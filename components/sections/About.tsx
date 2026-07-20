"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./About.module.css";

const PARAGRAPHS = [
  "The Leo Club of Pannipitiya Metro Titans was founded on the 17th of November 2006. However, in 2019, under the leadership of Leo Lakisha Perera, it resumed its great journey as an active Leo club in District 306 C2. Being a part of Leo Clubs international, today LCPMT is an incredible platform that is geared towards developing young professionals that provide service to others, address the physical and social needs of communities, promote integrity and promote better relationships between people through a framework of friendship and leadership.",
  "LCPMT commences a wide array of projects that target on making a world of difference. Not only that, but also projects are aligned to develop soft skills, leadership skills and fellowship among members of the club and values diversity and celebrates the contribution of each and every member regardless of age, ethnicity, race, abilities, religion, social status, cultural background, or gender. We strive to build a community as well as an environment where everyone unites to celebrate the differences and take action to create a lasting change.",
  "Our club members who are enthusiastic, energetic and passionate individuals from diverse professional fields are our pillars of strength. Even though we have completed a few years, we could accomplish several milestones with the help of them. Furthermore our club has also been recognized and acknowledged with several awards for its contribution towards the Leo Movement."
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
        <div className={styles.textContainer}>
          {PARAGRAPH_WORDS.map((words, pIndex) => (
            <p key={pIndex} className={styles.paragraph}>
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
                    {word}
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