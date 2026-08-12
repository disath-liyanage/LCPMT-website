"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./About.module.css";

const PARAGRAPHS = [
  "The Leo Club of Pannipitiya Metro Titans is a youth service organization under Leo District 306 D7, bringing together young people with a shared passion for service, leadership and fellowship.",
  "Through community-focused projects, collaborations and member-driven initiatives, we aim to address meaningful needs while creating opportunities for our members to learn, lead, connect and grow.",
  "Since our founding in 2006, the club has continued to evolve while staying committed to making a positive and lasting difference."
];

const PARAGRAPH_WORDS = PARAGRAPHS.map(p => p.split(" "));
const TOTAL_WORDS = PARAGRAPH_WORDS.reduce((acc, words) => acc + words.length, 0);

export default function AboutPreview() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frame: number | null = null;

    const measure = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      
      const progress = scrollable > 0 ? Math.min(Math.max(scrolled / scrollable, 0), 1) : 0;
      setActiveIndex(progress * TOTAL_WORDS);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        measure();
        frame = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  let globalWordIndex = 0;

  return (
    <section id="about" className={styles.about} ref={wrapperRef}>
      <div className={styles.sticky}>
        <div 
          className={styles.textContainer} 
          style={{ 
            maxWidth: "1000px", 
            margin: "0 auto", 
            padding: "0 20px",
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            lineHeight: "1.3",
            textAlign: "center",
            fontWeight: "500"
          }}
        >
          {PARAGRAPH_WORDS.map((words, pIndex) => (
            <p key={pIndex} className={styles.paragraph} style={{ marginBottom: "1.5rem" }}>
              {words.map((word) => {
                const currentIndex = globalWordIndex++;
                const reveal = Math.min(Math.max(activeIndex - currentIndex, 0), 1);
                
                return (
                  <span
                    key={currentIndex}
                    className={`${styles.word} ${reveal > 0.5 ? styles.wordActive : ""}`}
                    style={{ opacity: 0.25 + reveal * 0.75 }}
                    data-word={word}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}