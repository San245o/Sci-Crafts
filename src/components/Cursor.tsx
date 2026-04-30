"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

    let isVisible = false;
    let isEnabled = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isEnabled) return;

      if (!isVisible) {
        gsap.set(cursor, { opacity: 1 });
        isVisible = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const enableCursor = () => {
      isEnabled = true;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("sci-crafts-loader-complete", enableCursor, {
      once: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("sci-crafts-loader-complete", enableCursor);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-3 w-3 rounded-full bg-red-600 mix-blend-difference md:block"
      aria-hidden="true"
    />
  );
}
