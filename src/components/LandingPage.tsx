"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { RobotArmCanvas } from "./RobotArmModel";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger, SplitText);

function svgCoord(value: number) {
  return value.toFixed(3);
}

const compassTicks = Array.from({ length: 43 }, (_, index) => {
  const angle = 180 - index * (180 / 42);
  const radians = (angle * Math.PI) / 180;
  const major = index % 6 === 0;
  const mid = index % 3 === 0;
  const outer = 428;
  const inner = outer - (major ? 44 : mid ? 32 : 21);

  return {
    id: `tick-${index}`,
    x1: svgCoord(500 + Math.cos(radians) * inner),
    y1: svgCoord(500 - Math.sin(radians) * inner),
    x2: svgCoord(500 + Math.cos(radians) * outer),
    y2: svgCoord(500 - Math.sin(radians) * outer),
    className: major ? "compass-tick-major" : mid ? "compass-tick-mid" : "",
  };
});

function CompassGauge({ play }: { play: boolean }) {
  const compassRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.set(".compass-draw", { autoAlpha: 1, drawSVG: "0% 0%" });
      gsap.set(".compass-glint", { autoAlpha: 0, scale: 0.82, transformOrigin: "50% 50%" });

      if (!play) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(".compass-draw", { autoAlpha: 1, drawSVG: "0% 100%" });
        gsap.set(".compass-glint", { autoAlpha: 0.65, scale: 1 });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

      timeline
        .to(".compass-arc", {
          drawSVG: "0% 100%",
          duration: 1.1,
          stagger: 0.12,
        })
        .to(
          ".compass-tick",
          {
            drawSVG: "0% 100%",
            duration: 0.48,
            stagger: { each: 0.012, from: "center" },
          },
          "-=0.58",
        )
        .to(
          ".compass-red-arc",
          {
            drawSVG: "0% 100%",
            duration: 0.86,
            ease: "power2.inOut",
          },
          "-=0.5",
        )
        .to(".compass-cap", { drawSVG: "0% 100%", duration: 0.48 }, "-=0.42")
        .to(
          ".compass-glint",
          {
            autoAlpha: 0.7,
            scale: 1,
            duration: 0.42,
            stagger: 0.08,
          },
          "-=0.35",
        );
    },
    { dependencies: [play], scope: compassRef, revertOnUpdate: true },
  );

  return (
    <svg
      ref={compassRef}
      className="compass-svg"
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <path className="compass-draw compass-arc compass-outer-arc" d="M 72 500 A 428 428 0 0 1 928 500" />
      <path className="compass-draw compass-arc compass-red-arc" d="M 165 500 A 335 335 0 0 1 835 500" />
      <path className="compass-draw compass-arc compass-arc-inner" d="M 300 500 A 200 200 0 0 1 700 500" />
      <path className="compass-draw compass-arc compass-mobile-extension compass-mobile-red-arc" d="M 132 520 A 368 368 0 0 1 868 520" />
      <path className="compass-draw compass-arc compass-mobile-extension compass-mobile-inner-arc" d="M 245 520 A 255 255 0 0 1 755 520" />
      {compassTicks.map((tick) => (
        <line
          key={tick.id}
          className={["compass-draw", "compass-tick", tick.className]
            .filter(Boolean)
            .join(" ")}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
        />
      ))}
      <line className="compass-draw compass-cap" x1="420" y1="486" x2="580" y2="486" />
      <line className="compass-draw compass-cap compass-cap-red" x1="453" y1="486" x2="507" y2="486" />
      <circle className="compass-glint" cx="360" cy="274" r="2.5" />
      <path className="compass-glint compass-spark" d="M 296 248 h 18 M 305 239 v 18" />
      <path className="compass-glint compass-spark" d="M 710 226 h 14 M 717 219 v 14" />
    </svg>
  );
}

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyebrowLayerRef = useRef<HTMLDivElement>(null);
  const headlineLayerRef = useRef<HTMLDivElement>(null);
  const copyLayerRef = useRef<HTMLDivElement>(null);
  const eyebrowTextRef = useRef<HTMLParagraphElement>(null);
  const headlineTextRef = useRef<HTMLHeadingElement>(null);
  const copyTextRef = useRef<HTMLParagraphElement>(null);
  const [play, setPlay] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const [landingReady, setLandingReady] = useState(false);

  const handleLandingReady = useCallback(() => {
    const targetWindow = window as Window & {
      __sciCraftsLandingReady?: boolean;
    };

    targetWindow.__sciCraftsLandingReady = true;
    setLandingReady(true);
    window.dispatchEvent(new Event("sci-crafts-landing-ready"));
  }, []);

  useEffect(() => {
    const onComplete = () => setPlay(true);
    window.addEventListener("sci-crafts-loader-complete", onComplete);
    return () => {
      window.removeEventListener("sci-crafts-loader-complete", onComplete);
    };
  }, []);

  useGSAP(
    () => {
      const scope = containerRef.current;
      const eyebrowLayer = eyebrowLayerRef.current;
      const headlineLayer = headlineLayerRef.current;
      const copyLayer = copyLayerRef.current;
      const eyebrowText = eyebrowTextRef.current;
      const headlineText = headlineTextRef.current;
      const copyText = copyTextRef.current;

      if (
        !scope ||
        !eyebrowLayer ||
        !headlineLayer ||
        !copyLayer ||
        !eyebrowText ||
        !headlineText ||
        !copyText
      ) {
        return;
      }

      gsap.set([eyebrowText, headlineText, copyText], { autoAlpha: 0 });
      setTextReady(false);

      if (!play) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set([eyebrowText, headlineText, copyText], {
          autoAlpha: 1,
          y: 0,
        });
        setTextReady(true);
        return;
      }

      const split = SplitText.create(headlineText, {
        type: "chars",
        smartWrap: true,
      });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .fromTo(
          eyebrowText,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.56 },
          0,
        )
        .set(headlineText, { autoAlpha: 1 }, 0.04)
        .from(
          split.chars,
          {
            y: 50,
            opacity: 0,
            stagger: 0.03,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          0.04,
        )
        .fromTo(
          copyText,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.56 },
          0.16,
        );

      intro.eventCallback("onComplete", () => setTextReady(true));

      const parallax = (target: Element, y: number) => {
        gsap.to(target, {
          y,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "+=420",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      };

      parallax(eyebrowLayer, -80);
      parallax(headlineLayer, -40);
      parallax(copyLayer, -20);

      ScrollTrigger.refresh();

      return () => {
        split.revert();
      };
    },
    { dependencies: [play], scope: containerRef, revertOnUpdate: true },
  );

  return (
    <section 
      ref={containerRef} 
      className={`${landingReady ? "visible" : "invisible"} relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-[#f4ead7]`}
    >
      <div className="landing-backdrop pointer-events-none absolute inset-0 z-0" />

      <div className="pointer-events-none absolute top-[13.5vh] z-10 flex w-full max-w-[1180px] flex-col items-center px-4 text-center md:top-[12vh]">
        <div ref={eyebrowLayerRef}>
          <p
            ref={eyebrowTextRef}
            className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.46em] text-[#ef4444] opacity-0 sm:mb-4 sm:text-xs"
          >
            Premium 3D Commerce
          </p>
        </div>
        <div ref={headlineLayerRef}>
          <h1
            ref={headlineTextRef}
            className="max-w-[96vw] select-none font-[family-name:var(--font-instrument-serif)] text-[clamp(2.55rem,9.8vw,4.05rem)] italic leading-[0.86] text-[#242422] opacity-0 md:text-[clamp(3.95rem,6.75vw,5.35rem)]"
          >
            transforming your dimensions
          </h1>
        </div>
        <div ref={copyLayerRef}>
          <p
            ref={copyTextRef}
            className="mt-5 max-w-[690px] text-sm font-medium leading-6 tracking-[0.08em] text-[#615e59] opacity-0 sm:text-base md:text-lg"
          >
            Custom fabrication, prototypes, and precision-made objects.
            <br className="hidden sm:block" />
            Designed in 3D. Crafted for the real world.
          </p>
        </div>
      </div>

      <div className="compass-shell pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2">
        <CompassGauge play={textReady} />
      </div>

      <RobotArmCanvas onReady={handleLandingReady} />

      {/* Solid red curved mask overlapping the bottom of the screen */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 w-full overflow-hidden leading-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[25vh] sm:h-[35vh]"
        >
          <path 
            d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z" 
            className="fill-[#ef4444]"
          />
        </svg>
      </div>
    </section>
  );
}
