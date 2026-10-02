"use client";

import { useMemo, useState, useEffect, useCallback, useRef, useId } from "react";
import ProjectCard from "@/components/ui/ProjectCard";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  LinkSquare01Icon,
  Calendar03Icon,
  Location01Icon,
  ImageNotFound01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import type { Project, ProjectCategory } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, LayoutGroup, type Transition, useMotionValue } from "framer-motion";

const categories: (ProjectCategory | "All")[] = [
  "All",
  "Community Service",
  "International Service",
  "Digital Transformation",
  "Public Relations",
  "Sports & Recreation",
  "Membership Development",
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

  const getDistance = (touches: TouchList) =>
    Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

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
        setPos({
          x: touchPanRef.current.startPos.x + (e.touches[0].clientX - touchPanRef.current.startX),
          y: touchPanRef.current.startPos.y + (e.touches[0].clientY - touchPanRef.current.startY),
        });
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
    if (scale > 1) {
      mousePanRef.current = { startX: e.clientX, startY: e.clientY, startPos: pos };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mousePanRef.current) {
      setPos({
        x: mousePanRef.current.startPos.x + (e.clientX - mousePanRef.current.startX),
        y: mousePanRef.current.startPos.y + (e.clientY - mousePanRef.current.startY),
      });
    }
  };

  const stopMousePan = () => {
    mousePanRef.current = null;
  };

  const canSwipe = scale === 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 shrink-0 z-50" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 ? (
          <span className="bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full">
            {index + 1} / {images.length}
          </span>
        ) : (
          <span />
        )}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95"
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
            className={cn("absolute left-2 sm:left-6 z-50 p-2 sm:p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition-all shadow-lg active:scale-110", index === 0 ? "opacity-0 pointer-events-none" : "hover:scale-110")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
          </button>
        )}

        <motion.div
          className="w-full h-full absolute inset-0 touch-pan-y"
          drag={canSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
          onDragEnd={(_, { offset, velocity }) => {
            if (!canSwipe) return;
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold && index < images.length - 1) {
              onNavigate(index + 1);
            } else if (swipe > swipeConfidenceThreshold && index > 0) {
              onNavigate(index - 1);
            }
          }}
        >
          <motion.div
            className="w-full h-full flex items-center"
            animate={{ x: `-${index * 100}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            {images.map((imgSrc, idx) => (
              <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center relative">
                {brokenImages.has(idx) ? (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <HugeiconsIcon icon={ImageNotFound01Icon} size={40} />
                    <span className="text-sm">Image unavailable</span>
                  </div>
                ) : (
                  <motion.img
                    src={imgSrc}
                    alt={`${projectTitle} photo ${idx + 1}`}
                    onClick={idx === index ? handleTap : undefined}
                    onDoubleClick={idx === index ? toggleZoom : undefined}
                    onError={() => onImageError(idx)}
                    onMouseDown={idx === index ? handleMouseDown : undefined}
                    onMouseMove={idx === index ? handleMouseMove : undefined}
                    onMouseUp={idx === index ? stopMousePan : undefined}
                    onMouseLeave={idx === index ? stopMousePan : undefined}
                    style={idx === index ? { x: pos.x, y: pos.y, scale, touchAction: "none" } : { touchAction: "none" }}
                    className={cn("max-w-full max-h-full object-contain px-2", scale > 1 && idx === index ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {images.length > 1 && (
          <button
            onClick={() => index < images.length - 1 && onNavigate(index + 1)}
            disabled={index === images.length - 1}
            className={cn("absolute right-2 sm:right-6 z-50 p-2 sm:p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition-all shadow-lg active:scale-110", index === images.length - 1 ? "opacity-0 pointer-events-none" : "hover:scale-110")}
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
              className={cn(
                "relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden transition-all duration-300 shrink-0",
                idx === index
                  ? "scale-110 ring-2 ring-white/80 shadow-lg opacity-100"
                  : "opacity-50 hover:opacity-100 active:scale-95"
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
  const filtered = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.category === active)),
    [active, projects]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [projectSlideDirection, setProjectSlideDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [navFlash, setNavFlash] = useState<"left" | "right" | null>(null);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());
  const [sessionLayoutId, setSessionLayoutId] = useState<string | null>(null);

  const [gridLayout, setGridLayout] = useState({
    generation: 0,
    returnProjectKey: "",
    returnLayoutId: "",
  });

  const getGridLayoutId = useCallback(
    (project: Project) =>
      projectKey(project) === gridLayout.returnProjectKey
        ? gridLayout.returnLayoutId
        : `${projectLayoutId(project)}-${gridLayout.generation}`,
    [gridLayout]
  );

  const layoutGroupId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
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
    if (isOpen && activeProject) {
      url.searchParams.set("project", String(activeProject.id));
    } else {
      url.searchParams.delete("project");
    }
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
    if (!isOpen || !activeProject || lightboxOpen || isHoveringImage || isDraggingImage || carouselImages.length <= 1) return;
    const intervalRef = setInterval(() => {
      setActiveImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(intervalRef);
  }, [isOpen, activeProject, lightboxOpen, isHoveringImage, isDraggingImage, carouselImages.length]);

  const openProject = useCallback(
    (index: number) => {
      const project = filtered[index];
      if (!project || closingRef.current) return;
      setSessionLayoutId(getGridLayoutId(project));
      setSelectedIndex(index);
      setActiveProject(project);
      setActiveImageIndex(0);
      setProjectSlideDirection(0);
      setLightboxOpen(false);
      setBrokenImages(new Set());
      setIsOpen(true);
    },
    [filtered, getGridLayoutId]
  );

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

  const goToProject = useCallback(
    (index: number) => {
      if (index < 0 || index >= filtered.length || closingRef.current) return;
      setProjectSlideDirection(selectedIndex !== null && index > selectedIndex ? 1 : -1);
      setSelectedIndex(index);
      setActiveProject(filtered[index]);
      setActiveImageIndex(0);
      setLightboxOpen(false);
      setBrokenImages(new Set());
    },
    [filtered, selectedIndex]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") setLightboxOpen(false);
        else if (e.key === "ArrowRight" && activeImageIndex < carouselImages.length - 1) {
          setActiveImageIndex((prev) => prev + 1);
        } else if (e.key === "ArrowLeft" && activeImageIndex > 0) {
          setActiveImageIndex((prev) => prev - 1);
        }
        return;
      }
      if (e.key === "Escape") return closeProject();
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, closeProject, goToProject, filtered.length, lightboxOpen, activeImageIndex, carouselImages.length]);

  return (
    <LayoutGroup id={layoutGroupId}>
      <section className="mx-auto max-w-7xl relative pt-0 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              disabled={modalPresent}
              onClick={() => setActive(category)}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-semibold transition-colors duration-200 shadow-sm outline-none active:scale-95",
                active === category
                  ? "bg-[#2F6B4A] text-white border-[#2F6B4A]"
                  : "bg-transparent border-border/80 text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-50"
              )}
            >
              {category}
            </button>
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
                  whileTap={modalPresent ? undefined : { scale: 0.98 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-muted-foreground">No projects in this category yet.</p>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeProject}
              className="fixed inset-0 z-[9990] bg-background/30 backdrop-blur-xl"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && activeProject && selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-between px-2 sm:px-8"
            >
              <Button
                variant="outline"
                aria-label="Previous project"
                onClick={(e) => {
                  e.stopPropagation();
                  goToProject(selectedIndex - 1);
                }}
                disabled={selectedIndex === 0 || lightboxOpen}
                className={cn(
                  "flex pointer-events-auto transition-all duration-300 w-10 h-10 sm:w-14 sm:h-14 rounded-full items-center justify-center [&_svg]:size-5 sm:[&_svg]:size-7",
                  "bg-white/90 dark:bg-black/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.08)] border-2 border-transparent text-foreground",
                  selectedIndex === 0 || lightboxOpen ? "!opacity-0 pointer-events-none" : "hover:scale-110 active:scale-110 hover:bg-[#ebf7f1] hover:text-[#2F6B4A] hover:border-[#2F6B4A]/30 hover:shadow-[0_12px_40px_rgba(47,107,74,0.2)] dark:hover:bg-[#2F6B4A]/20 dark:hover:text-white dark:hover:border-[#2F6B4A]/40",
                  navFlash === "left" && "scale-110 bg-[#ebf7f1] text-[#2F6B4A] border-[#2F6B4A]/30 shadow-[0_12px_40px_rgba(47,107,74,0.2)] dark:bg-[#2F6B4A]/20 dark:text-white dark:border-[#2F6B4A]/40"
                )}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </Button>
              <Button
                variant="outline"
                aria-label="Next project"
                onClick={(e) => {
                  e.stopPropagation();
                  goToProject(selectedIndex + 1);
                }}
                disabled={selectedIndex === filtered.length - 1 || lightboxOpen}
                className={cn(
                  "flex pointer-events-auto transition-all duration-300 w-10 h-10 sm:w-14 sm:h-14 rounded-full items-center justify-center [&_svg]:size-5 sm:[&_svg]:size-7",
                  "bg-white/90 dark:bg-black/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.08)] border-2 border-transparent text-foreground",
                  selectedIndex === filtered.length - 1 || lightboxOpen ? "!opacity-0 pointer-events-none" : "hover:scale-110 active:scale-110 hover:bg-[#ebf7f1] hover:text-[#2F6B4A] hover:border-[#2F6B4A]/30 hover:shadow-[0_12px_40px_rgba(47,107,74,0.2)] dark:hover:bg-[#2F6B4A]/20 dark:hover:text-white dark:hover:border-[#2F6B4A]/40",
                  navFlash === "right" && "scale-110 bg-[#ebf7f1] text-[#2F6B4A] border-[#2F6B4A]/30 shadow-[0_12px_40px_rgba(47,107,74,0.2)] dark:bg-[#2F6B4A]/20 dark:text-white dark:border-[#2F6B4A]/40"
                )}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layoutRoot className="fixed inset-0 z-[9992] pointer-events-none flex items-center justify-center p-0 sm:p-6 md:p-8">
          <AnimatePresence
            onExitComplete={() => {
              setActiveProject(null);
              setSelectedIndex(null);
              setSessionLayoutId(null);
              setLightboxOpen(false);
              closingRef.current = false;
            }}
          >
            {isOpen && activeProject && selectedIndex !== null && (
              <motion.div
                key="project-modal"
                layoutId={sessionLayoutId || undefined}
                transition={morphTransition}
                role="dialog"
                aria-modal="true"
                aria-label={activeProject.title}
                className="pointer-events-auto relative w-full max-w-6xl h-full sm:h-[90vh] bg-card border-0 sm:border border-border rounded-none sm:rounded-3xl shadow-2xl overflow-hidden"
              >
                <button
                  ref={closeButtonRef}
                  onClick={closeProject}
                  aria-label="Close project"
                  className="absolute top-4 right-4 z-[9999] p-2 bg-black/50 hover:bg-black text-white border border-white/10 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 hover:rotate-90 shadow-md"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={24} />
                </button>

                <AnimatePresence custom={projectSlideDirection} initial={false} mode="popLayout">
                  <motion.div
                    key={activeProject.id}
                    custom={projectSlideDirection}
                    variants={{
                      enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
                      center: { zIndex: 1, x: 0, opacity: 1 },
                      exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? "100%" : "-100%", opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 flex flex-col md:flex-row bg-card"
                  >
                    <div
                      className="relative w-full md:w-1/2 h-[45%] md:h-full bg-muted/5 flex flex-col group overflow-hidden"
                      onMouseEnter={() => setIsHoveringImage(true)}
                      onMouseLeave={() => setIsHoveringImage(false)}
                    >
                      {carouselImages.length > 0 && !brokenImages.has(activeImageIndex) && (
                        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                          <motion.img
                            key={`bg-${activeImageIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            src={carouselImages[activeImageIndex]}
                            alt="blurred background"
                            className="w-full h-full object-cover blur-[100px] scale-[1.5]"
                          />
                          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[60px]" />
                        </div>
                      )}

                      {carouselImages.length > 0 ? (
                        <>
                          <div className="w-full shrink-0 flex justify-between items-start pt-4 px-4 z-20 pointer-events-none relative">
                            <span className="bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                              Click Image to expand
                            </span>

                            {carouselImages.length > 1 && (
                              <span className="bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] tabular-nums mr-12 md:mr-0">
                                {activeImageIndex + 1} / {carouselImages.length}
                              </span>
                            )}
                          </div>

                          <div className="relative w-full flex-1 overflow-hidden flex items-center justify-center z-10 my-auto">
                            <motion.div
                              className="w-full h-full absolute inset-0 touch-pan-y"
                              drag={!lightboxOpen ? "x" : false}
                              dragConstraints={{ left: 0, right: 0 }}
                              dragElastic={0.4}
                              dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
                              onDragStart={() => setIsDraggingImage(true)}
                              onDragEnd={(_, { offset, velocity }) => {
                                setIsDraggingImage(false);
                                if (lightboxOpen) return;
                                const swipe = swipePower(offset.x, velocity.x);
                                if (swipe < -swipeConfidenceThreshold && activeImageIndex < carouselImages.length - 1) {
                                  setActiveImageIndex((prev) => prev + 1);
                                } else if (swipe > swipeConfidenceThreshold && activeImageIndex > 0) {
                                  setActiveImageIndex((prev) => prev - 1);
                                }
                              }}
                            >
                              <motion.div
                                className="w-full h-full flex items-center"
                                animate={{ x: `-${activeImageIndex * 100}%` }}
                                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                              >
                                {carouselImages.map((imgSrc, idx) => (
                                  <motion.div
                                    key={idx}
                                    animate={{
                                      scale: activeImageIndex === idx ? 1 : 0.85,
                                      opacity: activeImageIndex === idx ? 1 : 0.4,
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                                    className="relative shrink-0 flex items-center justify-center cursor-pointer w-full h-full px-6 sm:px-10 md:px-12 py-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (activeImageIndex === idx) setLightboxOpen(true);
                                      else setActiveImageIndex(idx);
                                    }}
                                  >
                                    {brokenImages.has(idx) ? (
                                      <div className="w-full h-full bg-black/20 backdrop-blur-md rounded-[1.5rem] flex flex-col items-center justify-center gap-2 text-white/40 shadow-2xl">
                                        <HugeiconsIcon icon={ImageNotFound01Icon} size={32} />
                                        <span className="text-xs">Image unavailable</span>
                                      </div>
                                    ) : (
                                      <img
                                        src={imgSrc}
                                        alt=""
                                        loading={Math.abs(idx - activeImageIndex) <= 1 ? "eager" : "lazy"}
                                        onError={() => setBrokenImages((prev) => new Set(prev).add(idx))}
                                        className="w-full h-full object-cover rounded-[1.5rem] shadow-[0_16px_50px_-12px_rgba(0,0,0,0.7)] cursor-zoom-in transition-all duration-300 hover:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.8)]"
                                      />
                                    )}
                                  </motion.div>
                                ))}
                              </motion.div>
                            </motion.div>
                          </div>

                          <div className="w-full shrink-0 flex justify-center items-end pb-4 px-4 z-20 relative">
                            {carouselImages.length > 1 && (
                              <div className="flex gap-2.5 items-center overflow-x-auto p-2 bg-white/10 backdrop-blur-md rounded-[1.25rem] shadow-[0_12px_32px_rgba(0,0,0,0.5)] max-w-full">
                                {carouselImages.map((imgSrc, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveImageIndex(idx);
                                    }}
                                    className={cn(
                                      "relative h-10 w-10 sm:h-12 sm:w-12 rounded-[14px] overflow-hidden transition-all duration-300 shrink-0 cursor-pointer shadow-md active:scale-95",
                                      idx === activeImageIndex
                                        ? "scale-105 ring-2 ring-white/90 opacity-100 shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                                        : "opacity-60 hover:opacity-100"
                                    )}
                                  >
                                    {brokenImages.has(idx) ? (
                                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <HugeiconsIcon icon={ImageNotFound01Icon} size={16} className="text-white/40" />
                                      </div>
                                    ) : (
                                      <img src={imgSrc} alt="" className="object-cover w-full h-full" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground z-10 relative m-auto">No images</span>
                      )}
                    </div>

                    <div className="w-full md:w-1/2 h-[55%] md:h-full flex flex-col relative bg-card">
                      <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-10">
                        <div className="flex flex-col gap-3 mb-6 pr-8">
                          <div className={cn(
                            "flex items-center transition-all duration-300",
                            selectedIndex !== null && selectedIndex > 0 ? "pl-8 sm:pl-0" : ""
                          )}>
                            <span className="bg-[#2F6B4A] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                              {activeProject.category}
                            </span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
                            {activeProject.title}
                          </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 mb-6">
                          <div className="flex items-center gap-1.5 bg-muted/40 text-foreground/90 px-3 py-1.5 rounded-full text-xs font-semibold border border-border/50">
                            <HugeiconsIcon icon={Calendar03Icon} size={14} className="text-[#2F6B4A]" />
                            <span>
                              {new Date(activeProject.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {activeProject.location_type === "Online" || activeProject.location_type === "Multiple" ? (
                            <div className="flex items-center gap-1.5 bg-muted/40 text-foreground/90 px-3 py-1.5 rounded-full text-xs font-semibold border border-border/50">
                              <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#2F6B4A]" />
                              <span>{activeProject.location_type === "Online" ? "Online" : activeProject.location}</span>
                            </div>
                          ) : (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                activeProject.location
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-muted/40 text-foreground/90 px-3 py-1.5 rounded-full text-xs font-semibold border border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group active:scale-95"
                            >
                              <HugeiconsIcon
                                icon={Location01Icon}
                                size={14}
                                className="text-[#2F6B4A] group-hover:scale-110 transition-transform"
                              />
                              <span className="group-hover:text-[#2F6B4A] transition-colors">{activeProject.location}</span>
                              <HugeiconsIcon
                                icon={LinkSquare01Icon}
                                size={12}
                                className="opacity-40 group-hover:opacity-100 transition-opacity group-hover:text-[#2F6B4A]"
                              />
                            </a>
                          )}
                        </div>

                        {hasCollabs && (
                          <div className="mb-8 bg-gradient-to-br from-white to-[#ebf7f1] border border-[#2F6B4A]/15 rounded-3xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#2F6B4A]/80 uppercase tracking-widest mb-4">
                              <HugeiconsIcon icon={UserMultiple02Icon} size={14} />
                              Collaborators & Partners
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                              {activeProject.collaborators?.length ? (
                                activeProject.collaborators.map((collab, idx) =>
                                  collab.link ? (
                                    <a
                                      href={collab.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      key={idx}
                                      className="inline-flex items-center gap-1.5 bg-white border border-[#2F6B4A]/10 shadow-sm text-foreground/90 hover:text-[#2F6B4A] hover:border-[#2F6B4A]/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 px-3 py-1.5 rounded-full text-xs font-semibold group active:scale-95"
                                    >
                                      {collab.name}{" "}
                                      <HugeiconsIcon
                                        icon={LinkSquare01Icon}
                                        size={12}
                                        className="opacity-40 group-hover:opacity-100 transition-opacity"
                                      />
                                    </a>
                                  ) : (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1.5 bg-white border border-[#2F6B4A]/10 shadow-sm text-foreground/90 px-3 py-1.5 rounded-full text-xs font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                                    >
                                      {collab.name}
                                    </span>
                                  )
                                )
                              ) : activeProject.collaborative_club ? (
                                activeProject.collaborative_club_link ? (
                                  <a
                                    href={activeProject.collaborative_club_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-white border border-[#2F6B4A]/10 shadow-sm text-foreground/90 hover:text-[#2F6B4A] hover:border-[#2F6B4A]/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 px-3 py-1.5 rounded-full text-xs font-semibold group active:scale-95"
                                  >
                                    {activeProject.collaborative_club}{" "}
                                    <HugeiconsIcon
                                      icon={LinkSquare01Icon}
                                      size={12}
                                      className="opacity-40 group-hover:opacity-100 transition-opacity"
                                    />
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#2F6B4A]/10 shadow-sm text-foreground/90 px-3 py-1.5 rounded-full text-xs font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                                    {activeProject.collaborative_club}
                                  </span>
                                )
                              ) : null}
                            </div>
                          </div>
                        )}

                        {!hasCollabs && <div className="mb-6 border-b border-border/60" />}
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-medium [&>p]:mb-4 [&>strong]:text-foreground [&>a]:text-[#2F6B4A]">
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