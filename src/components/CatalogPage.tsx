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
  const hoverSrc = src.replace('/grey/', '/red/').replace('.webp', '_red.webp');
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverImgRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: cardRef });

  const handleMouseEnter = contextSafe(() => {
    gsap.to(hoverImgRef.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto"
    });

    const wrapper = cardRef.current?.querySelector(".product-image-transition");
    if (wrapper) {
      gsap.killTweensOf(wrapper, "scale,filter");
      gsap.to(wrapper, {
        scale: 1.05,
        filter: "brightness(1.15) contrast(1.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(hoverImgRef.current, {
      clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto"
    });

    const wrapper = cardRef.current?.querySelector(".product-image-transition");
    if (wrapper) {
      gsap.killTweensOf(wrapper, "scale,filter");
      gsap.to(wrapper, {
        scale: 1,
        filter: "brightness(1) contrast(1)",
        duration: 0.6,
        ease: "power2.out",
      });
    }
  });

  return (
    <div className={`flex flex-col gap-3 ${colClass}`} ref={cardRef}>
      <div
        className="product-card aspect-[3/4] w-full rounded-sm bg-[#d1c7b8] shadow-sm relative overflow-hidden cursor-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="product-image-transition w-full h-full absolute top-0 left-0" style={{ clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }}>
          {/* Default Grey Image */}
          <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 25vw" className="object-cover pointer-events-none" />

          {/* Hover Red Image */}
          <div
            ref={hoverImgRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }}
          >
            <Image src={hoverSrc} alt={`${alt} Hover`} fill sizes="(max-width: 1024px) 100vw, 25vw" className="object-cover pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex flex-col font-['Inter',sans-serif] mt-1">
        <div className="flex justify-between items-start text-[#ff0a0a] font-medium text-[clamp(0.9rem,3vw,1.25rem)] leading-tight tracking-tight">
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
      className="hide-cursor cursor-none relative flex items-center justify-center bg-transparent text-[#000000] font-['Inter',sans-serif] font-bold text-base md:text-xl tracking-widest uppercase rounded-[16px] overflow-hidden w-[240px] md:w-[300px] h-[56px] md:h-[72px]"
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
            const imgs = card.querySelectorAll("img");
            if (imgs.length) {
              gsap.fromTo(imgs,
                { scale: 1.2, xPercent: -20, rotate: -2 }, // Reverted to previous effect
                { scale: 1, xPercent: 0, rotate: 0, duration: 1.6, ease: "power2.out", delay: i * 0.25 }
              );
            }
          });
        },
        start: "top 85%",
        once: true,
      });

      const bottomSplit = SplitText.create(".marketplace-desc", { type: "words,chars" });

      const bottomTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".catalog-bottom-part",
          start: "top 75%",
        }
      });

      bottomTl.from(bottomSplit.chars, {
        opacity: 0,
        y: 20,
        stagger: 0.02,
        duration: 0.8,
        ease: "power3.out"
      });

      // Pin the entire catalog section when its bottom hits the viewport bottom
      ScrollTrigger.create({
        trigger: scope,
        start: "bottom bottom",
        end: "+=150%", // Enough space for AboutUs to scroll over
        pin: true,
        pinSpacing: false,
      });

      return () => {
        split.revert();
        bottomSplit.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative z-10 min-h-screen bg-[#f4f4f4] pt-8 md:pt-12 pb-12"
      aria-label="Catalog"
      style={{ overflow: "clip" }}
    >
      <div className="mx-auto w-full max-w-[85rem] relative z-10 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-0 w-full">
          <h3 className="catalog-title font-[family-name:var(--font-inter)] w-full text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#dc2626] [-webkit-text-stroke:3px_#dc2626] scale-x-[1.15] origin-center text-center mx-auto">
            BROWSE OUR<br />CATALOG
          </h3>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 gap-y-8 md:gap-y-12 lg:gap-y-14">
          {/* Row 1 */}
          <ProductItem src="/images/grey/ashtray.webp" alt="Ashtray" price="₹1,250" category="ACCESSORY" colClass="lg:col-start-1" />
          <ProductItem src="/images/grey/bikephone.webp" alt="Bike Phone Holder" price="₹2,100" category="MOUNT" colClass="lg:col-start-2" />
          <ProductItem src="/images/grey/Blue Page Holder Clip.webp" alt="Blue Page Holder Clip" price="₹1,000" category="OFFICE" colClass="lg:col-start-3" />
          <ProductItem src="/images/grey/cameranozzle.webp" alt="Camera Nozzle" price="₹1,500" category="PHOTOGRAPHY" colClass="lg:col-start-4" />

          {/* Row 2 */}
          <ProductItem src="/images/grey/Dual Cable Holder.webp" alt="Dual Cable Holder" price="₹850" category="ORGANIZATION" colClass="lg:col-start-1" />

          {/* Text block spanning center columns */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 lg:col-start-2 flex flex-col justify-center items-center relative text-block-container h-full py-8 lg:py-0 lg:pb-8">
            <div
              className="absolute inset-[-4rem] z-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='44' height='44' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0H44M0 0V44' fill='none' stroke='%237d7a73' stroke-opacity='.5' stroke-width='1' stroke-dasharray='4 8'/%3E%3C/svg%3E\")",
                backgroundSize: "44px 44px",
                maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)"
              }}
            />
            <h4 className="text-[clamp(1.75rem,5vw,2.5rem)] font-semibold uppercase text-[#1a1a1a] font-[family-name:var(--font-instrument-serif)] flex flex-col items-center w-full transform lg:-translate-y-4 relative z-10">
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-full md:w-max leading-[1.2] md:leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex flex-wrap md:flex-nowrap justify-center gap-[0.25em] w-full px-2 text-center">
                  <span>EXPLORE</span> <span>OUR</span> <span>CURATED</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-full md:w-max leading-[1.2] md:leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex flex-wrap md:flex-nowrap justify-center gap-[0.25em] w-full px-2 text-center">
                  <span>CATALOG</span> <span>OF</span> <span>3D</span> <span>MODELS.</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-full md:w-max leading-[1.2] md:leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex flex-wrap md:flex-nowrap justify-center gap-[0.25em] w-full px-2 text-center">
                  <span>FROM</span> <span>DECOR</span> <span>TO</span> <span>GIFTS</span> <span>AND</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-full md:w-max leading-[1.2] md:leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex flex-wrap md:flex-nowrap justify-center gap-[0.25em] w-full px-2 text-center">
                  <span>CUSTOM</span> <span>PIECES,</span> <span>PICK</span> <span>WHAT</span> <span>YOU</span> <span>LIKE</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
              <div className="text-line-wrap relative overflow-hidden flex justify-center w-full md:w-max leading-[1.2] md:leading-[1.15]">
                <div className="text-line opacity-0 relative z-0 flex flex-wrap md:flex-nowrap justify-center gap-[0.25em] w-full px-2 text-center">
                  <span>AND</span> <span>WE</span> <span>MAKE</span> <span>IT</span> <span>REAL.</span>
                </div>
                <div className="cover-block absolute top-0 left-0 w-full h-full bg-red-500 z-10 origin-left" style={{ transform: "scaleX(0)" }}></div>
              </div>
            </h4>
          </div>

          <ProductItem src="/images/grey/Geometric Succulent Planter.webp" alt="Geometric Succulent Planter" price="₹1,850" category="HOME DECOR" colClass="lg:col-start-4" />

          {/* Row 3 */}
          <ProductItem src="/images/grey/keychainholder.webp" alt="Keychain Holder" price="₹1,150" category="ACCESSORY" colClass="lg:col-start-1" />
          <ProductItem src="/images/grey/Multi-Compartment Desk Organizer.webp" alt="Desk Organizer" price="₹2,900" category="OFFICE" colClass="lg:col-start-2" />
          <ProductItem src="/images/grey/phoneholder.webp" alt="Phone Holder" price="₹1,350" category="MOUNT" colClass="lg:col-start-3" />
          <ProductItem src="/images/grey/usbwire.webp" alt="USB Wire" price="₹650" category="ACCESSORY" colClass="lg:col-start-4" />
        </div>
      </div>


      <div className="catalog-bottom-part w-full pt-2 md:pt-8 pb-4 flex flex-col md:flex-row items-center justify-between px-0 md:px-10 bg-[#f4f4f4] relative z-0 gap-6 md:gap-10 mt-10 md:mt-16">
        <div className="flex-1 flex flex-col items-center md:items-start justify-center">
          <h3 className="marketplace-desc text-center md:text-left text-3xl md:text-5xl lg:text-6xl font-[family-name:var(--font-instrument-serif)] text-[#ff0a0a] leading-[1.05] max-w-2xl uppercase tracking-tight">
            Bring Your Ideas To Life In Our Marketplace
          </h3>
        </div>
        <div className="flex-1 flex justify-center md:justify-end items-center">
          <MarketplaceButton />
        </div>
      </div>
    </section>
  );
}
