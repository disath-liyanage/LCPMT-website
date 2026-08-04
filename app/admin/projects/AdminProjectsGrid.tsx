"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/app/actions/projects";

type Project = {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  location: string;
  description: string;
  image_url: string | null;
};

const categories = [
  "All",
  "Community Service",
  "Environment",
  "Health",
  "Youth Development",
  "Fundraising",
];

export default function AdminProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
            onClick={() => setActive(category)}
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
          {filtered.map((project) => (
            <div 
              key={project.id} 
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer"
              onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
            >
              <div className="h-40 w-full bg-muted flex items-center justify-center">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-sm">No Image</span>
                )}
              </div>
              
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {project.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              </div>

              {expandedId === project.id && (
                <div 
                  className="flex gap-3 p-4 border-t border-border bg-muted/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/admin/edit/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Edit</Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleDelete(project.id)}
                    disabled={isPending}
                  >
                    {isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            No projects in this category yet. Time to build something.
          </p>
        </div>
      )}
    </div>
  );
}