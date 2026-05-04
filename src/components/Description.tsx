"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin);

const HEART_PATH =
  "M48,5c-4.418,0-8.418,1.791-11.313,4.687l-3.979,3.961c-0.391,0.391-1.023,0.391-1.414,0c0,0-3.971-3.97-3.979-3.961C24.418,6.791,20.418,5,16,5C7.163,5,0,12.163,0,21c0,3.338,1.024,6.436,2.773,9c0,0,0.734,1.164,1.602,2.031s24.797,24.797,24.797,24.797C29.953,57.609,30.977,58,32,58s2.047-0.391,2.828-1.172c0,0,23.93-23.93,24.797-24.797S61.227,30,61.227,30C62.976,27.436,64,24.338,64,21C64,12.163,56.837,5,48,5z M57,22c-0.553,0-1-0.447-1-1c0-4.418-3.582-8-8-8c-0.553,0-1-0.447-1-1s0.447-1,1-1c5.522,0,10,4.478,10,10C58,21.553,57.553,22,57,22z";
const MESSAGE_PATH =
  "M60,0H16c-2.211,0-4,1.789-4,4v4h38c3.438,0,6,2.656,6,6v22h4c2.211,0,4-1.789,4-4V4C64,1.789,62.211,0,60,0z M50,10H4c-2.211,0-4,1.789-4,4v30c0,2.211,1.789,4,4,4h7c0.553,0,1,0.447,1,1v11c0,1.617,0.973,3.078,2.469,3.695C14.965,63.902,15.484,64,16,64c1.039,0,2.062-0.406,2.828-1.172l14.156-14.156c0,0,0.516-0.672,1.672-0.672S50,48,50,48c2.211,0,4-1.789,4-4V14C54,11.791,52.209,10,50,10z M13,22h13c0.553,0,1,0.447,1,1s-0.447,1-1,1H13c-0.553,0-1-0.447-1-1S12.447,22,13,22z M34,36H13c-0.553,0-1-0.447-1-1s0.447-1,1-1h21c0.553,0,1,0.447,1,1S34.553,36,34,36z M41,30H13c-0.553,0-1-0.447-1-1s0.447-1,1-1h28c0.553,0,1,0.447,1,1S41.553,30,41,30z";
const ROCKET_PATH =
  "M63.029,42.285l-13.08-7.848c-0.175,4.299-0.787,8.26-1.494,11.562H64v-2C64,43.297,63.632,42.646,63.029,42.285z M46.905,52H62c1.104,0,2-0.896,2-2v-2H47.999C47.625,49.537,47.245,50.889,46.905,52z M14.051,34.438l-13.08,7.848C0.368,42.646,0,43.297,0,44v2h15.545C14.839,42.697,14.226,38.737,14.051,34.438z M0,48v2c0,1.104,0.896,2,2,2h15.095c-0.34-1.111-0.72-2.463-1.093-4H0z M32,64c2.06,0,4.239-2.343,4.837-6h-9.672C27.763,61.656,29.94,64,32,64z M33.109,0.336C32.773,0.112,32.387,0,32,0s-0.773,0.112-1.109,0.336C23.692,5.135,16,15.974,16,32c0,4.399,0.516,8.508,1.181,12h29.639C47.484,40.508,48,36.399,48,32C48,15.974,40.308,5.135,33.109,0.336z M32,30c-3.313,0-6-2.687-6-6s2.687-6,6-6s6,2.687,6,6S35.313,30,32,30z M 28 24 A 4 4 0 1 0 36 24 A 4 4 0 1 0 28 24 M20.143,54.742C20.447,55.502,21.183,56,22,56h20c0.817,0,1.553-0.498,1.857-1.258c0.097-0.24,1.427-3.62,2.554-8.742H17.589C18.716,51.122,20.046,54.502,20.143,54.742z";
