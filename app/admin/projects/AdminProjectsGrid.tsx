"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteProject, toggleFeatureProject } from "@/app/actions/projects";
import ProjectCard from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/data";

const categories = [
  "All",
  "Community Service",
  "International Service",
  "Digital Transformation",
  "Public Relations",
  "Sports & Recreation",
  "Membership Development",
];

export default function AdminProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      active === "All"
        ? projects
        : projects.filter((p) => p.category === active),
    [active, projects]
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      startTransition(() => { deleteProject(id); });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm",
              active === category
                ? "bg-[#2F6B4A] text-white border-[#2F6B4A] hover:bg-[#25573C] hover:border-[#25573C]"
                : "bg-background border-border/80 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <div key={project.id} className="group relative h-full rounded-2xl overflow-hidden">
              <div className="h-full w-full [&_.absolute.top-3.left-3]:group-hover:opacity-0 [&_.absolute.top-4.left-4]:group-hover:opacity-0 [&_.absolute.top-3.left-3]:transition-opacity [&_.absolute.top-4.left-4]:transition-opacity">
                <ProjectCard project={project} />
              </div>
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-t-2xl" />

              <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col xl:flex-row gap-2">
                <Link 
                  href={`/admin/edit/${project.id}`} 
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8 px-4 font-bold shadow-md bg-white text-black hover:bg-gray-200")}
                >
                  Edit
                </Link>
                <Button 
                  variant="secondary"
                  size="sm" 
                  className={cn("h-8 px-4 font-bold shadow-md", project.featured_on_main ? "bg-[#2F6B4A] hover:bg-[#25573C] text-white" : "bg-white text-black hover:bg-gray-200")} 
                  onClick={async () => { await toggleFeatureProject(project.id, project.featured_on_main || false); }}
                >
                  {project.featured_on_main ? "★ Featured" : "Add to Main"}
                </Button>
              </div>

              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-8 px-4 font-bold shadow-xl border border-red-800 bg-red-600/90 hover:bg-red-700 backdrop-blur-md text-white transition-all" 
                  onClick={() => handleDelete(project.id)} 
                  disabled={isPending}
                >
                  {isPending ? "..." : "Delete"}
                </Button>
              </div>

              {project.featured_on_main && (
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                  <span className="bg-[#2F6B4A] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-[#2F6B4A]/50">
                    ★ Main Page
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No projects found.</p>
        </div>
      )}
    </div>
  );
}