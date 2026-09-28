"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/site-config";
import { ShinyButton } from "@/components/ui/shiny-button";

const NAV_HEIGHT = 64;

export default function Navbar() {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

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
    if (pathname !== "/") return;

    const sectionIds = navLinks
      .map((link) => (link.href.includes("#") ? link.href.split("#")[1] : null))
      .filter((id): id is string => Boolean(id));

    const handleScroll = () => {
      let current = "hero";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - NAV_HEIGHT <= 0) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const updateIndicator = () => {
      if (!navContainerRef.current) return;

      const activeLink = navContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;

      if (activeLink && pastHero) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          opacity: 1,
        });
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
  }, [activeSection, pathname, pastHero]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    const hashPart = href.includes("#") ? href.split("#")[1] : null;
    if (!hashPart || pathname !== "/") return;

    const el = document.getElementById(hashPart);
    if (!el) return;

    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .pause-shiny,
        .pause-shiny::before,
        .pause-shiny::after,
        .pause-shiny span::before {
          animation-play-state: paused !important;
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-[100]">
        <nav
          aria-label="Primary"
          className={cn(
            "relative h-16 w-full transition-all duration-300",
            pastHero
              ? cn(
                  "bg-[#F5F0E8]/55 backdrop-blur-2xl backdrop-saturate-[180%]",
                  "shadow-[0_4px_24px_rgba(0,0,0,0.10)]"
                )
              : "bg-transparent backdrop-blur-0 shadow-none"
          )}
        >
          <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-3 sm:px-6">
            <Link
              href="/#hero"
              onClick={(e) => handleNavClick(e, "/#hero")}
              aria-label="Leo Club of Pannipitiya Metro Titans, go to home"
              className="group flex h-full shrink-0 items-center gap-3"
            >
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
                <Image
                  src="/images/logo.svg"
                  alt="Leo Club Logo"
                  width={128}
                  height={128}
                  quality={100}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="hidden flex-col justify-center leading-tight whitespace-nowrap sm:flex">
                <span className="text-sm font-bold text-[#2D3F2B]">Leo Club of</span>
                <span className="text-sm font-bold tracking-wide text-[#2D3F2B]">
                  Pannipitiya Metro Titans
                </span>
              </span>
            </Link>

            <div
              ref={navContainerRef}
              className="relative flex min-w-0 flex-1 items-center justify-end gap-4 overflow-x-auto py-1.5 sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <span
                className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-[#2D3F2B] transition-all duration-300 ease-out"
                style={indicatorStyle}
              />

              {navLinks
                .filter((link) => link.label.toLowerCase() !== "join us")
                .filter((link) => !(!pastHero && link.label.toLowerCase() === "home"))
                .map((link) => {
                  const hashPart = link.href.includes("#") ? link.href.split("#")[1] : null;
                  const targetId = hashPart || link.href.replace(/^\/+/, "");

                  let active = false;

                  if (pathname === "/") {
                    if (hashPart) {
                      active = activeSection === targetId;
                    }
                  } else {
                    const basePath = link.href.split("#")[0] || "/";

                    if (basePath !== "/") {
                      active = pathname === basePath || pathname.startsWith(`${basePath}/`);
                    } else if (hashPart) {
                      const routePath = `/${hashPart}`;
                      active = pathname === routePath || pathname.startsWith(`${routePath}/`);
                    }
                  }

                  if (!pastHero) {
                    active = false;
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
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

            <div className="shrink-0 z-10 flex items-center">
              <Link href="/join" className="block">
                <ShinyButton
                  className={cn(
                    "h-8 px-4 sm:h-9 sm:px-5 !text-[13px] sm:!text-[14px] !font-bold tracking-wide",
                    !pastHero && "pause-shiny"
                  )}
                >
                  Join Us
                </ShinyButton>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}