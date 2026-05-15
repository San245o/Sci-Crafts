"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AboutUsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  
  const toggleMobileColor = (imgName: string) => {
    // Only toggle if we want touch support to persist color
    setActiveImg(prev => prev === imgName ? null : imgName);
  };
  
  useGSAP(() => {
    // Left and Right blocks (sword and dragon) sweep up from bottom. Middle block (f1) sweeps from top down.
    gsap.fromTo(
      ".about-img-left",
      { y: "100%", scale: 1.3, willChange: "transform" },
      {
        y: "0%",
        scale: 1,
        duration: 2.5,
        ease: "expo.out",
        force3D: true, // Forces hardware acceleration
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%", // Triggers when element is 2/5 (40%) visible from bottom
          toggleActions: "play none none reverse",
        }
      }
    );

    gsap.fromTo(
      ".about-img-middle",
      { y: "-100%", scale: 1.3, willChange: "transform" },
      {
        y: "0%",
        scale: 1,
        duration: 2,
        ease: "expo.out",
        force3D: true, // Forces hardware acceleration
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%", // Triggers when element is 2/5 (40%) visible from bottom
          toggleActions: "play none none reverse",
        }
      }
    );

    gsap.fromTo(
      ".about-img-right",
      { y: "100%", scale: 1.3, willChange: "transform" },
      {
        y: "0%",
        scale: 1,
        duration: 2.5,
        ease: "expo.out",
        force3D: true, // Forces hardware acceleration
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%", // Triggers when element is 2/5 (40%) visible from bottom
          toggleActions: "play none none reverse",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative z-20 w-full min-h-screen bg-[#f4ead7] flex flex-col justify-center overflow-hidden pt-20 pb-32 md:pb-0" aria-label="About Sci-Crafts - Bangalore 3D Printing Service">
      <div className="landing-backdrop pointer-events-none absolute inset-0 z-0" />
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#f0ebd8] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#e8e2ce] blur-[140px] opacity-50" />
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 lg:px-20 relative z-10 flex flex-col h-full justify-center">
        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-between w-full relative min-h-[80vh] md:h-[90vh] gap-10 md:gap-0">

          {/* Left Side: Typography */}
          <div className="flex flex-col justify-start w-full md:w-[42%] lg:w-[40%] h-auto md:h-full z-20 pt-6 md:pt-20 mt-0 md:mt-0">
            <div className="max-w-[420px] mb-8 md:mb-10 relative">
              <div className="absolute -left-4 md:-left-6 top-0 w-1 h-full bg-[#1a1008] hidden sm:block" />
              <p className="text-sm md:text-base font-medium text-[#1a1008] leading-relaxed text-justify">
                Bangalore's premier 3D printing service, dedicated to transforming precision into reality. For us, precision is an art form. Discover the diverse range of{" "}
                <Link href="/blog/3d-printers" className="font-bold underline decoration-2 decoration-[#1a1008]/30 hover:decoration-[#1a1008] underline-offset-4 transition-all">
                  3D printers we own
                </Link>
                , featuring the Bambu Lab A1, P1S, and the flagship X1 Carbon. Learn more about the{" "}
                <Link href="/blog/plastics" className="font-bold underline decoration-2 decoration-[#1a1008]/30 hover:decoration-[#1a1008] underline-offset-4 transition-all">
                  advanced plastics used
                </Link>
                {" "}in these machines, from standard PLA and ABS to durable PETG and flexible TPU.
              </p>
            </div>

            <div className="flex flex-col font-[family-name:var(--font-inter)] tracking-tighter text-[#1a1008] relative z-20 uppercase w-max">
              <h2 className="text-[15vw] sm:text-[13vw] md:text-[10vw] leading-[0.78] font-black mix-blend-difference md:mix-blend-normal">ABOUT</h2>
              <div className="flex items-center w-full mt-1 md:mt-3 justify-between">
                <div className="flex-grow h-[8px] md:h-[12px] bg-[#1a1008] mr-4 md:mr-8" />
                <h2 className="text-[15vw] sm:text-[13vw] md:text-[10vw] leading-[0.78] font-black mix-blend-difference md:mix-blend-normal text-right">US</h2>
              </div>
            </div>
          </div>

          {/* Right Side: 3 Image Blocks */}
          <div className="relative w-full md:w-[55%] lg:w-[52%] h-[450px] md:h-full mt-4 md:mt-0 flex flex-row items-center justify-center md:justify-end gap-3 sm:gap-5 md:gap-8 z-10 pointer-events-none">
            {/* Block 1 (Left) */}
            <div className="relative w-[28%] md:w-[30%] h-[90%] md:h-[85%] bg-[#d3cec4] shadow-2xl overflow-hidden pointer-events-auto translate-y-0 md:translate-y-4" style={{ clipPath: 'polygon(0 5%, 100% 0, 100% 95%, 0 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent z-10 pointer-events-none" />
              <Image 
                src="/sword.webp" 
                fill
                sizes="(max-width: 768px) 30vw, 20vw"
                onClick={() => toggleMobileColor('left')}
                className={`about-img-left object-cover transition-[filter] duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${activeImg === 'left' ? 'grayscale-0' : 'grayscale'} hover:grayscale-0 cursor-pointer`} 
                alt="Sword" 
              />
            </div>

            {/* Block 2 (Middle) */}
            <div className="relative w-[44%] md:w-[40%] h-[100%] md:h-[100%] bg-[#c4beb3] shadow-2xl overflow-hidden pointer-events-auto -translate-y-4 md:-translate-y-8" style={{ clipPath: 'polygon(0 0, 100% 4%, 100% 100%, 0 96%)' }}>
              <div className="absolute inset-0 bg-gradient-to-bl from-black/10 to-transparent z-10 pointer-events-none" />
              <Image 
                src="/f1.webp" 
                fill
                sizes="(max-width: 768px) 45vw, 30vw"
                onClick={() => toggleMobileColor('middle')}
                className={`about-img-middle object-cover transition-[filter] duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${activeImg === 'middle' ? 'grayscale-0' : 'grayscale'} hover:grayscale-0 cursor-pointer`} 
                alt="F1 Car" 
              />
            </div>

            {/* Block 3 Wrapper (Right) */}
            <div className="relative w-[28%] md:w-[30%] h-[80%] md:h-[75%] flex flex-col justify-end translate-y-4 md:translate-y-12">
              <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-tight text-[#1a1008] mb-2 md:mb-4 pl-2 opacity-80 border-l-2 border-[#1a1008] leading-snug">
                Our dedication to 3D printing technology reflects a deep respect for innovation and its limitless potential.
              </p>
              <div className="relative w-full flex-grow md:flex-grow-0 md:h-full bg-[#b8b1a5] shadow-2xl overflow-hidden pointer-events-auto" style={{ clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 92%)' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10 pointer-events-none" />
                <Image 
                  src="/dragon.webp" 
                  fill
                  sizes="(max-width: 768px) 30vw, 20vw"
                  onClick={() => toggleMobileColor('right')}
                  className={`about-img-right object-cover transition-[filter] duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${activeImg === 'right' ? 'grayscale-0' : 'grayscale'} hover:grayscale-0 cursor-pointer`} 
                  alt="Dragon" 
                />
              </div>
            </div>
          </div>

        </div>


      </div>
    </section>
  );
}
