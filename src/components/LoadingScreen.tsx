"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Text3D, useFont, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const fontPath = "/fonts/droid_sans_bold.typeface.json";
const red = "#ef4444";

const loaderTiming = {
  textExitStart: 1.72,
  loaderExitStart: 2.44,
  countDuration: 1.86,
  stageInDuration: 0.56,
};

useFont.preload(fontPath);
useGLTF.preload("/robot_arm.glb");

type TextLine3DProps = {
  text: string;
  y: number;
  delay: number;
  play: boolean;
  lineScale?: number;
  x?: number;
};

type LetterLayout = {
  index: number;
  letter: string;
  position: [number, number, number];
};

function getLetterWidth(letter: string) {
  const lower = letter.toLowerCase();
  const letterSpacing = 0.2;

  if (letter === " ") return 0.48;
  if (lower === "i" || lower === "l") return 0.34 + letterSpacing;
  if (lower === "-") return 0.46 + letterSpacing;
  if (lower === "f" || lower === "t") return 0.58 + letterSpacing;
  if (lower === "m" || lower === "w") return 0.92 + letterSpacing;

  return 0.7 + letterSpacing;
}

function TextLine3D({
  text,
  y,
  delay,
  play,
  lineScale = 1,
  x = 0,
}: TextLine3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lettersRef = useRef<THREE.Mesh[]>([]);

  const letters = useMemo<LetterLayout[]>(() => {
    const chars = text.split("");
    const lineWidth = chars.reduce(
      (width, letter) => width + getLetterWidth(letter),
      0,
    );

    return chars.map((letter, index) => {
      const xOffset = chars
        .slice(0, index)
        .reduce((offset, char) => offset + getLetterWidth(char), -lineWidth / 2);
      const position: [number, number, number] = [xOffset, 0, 0];

      return { index, letter, position };
    });
  }, [text]);

  useEffect(() => {
    const meshes = lettersRef.current.filter(Boolean);

    gsap.set(
      meshes.map((mesh) => mesh.position),
      { y: -1.7, z: -3.2 },
    );

    gsap.set(
      meshes.map((mesh) => mesh.rotation),
      { x: 0.9, y: -1.05, z: 0.24 },
    );

    gsap.set(
      meshes.map((mesh) => mesh.scale),
      { x: 0, y: 0, z: 0 },
    );

    if (!play) return;

    if (groupRef.current) groupRef.current.visible = true;

    const timing = {
      inDuration: 0.7,
      rotateDuration: 0.78,
      scaleDuration: 0.62,
      exitStart: loaderTiming.textExitStart,
      exitDuration: 0.48,
      inStagger: 0.038,
      outStagger: 0.024,
    };

    const tl = gsap.timeline({
      delay,
      defaults: { ease: "power4.out" },
    });

    tl.to(
        meshes.map((m) => m.position),
        {
          y: 0,
          z: 0,
          duration: timing.inDuration,
          stagger: { each: timing.inStagger, from: "center" },
        },
        0,
      )
      .to(
        meshes.map((m) => m.rotation),
        {
          x: 0,
          y: 0,
          z: 0,
          duration: timing.rotateDuration,
          ease: "back.out(1.35)",
          stagger: { each: timing.inStagger, from: "center" },
        },
        0,
      )
      .to(
        meshes.map((m) => m.scale),
        {
          x: 1,
          y: 1,
          z: 1,
          duration: timing.scaleDuration,
          ease: "back.out(1.55)",
          stagger: { each: timing.inStagger, from: "center" },
        },
        0,
      )
      .to(
        meshes.map((m) => m.position),
        {
          y: 1.8,
          z: -1.2,
          duration: timing.exitDuration,
          ease: "power3.in",
          stagger: { each: timing.outStagger, from: "edges" },
        },
        timing.exitStart,
      )
      .to(
        meshes.map((m) => m.rotation),
        {
          x: -1.1,
          y: 0.75,
          z: -0.3,
          duration: timing.exitDuration,
          ease: "power3.in",
          stagger: { each: timing.outStagger, from: "edges" },
        },
        timing.exitStart,
      )
      .to(
        meshes.map((m) => m.scale),
        {
          x: 0,
          y: 0,
          z: 0,
          duration: timing.exitDuration,
          ease: "power3.in",
          stagger: { each: timing.outStagger, from: "edges" },
        },
        timing.exitStart,
      );

    return () => {
      tl.kill();
    };
  }, [delay, play]);

  return (
    <group ref={groupRef} position={[x, y, 0]} scale={lineScale} visible={false}>
      {letters.map(({ index, letter, position }) => {
        if (letter === " ") return null;

        return (
          <Text3D
            key={`${letter}-${index}`}
            ref={(node) => {
              if (node) lettersRef.current[index] = node;
            }}
            font={fontPath}
            size={1.12}
            height={1.02}
            curveSegments={6}
            bevelEnabled
            bevelThickness={0.045}
            bevelSize={0.022}
            bevelOffset={0}
            bevelSegments={2}
            position={position}
          >
            {letter}
            <meshStandardMaterial
              color="#ff2a2a"
              emissive="#000000"
              emissiveIntensity={0.05}
              metalness={0.5}
              roughness={0.31}
            />
          </Text3D>
        );
      })}
    </group>
  );
}

