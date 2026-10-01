"use client";

import { useMemo, useState, useEffect, useCallback, useRef, useId } from "react";
import ProjectCard from "@/components/ui/ProjectCard";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, LinkSquare01Icon, Calendar01Icon, Location01Icon, ImageNotFound01Icon } from "@hugeicons/core-free-icons";
import type { Project, ProjectCategory } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, LayoutGroup, type Transition, useMotionValue } from "framer-motion";

const categories: (ProjectCategory | "All")[] = [
  "All", "Community Service", "International Service", "Digital Transformation",
  "Public Relations", "Sports & Recreation", "Membership Development",
];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;
const morphTransition: Transition = { type: "spring", damping: 25, stiffness: 250, mass: 0.9 };
const AUTOPLAY_MS = 5000;
const projectKey = (project: Project) => String(project.id || project.slug);
const cardDomId = (project: Project) => `grid-card-${encodeURIComponent(projectKey(project))}`;
const projectLayoutId = (project: Project) => `project-container-${projectKey(project)}`;

function PhotoLightbox({
  images,
  index,
  projectTitle,
  brokenImages,
  onImageError,
  onNavigate,
  onClose,
}: {
  images: string[];
  index: number;
  projectTitle: string;
  brokenImages: Set<number>;
  onImageError: (idx: number) => void;
  onNavigate: (nextIndex: number) => void;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(null);
  const touchPanRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const mousePanRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const getDistance = (touches: TouchList) => {
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = { startDistance: getDistance(e.touches), startScale: scale };
      } else if (e.touches.length === 1 && scale > 1) {
        touchPanRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, startPos: pos };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const newDistance = getDistance(e.touches);
        const nextScale = Math.min(4, Math.max(1, pinchRef.current.startScale * (newDistance / pinchRef.current.startDistance)));
        setScale(nextScale);
        if (nextScale === 1) setPos({ x: 0, y: 0 });
      } else if (e.touches.length === 1 && touchPanRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchPanRef.current.startX;
        const dy = e.touches[0].clientY - touchPanRef.current.startY;
        setPos({ x: touchPanRef.current.startPos.x + dx, y: touchPanRef.current.startPos.y + dy });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length < 1) touchPanRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [scale, pos]);

  const toggleZoom = () => {
    if (scale > 1) {
      setScale(1);
      setPos({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) toggleZoom();
    lastTapRef.current = now;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    mousePanRef.current = { startX: e.clientX, startY: e.clientY, startPos: pos };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mousePanRef.current) return;
    const dx = e.clientX - mousePanRef.current.startX;
    const dy = e.clientY - mousePanRef.current.startY;
    setPos({ x: mousePanRef.current.startPos.x + dx, y: mousePanRef.current.startPos.y + dy });
  };
  const stopMousePan = () => { mousePanRef.current = null; };

  const canSwipe = scale === 1;
  const hasError = brokenImages.has(index);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${projectTitle} photo viewer`}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 shrink-0 z-50" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 ? (
          <span className="bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full tabular-nums">
            {index + 1} / {images.length}
          </span>
        ) : <span />}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close photo viewer"
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={22} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            onClick={() => index > 0 && onNavigate(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
            className={cn("absolute left-2 sm:left-6 z-50 p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all", index === 0 ? "opacity-0 pointer-events-none" : "hover:scale-110")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
          </button>
        )}

        <motion.div
          className="w-full h-full absolute inset-0 flex items-center justify-center"
          drag={canSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={(_, { offset, velocity }) => {
            if (!canSwipe) return;
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold && index < images.length - 1) onNavigate(index + 1);
            else if (swipe > swipeConfidenceThreshold && index > 0) onNavigate(index - 1);
          }}
        >
          {hasError ? (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <HugeiconsIcon icon={ImageNotFound01Icon} size={40} />
              <span className="text-sm">Image unavailable</span>
            </div>
          ) : (
            <motion.img
              key={index}
              src={images[index]}
              alt={`${projectTitle} photo ${index + 1}`}
              onClick={handleTap}
              onDoubleClick={toggleZoom}
              onError={() => onImageError(index)}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopMousePan}
              onMouseLeave={stopMousePan}
              style={{ x: pos.x, y: pos.y, scale, touchAction: "none" }}
              className={cn("max-w-full max-h-full object-contain px-2", scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
              draggable={false}
            />
          )}
        </motion.div>

        {images.length > 1 && (
          <button
            onClick={() => index < images.length - 1 && onNavigate(index + 1)}
            disabled={index === images.length - 1}
            aria-label="Next photo"
            className={cn("absolute right-2 sm:right-6 z-50 p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all", index === images.length - 1 ? "opacity-0 pointer-events-none" : "hover:scale-110")}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={22} />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div 
          className="h-auto w-full flex gap-3 justify-center items-center overflow-x-auto px-4 pb-6 pt-4 shrink-0 bg-black/50 z-50 border-t border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((imgSrc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden transition-all duration-300 shrink-0 cursor-pointer",
                idx === index
                  ? "scale-110 ring-2 ring-white/80 shadow-lg opacity-100"
                  : "opacity-50 hover:opacity-100"
              )}
            >
              {brokenImages.has(idx) ? (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <HugeiconsIcon icon={ImageNotFound01Icon} size={16} className="text-white/40" />
                </div>
              ) : (
                <img
                  src={imgSrc}
                  alt={`Thumbnail ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const filtered = useMemo(() => active === "All" ? projects : projects.filter((p) => p.category === active), [active, projects]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [projectSlideDirection, setProjectSlideDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [navFlash, setNavFlash] = useState<"left" | "right" | null>(null);
  const [showCollabs, setShowCollabs] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const initializedUrl = useRef(false);
  const [urlReady, setUrlReady] = useState(false);
  const closingRef = useRef(false);

  const dragX = useMotionValue(0);

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

  useEffect(() => {
    if (!isOpen || !activeProject || lightboxOpen || isHoveringImage || carouselImages.length <= 1) return;
    const intervalRef = setInterval(() => {
      const x = dragX.get();
      if (x === 0) {
        setActiveImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(intervalRef);
  }, [isOpen, activeProject, lightboxOpen, isHoveringImage, dragX, carouselImages.length, activeImageIndex]);

  const onDragEnd = () => {
    const x = dragX.get();
    if (x <= -50 && activeImageIndex < carouselImages.length - 1) {
      setActiveImageIndex((prev) => prev + 1);
    } else if (x >= 50 && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
  };

  const openProject = useCallback((index: number) => {
    const project = filtered[index];
    if (!project || closingRef.current) return;
    setSessionLayoutId(getGridLayoutId(project));
    setSelectedIndex(index);
    setActiveProject(project);
    setActiveImageIndex(0);
    setProjectSlideDirection(0);
    setLightboxOpen(false);
    setShowCollabs(false);
    setBrokenImages(new Set());
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
    setLightboxOpen(false);
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

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  const goToProject = useCallback((index: number) => {
    if (index < 0 || index >= filtered.length || closingRef.current) return;
    setProjectSlideDirection(selectedIndex !== null && index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
    setActiveProject(filtered[index]);
    setActiveImageIndex(0);
    setLightboxOpen(false);
    setShowCollabs(false);
    setBrokenImages(new Set());
  }, [filtered, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") {
          setLightboxOpen(false);
        } else if (e.key === "ArrowRight" && activeImageIndex < carouselImages.length - 1) {
          setActiveImageIndex((prev) => prev + 1);
        } else if (e.key === "ArrowLeft" && activeImageIndex > 0) {
          setActiveImageIndex((prev) => prev - 1);
        }
        return;
      }

      if (e.key === "Escape") {
        closeProject();
        return;
      }
      if (selectedIndex === null) return;

      if (e.key === "ArrowRight") {
        if (activeImageIndex < carouselImages.length - 1) {
          setActiveImageIndex((prev) => prev + 1);
        } else if (selectedIndex < filtered.length - 1) {
          setNavFlash("right");
          window.setTimeout(() => setNavFlash(null), 200);
          goToProject(selectedIndex + 1);
        }
      }
      if (e.key === "ArrowLeft") {
        if (activeImageIndex > 0) {
          setActiveImageIndex((prev) => prev - 1);
        } else if (selectedIndex > 0) {
          setNavFlash("left");
          window.setTimeout(() => setNavFlash(null), 200);
          goToProject(selectedIndex - 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedIndex, closeProject, goToProject, filtered.length, lightboxOpen, activeImageIndex, carouselImages.length]);

  const handleToggleCollabs = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCollabs((previous) => !previous);
    if (!showCollabs) window.setTimeout(() => collabsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
  };

  return (
    <LayoutGroup id={layoutGroupId}>
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 lg:px-8 relative">
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
              disabled={selectedIndex === 0 || lightboxOpen} className={cn("flex pointer-events-auto transition-all duration-300 w-10 h-10 sm:w-14 sm:h-14 rounded-full items-center justify-center [&_svg]:size-5 sm:[&_svg]:size-7 shadow-lg", (selectedIndex === 0 || lightboxOpen) ? "!opacity-0 pointer-events-none" : "hover:scale-110", navFlash === "left" && "scale-110 bg-white/80 shadow-xl dark:bg-white/30")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>
            <Button variant="frosted-nav" aria-label="Next project" onClick={(e) => { e.stopPropagation(); goToProject(selectedIndex + 1); }}
              disabled={selectedIndex === filtered.length - 1 || lightboxOpen} className={cn("flex pointer-events-auto transition-all duration-300 w-10 h-10 sm:w-14 sm:h-14 rounded-full items-center justify-center [&_svg]:size-5 sm:[&_svg]:size-7 shadow-lg", (selectedIndex === filtered.length - 1 || lightboxOpen) ? "!opacity-0 pointer-events-none" : "hover:scale-110", navFlash === "right" && "scale-110 bg-white/80 shadow-xl dark:bg-white/30")}>
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
          setLightboxOpen(false);
          setShowCollabs(false);
          closingRef.current = false;
        }}>
          {isOpen && activeProject && selectedIndex !== null && (
            <motion.div key="project-modal" layoutId={sessionLayoutId || undefined}
              transition={morphTransition}
              role="dialog"
              aria-modal="true"
              aria-label={activeProject.title}
              className="pointer-events-auto relative w-full max-w-6xl h-full sm:h-[90vh] bg-card border-0 sm:border border-border rounded-none sm:rounded-2xl shadow-2xl overflow-hidden">
              <button ref={closeButtonRef} onClick={closeProject} aria-label="Close project"
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
                  drag={!lightboxOpen ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={1}
                  onDragEnd={(_, { offset, velocity }) => {
                    if (lightboxOpen) return;
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold && selectedIndex < filtered.length - 1) goToProject(selectedIndex + 1);
                    else if (swipe > swipeConfidenceThreshold && selectedIndex > 0) goToProject(selectedIndex - 1);
                  }}>

                  <div
                    className="relative w-full md:w-1/2 h-[45%] md:h-full bg-black flex flex-col items-center justify-center group overflow-hidden"
                    onMouseEnter={() => setIsHoveringImage(true)}
                    onMouseLeave={() => setIsHoveringImage(false)}
                  >
                    {carouselImages.length > 0 ? (
                      <>
                        <div className="absolute top-4 left-4 z-20 pointer-events-none">
                          <span className="bg-black/60 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10 tracking-wide">
                            Click image to expand
                          </span>
                        </div>

                        {carouselImages.length > 1 && (
                          <div className="absolute top-4 right-4 z-20 pointer-events-none">
                            <span className="bg-black/60 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10 tabular-nums">
                              {activeImageIndex + 1} / {carouselImages.length}
                            </span>
                          </div>
                        )}

                        <div className="relative w-full flex-1 overflow-hidden flex items-center">
                          <motion.div
                            drag={!lightboxOpen ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            style={{ x: !lightboxOpen ? dragX : 0 }}
                            animate={{ translateX: `-${activeImageIndex * 100}%` }}
                            transition={lightboxOpen ? { duration: 0 } : { type: "spring", mass: 3, stiffness: 400, damping: 50 }}
                            onDragEnd={onDragEnd}
                            className="flex w-full h-full items-center"
                          >
                            {carouselImages.map((imgSrc, idx) => (
                              <motion.div
                                key={idx}
                                animate={{
                                  scale: activeImageIndex === idx ? 0.95 : 0.85,
                                  opacity: activeImageIndex === idx ? 1 : 0.4,
                                }}
                                transition={{ type: "spring", mass: 3, stiffness: 400, damping: 50 }}
                                className="relative shrink-0 flex items-center justify-center cursor-pointer w-full h-full p-4 sm:p-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeImageIndex === idx) setLightboxOpen(true);
                                  else setActiveImageIndex(idx);
                                }}
                              >
                                {brokenImages.has(idx) ? (
                                  <div className="flex flex-col items-center gap-2 text-white/40">
                                    <HugeiconsIcon icon={ImageNotFound01Icon} size={32} />
                                    <span className="text-xs">Image unavailable</span>
                                  </div>
                                ) : (
                                  <img
                                    src={imgSrc}
                                    alt={`${activeProject.title} image ${idx + 1}`}
                                    loading={Math.abs(idx - activeImageIndex) <= 1 ? "eager" : "lazy"}
                                    onError={() => setBrokenImages((prev) => new Set(prev).add(idx))}
                                    className="w-full h-full object-cover rounded-2xl shadow-xl cursor-zoom-in transition-all duration-300"
                                  />
                                )}
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>

                        {carouselImages.length > 1 && (
                          <div className="h-auto w-full flex gap-3 justify-center items-center overflow-x-auto px-4 pb-6 pt-2 z-10">
                            {carouselImages.map((imgSrc, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                                aria-label={`Go to slide ${idx + 1}`}
                                aria-current={idx === activeImageIndex}
                                className={cn(
                                  "relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden transition-all duration-300 shrink-0 cursor-pointer",
                                  idx === activeImageIndex
                                    ? "scale-110 ring-2 ring-white/80 shadow-lg opacity-100"
                                    : "opacity-50 hover:opacity-100"
                                )}
                              >
                                {brokenImages.has(idx) ? (
                                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={ImageNotFound01Icon} size={16} className="text-white/40" />
                                  </div>
                                ) : (
                                  <img
                                    src={imgSrc}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="object-cover w-full h-full"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
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

      <AnimatePresence>
        {lightboxOpen && activeProject && carouselImages.length > 0 && (
          <PhotoLightbox
            images={carouselImages}
            index={activeImageIndex}
            projectTitle={activeProject.title}
            brokenImages={brokenImages}
            onImageError={(idx) => setBrokenImages((prev) => new Set(prev).add(idx))}
            onNavigate={(next) => setActiveImageIndex(next)}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
    </LayoutGroup>
  );
}