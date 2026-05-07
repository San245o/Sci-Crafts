"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isLoaderComplete, setIsLoaderComplete] = useState(false);

  // Wait for the loading screen to complete before we even render the cursor
  useEffect(() => {
    const enableCursor = () => {
      setIsLoaderComplete(true);
    };

    // If the window has already marked it ready from another component, catch it here just in case,
    // otherwise wait for the event.
    window.addEventListener("sci-crafts-loader-complete", enableCursor, {
      once: true,
    });

    return () => {
      window.removeEventListener("sci-crafts-loader-complete", enableCursor);
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const text = textRef.current;
    if (!cursor || !text || !isLoaderComplete) return;

    // Initially start hidden to prevent flashing at 0,0
    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

    let isVisible = false;
    let isHoveringProduct = false;
    let isHoveringHidden = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        // Fade in smoothly when the mouse first moves
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
        isVisible = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);

      const target = e.target as HTMLElement;
      const productCard = target.closest('.product-card');
      const hideCursor = target.closest('.hide-cursor');

      if (hideCursor && !isHoveringHidden) {
        isHoveringHidden = true;
        isHoveringProduct = false; // Reset the other state
        gsap.to(cursor, { opacity: 0, duration: 0.2 });
        gsap.to(text, { autoAlpha: 0, duration: 0.2 });
      } else if (productCard && !isHoveringProduct) {
        isHoveringProduct = true;
        isHoveringHidden = false; // Reset the other state
        gsap.to(cursor, {
          opacity: 1,
          width: 90,
          height: 90,
          backgroundColor: "#ff0000",
          mixBlendMode: "normal",
          duration: 0.4,
          ease: "back.out(1.5)"
        });
        gsap.to(text, { autoAlpha: 1, duration: 0.3, delay: 0.1 });
      } else if (!productCard && !hideCursor && (isHoveringProduct || isHoveringHidden)) {
        isHoveringProduct = false;
        isHoveringHidden = false;
        gsap.to(cursor, {
          opacity: 1,
          width: 8,
          height: 8,
          backgroundColor: "#ff0000",
          mixBlendMode: "normal",
          duration: 0.4,
          ease: "power3.out"
        });
        gsap.to(text, { autoAlpha: 0, duration: 0.2 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isLoaderComplete]);

  if (!isLoaderComplete) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-2 w-2 rounded-full bg-[#ff0000] mix-blend-normal md:flex items-center justify-center opacity-0 overflow-hidden"
      aria-hidden="true"
    >
      <span ref={textRef} className="text-white text-[11px] font-normal uppercase tracking-wide opacity-0 invisible whitespace-nowrap text-center text-balance leading-none">
        View More
      </span>
    </div>
  );
}
