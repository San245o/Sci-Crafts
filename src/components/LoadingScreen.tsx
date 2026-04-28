"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Text3D, useFont } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrambleTextPlugin);

const fontPath = "/fonts/helvetiker_bold.typeface.json";
const textExitStart = 2.05;
const loaderExitStart = 2.8;
const red = "#ef4444";

useFont.preload(fontPath);

type TextLine3DProps = {
  text: string;
  y: number;
  delay: number;
  play: boolean;
};

type LetterLayout = {
  index: number;
  letter: string;
  position: [number, number, number];
};

function getLetterWidth(letter: string) {
  const lower = letter.toLowerCase();
  const letterSpacing = 0.18;

  if (letter === " ") return 0.48;
  if (lower === "i" || lower === "l") return 0.34 + letterSpacing;
  if (lower === "-") return 0.48 + letterSpacing;
  if (lower === "f" || lower === "t") return 0.56 + letterSpacing;
  if (lower === "m" || lower === "w") return 0.9 + letterSpacing;

  return 0.72 + letterSpacing;
}

function TextLine3D({ text, y, delay, play }: TextLine3DProps) {
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
      { y: -1.4, z: -2.2 },
    );

    gsap.set(
      meshes.map((mesh) => mesh.rotation),
      { x: 1.15, y: -0.7, z: 0.28 },
    );

    gsap.set(
      meshes.map((mesh) => mesh.scale),
      { x: 0, y: 0, z: 0 },
    );

    if (!play) return;

    if (groupRef.current) groupRef.current.visible = true;

    const tl = gsap.timeline({ delay, defaults: { ease: "power4.out" } });

    tl.to(
      meshes.map((m) => m.position),
      { y: 0, z: 0, duration: 0.86, stagger: { each: 0.045, from: "start" } },
      0,
    )
      .to(
        meshes.map((m) => m.rotation),
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.92,
          ease: "back.out(1.8)",
          stagger: { each: 0.045, from: "start" },
        },
        0,
      )
      .to(
        meshes.map((m) => m.scale),
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.72,
          ease: "back.out(2)",
          stagger: { each: 0.045, from: "start" },
        },
        0,
      )
      .to(
        meshes.map((m) => m.position),
        {
          y: 1.8,
          z: -1.2,
          duration: 0.56,
          ease: "power3.in",
          stagger: { each: 0.026, from: "start" },
        },
        textExitStart,
      )
      .to(
        meshes.map((m) => m.rotation),
        {
          x: -1.1,
          y: 0.75,
          z: -0.3,
          duration: 0.56,
          ease: "power3.in",
          stagger: { each: 0.026, from: "start" },
        },
        textExitStart,
      )
      .to(
        meshes.map((m) => m.scale),
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.56,
          ease: "power3.in",
          stagger: { each: 0.026, from: "start" },
        },
        textExitStart,
      );

    return () => {
      tl.kill();
    };
  }, [delay, play]);

  return (
    <group ref={groupRef} position={[0, y, 0]} visible={false}>
      {letters.map(({ index, letter, position }) => {
        if (letter === " ") return null;

        return (
          <Text3D
            key={`${letter}-${index}`}
            ref={(node) => {
              if (node) lettersRef.current[index] = node;
            }}
            font={fontPath}
            size={1}
            height={0.46}
            curveSegments={10}
            bevelEnabled
            bevelThickness={0.045}
            bevelSize={0.028}
            bevelOffset={0}
            bevelSegments={3}
            position={position}
          >
            {letter}
            <meshStandardMaterial
              color="#ef2f2f"
              emissive="#7f0000"
              emissiveIntensity={0.18}
              metalness={0.2}
              roughness={0.26}
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
};

function ThreeDTitle({ onReady, play }: ThreeDTitleProps) {
  const mainGroupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobileViewport = viewport.width < 7;
  const textScale = isMobileViewport
    ? Math.min(3.05, viewport.width / 4.35, viewport.height / 1.85)
    : Math.min(3.12, viewport.width / 6.2, viewport.height / 2.45);
  const textScaleX = textScale * 1.04;
  const textX = viewport.width > 10 ? 0.22 : 0;

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    if (!play) return;
    if (!mainGroupRef.current) return;

    gsap.fromTo(
      mainGroupRef.current.rotation,
      { x: 0.12, y: -0.62, z: 0.04 },
      { x: 0.12, y: -0.42, z: 0.04, duration: 1.1, ease: "power3.inOut" },
    );
  }, [play]);

  return (
    <group
      ref={mainGroupRef}
      position={[textX, -0.08, 0]}
      rotation={[0.12, -0.42, 0.04]}
      scale={[textScaleX, textScale, textScale]}
    >
      <TextLine3D text="SCI-FI" y={0.64} delay={0} play={play} />
      <TextLine3D text="CRAFTS" y={-0.64} delay={0.06} play={play} />
    </group>
  );
}

type Loader3DTextProps = {
  onReady: () => void;
  play: boolean;
};

function Loader3DText({ onReady, play }: Loader3DTextProps) {
  return (
    <div className="h-[34svh] min-h-[260px] w-[calc(100vw-2rem)] max-w-[820px] translate-x-0 py-2 sm:h-[38svh] sm:min-h-[300px] sm:w-[min(96vw,940px)] md:h-[70svh] md:min-h-[540px] md:w-[min(96vw,1480px)] md:max-w-none md:translate-x-[1vw] md:py-0 lg:h-[74svh]">
      <Canvas
        camera={{ position: [0, 0, 11.8], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.35} />
        <directionalLight position={[4, 5, 5]} intensity={5.5} />
        <pointLight position={[0, 3, 4]} intensity={4.5} color={red} />
        <pointLight position={[4, -2, 4]} intensity={5.5} color="#d946ef" />
        <pointLight position={[-5, 2, 4]} intensity={3.2} color="#38bdf8" />
        <pointLight position={[0, -4, 5]} intensity={2.5} color="#ffffff" />

        <Suspense fallback={null}>
          <ThreeDTitle onReady={onReady} play={play} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function LoadingScreen() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrambleRef = useRef<HTMLDivElement>(null);
  const [threeReady, setThreeReady] = useState(false);

  useGSAP(
    () => {
      const scope = loaderRef.current;
      if (!scope || !threeReady) return;

      const select = <T extends Element>(selector: string) =>
        scope.querySelector<T>(selector);

      const diamondMark = select<SVGGElement>(".diamond-mark");
      const diamondPath = select<SVGPathElement>(".diamond-path");
      const scrambleText = scrambleRef.current;

      if (!diamondMark || !diamondPath || !scrambleText) return;

      gsap.set(contentRef.current, { autoAlpha: 1 });
      gsap.set(diamondMark, { opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(diamondPath, { drawSVG: "0% 0%" });
      gsap.set(scrambleText, { opacity: 0, y: 8 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl
        .fromTo(
          diamondMark,
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" },
          0,
        )
        .to(
          diamondPath,
          {
            drawSVG: "100%",
            duration: 1.25,
            ease: "power3.inOut",
          },
          0,
        )
        .fromTo(
          scrambleText,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
          },
          0.38,
        )
        .to(
          scrambleText,
          {
            duration: 1.05,
            scrambleText: {
              text: "Bring 3D IRL",
              chars: "X0",
              speed: 0.45,
            },
          },
          0.55,
        )
        .to(
          svgRef.current,
          { scale: 1.08, opacity: 0, duration: 0.62, ease: "power2.inOut" },
          textExitStart,
        )
        .to(
          diamondPath,
          { drawSVG: "100% 100%", duration: 0.62, ease: "power2.inOut" },
          textExitStart,
        )
        .to(
          scrambleText,
          { opacity: 0, y: -8, duration: 0.4, ease: "power2.in" },
          textExitStart,
        )
        .to(
          loaderRef.current,
          {
            yPercent: -100,
            duration: 0.5,
            ease: "power4.inOut",
            onComplete: () => {
              window.dispatchEvent(new Event("sci-crafts-loader-complete"));
            },
          },
          loaderExitStart,
        );
    },
    { dependencies: [threeReady], scope: loaderRef },
  );

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-50 overflow-hidden will-change-transform border-16 border-[#D22F2F]"
      style={{ backgroundColor: "#252323" }}
      aria-label="Loading Sci-Fi Crafts"
      role="status"
    >
      <div
        ref={contentRef}
        className="invisible relative z-10 grid h-[100svh] grid-cols-1 grid-rows-[40fr_60fr] items-center gap-1 px-4 py-6 opacity-0 sm:px-8 md:min-h-[100svh] md:grid-cols-[0.52fr_1.48fr] md:grid-rows-1 md:gap-6 md:px-10 md:py-0 lg:px-12"
      >
        <div className="flex -translate-y-6 flex-col items-center justify-center gap-9 md:-translate-y-10 md:gap-11">
          <svg
            ref={svgRef}
            viewBox="-1 -1 103 103"
            className="h-44 w-44 overflow-visible fill-none sm:h-48 sm:w-48 md:h-72 md:w-72"
          >
            <defs>
              <linearGradient
                id="diamondStroke"
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ef2f2f" />
                <stop offset="48%" stopColor="#fff4f4" />
                <stop offset="100%" stopColor="#ff4b55" />
              </linearGradient>
            </defs>

            <g
              className="diamond-mark"
              opacity="0"
              strokeLinecap="butt"
              strokeLinejoin="miter"
            >
              <path
                className="diamond-path"
                d="M50.5 50.5h50v50s-19.2 1.3-37.2-16.7S56 35.4 35.5 15.5C18.5-1 .5.5.5.5v50h50s25.6-.6 38-18 12-32 12-32h-50v100H.5S.2 80.7 11.8 68.2 40 49.7 50.5 50.5Z"
                stroke="url(#diamondStroke)"
                strokeWidth="2.2"
              />
            </g>
          </svg>
          <div className="flex min-h-10 w-[min(92vw,34rem)] justify-center overflow-visible">
            <div
              ref={scrambleRef}
              className="inline-block w-[12ch] whitespace-nowrap text-center text-[clamp(1.75rem,6vw,3rem)] font-black uppercase leading-none tracking-[0.16em] text-[#ef2f2f] sm:tracking-[0.2em] md:text-5xl md:tracking-[0.24em]"
              style={{
                fontFeatureSettings: "'tnum'",
                fontVariationSettings: "'wght' 900",
                WebkitTextStroke: "0.5px #ef2f2f",
              }}
            />
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center overflow-visible md:justify-start">
          <Loader3DText
            onReady={() => setThreeReady(true)}
            play={threeReady}
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          backgroundImage: "url('/noise.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "72px 72px",
          imageRendering: "pixelated",
          mixBlendMode: "overlay",
          opacity: 0.38,
        }}
      />

      <span className="sr-only">Loading Sci-Fi Crafts</span>
    </div>
  );
}
