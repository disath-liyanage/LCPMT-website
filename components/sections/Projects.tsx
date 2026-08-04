import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { getFeaturedProjects } from "@/app/actions/projects";
import FeaturedCarousel from "./FeaturedCarousel";

export default async function FeaturedProjects() {
  const featuredProjects = await getFeaturedProjects();

  if (!featuredProjects || featuredProjects.length === 0) {
    return null; 
  }

  return (
    <section className="bg-muted/30 py-24" id="projects">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end mb-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Our Impact
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Projects
            </h2>
          </div>
          
          <Link 
            href="/projects" 
            className="group flex items-center gap-2 text-sm font-semibold tracking-wide text-primary hover:text-primary/80 transition-colors pb-1"
          >
            <span>View All Projects</span>
            <HugeiconsIcon 
              icon={ArrowRight01Icon} 
              size={18} 
              className="transition-transform duration-300 group-hover:translate-x-1.5" 
            />
          </Link>
        </div>

        <FeaturedCarousel projects={featuredProjects} />

      </div>
    </section>
  );
}