type ThreeDTitleProps = {
  onReady: () => void;
  play: boolean;
  fast: boolean;
};

function ThreeDTitle({ onReady, play, fast }: ThreeDTitleProps) {
  const mainGroupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const textScale = fast
    ? Math.min(2.55, viewport.width / 6.5, viewport.height / 2.8)
    : Math.min(2.8, viewport.width / 5.8, viewport.height / 2.4);
  const textScaleX = textScale * 0.96;

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    if (!play) return;
    if (!mainGroupRef.current) return;

    gsap.fromTo(
      mainGroupRef.current.rotation,
      { x: 0.08, y: -0.42, z: -0.05 },
      {
        x: 0.08,
        y: -0.2,
        z: -0.05,
        duration: 0.95,
        ease: "power3.inOut",
      },
    );
  }, [play]);

  return (
    <group
      ref={mainGroupRef}
      position={[0, fast ? 0.15 : -0.64, 0]}
      rotation={[0.08, -0.2, -0.05]}
      scale={[textScaleX, textScale, textScale]}
    >
      <TextLine3D text="SCI-FI" y={0.64} delay={0} play={play} />
      <TextLine3D
        text="CRAFTS"
        y={-0.64}
        delay={0.06}
        play={play}
        lineScale={0.94}
        x={0.16}
      />
    </group>
  );
}

type Loader3DTextProps = {
  onReady: () => void;
  play: boolean;
  fast: boolean;
};

