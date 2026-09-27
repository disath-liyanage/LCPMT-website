"use client";

import { useMemo, useState, useEffect, useCallback, useRef, useId } from "react";
import ProjectCard from "@/components/ui/ProjectCard";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, LinkSquare01Icon, Calendar01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import type { Project, ProjectCategory } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, LayoutGroup, type Transition } from "framer-motion";

const categories: (ProjectCategory | "All")[] = [
  "All", "Community Service", "International Service", "Digital Transformation",
  "Public Relations", "Sports & Recreation", "Membership Development",
];
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;
const morphTransition: Transition = { type: "spring", damping: 25, stiffness: 250, mass: 0.9 };
const projectKey = (project: Project) => String(project.id || project.slug);
const cardDomId = (project: Project) => `grid-card-${encodeURIComponent(projectKey(project))}`;
const projectLayoutId = (project: Project) => `project-container-${projectKey(project)}`;

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const filtered = useMemo(() => active === "All" ? projects : projects.filter((p) => p.category === active), [active, projects]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageDirection, setImageDirection] = useState(0);
  const [projectSlideDirection, setProjectSlideDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [navFlash, setNavFlash] = useState<"left" | "right" | null>(null);
  const [showCollabs, setShowCollabs] = useState(false);

  const [sessionLayoutId, setSessionLayoutId] = useState<string | null>(null);

  const [gridLayout, setGridLayout] = useState({
    generation: 0,
    returnProjectKey: "",
    returnLayoutId: "",
  });
  const getGridLayoutId = useCallback((project: Project) =>
    projectKey(project) === gridLayout.returnProjectKey
      ? gridLayout.returnLayoutId
      : `${projectLayoutId(project)}-${gridLayout.generation}`,
  [gridLayout]);
  const layoutGroupId = useId();
  const collabsRef = useRef<HTMLDivElement>(null);
  const initializedUrl = useRef(false);
  const [urlReady, setUrlReady] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => {
    if (initializedUrl.current) return;
    initializedUrl.current = true;
    const projectId = new URLSearchParams(window.location.search).get("project");
    const index = projects.findIndex((p) => String(p.id) === projectId);
    if (index !== -1) {
      setSessionLayoutId(getGridLayoutId(projects[index]));
      setSelectedIndex(index);
      setActiveProject(projects[index]);
      setIsOpen(true);
    }
    setUrlReady(true);
  }, [projects, getGridLayoutId]);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    if (isOpen && activeProject) url.searchParams.set("project", String(activeProject.id));
    else url.searchParams.delete("project");
    window.history.replaceState(window.history.state, "", url);
  }, [isOpen, activeProject, urlReady]);

  const carouselImages = useMemo(() => {
    if (!activeProject) return [];
    const images = activeProject.images || [];
    const main = activeProject.main_image;
    return main ? [main, ...images.filter((img) => img !== main)] : images;
  }, [activeProject]);
  const hasCollabs = !!activeProject && (!!activeProject.collaborators?.length || !!activeProject.collaborative_club);

  const openProject = useCallback((index: number) => {
    const project = filtered[index];
    if (!project || closingRef.current) return;
    setSessionLayoutId(getGridLayoutId(project));
    setSelectedIndex(index);
    setActiveProject(project);
    setActiveImageIndex(0);
    setImageDirection(0);
    setProjectSlideDirection(0);
    setIsZoomed(false);
    setShowCollabs(false);
    setIsOpen(true);
  }, [filtered, getGridLayoutId]);

  const closeProject = useCallback(() => {
    if (!isOpen || !activeProject || !sessionLayoutId || closingRef.current) return;
    closingRef.current = true;
    const card = document.getElementById(cardDomId(activeProject));
    card?.scrollIntoView({ behavior: "instant", block: "center" });

    setGridLayout((previous) => ({
      generation: previous.generation + 1,
      returnProjectKey: projectKey(activeProject),
      returnLayoutId: sessionLayoutId,
    }));
    setIsOpen(false);
    setIsZoomed(false);
    setShowCollabs(false);
  }, [isOpen, activeProject, sessionLayoutId]);

  const modalPresent = activeProject !== null;
  useEffect(() => {
    if (!modalPresent) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [modalPresent]);

  const goToProject = useCallback((index: number) => {
    if (index < 0 || index >= filtered.length || closingRef.current) return;
    setProjectSlideDirection(selectedIndex !== null && index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
    setActiveProject(filtered[index]);
    setActiveImageIndex(0);
    setImageDirection(0);
    setIsZoomed(false);
    setShowCollabs(false);
  }, [filtered, selectedIndex]);

  const paginateImage = (direction: number) => {
    if (carouselImages.length < 2) return;
    setImageDirection(direction);
    setActiveImageIndex((prev) => (prev + direction + carouselImages.length) % carouselImages.length);
    setIsZoomed(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProject();
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight" && selectedIndex < filtered.length - 1) {
        setNavFlash("right");
        window.setTimeout(() => setNavFlash(null), 200);
        goToProject(selectedIndex + 1);
      }
      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        setNavFlash("left");
        window.setTimeout(() => setNavFlash(null), 200);
        goToProject(selectedIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedIndex, closeProject, goToProject, filtered.length]);

  const handleToggleCollabs = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCollabs((previous) => !previous);
    if (!showCollabs) window.setTimeout(() => collabsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
  };

  return (
    <LayoutGroup id={layoutGroupId}>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative">
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {categories.map((category) => (
          <Button key={category} size="default" variant={active === category ? "frosted-filter-active" : "frosted-filter"}
            disabled={modalPresent}
            onClick={() => setActive(category)}>
            {category}
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <div key={projectKey(project)} id={cardDomId(project)} className="h-full">
              <motion.div
                key={isOpen ? "background" : `grid-${gridLayout.generation}`}
                layoutId={isOpen ? undefined : getGridLayoutId(project)}
                transition={morphTransition}
                onClick={() => openProject(index)}
                className="cursor-pointer h-full"
                whileHover={modalPresent ? undefined : { scale: 1.02 }}
                whileTap={modalPresent ? undefined : { scale: 0.98 }}>
                <ProjectCard project={project} />
              </motion.div>
            </div>
          ))}
        </div>
      ) : <p className="mt-12 text-center text-sm text-muted-foreground">No projects in this category yet.</p>}

      <AnimatePresence>
        {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }} onClick={closeProject}
          className="fixed inset-0 z-[100] bg-background/30 backdrop-blur-xl" />}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && activeProject && selectedIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-between px-2 sm:px-8">
            <Button variant="frosted-nav" aria-label="Previous project" onClick={(e) => { e.stopPropagation(); goToProject(selectedIndex - 1); }}
              disabled={selectedIndex === 0} className={cn("flex pointer-events-auto transition-all duration-300 w-10 h-10 sm:w-14 sm:h-14 rounded-full items-center justify-center [&_svg]:size-5 sm:[&_svg]:size-7 shadow-lg", selectedIndex === 0 ? "!opacity-0 pointer-events-none" : "hover:scale-110", navFlash === "left" && "scale-110 bg-white/80 shadow-xl dark:bg-white/30")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>
            <Button variant="frosted-nav" aria-label="Next project" onClick={(e) => { e.stopPropagation(); goToProject(selectedIndex + 1); }}
              disabled={selectedIndex === filtered.length - 1} className={cn("flex pointer-events-auto transition-all duration-300 w-10 h-10 sm:w-14 sm:h-14 rounded-full items-center justify-center [&_svg]:size-5 sm:[&_svg]:size-7 shadow-lg", selectedIndex === filtered.length - 1 ? "!opacity-0 pointer-events-none" : "hover:scale-110", navFlash === "right" && "scale-110 bg-white/80 shadow-xl dark:bg-white/30")}>
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layoutRoot className="fixed inset-0 z-[105] pointer-events-none flex items-center justify-center p-0 sm:p-6 md:p-8">
        <AnimatePresence onExitComplete={() => {
          setActiveProject(null);
          setSelectedIndex(null);
          setSessionLayoutId(null);
          setIsZoomed(false);
          setShowCollabs(false);
          closingRef.current = false;
        }}>
          {isOpen && activeProject && selectedIndex !== null && (
            <motion.div key="project-modal" layoutId={sessionLayoutId || undefined}
              transition={morphTransition}
              className="pointer-events-auto relative w-full max-w-6xl h-full sm:h-[90vh] bg-card border-0 sm:border border-border rounded-none sm:rounded-2xl shadow-2xl overflow-hidden">
              <button onClick={closeProject} aria-label="Close project"
                className="absolute top-4 right-4 z-[120] p-2 bg-black/50 hover:bg-black text-white border border-white/10 rounded-full backdrop-blur-md transition-all hover:scale-110 hover:rotate-90">
                <HugeiconsIcon icon={Cancel01Icon} size={24} />
              </button>

              <AnimatePresence custom={projectSlideDirection} initial={false} mode="popLayout">
                <motion.div key={activeProject.id} custom={projectSlideDirection}
                  variants={{
                    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
                    center: { zIndex: 1, x: 0, opacity: 1 },
                    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? "100%" : "-100%", opacity: 0 }),
                  }}
                  initial="enter" animate="center" exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex flex-col md:flex-row bg-card"
                  drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={1}
                  onDragEnd={(_, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold && selectedIndex < filtered.length - 1) goToProject(selectedIndex + 1);
                    else if (swipe > swipeConfidenceThreshold && selectedIndex > 0) goToProject(selectedIndex - 1);
                  }}>
                  <div className="relative w-full md:w-1/2 h-[45%] md:h-full bg-black flex items-center justify-center group overflow-hidden">
                    {carouselImages.length > 0 ? (
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        <AnimatePresence initial={false} custom={imageDirection}>
                          <motion.img key={activeImageIndex} src={carouselImages[activeImageIndex]} custom={imageDirection}
                            variants={{
                              enter: (dir: number) => ({ x: dir > 0 ? 500 : -500, opacity: 0 }),
                              center: { zIndex: 1, x: 0, opacity: 1 },
                              exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 500 : -500, opacity: 0 }),
                            }}
                            initial="enter" animate="center" exit="exit"
                            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={1}
                            onDragEnd={(_, { offset, velocity }) => {
                              const swipe = swipePower(offset.x, velocity.x);
                              if (swipe < -swipeConfidenceThreshold) paginateImage(1);
                              else if (swipe > swipeConfidenceThreshold) paginateImage(-1);
                            }}
                            onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                            className={cn("absolute w-full h-full", isZoomed ? "object-contain cursor-zoom-out" : "object-cover cursor-zoom-in")}
                            alt={`${activeProject.title} image ${activeImageIndex + 1}`} />
                        </AnimatePresence>
                        {carouselImages.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm z-10">
                            {carouselImages.map((_, i) => (
                              <button key={i} aria-label={`Show image ${i + 1}`}
                                className={cn("h-2 rounded-full transition-all duration-300 cursor-pointer", i === activeImageIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/90")}
                                onClick={(e) => { e.stopPropagation(); setImageDirection(i > activeImageIndex ? 1 : -1); setActiveImageIndex(i); setIsZoomed(false); }} />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : <span className="text-white/50">No images</span>}
                  </div>

                  <div className="w-full md:w-1/2 h-[55%] md:h-full flex flex-col relative bg-card">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-10">
                      <div className="flex flex-wrap items-center gap-3 mb-6 pr-10">
                        <Button size="xs" variant="frosted-pill" className="uppercase tracking-wider pointer-events-none">{activeProject.category}</Button>
                        {hasCollabs && (
                          <button onClick={handleToggleCollabs} className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                            In Collaboration With
                            <HugeiconsIcon icon={ArrowRight01Icon} size={14} className={cn("transition-transform duration-300", showCollabs && "rotate-90")} />
                          </button>
                        )}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{activeProject.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground/80 mb-6 pb-6 border-b border-border/50">
                        <span className="flex items-center gap-1.5 bg-background border border-border/80 shadow-sm px-2.5 py-1 rounded-full whitespace-nowrap">
                          <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-primary shrink-0" />
                          <span>{new Date(activeProject.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-background border border-border/80 shadow-sm px-2.5 py-1 rounded-full whitespace-nowrap">
                          <HugeiconsIcon icon={Location01Icon} size={16} className="text-primary shrink-0" />
                          {activeProject.location_type === "Online" ? "Online" : activeProject.location_type === "Multiple" ? activeProject.location : (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeProject.location)}`}
                              target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                              {activeProject.location} <HugeiconsIcon icon={LinkSquare01Icon} size={14} className="opacity-50" />
                            </a>
                          )}
                        </span>
                      </div>
                      <div ref={collabsRef}>
                        {showCollabs && hasCollabs && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            className="mb-6 overflow-hidden">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Collaborators</h3>
                            <div className="flex flex-wrap gap-2">
                              {activeProject.collaborators?.length ? activeProject.collaborators.map((collab, idx) => (
                                collab.link ? (
                                  <a href={collab.link} target="_blank" rel="noopener noreferrer" key={idx}
                                    className="flex items-center gap-1.5 bg-background hover:bg-muted border border-border/80 shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold transition-colors">
                                    {collab.name} <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="opacity-50" />
                                  </a>
                                ) : <span key={idx} className="bg-background border border-border/80 shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold">{collab.name}</span>
                              )) : activeProject.collaborative_club ? (
                                activeProject.collaborative_club_link ? (
                                  <a href={activeProject.collaborative_club_link} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-background hover:bg-muted border border-border/80 shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold transition-colors">
                                    {activeProject.collaborative_club} <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="opacity-50" />
                                  </a>
                                ) : <span className="bg-background border border-border/80 shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold">{activeProject.collaborative_club}</span>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-medium [&>p]:mb-4 [&>strong]:text-foreground [&>a]:text-primary">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeProject.description}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
    </LayoutGroup>
  );
}