import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Location01FreeIcons } from "@hugeicons/core-free-icons";
import type { Project } from "@/lib/data";

const stripMarkdown = (str: string) => {
  if (!str) return "";
  return str
    .replace(/[#_*~`]/g, "") // Remove bold, italics, headers, code
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Replace links with just the text
    .trim();
};

export default function ProjectCard({ project }: { project: Project }) {
  const displayImage = project.main_image || (project.images && project.images[0]) || "/placeholder.jpg";
  const previewText = project.summary || stripMarkdown(project.description);

  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={displayImage}
          alt={`${project.title} photo`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-secondary/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-secondary-foreground">
          {project.category}
        </span>
        {project.status === "upcoming" && (
          <span className="absolute right-3 top-3 rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary-foreground">
            Upcoming
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <HugeiconsIcon icon={Calendar01Icon} size={14} />
            {new Date(project.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <HugeiconsIcon icon={Location01FreeIcons} size={14} />
            {project.location}
          </span>
        </div>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {previewText}
        </p>
      </div>
    </article>
  );
}