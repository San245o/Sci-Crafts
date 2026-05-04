"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { RobotArmCanvas } from "./RobotArmModel";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger, SplitText);



function CompassGauge({ play }: { play: boolean }) {
  const compassRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/compass.svg")
      .then((res) => res.text())
      .then((text) => setSvgContent(text));
  }, []);

  useGSAP(
    () => {
      if (!svgContent) return;

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
    { dependencies: [play, svgContent], scope: compassRef, revertOnUpdate: true },
  );

  return (
    <div
      ref={compassRef}
      className="pointer-events-none"
      dangerouslySetInnerHTML={{ __html: svgContent || "" }}
      aria-hidden="true"
    />
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
  const curtainRef = useRef<HTMLDivElement>(null);
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
      gsap.set([eyebrowLayer, headlineLayer, copyLayer], {
        transformOrigin: "50% 50%",
      });
      setTextReady(false);

      if (!play) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set([eyebrowText, headlineText, copyText], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
        setTextReady(true);
        return;
      }

      const split = SplitText.create(headlineText, {
        type: "words",
        smartWrap: true,
      });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .fromTo(
          eyebrowText,
          { autoAlpha: 0, y: 24, scale: 1.08 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: "back.out(1.35)" },
          0,
        )
        .set(headlineText, { autoAlpha: 1 }, 0.04)
        .fromTo(
          headlineLayer,
          { scale: 1.12, y: 20, autoAlpha: 0 },
          { scale: 1, y: 0, autoAlpha: 1, duration: 0.72, ease: "back.out(1.32)" },
          0.03,
        )
        .from(
          split.words,
          {
            yPercent: 28,
            scale: 1.03,
            opacity: 0,
            stagger: 0.04,
            duration: 0.62,
            ease: "power3.out",
          },
          0.08,
        )
        .fromTo(
          copyText,
          { autoAlpha: 0, y: 24, scale: 1.06 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: "back.out(1.28)" },
          0.2,
        );

      intro.eventCallback("onComplete", () => setTextReady(true));

      // Create the scroll-driven intro timeline
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "+=150%",
          pin: true,
          pinSpacing: false,
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });

      // Text layers float up and fade as user scrolls
      // We animate them bottom-up so lower layers disappear before the curve hits them
      scrollTl
        .to(
          [copyLayer, headlineLayer, eyebrowLayer],
          { y: -220, scale: 0.9, autoAlpha: 0, ease: "power2.out", duration: 0.2, stagger: 0.02 },
          0,
        );

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
      className={`${landingReady ? "visible" : "invisible"} relative z-0 flex h-screen flex-col items-center justify-start bg-[#f4ead7]`}
      style={{ overflow: "clip" }}
    >
      <div className="landing-backdrop pointer-events-none absolute inset-0 z-0" />

      <div className="pointer-events-none absolute top-[13.5vh] z-10 flex w-full max-w-[1180px] flex-col items-center px-4 text-center md:top-[12vh]">
        <div ref={eyebrowLayerRef}>
          <p
            ref={eyebrowTextRef}
            className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.46em] text-[#ef4444] opacity-0 sm:mb-4 sm:text-xs"
          >
            Premium 3D Commerce
          </p>
        </div>
        <div ref={headlineLayerRef}>
          <h1
            ref={headlineTextRef}
            className="max-w-[96vw] mb-6 md:mb-0 select-none font-[family-name:var(--font-instrument-serif)] text-[clamp(2.9rem,11.5vw,4.05rem)] italic leading-[0.98] md:leading-[0.86] text-[#242422] opacity-0 md:text-[clamp(3.95rem,6.75vw,5.35rem)] md:whitespace-nowrap"
          >
            transforming your dimensions
          </h1>
        </div>
        <div ref={copyLayerRef}>
          <p
            ref={copyTextRef}
            className="mt-5 max-w-[690px] text-base font-medium leading-6 tracking-[0.08em] text-[#615e59] opacity-0 sm:text-base md:text-lg"
          >
            Custom fabrication, prototypes, and precision-made objects.{" "}
            <br className="hidden sm:block" />
            Designed in 3D. Crafted for the real world.
          </p>
        </div>
      </div>

      <div className="compass-shell pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2">
        <CompassGauge play={textReady} />
      </div>

      <RobotArmCanvas onReady={handleLandingReady} />
    </section>
  );
}
