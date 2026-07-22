import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Location01FreeIcons } from "@hugeicons/core-free-icons";
import type { Project } from "@/lib/data";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={project.image}
          alt={`${project.title} - ${project.category} project photo`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          {project.category}
        </span>
        {project.status === "upcoming" && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Upcoming
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-foreground">
          {project.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Calendar01Icon} size={14} />
            {project.date}
          </span>
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Location01FreeIcons} size={14} />
            {project.location}
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
      </div>
    </article>
  );
}