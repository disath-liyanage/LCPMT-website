"use client";

import { useRef, useState, useEffect } from "react";
import ProjectCard from "@/components/ui/ProjectCard";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function FeaturedCarousel({ projects }: { projects: Project[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [projects]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
      
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
      
      setTimeout(checkScroll, 400); 
    }
  };

  return (
    <div className="relative group/carousel w-full">
      
      {projects.length > 3 && (
        <button 
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={cn(
            "absolute -left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-background border border-border rounded-full shadow-lg transition-all duration-300 hidden lg:flex",
            !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
          )}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
        </button>
      )}

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="w-full flex-none snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333333%-16px)]"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {projects.length > 3 && (
        <button 
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={cn(
            "absolute -right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-background border border-border rounded-full shadow-lg transition-all duration-300 hidden lg:flex",
            !canScrollRight ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
          )}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
        </button>
      )}
    </div>
  );
}