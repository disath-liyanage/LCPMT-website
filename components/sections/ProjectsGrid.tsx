"use client";

import { useMemo, useState, useEffect } from "react";
import ProjectCard from "@/components/ui/ProjectCard";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, LinkSquare01Icon, Calendar01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import type { Project, ProjectCategory } from "@/lib/data";

const categories: (ProjectCategory | "All")[] = [
  "All",
  "Community Service",
  "International Service",
  "Digital Transformation",
  "Public Relations",
  "Sports & Recreation",
  "Membership Development",
];
export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const filtered = useMemo(() => active === "All" ? projects : projects.filter((p) => p.category === active), [active, projects]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    if (projectId) {
      const index = filtered.findIndex((p) => p.id === projectId);
      if (index !== -1) {
        setSelectedIndex(index);
        window.history.replaceState({}, "", "/projects"); 
      }
    }
  }, [filtered]);

  const activeProject = selectedIndex !== null ? filtered[selectedIndex] : null;

  const carouselImages = useMemo(() => {
    if (!activeProject) return [];
    const allImages = activeProject.images || [];
    const main = activeProject.main_image;
    if (main) return [main, ...allImages.filter((img) => img !== main)];
    return allImages;
  }, [activeProject]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [selectedIndex]);

  const closeProject = () => { setSelectedIndex(null); setActiveImageIndex(0); setIsZoomed(false); };
  const goToProject = (index: number) => { setSelectedIndex(index); setActiveImageIndex(0); setIsZoomed(false); };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button key={category} type="button" onClick={() => { setActive(category); closeProject(); }} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", active === category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/70 hover:bg-accent")}>
            {category}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <div key={project.id || project.slug} onClick={() => goToProject(index)} className="cursor-pointer">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-muted-foreground">No projects in this category yet.</p>
      )}

      {activeProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 sm:p-6 md:px-20">
          <button onClick={() => goToProject(selectedIndex! - 1)} disabled={selectedIndex === 0} className="hidden md:flex absolute left-4 z-[110] p-4 bg-card/50 hover:bg-card border border-border rounded-full shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
          </button>

          <div className="relative flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <button onClick={closeProject} className="absolute top-4 right-4 z-[110] p-2 bg-background/80 hover:bg-background border border-border rounded-full backdrop-blur-md transition-colors">
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>

            <div className="relative w-full md:w-1/2 h-[45%] md:h-full bg-black flex items-center justify-center group">
              {carouselImages.length > 0 ? (
                <div className="relative w-full aspect-square sm:aspect-[4/5] max-h-full flex items-center justify-center overflow-hidden">
                  <img src={carouselImages[activeImageIndex]} alt="Photo" onClick={() => setIsZoomed(!isZoomed)} className={cn("w-full h-full transition-all duration-300", isZoomed ? "object-contain cursor-zoom-out" : "object-cover cursor-zoom-in")} />
                  {carouselImages.length > 1 && (
                    <>
                      <button onClick={() => { setIsZoomed(false); setActiveImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><HugeiconsIcon icon={ArrowLeft01Icon} size={24} /></button>
                      <button onClick={() => { setIsZoomed(false); setActiveImageIndex((prev) => (prev + 1) % carouselImages.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><HugeiconsIcon icon={ArrowRight01Icon} size={24} /></button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">
                        {carouselImages.map((_, i) => <div key={i} className={cn("h-2 rounded-full transition-all duration-300 cursor-pointer", i === activeImageIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/90")} onClick={() => { setIsZoomed(false); setActiveImageIndex(i); }} />)}
                      </div>
                    </>
                  )}
                </div>
              ) : <span className="text-white/50">No images</span>}
            </div>

            <div className="w-full md:w-1/2 h-[55%] md:h-full flex flex-col relative bg-card">
              <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24 md:pb-10">
                <div className="flex flex-wrap items-center gap-3 mb-2 pr-10">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full uppercase tracking-wider">{activeProject.category}</span>
                  {activeProject.collaborators && activeProject.collaborators.length > 0 ? (
                    activeProject.collaborators.map((collab, idx) => (
                      <a key={idx} href={collab.link || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-full transition-colors">
                        {collab.name} {collab.link && <HugeiconsIcon icon={LinkSquare01Icon} size={14} />}
                      </a>
                    ))
                  ) : (
                    activeProject.collaborative_club && (
                      <a href={activeProject.collaborative_club_link || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-full transition-colors">
                        {activeProject.collaborative_club} {activeProject.collaborative_club_link && <HugeiconsIcon icon={LinkSquare01Icon} size={14} />}
                      </a>
                    )
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-2">{activeProject.title}</h2>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                  <span className="flex items-center gap-1.5"><HugeiconsIcon icon={Calendar01Icon} size={16} /> {new Date(activeProject.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><HugeiconsIcon icon={Location01Icon} size={16} /> 
                    {activeProject.location_type === 'Online' ? "Online" : activeProject.location_type === 'Multiple' ? activeProject.location : (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeProject.location)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-colors flex items-center gap-1">
                        {activeProject.location} <HugeiconsIcon icon={LinkSquare01Icon} size={14} className="opacity-50" />
                      </a>
                    )}
                  </span>
                </div>
                
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline hover:text-primary/80" />, ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 mb-4 space-y-2" />, ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 mb-4 space-y-2" />, li: ({ node, ...props }) => <li {...props} className="pl-1" />, table: ({ node, ...props }) => <div className="overflow-x-auto mb-6"><table {...props} className="w-full border-collapse border border-border text-sm" /></div>, th: ({ node, ...props }) => <th {...props} className="border border-border bg-muted/50 p-3 font-bold text-left" />, td: ({ node, ...props }) => <td {...props} className="border border-border p-3" />, h3: ({ node, ...props }) => <h3 {...props} className="text-xl font-bold mt-8 mb-4 text-foreground" />, strong: ({ node, ...props }) => <strong {...props} className="font-bold text-foreground" /> }}>
                    {activeProject.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => goToProject(selectedIndex! + 1)} disabled={selectedIndex === filtered.length - 1} className="hidden md:flex absolute right-4 z-[110] p-4 bg-card/50 hover:bg-card border border-border rounded-full shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <HugeiconsIcon icon={ArrowRight01Icon} size={28} />
          </button>
        </div>
      )}
    </section>
  );
}