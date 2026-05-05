"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const links = [
  { name: "home", href: "#" },
  { name: "about us", href: "#" },
  { name: "catalog", href: "#" },
  { name: "contact", href: "#" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      gsap.set(".menu-panel", { xPercent: 100 });
      gsap.set(".menu-link-item", { yPercent: 50, autoAlpha: 0 });

      const tl = gsap.timeline({ paused: true });
      tlRef.current = tl;

      // Slower cascade effect
      tl.to(".menu-panel", {
        xPercent: 0,
        duration: 1.1,
        ease: "power4.inOut",
        stagger: 0.15,
      });

      tl.to(
        ".menu-link-item",
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
        },
        "-=0.6"
      );
    },
    { scope: containerRef }
  );

  useEffect(() => {
    if (isOpen) {
      tlRef.current?.play();
    } else {
      tlRef.current?.reverse();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 pointer-events-none">
      {/* Click-away backdrop */}
      {isOpen && (
        <div 
          className="absolute inset-0 pointer-events-auto bg-transparent z-0" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      {/* Cascading Panels (30% width on desktop) */}
      <div className="menu-panel absolute top-0 bottom-0 right-0 w-full sm:w-[50vw] md:w-[30vw] rounded-l-3xl bg-[#ef4444] pointer-events-auto" style={{ willChange: 'transform' }} />
      <div className="menu-panel absolute top-0 bottom-0 right-0 w-full sm:w-[50vw] md:w-[30vw] rounded-l-3xl bg-[#242422] pointer-events-auto" style={{ willChange: 'transform' }} />
      <div className="menu-panel absolute top-0 bottom-0 right-0 w-full sm:w-[50vw] md:w-[30vw] rounded-l-3xl bg-[#f4ead7] pointer-events-auto flex flex-col justify-center px-8 sm:px-12 md:px-16" style={{ willChange: 'transform' }}>
        
        {/* Navigation Links inside final panel */}
        <nav className="flex flex-col gap-2 sm:gap-4 w-full mt-4">
          {links.map((link, index) => (
            <div key={link.name} className="overflow-hidden py-1">
              <div className="menu-link-item">
                <MenuLink name={link.name} />
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto absolute top-6 sm:top-10 right-6 sm:right-10 flex items-center gap-1.5 sm:gap-2 text-[0.8rem] sm:text-[0.95rem] font-bold tracking-widest text-[#242422] z-[110] group transition-opacity"
        aria-label="Toggle Menu"
      >
        <div className="relative overflow-hidden h-[1.4em] leading-none">
          <div className={`flex flex-col transition-transform duration-500 ease-in-out ${isOpen ? "-translate-y-1/2" : "translate-y-0"}`}>
            <span className="h-[1.4em] flex items-center">Menu</span>
            <span className="h-[1.4em] flex items-center">Close</span>
          </div>
        </div>
        <div className={`relative w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center transition-transform duration-500 ease-in-out ${isOpen ? "rotate-45" : "group-hover:rotate-90"}`}>
          <span className="absolute w-full h-[2px] bg-[#242422]" />
          <span className="absolute w-[2px] h-full bg-[#242422]" />
        </div>
      </button>
    </div>
  );
}

function MenuLink({ name }: { name: string }) {
  return (
    <div className="group relative cursor-pointer overflow-hidden font-[family-name:var(--font-instrument-serif)] text-[clamp(2rem,4vw,4rem)] leading-none uppercase text-[#242422] bg-transparent w-full">
      {/* Base Text */}
      <div className="relative z-10 px-2 sm:px-4 py-1 transition-transform duration-500 ease-in-out group-hover:-translate-y-full whitespace-nowrap">
        {name}
      </div>
      
      {/* Hover Text block that swipes up */}
      <div className="absolute inset-0 z-20 flex items-center bg-[#ef4444] text-[#f4ead7] px-2 sm:px-4 py-1 translate-y-[101%] transition-transform duration-500 ease-in-out group-hover:translate-y-0 w-full">
        <div className="flex items-center w-full justify-between whitespace-nowrap">
          <span>{name}</span>
          <span className="text-[clamp(1.2rem,3vw,2.5rem)] ml-4 sm:ml-6 font-sans font-light">↗</span>
        </div>
      </div>
    </div>
  );
}
