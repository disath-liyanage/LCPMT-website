"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const topLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  
  const slashRef = useRef<SVGLineElement>(null);
  const revealBgRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      const diagLength = window.innerWidth + window.innerHeight; 
      gsap.set(slashRef.current, { 
        strokeDasharray: diagLength,
        strokeDashoffset: diagLength
      });

      tl.to(slashRef.current, {
        strokeDashoffset: 0,
        duration: 0.25,
        ease: "power4.in",
        delay: 0.5,
      })
      .to(slashRef.current, {
        opacity: 0,
        duration: 0.1,
      })
      .to(topLeftRef.current, {
        xPercent: -100,
        yPercent: -100,
        duration: 1.2,
        ease: "power3.inOut",
      }, "<")
      .to(bottomRightRef.current, {
        xPercent: 100,
        yPercent: 100,
        duration: 1.2,
        ease: "power3.inOut",
      }, "<")
      .fromTo([logoImageRef.current, textRef.current],
        { scale: 0.9, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" },
        "-=0.9"
      )
      .add(() => {
        gsap.to(logoImageRef.current, {
          scale: 1.08,
          duration: 4,
          ease: "sine.out"
        });
      }, "-=1.0")
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        delay: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          setIsAnimating(false);
          onComplete();
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (!isAnimating) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
    >
      <div 
        ref={revealBgRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 pointer-events-auto"
        style={{ background: "radial-gradient(circle at center, #eef5f0 0%, #5c7c64 100%)" }}
      >
        <Image
          ref={logoImageRef}
          src="/images/logo.svg"
          alt="Leo Club Logo"
          width={400}
          height={400}
          className="h-72 w-72 object-contain drop-shadow-xl"
          priority
        />

        <h1
          ref={textRef}
          className="text-center font-sans text-xl font-black uppercase tracking-widest text-[#0f2a1d] sm:text-2xl"
        >
          Leo Club of Pannipitiya <br /> Metro Titans
        </h1>
      </div>

      <svg className="absolute inset-0 z-30 h-full w-full pointer-events-none drop-shadow-[0_0_12px_rgba(255,255,255,1)]">
        <line 
          ref={slashRef} 
          x1="100%" 
          y1="0" 
          x2="0" 
          y2="100%" 
          stroke="white" 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
      </svg>

      <div
        ref={topLeftRef}
        className="absolute inset-0 z-20 flex items-center justify-center bg-background pointer-events-auto [clip-path:polygon(0_0,100%_0,0_100%)]"
      >
        <Image 
          src="/images/titan.svg" 
          alt="Titan" 
          width={900} 
          height={900} 
          className="h-[80vh] w-auto max-w-[95vw] object-contain opacity-10"
          priority
        />
      </div>
      
      <div
        ref={bottomRightRef}
        className="absolute inset-0 z-20 flex items-center justify-center bg-background pointer-events-auto [clip-path:polygon(100%_0,100%_100%,0_100%)]"
      >
        <Image 
          src="/images/titan.svg" 
          alt="Titan" 
          width={900} 
          height={900} 
          className="h-[80vh] w-auto max-w-[95vw] object-contain opacity-10"
          priority
        />
      </div>
    </div>
  );
}