function Loader3DText({ onReady, play, fast }: Loader3DTextProps) {
  return (
    <div className="h-[56svh] min-h-[320px] w-[min(118vw,1200px)] shrink-0 sm:h-[56svh] sm:min-h-80 sm:w-[min(110vw,1200px)] md:h-[62svh] md:min-h-[480px] lg:h-[66svh]">
      <Canvas
        camera={{ position: [0, 0, fast ? 14.8 : 14.75], fov: fast ? 40 : 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 5, 5]} intensity={5.8} />
        <pointLight position={[0, 2, 5]} intensity={3.8} color={red} />
        <pointLight position={[-4, -2, 5]} intensity={1.8} color="#ffffff" />

        <Suspense fallback={null}>
          <ThreeDTitle onReady={onReady} play={play} fast={fast} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function LoadingScreen() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [threeReady, setThreeReady] = useState(false);
  const [landingReady, setLandingReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const handleThreeReady = useCallback(() => setThreeReady(true), []);

  useEffect(() => {
    const targetWindow = window as Window & {
      __sciCraftsLandingReady?: boolean;
    };
    const updateLandingReady = () => setLandingReady(true);

    if (targetWindow.__sciCraftsLandingReady) {
      updateLandingReady();
    }

    window.addEventListener("sci-crafts-landing-ready", updateLandingReady);

    return () => {
      window.removeEventListener("sci-crafts-landing-ready", updateLandingReady);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const updateIsMobile = () => setIsMobile(query.matches);

    updateIsMobile();
    query.addEventListener("change", updateIsMobile);

    return () => {
      query.removeEventListener("change", updateIsMobile);
    };
  }, []);

  useGSAP(
    () => {
      const scope = loaderRef.current;
      if (!scope || !threeReady || !landingReady) return;

      const counterText = counterRef.current;
      const stageItems = Array.from(
        scope.querySelectorAll<HTMLElement>(".loader-stage-item"),
      );
      const shutterPanels = Array.from(
        scope.querySelectorAll<HTMLElement>(".loader-shutter"),
      );

      if (!counterText) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const counter = { value: 0 };

      gsap.set(contentRef.current, { autoAlpha: 1 });
      gsap.set(counterText, { opacity: 0, y: 10 });
      gsap.set(stageItems, { autoAlpha: 0, y: 22 });
      gsap.set(shutterPanels, { scaleY: 0, transformOrigin: "50% 100%" });

      if (prefersReducedMotion) {
        counterText.textContent = "100";
        gsap.set([counterText, stageItems], {
          opacity: 1,
          y: 0,
        });
        gsap.to(loaderRef.current, {
          autoAlpha: 0,
          delay: 0.55,
          duration: 0.28,
          onComplete: () => {
            window.dispatchEvent(new Event("sci-crafts-loader-complete"));
          },
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl
        .to(
          stageItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: loaderTiming.stageInDuration,
            stagger: { each: 0.08, from: "center" },
            ease: "power4.out",
          },
          0.08,
        )
        .to(
          counterText,
          { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
          0.22,
        )
        .to(
          counter,
          {
            value: 100,
            duration: loaderTiming.countDuration,
            ease: "power3.inOut",
            onUpdate: () => {
              counterText.textContent = Math.round(counter.value)
                .toString()
                .padStart(3, "0");
            },
          },
          0.26,
        )
        .to(
          counterText,
          {
            autoAlpha: 0,
            y: -10,
            duration: 0.34,
            ease: "power2.in",
          },
          loaderTiming.textExitStart + 0.1,
        )
        .to(
          stageItems,
          {
            autoAlpha: 0,
            y: -18,
            duration: 0.48,
            stagger: { each: 0.04, from: "edges" },
            ease: "power3.in",
          },
          loaderTiming.textExitStart + 0.04,
        )
        .to(
          shutterPanels,
          {
            scaleY: 1,
            duration: 0.46,
            ease: "power4.inOut",
            stagger: { each: 0.045, from: "end" },
          },
          loaderTiming.loaderExitStart - 0.38,
        )
        .to(
          loaderRef.current,
          {
            yPercent: -101,
            duration: 0.7,
            ease: "power4.inOut",
            onComplete: () => {
              window.dispatchEvent(new Event("sci-crafts-loader-complete"));
            },
          },
          loaderTiming.loaderExitStart + 0.08,
        );
    },
    { dependencies: [threeReady, landingReady], scope: loaderRef },
  );

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-50 overflow-hidden border-[12px] border-[#dc2626] bg-[#161515] text-[#fff4f1] will-change-transform sm:border-[16px]"
      aria-label="Loading Sci-Fi Crafts"
      role="status"
    >
      <div
        ref={contentRef}
        className="invisible relative z-10 flex min-h-[100svh] flex-col justify-between px-5 py-8 opacity-0 sm:px-10 md:px-14 md:py-11"
      >
        <div className="flex w-full items-start justify-between gap-4">
          <div className="text-[0.62rem] font-black uppercase tracking-[0.32em] text-[#fff4f1]/55">
            Sci-Crafts
          </div>
        </div>

        <div className="loader-stage-item relative z-10 flex min-h-0 flex-1 items-center justify-center py-2">
          <Loader3DText
            onReady={handleThreeReady}
            play={threeReady}
            fast={isMobile}
          />
        </div>

        <div className="loader-stage-item mx-auto mb-9 flex w-full max-w-5xl justify-end sm:mb-7">
          <div
            ref={counterRef}
            className="w-[4ch] shrink-0 text-right text-2xl font-black leading-none tracking-[0.04em] text-[#fff4f1] sm:text-4xl"
            style={{ fontFeatureSettings: "'tnum'" }}
          >
            000
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 grid grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="loader-shutter bg-[#dc2626]" />
        ))}
      </div>
      <span className="sr-only">Loading Sci-Fi Crafts</span>
    </div>
  );
}
