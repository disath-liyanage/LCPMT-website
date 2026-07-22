import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/ui/ProjectCard";

import { getProjects } from "@/app/actions/projects"; 

export default async function ProjectsPreview() {
  const projects = await getProjects();
  const featured = projects.slice(0, 3);

  return (
    <section className="bg-muted/50" id="projects">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Our Work
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Recent &amp; Upcoming Projects
            </h2>
          </div>
          <Button
            variant="outline"
            render={
              <Link href="/projects">
                View All Projects
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </Link>
            }
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug || project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}