const THUMBSUP_PATH =
  "M 6 57 A 1 1 0 1 0 8 57 A 1 1 0 1 0 6 57 M14,26c0-2.212-1.789-4-4-4H4c-2.211,0-4,1.788-4,4v34c0,2.21,1.789,4,4,4h6c2.211,0,4-1.79,4-4V26z M7,60c-1.657,0-3-1.344-3-3c0-1.658,1.343-3,3-3s3,1.342,3,3C10,58.656,8.657,60,7,60z M64,28c0-3.314-2.687-6-6-6H41l0,0h-0.016H41l2-18c0.209-2.188-1.287-4-3.498-4h-4.001C33,0,31.959,1.75,31,4l-8,18c-2.155,5.169-5,6-7,6v30.218c1.203,0.285,2.714,0.945,4.21,2.479C23.324,63.894,27.043,64,29,64h23c3.313,0,6-2.688,6-6c0-1.731-0.737-3.288-1.91-4.383C58.371,52.769,60,50.577,60,48c0-1.731-0.737-3.288-1.91-4.383C60.371,42.769,62,40.577,62,38c0-1.731-0.737-3.288-1.91-4.383C62.371,32.769,64,30.577,64,28z";
const MORPH_PATHS = [MESSAGE_PATH, ROCKET_PATH, THUMBSUP_PATH, HEART_PATH];

type DescriptionProps = {
  className?: string;
};

/**
 * DescriptionContent — the actual rendered content.
 * Separated so the parent can lazy-mount / unmount this component.
 */
