"use client"

import React from 'react'

export default function LogoSlider() {
  const logos = [
    { src: "/images/lion-logo.png", alt: "Lion Logo" },
    { src: "/images/Beyond.png", alt: "Beyond Boundaries Logo" },
    { src: "/images/leo-logo.png", alt: "Leo Logo" },
    { src: "/images/leo-md.webp", alt: "Leo MD Logo" },
    { src: "/images/District-Logo.png", alt: "Leo District Logo" },
    { src: "/images/logo.svg", alt: "LCPMT Logo" },
    { src: "/images/leosofSl.webp", alt: "Leos of Logo" },
  ];

  return (
    <section id="contact" className="relative w-full h-24 overflow-hidden bg-[#FEFDF9]">
      <style>{`
        @keyframes slideLeftToRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        .slider-track {
          display: flex;
          height: 100%;
          width: max-content;
          animation: slideLeftToRight 25s linear infinite;
        }

        .slider-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="slider-track gap-12 px-6">
        {[...logos, ...logos].map((logo, index) => (
          <div key={index} className="flex h-full w-40 flex-shrink-0 items-center justify-center">
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  )
}