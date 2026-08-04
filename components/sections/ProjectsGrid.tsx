"use client";

import { useMemo, useState } from "react";
import ProjectCard from "@/components/ui/ProjectCard";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, LinkSquare01Icon } from "@hugeicons/core-free-icons";
import type { Project, ProjectCategory } from "@/lib/data";

const categories: (ProjectCategory | "All")[] = [
  "All",
  "Community Service",
  "Environment",
  "Health",
  "Youth Development",
  "Fundraising",
];

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? projects
        : projects.filter((p) => p.category === active),
    [active, projects]
  );

  const activeProject = selectedIndex !== null ? filtered[selectedIndex] : null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        role="group"
        aria-label="Filter projects by category"
        className="flex flex-wrap gap-2 mb-8"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setActive(category);
              setSelectedIndex(null);
            }}
            aria-pressed={active === category}
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
          {filtered.map((project, index) => (
            <div key={project.slug} onClick={() => setSelectedIndex(index)} className="cursor-pointer">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No projects in this category yet - check back soon.
        </p>
      )}

      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 sm:p-6">
          <div className="relative flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            
            <button 
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-background/50 hover:bg-background rounded-full backdrop-blur-md transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>

            <div className="w-full md:w-1/2 h-[40%] md:h-full bg-muted overflow-y-auto snap-y snap-mandatory hide-scrollbar">
              {activeProject.images && activeProject.images.length > 0 ? (
                activeProject.images.map((img, i) => (
                  <div key={i} className="w-full h-full snap-start flex-shrink-0">
                    <img 
                      src={img} 
                      alt={`${activeProject.title} photo ${i + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : activeProject.main_image ? (
                <div className="w-full h-full flex-shrink-0">
                  <img 
                    src={activeProject.main_image} 
                    alt={activeProject.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No images available</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 h-[60%] md:h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                    {activeProject.category}
                  </span>
                  
                  {activeProject.collaborative_club && (
                    activeProject.collaborative_club_link ? (
                      <a 
                        href={activeProject.collaborative_club_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-full transition-colors"
                      >
                        {activeProject.collaborative_club}
                        <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
                      </a>
                    ) : (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full">
                        {activeProject.collaborative_club}
                      </span>
                    )
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">{activeProject.title}</h2>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                  <span>{new Date(activeProject.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{activeProject.location}</span>
                </div>
                
                {/* Markdown Content */}
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown>{activeProject.description}</ReactMarkdown>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
                <button 
                  onClick={() => setSelectedIndex(selectedIndex - 1)}
                  disabled={selectedIndex === 0}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
                  <span className="hidden sm:inline font-medium">Previous Project</span>
                </button>
                
                <span className="text-sm font-medium text-muted-foreground">
                  {selectedIndex + 1} of {filtered.length}
                </span>

                <button 
                  onClick={() => setSelectedIndex(selectedIndex + 1)}
                  disabled={selectedIndex === filtered.length - 1}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="hidden sm:inline font-medium">Next Project</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}