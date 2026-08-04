import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/ui/ProjectCard";
import { getFeaturedProjects } from "@/app/actions/projects";

export default async function FeaturedProjects() {
  const featuredProjects = await getFeaturedProjects();

  if (!featuredProjects || featuredProjects.length === 0) {
    return null; 
  }

  return (
    <section className="bg-muted/30 py-20" id="projects">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end mb-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Our Impact
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Projects
            </h2>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/projects">
              View All Projects
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}