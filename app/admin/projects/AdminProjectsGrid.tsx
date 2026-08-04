"use client";

import { useMemo, useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteProject, toggleFeatureProject } from "@/app/actions/projects";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowLeft01Icon, 
  ArrowRight01Icon, 
  Cancel01Icon, 
  LinkSquare01Icon 
} from "@hugeicons/core-free-icons";
import type { Project } from "@/lib/data";

const categories = [
  "All",
  "Community Service",
  "Environment",
  "Health",
  "Youth Development",
  "Fundraising",
];

const stripMarkdown = (str: string) => {
  if (!str) return "";
  return str.replace(/[#_*~`]/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").trim();
};

export default function AdminProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      active === "All"
        ? projects
        : projects.filter((p) => p.category === active),
    [active, projects]
  );

  const activeProject = selectedIndex !== null ? filtered[selectedIndex] : null;

  const carouselImages = useMemo(() => {
    if (!activeProject) return [];
    if (activeProject.images && activeProject.images.length > 0) return activeProject.images;
    if (activeProject.main_image) return [activeProject.main_image];
    return [];
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

  const closeProject = () => {
    setSelectedIndex(null);
    setActiveImageIndex(0);
    setIsZoomed(false);
  };

  const goToProject = (index: number) => {
    setSelectedIndex(index);
    setActiveImageIndex(0);
    setIsZoomed(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      startTransition(() => {
        deleteProject(id);
      });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setActive(category);
              closeProject();
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:bg-accent"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => {
            const displayImage = project.main_image || (project.images && project.images[0]) || "/placeholder.jpg";
            const previewText = project.summary || stripMarkdown(project.description);

            return (
              <div 
                key={project.id} 
                onClick={() => goToProject(index)}
                className={cn(
                  "group relative flex flex-col h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer",
                  project.featured_on_main ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
                )}
              >
                {/* Hover Action Buttons */}
                <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="secondary" size="sm" className="h-8 px-4 font-bold shadow-md bg-white text-black hover:bg-gray-200">
                    <Link href={`/admin/edit/${project.id}`} onClick={(e) => e.stopPropagation()}>
                      Edit
                    </Link>
                  </Button>
                  
                  <Button 
                    variant={project.featured_on_main ? "default" : "secondary"} 
                    size="sm" 
                    className={cn("h-8 px-4 font-bold shadow-md", !project.featured_on_main && "bg-white text-black hover:bg-gray-200")}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await toggleFeatureProject(project.id, project.featured_on_main || false);
                    }}
                  >
                    {project.featured_on_main ? "★ Featured" : "Add to Main"}
                  </Button>
                </div>

                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 px-4 font-bold shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    disabled={isPending}
                  >
                    {isPending ? "..." : "Delete"}
                  </Button>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={displayImage}
                    alt={`${project.title} photo`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {project.featured_on_main && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground z-10 shadow-md">
                      ★ Main Page
                    </span>
                  )}
                  {project.images && project.images.length > 1 && (
                    <span className="absolute right-3 bottom-3 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-medium text-foreground z-10">
                      {project.images.length} Photos
                    </span>
                  )}
                </div>
                
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-x-4 text-xs text-muted-foreground font-medium">
                    <span className="bg-muted/50 px-2 py-1 rounded-md">
                      {new Date(project.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {previewText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No projects found.</p>
        </div>
      )}

      {activeProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 sm:p-6 md:px-20">
          
          <button 
            onClick={() => goToProject(selectedIndex! - 1)}
            disabled={selectedIndex === 0}
            className="hidden md:flex absolute left-4 z-[70] p-4 bg-card/50 hover:bg-card border border-border rounded-full shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={28} />
          </button>

          <div className="relative flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            
            <button 
              onClick={closeProject}
              className="absolute top-4 right-4 z-[70] p-2 bg-background/80 hover:bg-background border border-border rounded-full backdrop-blur-md transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>

            <div className="relative w-full md:w-1/2 h-[45%] md:h-full bg-black flex items-center justify-center group">
              {carouselImages.length > 0 ? (
                <div className="relative w-full aspect-square sm:aspect-[4/5] max-h-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={carouselImages[activeImageIndex]} 
                    alt={`Photo ${activeImageIndex + 1}`} 
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={cn(
                      "w-full h-full transition-all duration-300",
                      isZoomed ? "object-contain cursor-zoom-out" : "object-cover cursor-zoom-in"
                    )}
                  />

                  {carouselImages.length > 1 && (
                    <>
                      <button 
                        onClick={() => { setIsZoomed(false); setActiveImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
                      </button>
                      <button 
                        onClick={() => { setIsZoomed(false); setActiveImageIndex((prev) => (prev + 1) % carouselImages.length); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">
                        {carouselImages.map((_, i) => (
                          <div 
                            key={i}
                            className={cn(
                              "h-2 rounded-full transition-all duration-300 cursor-pointer",
                              i === activeImageIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/90"
                            )}
                            onClick={() => { setIsZoomed(false); setActiveImageIndex(i); }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-white/50">No images</span>
              )}
            </div>

            <div className="w-full md:w-1/2 h-[55%] md:h-full flex flex-col relative bg-card">
              <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24 md:pb-10">
                <div className="flex flex-wrap items-center gap-3 mb-4 pr-10">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                    {activeProject.category}
                  </span>
                  
                  {activeProject.collaborative_club && (
                    <a 
                      href={activeProject.collaborative_club_link || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-full transition-colors"
                    >
                      {activeProject.collaborative_club}
                      {activeProject.collaborative_club_link && <HugeiconsIcon icon={LinkSquare01Icon} size={14} />}
                    </a>
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">{activeProject.title}</h2>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                  <span>{new Date(activeProject.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{activeProject.location}</span>
                </div>
                
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline hover:text-primary/80" />,
                      ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 mb-4 space-y-2" />,
                      ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 mb-4 space-y-2" />,
                      li: ({ node, ...props }) => <li {...props} className="pl-1" />,
                      table: ({ node, ...props }) => <div className="overflow-x-auto mb-6"><table {...props} className="w-full border-collapse border border-border text-sm" /></div>,
                      th: ({ node, ...props }) => <th {...props} className="border border-border bg-muted/50 p-3 font-bold text-left" />,
                      td: ({ node, ...props }) => <td {...props} className="border border-border p-3" />,
                      h3: ({ node, ...props }) => <h3 {...props} className="text-xl font-bold mt-8 mb-4 text-foreground" />,
                      strong: ({ node, ...props }) => <strong {...props} className="font-bold text-foreground" />,
                    }}
                  >
                    {activeProject.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => goToProject(selectedIndex! + 1)}
            disabled={selectedIndex === filtered.length - 1}
            className="hidden md:flex absolute right-4 z-[70] p-4 bg-card/50 hover:bg-card border border-border rounded-full shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={28} />
          </button>
        </div>
      )}
    </div>
  );
}