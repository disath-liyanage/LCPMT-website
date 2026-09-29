"use client";

import { useEffect, useRef, useState } from "react";

type CardData = {
  letter: string;
  word: string;
  text: string;
};

export default function LeoScrollCards({ cards }: { cards: CardData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const trigger = window.innerHeight * 0.55;
      let currentIdx = activeIndex;

      containerRefs.current.forEach((el, i) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          if (cardCenter < trigger + 150 && cardCenter > trigger - 150) {
            currentIdx = i;
          }
        }
      });
      
      if (currentIdx !== activeIndex) {
        setActiveIndex(currentIdx);
      }
    };

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [activeIndex]);

  return (
    <div className="space-y-6 lg:col-span-7">
      {cards.map(({ letter, word, text }, i) => {
        const isActive = i === activeIndex;
        return (
          <article
            key={letter}
            ref={(el) => {
              containerRefs.current[i] = el;
            }}
            className={`group relative overflow-hidden rounded-3xl border-2 bg-white p-8 transition-all duration-500 lg:p-10 ${
              isActive
                ? "scale-[1.02] border-[#2F6B4A] shadow-xl shadow-[#2F6B4A]/15"
                : "scale-100 border-[#16241B]/5 hover:border-[#2F6B4A]/30 shadow-sm"
            }`}
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute -right-2 -top-6 select-none text-[10rem] font-black leading-none transition-all duration-500 sm:-right-4 sm:-top-8 sm:text-[14rem] ${
                isActive ? "scale-105 text-[#2F6B4A]/[0.06]" : "scale-100 text-[#16241B]/[0.03]"
              }`}
            >
              {letter}
            </span>
            <div className="relative z-10">
              <h3
                className={`text-2xl font-bold tracking-tight sm:text-3xl transition-colors duration-500 ${
                  isActive ? "text-[#2F6B4A]" : "text-[#16241B]"
                }`}
              >
                {word}
              </h3>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-[#5F6F65]">
                {text}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
