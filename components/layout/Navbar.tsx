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
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);

  const isHomePage = pathname === "/";
  const showNavBg = !isHomePage || isScrolled;
  const solidBg = showNavBg || menuOpen;

  useEffect(() => {
    const handleScrollBg = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScrollBg();
    window.addEventListener("scroll", handleScrollBg, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollBg);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = navLinks
      .map((link) => (link.href.includes("#") ? link.href.split("#")[1] : null))
      .filter((id): id is string => Boolean(id));

    let ticking = false;

    const compute = () => {
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
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const updateIndicator = () => {
      if (!navContainerRef.current) return;

      const activeLink = navContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;

      if (activeLink && activeLink.offsetWidth > 0 && showNavBg) {
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
  }, [activeSection, pathname, showNavBg]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setMenuOpen(false);

    const hashPart = href.includes("#") ? href.split("#")[1] : null;
    if (!hashPart || pathname !== "/") return;

    const el = document.getElementById(hashPart);
    if (!el) return;

    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const isLinkActive = (href: string, forceShow = false) => {
    if (!showNavBg && !forceShow) return false;

    const hashPart = href.includes("#") ? href.split("#")[1] : null;

    if (pathname === "/") {
      return hashPart ? activeSection === hashPart : false;
    }

    const basePath = href.split("#")[0] || "/";

    if (basePath !== "/") {
      return pathname === basePath || pathname.startsWith(`${basePath}/`);
    }
    if (hashPart) {
      const routePath = `/${hashPart}`;
      return pathname === routePath || pathname.startsWith(`${routePath}/`);
    }
    return false;
  };

  const visibleLinks = navLinks.filter((link) => link.label.toLowerCase() !== "join us");

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
            solidBg
              ? cn(
                  "bg-[#F5F0E8]/55 backdrop-blur-2xl backdrop-saturate-[180%] backdrop-brightness-125",
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
                <span className="text-sm font-bold text-[#2D3F2B] antialiased">Leo Club of</span>
                <span className="text-sm font-bold tracking-wide text-[#2D3F2B] antialiased">
                  Pannipitiya Metro Titans
                </span>
              </span>
            </Link>

            <div
              ref={navContainerRef}
              className="relative hidden min-w-0 flex-1 items-center justify-end gap-6 overflow-x-auto py-1.5 md:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <span
                className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-[#2D3F2B] transition-all duration-300 ease-out"
                style={indicatorStyle}
              />

              {visibleLinks
                .filter((link) => !(!showNavBg && link.label.toLowerCase() === "home"))
                .map((link) => {
                  const hashPart = link.href.includes("#") ? link.href.split("#")[1] : null;
                  const targetId = hashPart || link.href.replace(/^\/+/, "");
                  const active = isLinkActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      data-active={active}
                      data-target={targetId}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative whitespace-nowrap px-1 py-1 text-[14px] transition-colors duration-300 antialiased",
                        active
                          ? "text-[#2D3F2B] font-bold"
                          : "text-[#556B52] font-semibold hover:text-[#1C2B1E]"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
            </div>

            <div className="z-10 ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:pl-2">
              <Link href="/join" className="block">
                <ShinyButton
                  className={cn(
                    "h-8 px-4 sm:h-9 sm:px-5 !text-[13px] sm:!text-[14px] !font-bold tracking-wide",
                    !solidBg && "pause-shiny"
                  )}
                >
                  Join Us
                </ShinyButton>
              </Link>

              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((o) => !o)}
                className="relative h-10 w-10 shrink-0 rounded-full transition-colors active:bg-[#2D3F2B]/10 md:hidden"
              >
                <span
                  className={cn(
                    "absolute left-1/2 top-1/2 -ml-[10px] -mt-px h-0.5 w-5 rounded-full bg-[#2D3F2B] transition-all duration-300",
                    menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[6px]"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-1/2 top-1/2 -ml-[10px] -mt-px h-0.5 w-5 rounded-full bg-[#2D3F2B] transition-all duration-300",
                    menuOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-1/2 top-1/2 -ml-[10px] -mt-px h-0.5 w-5 rounded-full bg-[#2D3F2B] transition-all duration-300",
                    menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[6px]"
                  )}
                />
              </button>
            </div>
          </div>
        </nav>

        {menuOpen && (
          <div
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 bg-black/25 md:hidden"
          />
        )}

        <div
          id="mobile-menu"
          className={cn(
            "absolute inset-x-0 top-full overflow-hidden border-t border-[#2D3F2B]/10 bg-[#F5F0E8]/55 backdrop-blur-2xl backdrop-saturate-[180%] backdrop-brightness-125",
            "shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out md:hidden",
            menuOpen ? "visible max-h-[calc(100dvh-4rem)] opacity-100" : "invisible max-h-0 opacity-0"
          )}
        >
          <ul className="mx-auto flex max-w-6xl flex-col px-3 py-2 sm:px-6">
            {visibleLinks.map((link) => {
              const active = isLinkActive(link.href, true);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-lg border-l-2 px-3 text-base antialiased transition-colors",
                      active
                        ? "border-[#2D3F2B] bg-[#2D3F2B]/5 font-bold text-[#2D3F2B]"
                        : "border-transparent font-semibold text-[#556B52] active:bg-[#2D3F2B]/5"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </header>
    </>
  );
}