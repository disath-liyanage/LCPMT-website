"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/site-config";

export default function Navbar() {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    
    if (!hero) {
      setPastHero(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-80% 0px 0px 0px" }
    );
    
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const sectionIds = navLinks
      .map((link) => {
        if (link.href === "/") return "hero";
        return link.href.replace("/#", "").replace("#", "").replace("/", "");
      })
      .filter(Boolean);

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const updateIndicator = () => {
      if (!navContainerRef.current) return;
      
      const activeLink = navContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      
      if (activeLink) {
        const targetId = activeLink.getAttribute("data-target");
        
        if (targetId === "hero") {
          setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
        } else {
          setIndicatorStyle({
            left: activeLink.offsetLeft,
            width: activeLink.offsetWidth,
            opacity: 1,
          });
        }
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    
    const timer = setTimeout(updateIndicator, 150);
    
    window.addEventListener("resize", updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeSection, pathname]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-[clamp(0.75rem,2vh,1.5rem)] z-[100] flex justify-center px-2 sm:px-4 pointer-events-none transition-all duration-400 ease-out",
        pastHero ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto relative flex items-center justify-between w-full max-w-5xl rounded-full px-4 py-2 sm:px-6 sm:py-2.5 transition-all duration-300",
          "bg-[#F5F0E8]/85 backdrop-blur-[12px] backdrop-saturate-[140%] border border-[#D8CCB8]/50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
          !pastHero && "pointer-events-none"
        )}
      >
        <Link
          href="/#hero"
          className="flex shrink-0 items-center gap-3 z-10 transition-transform hover:scale-105"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
            LT
          </span>
          <span className="hidden sm:flex flex-col leading-tight whitespace-nowrap">
            <span className="text-sm font-bold text-[#2D3F2B]">
              Leo Club of
            </span>
            <span className="text-sm font-bold tracking-wide text-[#2D3F2B]">
              Pannipitiya Metro Titans
            </span>
          </span>
        </Link>

        <div 
          ref={navContainerRef}
          className="relative flex items-center gap-4 sm:gap-6 overflow-x-auto mx-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden z-10"
        >
          <span 
            className="absolute bottom-1 h-[2px] rounded-full bg-[#2D3F2B] transition-all duration-1500 ease-out pointer-events-none"
            style={indicatorStyle}
          />

          {navLinks
            .filter((link) => link.label.toLowerCase() !== "join us")
            .map((link) => {
              const targetId = link.href === "/" 
                ? "hero" 
                : link.href.replace("/#", "").replace("#", "").replace("/", "");
              
              let active = false;

              if (activeSection) {
                active = activeSection === targetId;
              } else {
                if (pathname === "/") {
                  active = targetId === "hero";
                } else {
                  active = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
                }
              }
                  
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={active}
                  data-target={targetId}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative whitespace-nowrap px-1 py-1 text-[13px] sm:text-[14px] transition-colors duration-300",
                    active
                      ? "text-[#2D3F2B] font-bold"
                      : "text-[#556B52] font-semibold hover:text-[#1C2B1E] hover:font-bold"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
        </div>

        <div className="shrink-0 z-10">
          <Link
            href="/join"
            className="inline-flex whitespace-nowrap rounded-full border border-[#2D3F2B] px-4 py-1.5 sm:px-5 sm:py-2 text-[13px] sm:text-sm font-semibold text-[#2D3F2B] transition-all duration-200 hover:bg-[#2D3F2B] hover:text-[#F5F0E8] active:scale-95"
          >
            Join Us
          </Link>
        </div>
      </nav>
    </header>
  );
}