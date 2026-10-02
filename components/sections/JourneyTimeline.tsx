"use client";

import { useEffect, useRef, useState } from "react";
import type { Milestone } from "@/lib/about-data";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

type Props = {
  title: string;
  intro?: string;
  milestones: Milestone[];
};

export default function JourneyTimeline({ title, intro, milestones }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRefDesktop = useRef<HTMLDivElement>(null);
  const fillRefMobile = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const list = listRef.current;
      if (!list) return;

      const trigger = window.innerHeight * 0.6; 
      const rect = list.getBoundingClientRect();
      const scaleVal = clamp((trigger - rect.top) / rect.height);
      const scaleTransform = `scaleY(${scaleVal})`;

      if (fillRefDesktop.current) {
        fillRefDesktop.current.style.transform = scaleTransform;
      }
      if (fillRefMobile.current) {
        fillRefMobile.current.style.transform = scaleTransform;
      }

      let idx = 0;
      itemRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < trigger) idx = i;
      });
      setActive(idx);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div>
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#16241B] sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5F6F65]">
            {intro}
          </p>
        )}
      </div>

      <ol ref={listRef} className="relative mx-auto mt-20 max-w-5xl border-l-2 border-[#16241B]/10 md:border-l-0">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-[#16241B]/10 md:block"
        >
          <div
            ref={fillRefDesktop}
            className="h-full w-full origin-top bg-[#2F6B4A]"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        <div
          aria-hidden
          className="absolute left-[-2px] top-0 h-full w-[2px] bg-transparent md:hidden"
        >
          <div
            ref={fillRefMobile}
            className="h-full w-full origin-top bg-[#2F6B4A] transition-transform duration-75"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        {milestones.map((m, i) => {
          const left = i % 2 === 0;
          const reached = i <= active;
          const current = i === active; 

          return (
            <li
              key={`${m.year}-${m.title}`}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`relative pb-20 pl-10 last:pb-0 md:w-1/2 md:pl-0 ${
                left ? "md:pr-16 md:text-right" : "md:ml-auto md:pl-16"
              }`}
            >
              <span
                aria-hidden
                className={`absolute -left-[11px] top-2 h-5 w-5 rounded-full border-4 ring-8 ring-white transition-all duration-500 ${
                  left ? "md:-right-2.5 md:left-auto" : "md:-left-2.5"
                } ${
                  reached
                    ? "border-white bg-[#2F6B4A] shadow-md shadow-[#2F6B4A]/20"
                    : "border-white bg-[#16241B]/20"
                }`}
              />
              
              <div
                className={`transition-all duration-500 ${
                  reached ? "opacity-100" : "opacity-40"
                }`}
              >
                <p className={`text-4xl font-black leading-none tracking-tighter transition-colors duration-500 sm:text-5xl ${current ? "text-[#2F6B4A]" : "text-[#16241B]"}`}>
                  {m.year}
                </p>
                <h3 className="mt-4 text-2xl font-bold text-[#16241B]">{m.title}</h3>
                {m.description && (
                  <p 
                    className={`mt-3 text-lg leading-relaxed transition-colors duration-500 ${
                      current ? "text-[#16241B]" : "text-[#5F6F65]"
                    }`}
                    style={
                      current 
                        ? { textShadow: "0 0 0.5px #16241B, 0 0 0.5px #16241B" } 
                        : { textShadow: "0 0 0px transparent" }
                    }
                  >
                    {m.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}