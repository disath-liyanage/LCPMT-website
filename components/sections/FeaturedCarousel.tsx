"use client";

import { useRef, useState, useEffect } from "react";
import ProjectCard from "@/components/ui/ProjectCard";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function FeaturedCarousel({ projects }: { projects: Project[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateSliderAndButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 2);

      if (thumbRef.current) {
        const thumbWidth = (clientWidth / scrollWidth) * 100;
        const scrollPercentage = (scrollLeft / scrollWidth) * 100;
        thumbRef.current.style.width = `${thumbWidth}%`;
        thumbRef.current.style.left = `${scrollPercentage}%`;
      }
    }
  };

  useEffect(() => {
    updateSliderAndButtons();
    window.addEventListener("resize", updateSliderAndButtons);
    return () => window.removeEventListener("resize", updateSliderAndButtons);
  }, [projects]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
      
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative group/carousel w-full flex flex-col gap-4">
      <div className="relative w-full flex items-center">
        <Button 
          variant="frosted-nav"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={cn(
            "absolute -left-6 z-20 w-14 h-14 rounded-full hidden lg:flex items-center justify-center transition-all duration-300",
            !canScrollLeft 
              ? "!opacity-0 pointer-events-none" 
              : "opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
          )}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>

        <div 
          ref={scrollRef}
          onScroll={updateSliderAndButtons}
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
        >
          {projects.map((project) => (
            <Link 
              href={`/projects?project=${project.id}`}
              key={project.id} 
              className="w-full flex-none snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333333%-16px)] cursor-pointer block"
            >
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>

        <Button 
          variant="frosted-nav"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={cn(
            "absolute -right-6 z-20 w-14 h-14 rounded-full hidden lg:flex items-center justify-center transition-all duration-300",
            !canScrollRight 
              ? "!opacity-0 pointer-events-none" 
              : "opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
          )}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </div>

      <div className="w-24 sm:w-32 h-1.5 bg-secondary/50 rounded-full relative overflow-hidden mt-2 mx-auto">
        <div 
          ref={thumbRef}
          className="absolute top-0 left-0 h-full bg-[#2F6B4A] rounded-full transition-none"
        />
      </div>
    </div>
  );
}