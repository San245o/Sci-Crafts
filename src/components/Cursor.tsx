"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
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
    if (!cursor || !isLoaderComplete) return;

    // Initially start hidden to prevent flashing at 0,0
    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

    let isVisible = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        // Fade in smoothly when the mouse first moves
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
        isVisible = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
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
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-3 w-3 rounded-full bg-red-600 mix-blend-difference md:block opacity-0"
      aria-hidden="true"
    />
  );
}
