"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, SplitText, ScrollTrigger);

export function CatalogPage() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      const split = SplitText.create(".catalog-title", { type: "chars" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 75%",
        },
      });

      tl.from(split.chars, {
        scale: 0,
        y: 30,
        rotation: () => gsap.utils.random(-20, 20),
        stagger: { each: 0.04, from: "random" },
        duration: 0.4,
        ease: "back.out(2)",
      })
      .fromTo(
        ".catalog-line",
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", duration: 1, ease: "power3.out" },
        "-=0.2"
      );

      return () => {
        split.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative z-10 min-h-screen bg-[#f4ead7] px-6 sm:px-10 md:px-16 lg:px-20 py-24"
      aria-label="Catalog"
    >
      <div className="mx-auto w-full max-w-[85rem]">
        <h3 className="catalog-title font-[family-name:var(--font-instrument-serif)] text-[clamp(2.5rem,7vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-[#333333]">
          BROWSE OUR<br />CATALOG
        </h3>
        
        <div className="mt-8 mb-16 h-[6px] w-full bg-transparent">
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="3"
              x2="100%"
              y2="3"
              className="catalog-line stroke-[#333333]"
              strokeWidth="6"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="product-skeleton aspect-[3/4] w-full rounded-sm bg-[#d1c7b8] shadow-sm"
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}
