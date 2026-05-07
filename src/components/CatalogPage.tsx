"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, SplitText, ScrollTrigger);

function ProductItem({ src, alt, price, category, colClass = "" }: { src: string, alt: string, price: string, category: string, colClass?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${colClass}`}>
      <div className="product-card aspect-[3/4] w-full rounded-sm bg-[#d1c7b8] shadow-sm relative overflow-hidden cursor-none">
        <div className="product-image-transition w-full h-full absolute top-0 left-0" style={{ clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }}>
          <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 25vw" className="object-cover pointer-events-none" />
        </div>
      </div>
      <div className="flex flex-col font-['Inter',sans-serif] mt-1">
        <div className="flex justify-between items-start text-[#ff0a0a] font-medium text-[clamp(1.1rem,1.5vw,1.25rem)] leading-tight tracking-tight">
          <h5 className="max-w-[75%] font-normal">{alt}</h5>
          <span>{price}</span>
        </div>
        <div className="flex items-center text-[#ff0a0a] text-[10px] font-bold tracking-widest mt-1 uppercase">
          <span className="w-2 h-2 rounded-full bg-[#ff0a0a] mr-2 flex-shrink-0"></span>
          {category}
        </div>
      </div>
    </div>
  );
}

function MarketplaceButton() {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const idleTextRef = useRef<HTMLDivElement>(null);
  const hoverTextRef = useRef<HTMLDivElement>(null);
  const idleArrowRef = useRef<HTMLDivElement>(null);
  const hoverArrowRef = useRef<HTMLDivElement>(null);
  const bgCircleRef = useRef<HTMLDivElement>(null);
  
  const { contextSafe } = useGSAP({ scope: buttonRef });

  const handleMouseEnter = contextSafe(() => {
    gsap.to(buttonRef.current, {
      color: "#f4ead7",
      duration: 0.5,
      ease: "power3.inOut",
      overwrite: "auto"
    });

    if (bgCircleRef.current) {
      gsap.to(bgCircleRef.current, {
        scale: 1,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }

    if (idleTextRef.current) {
      gsap.to(idleTextRef.current, {
        y: -50,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }
    if (idleArrowRef.current) {
      gsap.to(idleArrowRef.current, {
        y: -50,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }

    if (hoverTextRef.current) {
      gsap.to(hoverTextRef.current, {
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }
    if (hoverArrowRef.current) {
      gsap.to(hoverArrowRef.current, {
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(buttonRef.current, {
      color: "#000000",
      duration: 0.5,
      ease: "power3.inOut",
      overwrite: "auto"
    });

    if (bgCircleRef.current) {
      gsap.to(bgCircleRef.current, {
        scale: 0,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }

    if (idleTextRef.current) {
      gsap.to(idleTextRef.current, {
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }
    if (idleArrowRef.current) {
      gsap.to(idleArrowRef.current, {
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }

    if (hoverTextRef.current) {
      gsap.to(hoverTextRef.current, {
        y: 50,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }
    if (hoverArrowRef.current) {
      gsap.to(hoverArrowRef.current, {
        y: 50,
        duration: 0.5,
        ease: "power3.inOut",
        overwrite: true
      });
    }
  });

  useGSAP(() => {
    if (!hoverTextRef.current || !hoverArrowRef.current) return;
    
    // Initial state for hover text & arrow
    gsap.set([hoverTextRef.current, hoverArrowRef.current], { y: 50 });

  }, { scope: buttonRef });

  return (
    <button
      ref={buttonRef}
      onClick={() => router.push("/marketplace")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hide-cursor cursor-none mt-20 relative flex items-center justify-center bg-transparent text-[#000000] font-['Inter',sans-serif] font-bold text-lg md:text-xl tracking-widest uppercase rounded-[16px] overflow-hidden w-[300px] h-[72px]"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Expanding Red Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div 
          ref={bgCircleRef} 
          className="w-[400px] h-[400px] bg-[#ff0000] rounded-full pointer-events-none"
          style={{ transform: "scale(0)" }}
        ></div>
      </div>

      {/* Idle Content (Arrow on Right) */}
      <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none z-10 w-full h-full">
        <div ref={idleTextRef} className="relative block">MARKETPLACE</div>
        <div ref={idleArrowRef} className="flex items-center justify-center relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="19" x2="19" y2="5"></line>
            <polyline points="9 5 19 5 19 15"></polyline>
          </svg>
        </div>
      </div>

      {/* Hover Content (Arrow on Left) */}
      <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none z-10 w-full h-full">
        <div ref={hoverArrowRef} className="flex items-center justify-center relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="19" x2="19" y2="5"></line>
            <polyline points="9 5 19 5 19 15"></polyline>
          </svg>
        </div>
        <div ref={hoverTextRef} className="relative block">MARKETPLACE</div>
      </div>
    </button>
  );
}

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
        { drawSVG: "50% 50%" },
        { drawSVG: "0% 100%", duration: 1, ease: "power3.out" },
        "-=0.2"
      );

      const blockWraps = gsap.utils.toArray<HTMLElement>(".text-line-wrap");
      
      blockWraps.forEach((wrap, i) => {
        const cover = wrap.querySelector(".cover-block");
        const text = wrap.querySelector(".text-line");
        
        const tlText = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
          }
        });

        tlText.to(cover, { scaleX: 1, duration: 0.85, ease: "power2.inOut", transformOrigin: "left" })
              .set(text, { opacity: 1 })
              .to(cover, { scaleX: 0, duration: 0.85, ease: "power2.inOut", transformOrigin: "right" });
      });

      ScrollTrigger.batch(".product-card", {
        interval: 0.15, // time window to batch items
        batchMax: 4,    // max items per batch (row)
        onEnter: (batch) => {
          gsap.to(batch.map(card => card.querySelector('.product-image-transition')), {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            stagger: 0.25, // Increased stagger
            duration: 1.2,
            ease: "power3.out",
          });
          
          batch.forEach((card, i) => {
            const img = card.querySelector("img");
            if (img) {
              gsap.fromTo(img, 
                { scale: 1.2, xPercent: -20, rotate: -2 }, // Reverted to previous effect
                { scale: 1, xPercent: 0, rotate: 0, duration: 1.6, ease: "power2.out", delay: i * 0.25 }
              );
            }
          });
        },
        start: "top 85%",
        once: true,
      });

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 gap-y-12 lg:gap-y-14">
          {/* Row 1 */}
          <ProductItem src="/ashtray.webp" alt="Ashtray" price="₹1,250" category="ACCESSORY" colClass="lg:col-start-1" />
          <ProductItem src="/bikephone.webp" alt="Bike Phone Holder" price="₹2,100" category="MOUNT" colClass="lg:col-start-2" />
          <ProductItem src="/Blue Page Holder Clip.webp" alt="Blue Page Holder Clip" price="₹1,000" category="OFFICE" colClass="lg:col-start-3" />
          <ProductItem src="/cameranozzle.webp" alt="Camera Nozzle" price="₹1,500" category="PHOTOGRAPHY" colClass="lg:col-start-4" />

          {/* Row 2 */}
          <ProductItem src="/Dual Cable Holder.webp" alt="Dual Cable Holder" price="₹850" category="ORGANIZATION" colClass="lg:col-start-1" />
          
          {/* Text block spanning center columns */}
          <div className="lg:col-span-2 lg:col-start-2 flex flex-col justify-center items-center relative text-block-container h-full pb-8">
            <h4 className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold uppercase text-[#1a1a1a] font-[family-name:var(--font-instrument-serif)] flex flex-col items-center w-full transform -translate-y-4">
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-max leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex justify-center gap-[0.25em] w-full whitespace-nowrap px-2">
                  <span>EXPLORE</span> <span>OUR</span> <span>CURATED</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-max leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex justify-center gap-[0.25em] w-full whitespace-nowrap px-2">
                  <span>CATALOG</span> <span>OF</span> <span>3D</span> <span>MODELS.</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-max leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex justify-center gap-[0.25em] w-full whitespace-nowrap px-2">
                  <span>FROM</span> <span>DECOR</span> <span>TO</span> <span>GIFTS</span> <span>AND</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-max leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex justify-center gap-[0.25em] w-full whitespace-nowrap px-2">
                  <span>CUSTOM</span> <span>PIECES,</span> <span>PICK</span> <span>WHAT</span> <span>YOU</span> <span>LIKE</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-max leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex justify-center gap-[0.25em] w-full whitespace-nowrap px-2">
                  <span>AND</span> <span>WE</span> <span>MAKE</span> <span>IT</span> <span>REAL.</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
            </h4>
          </div>

          <ProductItem src="/Geometric Succulent Planter.webp" alt="Geometric Succulent Planter" price="₹1,850" category="HOME DECOR" colClass="lg:col-start-4" />

          {/* Row 3 */}
          <ProductItem src="/keychainholder.webp" alt="Keychain Holder" price="₹1,150" category="ACCESSORY" colClass="lg:col-start-1" />
          <ProductItem src="/Multi-Compartment Desk Organizer.webp" alt="Desk Organizer" price="₹2,900" category="OFFICE" colClass="lg:col-start-2" />
          <ProductItem src="/phoneholder.webp" alt="Phone Holder" price="₹1,350" category="MOUNT" colClass="lg:col-start-3" />
          <ProductItem src="/usbwire.webp" alt="USB Wire" price="₹650" category="ACCESSORY" colClass="lg:col-start-4" />
        </div>

        <div className="w-full flex justify-center pb-8">
          <MarketplaceButton />
        </div>
      </div>
    </section>
  );
}