function DescriptionContent({ className = "" }: DescriptionProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      // Flatten the SVG curve as it scrolls up to the top of the screen
      gsap.to(".desc-curve", {
        scaleY: 0,
        transformOrigin: "100% 100%",
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top bottom", // Curve starts moving up from bottom
          end: "top top", // Curve finishes flattening when top hits top
          scrub: true,
        },
      });
      // Text animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 70%",
          end: "top -20%", // increased scroll distance
          scrub: 2.5, // smoother/slower scrubbing
        },
      });

      tl.from(".line-1", { xPercent: -30, autoAlpha: 0, ease: "power2.out", duration: 1.2 }, 0.2)
        .to(".badge-1", { scale: 1, ease: "back.out(2)", duration: 0.8 }, 0.4)
        .from(".line-2", { xPercent: 30, autoAlpha: 0, ease: "power2.out", duration: 1.2 }, 0.6)
        .to(".badge-2", { scale: 1, ease: "back.out(2)", duration: 0.8 }, 0.8)
        .from(".line-3", { xPercent: -30, autoAlpha: 0, ease: "power2.out", duration: 1.2 }, 1.0)
        .to(".badge-3", { scale: 1, ease: "back.out(2)", duration: 0.8 }, 1.2)
        .from(
          ".desc-para",
          { y: 50, scale: 0.95, autoAlpha: 0, ease: "back.out(1.5)", duration: 1.2 },
          1.4,
        )
        .from(".morph-container", { scale: 0.8, autoAlpha: 0, ease: "back.out(1.2)", duration: 1.5 }, 1.2);

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // set 3D perspective
      gsap.set(".badge-1, .badge-2, .badge-3", { transformPerspective: 800 });

      // Independent continuous hovering animations — created paused
      const badge1Tween = gsap.to(".badge-1", {
        y: "-=10",
        rotationZ: "-=3",
        rotationX: "+=15",
        rotationY: "-=10",
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        paused: true,
      });
      const badge2Tween = gsap.to(".badge-2", {
        rotationZ: "+=5",
        rotationX: "-=15",
        rotationY: "+=15",
        duration: 2.1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        paused: true,
      });
      const badge3Tween = gsap.to(".badge-3", {
        y: "-=12",
        rotationZ: "+=6",
        rotationX: "+=20",
        rotationY: "-=15",
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        paused: true,
      });
      const badgeTweens = [badge1Tween, badge2Tween, badge3Tween];
      let morphTl: gsap.core.Timeline | null = null;

      const ensureMorphTimeline = () => {
        if (morphTl) return morphTl;

        morphTl = gsap.timeline({
          repeat: -1,
          paused: true,
          defaults: { ease: "power2.inOut" },
        });

        const tl = morphTl;
        if (!tl) return morphTl;

        MORPH_PATHS.forEach((targetPath, i) => {
          const currentText = `.step-${i}`;
          const nextText = `.step-${(i + 1) % 4}`;

          tl.to("#morph-path", { morphSVG: targetPath, duration: 1.0 }, "+=1.6")
            .to(currentText, { autoAlpha: 0, duration: 0.4 }, "<0.3")
            .to(nextText, { autoAlpha: 1, duration: 0.4 }, "<");
        });

        return morphTl;
      };

      if (prefersReducedMotion) {
        gsap.set("#morph-path", { attr: { d: HEART_PATH } });
        return;
      }

      const playAmbient = () => {
        ensureMorphTimeline().play();
        badgeTweens.forEach((tween) => tween.play());
      };

      const pauseAmbient = () => {
        morphTl?.pause();
        badgeTweens.forEach((tween) => tween.pause());
      };

      const ambientTrigger = ScrollTrigger.create({
        trigger: scope,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: playAmbient,
        onEnterBack: playAmbient,
        onLeave: pauseAmbient,
        onLeaveBack: pauseAmbient,
      });

      if (ambientTrigger.isActive) {
        playAmbient();
      }

    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className={`relative z-20 flex min-h-screen flex-col items-center justify-center bg-[#ef4444] px-6 sm:px-10 md:px-16 lg:px-20 ${className}`}
    >
      {/* Curved leading edge at the top of the description page */}
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="desc-curve pointer-events-none absolute top-0 left-0 z-10 w-full h-[25vh] sm:h-[35vh] -translate-y-[99%]"
      >
        <path
          d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z"
          className="fill-[#ef4444]"
        />
      </svg>

      <div className="relative z-20 flex w-full max-w-[85rem] flex-col items-center justify-between gap-8 lg:gap-12 lg:flex-row pt-32 sm:pt-16 lg:pt-0 pb-12 sm:pb-0">
        {/* Left Side: Original Typography block */}
        <div className="w-full flex-shrink shrink-0 text-left drop-shadow-xl lg:w-[58%] xl:w-[60%]">
          <h2 className="relative mb-6 sm:mb-8 font-sans font-[800] text-[#FFB8BF] text-[clamp(3rem,9.2vw,5.5rem)] leading-[1.05] tracking-tight uppercase">
            <div className="badge-1 absolute -top-4 left-4 sm:-top-8 sm:-left-4 -rotate-[6deg] scale-0 z-30 inline-block px-2 py-0.5 sm:px-3 sm:py-1 font-sans font-extrabold text-[0.55rem] sm:text-sm tracking-widest uppercase bg-[#f4ead7] text-[#ef4444] border-[1.5px] sm:border-2 border-[#991b1b] shadow-[3px_3px_0_0_#7f1d1d] sm:shadow-[4px_4px_0_0_#7f1d1d] will-change-transform">
              CRAFTSMANSHIP
            </div>

            <div className="line-1 will-change-transform relative z-20 whitespace-nowrap">CHOOSE YOUR</div>
            <div className="line-2 will-change-transform relative z-20">
              <span className="relative inline-block">
                FAVOURITE
                <div className="badge-2 absolute top-1/2 -right-4 translate-x-full sm:-right-8 -translate-y-1/2 rotate-[5deg] scale-0 z-30 inline-block px-2 py-0.5 sm:px-3 sm:py-1 font-sans font-extrabold text-[0.55rem] sm:text-sm tracking-widest uppercase bg-[#f4ead7] text-[#ef4444] border-[1.5px] sm:border-2 border-[#991b1b] shadow-[3px_3px_0_0_#7f1d1d] sm:shadow-[4px_4px_0_0_#7f1d1d] will-change-transform">
                  PRECISION
                </div>
              </span>
            </div>
            <div className="line-3 will-change-transform relative z-20">
              <span className="relative inline-block">
                MODEL.
                <div className="badge-3 absolute top-1/2 -right-4 translate-x-full sm:-right-8 -translate-y-1/2 -rotate-[12deg] scale-0 z-30 inline-block px-2 py-0.5 sm:px-3 sm:py-1 font-sans font-extrabold text-[0.55rem] sm:text-sm tracking-widest uppercase bg-[#f4ead7] text-[#ef4444] border-[1.5px] sm:border-2 border-[#991b1b] shadow-[3px_3px_0_0_#7f1d1d] sm:shadow-[4px_4px_0_0_#7f1d1d] will-change-transform">
                  WIZARDRY
                </div>
              </span>
            </div>
          </h2>
          <p className="desc-para max-w-3xl font-sans text-lg sm:text-lg md:text-xl font-[700] text-[#FFB8BF] leading-relaxed tracking-wide will-change-transform drop-shadow-md">
            Choose a model, send it on WhatsApp, and place your custom 3D print
            order instantly. Whether it&apos;s a miniature, decor piece, prototype, or
            personalized gift, we turn your selected design into a finished
            physical product.
          </p>
        </div>

        {/* Right Side: Morphing SVG block */}
        <div className="morph-container flex w-full lg:w-[38%] xl:w-[35%] flex-col items-center justify-center p-2 sm:p-8 mt-24 sm:mt-0 will-change-transform lg:ml-auto">
          <svg className="h-40 w-40 sm:h-48 sm:w-48 lg:h-64 lg:w-64" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="morphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#c0c0c0" />
              </linearGradient>
            </defs>
            {/* The visible morphing path starts as heart */}
            <path id="morph-path" fill="url(#morphGrad)" d="M48,5c-4.418,0-8.418,1.791-11.313,4.687l-3.979,3.961c-0.391,0.391-1.023,0.391-1.414,0c0,0-3.971-3.97-3.979-3.961C24.418,6.791,20.418,5,16,5C7.163,5,0,12.163,0,21c0,3.338,1.024,6.436,2.773,9c0,0,0.734,1.164,1.602,2.031s24.797,24.797,24.797,24.797C29.953,57.609,30.977,58,32,58s2.047-0.391,2.828-1.172c0,0,23.93-23.93,24.797-24.797S61.227,30,61.227,30C62.976,27.436,64,24.338,64,21C64,12.163,56.837,5,48,5z M57,22c-0.553,0-1-0.447-1-1c0-4.418-3.582-8-8-8c-0.553,0-1-0.447-1-1s0.447-1,1-1c5.522,0,10,4.478,10,10C58,21.553,57.553,22,57,22z" />
          </svg>

          <div className="relative mt-5 sm:mt-8 h-16 sm:h-20 w-full max-w-md text-center font-sans">
            <div className="step-0 absolute inset-0 flex items-center justify-center text-xl sm:text-lg lg:text-2xl font-bold tracking-wider text-[#f4ead7] opacity-100 will-change-transform uppercase text-balance">
              Select your model
            </div>
            <div className="step-1 absolute inset-0 flex items-center justify-center text-lg sm:text-lg lg:text-xl font-bold tracking-wider text-[#f4ead7] opacity-0 will-change-transform uppercase text-balance">
              Message us your favourite model for printing
            </div>
            <div className="step-2 absolute inset-0 flex items-center justify-center text-xl sm:text-lg lg:text-2xl font-bold tracking-wider text-[#f4ead7] opacity-0 will-change-transform uppercase text-balance">
              Out for delivery
            </div>
            <div className="step-3 absolute inset-0 flex items-center justify-center text-xl sm:text-lg lg:text-2xl font-bold tracking-wider text-[#f4ead7] opacity-0 will-change-transform uppercase text-balance">
              Enjoy!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Description — lazy-mounts DescriptionContent when the placeholder enters
 * the viewport (with generous rootMargin) and unmounts it when it scrolls
 * fully past, freeing SVG morph / badge animation CPU.
 */
export function Description({ className = "" }: DescriptionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
        }
      },
      {
        // Start loading when the section is within 600px of the viewport
        rootMargin: "600px 0px 600px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} style={{ minHeight: shouldRender ? undefined : "100vh" }}>
      {shouldRender && <DescriptionContent className={className} />}
    </div>
  );
}
