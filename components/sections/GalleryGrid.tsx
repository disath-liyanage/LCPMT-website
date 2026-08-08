"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type ProjectImage = {
  url: string;
  projectId: string | number;
  projectTitle: string;
};

export default function GalleryGrid({ projects }: { projects: any[] }) {
  const [activeFilter, setActiveFilter] = useState<string | number>("all");

  const allImages: ProjectImage[] = projects.flatMap((project) => 

    (project.images || []).map((url: string) => ({
      url,
      projectId: project.id,
      projectTitle: project.title, 
    }))
  );

  const displayedImages = activeFilter === "all" 
    ? allImages 
    : allImages.filter((img) => img.projectId === activeFilter);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          onClick={() => setActiveFilter("all")}
          className="rounded-full"
        >
          All Photos
        </Button>
        
        {projects.map((project) => (
          <Button
            key={project.id}
            variant={activeFilter === project.id ? "default" : "outline"}
            onClick={() => setActiveFilter(project.id)}
            className="rounded-full"
          >
            {project.title}
          </Button>
        ))}
      </div>

      {displayedImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedImages.map((image, index) => (
            <div 
              key={`${image.projectId}-${index}`} 
              className="relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              <img
                src={image.url}
                alt={`${image.projectTitle} photo`}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No images found. Add some damn photos to your projects!
        </div>
      )}
    </div>
  );
}