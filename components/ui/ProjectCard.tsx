import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import type { Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function ProjectCard({ project }: { project: Project }) {
  const displayImage = project.main_image || (project.images && project.images[0]) || "/placeholder.jpg";
  const previewText = project.summary || project.description;

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
        <Button variant="frosted-pill" size="xs" className="absolute left-3 top-3 pointer-events-none tracking-wider">
          {project.category}
        </Button>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {project.title}
        </h3>
        
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground/80 pb-1">
          <span className="flex items-center gap-1.5 bg-background border border-border/80 shadow-sm px-2.5 py-1 rounded-full whitespace-nowrap">
            <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-primary shrink-0" />
            <span className="truncate max-w-[120px]">
              {new Date(project.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </span>
          <span className="flex items-center gap-1.5 bg-background border border-border/80 shadow-sm px-2.5 py-1 rounded-full whitespace-nowrap">
            <HugeiconsIcon icon={Location01Icon} size={16} className="text-primary shrink-0" />
            <span className="truncate max-w-[150px]">
              {project.location_type === 'Online' ? "Online" : project.location}
            </span>
          </span>
        </div>
        
        <div className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80 font-medium line-clamp-3 [&>p]:inline [&>strong]:text-foreground [&>strong]:font-bold [&>a]:text-primary">
          <ReactMarkdown>{previewText}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}