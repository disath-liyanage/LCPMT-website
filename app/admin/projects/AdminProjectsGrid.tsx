"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteProject, toggleFeatureProject } from "@/app/actions/projects";
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

const stripMarkdown = (str: string) => {
  if (!str) return "";
  return str.replace(/[#_*~`]/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").trim();
};

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
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button key={category} type="button" onClick={() => setActive(category)} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", active === category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/70 hover:bg-accent")}>
            {category}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const displayImage = project.main_image || (project.images && project.images[0]) || "/placeholder.jpg";
            const previewText = project.summary || stripMarkdown(project.description);

            return (
              <div key={project.id} className={cn("group relative flex flex-col h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg", project.featured_on_main ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border")}>
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col sm:flex-row gap-2">
                  <Link href={`/admin/edit/${project.id}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8 px-4 font-bold shadow-md bg-white text-black hover:bg-gray-200")}>
                    Edit
                  </Link>
                  <Button variant={project.featured_on_main ? "default" : "secondary"} size="sm" className={cn("h-8 px-4 font-bold shadow-md", !project.featured_on_main && "bg-white text-black hover:bg-gray-200")} onClick={async () => { await toggleFeatureProject(project.id, project.featured_on_main || false); }}>
                    {project.featured_on_main ? "★ Featured" : "Add to Main"}
                  </Button>
                </div>

                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="destructive" size="sm" className="h-8 px-4 font-bold shadow-xl border border-red-800 bg-red-600/50 hover:bg-red-600/90 backdrop-blur-md text-white transition-all" onClick={() => handleDelete(project.id)} disabled={isPending}>
                    {isPending ? "..." : "Delete"}
                  </Button>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img src={displayImage} alt={`${project.title} photo`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {project.featured_on_main && <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground z-10 shadow-md">★ Main Page</span>}
                  {project.images && project.images.length > 1 && <span className="absolute right-3 bottom-3 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-medium text-foreground z-10">{project.images.length} Photos</span>}
                </div>
                
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-bold text-foreground">{project.title}</h3>
                  <div className="mt-3 flex items-center gap-x-4 text-xs text-muted-foreground font-medium">
                    <span className="bg-muted/50 px-2 py-1 rounded-md">{new Date(project.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{previewText}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm"><p className="text-muted-foreground">No projects found.</p></div>
      )}
    </div>
  );
}