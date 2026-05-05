"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AdaptiveDpr,
  OrthographicCamera,
  Preload,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const robotArmPath = "/robot_arm.glb";
const robotFrontRotation: [number, number, number] = [0, 3.6, 0];

// Draco-compressed GLB — pass decoder path as second argument
useGLTF.preload(robotArmPath, "/draco/");

type RobotArmGLTF = {
  scene: THREE.Group;
};

type JointTargets = {
  baseY: number;
  upperX: number;
  shoulderX: number;
  wristX: number;
};

type AimRef = {
  current: {
    x: number;
    y: number;
  };
};

const paint = {
  shell: new THREE.MeshStandardMaterial({
    color: "#303332",
    metalness: 0.08,
    roughness: 0.78,
    envMapIntensity: 0.32,
  }),
  joint: new THREE.MeshStandardMaterial({
    color: "#747d7b",
    metalness: 0.4,
    roughness: 0.7,
    envMapIntensity: 0.36,
  }),
  accent: new THREE.MeshStandardMaterial({
    color: "#dc2626",
    emissive: "#5f0808",
    emissiveIntensity: 0.22,
    metalness: 0.42,
    roughness: 0.2,
  }),
  base: new THREE.MeshStandardMaterial({
    color: "#000000",
    metalness: 0.06,
    roughness: 0.82,
    envMapIntensity: 0.28,
  }),
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function materialForMesh(name: string) {
  if (name.includes("Base") || name.includes("Ellipse")) return paint.base;
  if (name.includes("Cylinder") || name.includes("Star")) return paint.joint;
  if (name.includes("Grab") || name.includes("Triangle")) return paint.accent;
  return paint.shell;
}

function usePreparedRobotScene() {
  const { scene } = useGLTF(robotArmPath, "/draco/") as RobotArmGLTF;

  return useMemo(() => {
    const clone = scene.clone(true);
    const removableNames = new Set(["UI", "Target", "Floor"]);

    clone.traverse((object) => {
      if (removableNames.has(object.name)) {
        object.visible = false;
      }

      if (object.type.includes("Light") || object.type.includes("Camera")) {
        object.visible = false;
      }

      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
        object.material = materialForMesh(object.name);
      }
    });

    return clone;
  }, [scene]);
}

function RobotArmRig({
  aimRef,
  onReady,
}: {
  aimRef: AimRef;
  onReady?: () => void;
}) {
  const scene = usePreparedRobotScene();
  const rootRef = useRef<THREE.Group>(null);
  const readyRef = useRef(false);
  const baseRef = useRef<THREE.Object3D | null>(null);
  const upperArmRef = useRef<THREE.Object3D | null>(null);
  const shoulderRef = useRef<THREE.Object3D | null>(null);
  const wristRef = useRef<THREE.Object3D | null>(null);
  const restPose = useRef<JointTargets | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const { pointer, size } = useThree();

  useEffect(() => {
    baseRef.current = scene.getObjectByName("Base_Y_Rotation") ?? null;
    upperArmRef.current = scene.getObjectByName("1_Hand_X_rotation") ?? null;
    shoulderRef.current = scene.getObjectByName("2_Hand_X_Rotation") ?? null;
    wristRef.current = scene.getObjectByName("3_Hand_X_Rotate") ?? null;

    if (
      baseRef.current &&
      upperArmRef.current &&
      shoulderRef.current &&
      wristRef.current
    ) {
      restPose.current = {
        baseY: baseRef.current.rotation.y,
        upperX: upperArmRef.current.rotation.x,
        shoulderX: shoulderRef.current.rotation.x,
        wristX: wristRef.current.rotation.x,
      };

      if (!readyRef.current) {
        readyRef.current = true;
        requestAnimationFrame(() => onReady?.());
      }
    }
  }, [onReady, scene]);

  useFrame((_, delta) => {
    const aimX = Number.isFinite(aimRef.current.x) ? aimRef.current.x : pointer.x;
    const aimY = Number.isFinite(aimRef.current.y) ? aimRef.current.y : pointer.y;

    target.current.x = THREE.MathUtils.lerp(target.current.x, aimX, 0.08);
    target.current.y = THREE.MathUtils.lerp(target.current.y, aimY, 0.08);

    const rest = restPose.current;
    const base = baseRef.current;
    const upperArm = upperArmRef.current;
    const shoulder = shoulderRef.current;
    const wrist = wristRef.current;
    const root = rootRef.current;

    if (!rest || !base || !upperArm || !shoulder || !wrist || !root) return;

    const reachX = clamp(target.current.x, -1, 1);
    const reachY = clamp(target.current.y, -1, 1);
    const damp = 1 - Math.exp(-delta * 9);
    const horizontalAim = -reachX * 0.42;
    const verticalAim = reachY * 0.86;

    base.rotation.y = THREE.MathUtils.lerp(
      base.rotation.y,
      rest.baseY + horizontalAim,
      damp,
    );

    upperArm.rotation.x = THREE.MathUtils.lerp(
      upperArm.rotation.x,
      clamp(rest.upperX - verticalAim * 0.46, -1.05, 0.34),
      damp,
    );

    shoulder.rotation.x = THREE.MathUtils.lerp(
      shoulder.rotation.x,
      clamp(rest.shoulderX - verticalAim * 0.64, 0.12, 1.52),
      damp,
    );

    wrist.rotation.x = THREE.MathUtils.lerp(
      wrist.rotation.x,
      clamp(rest.wristX + verticalAim * 0.42 - Math.abs(reachX) * 0.08, -0.8, 0.82),
      damp,
    );

    root.rotation.x = THREE.MathUtils.lerp(
      root.rotation.x,
      robotFrontRotation[0] + reachY * 0.025,
      damp,
    );
    root.rotation.y = THREE.MathUtils.lerp(
      root.rotation.y,
      robotFrontRotation[1] + reachX * 0.04,
      damp,
    );
    root.rotation.z = THREE.MathUtils.lerp(
      root.rotation.z,
      robotFrontRotation[2] - reachX * 0.018,
      damp,
    );
  });

  const isMobile = size.width < 640;
  const scale = isMobile ? 0.774 * 0.85 * 1.15 * 1.15 : 1.254;
  const posY = isMobile ? -0.92 : -0.9;

  return (
    <group
      ref={rootRef}
      position={[0, posY, 0]}
      rotation={robotFrontRotation}
      scale={scale}
    >
      <primitive object={scene} />
    </group>
  );
}

function ResponsiveOrthographicCamera() {
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const { invalidate, size } = useThree();
  const aspect = clamp(size.width / Math.max(size.height, 1), 0.42, 2.6);

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    camera.left = -aspect;
    camera.right = aspect;
    camera.bottom = -1;
    camera.top = 1;
    camera.updateProjectionMatrix();
    invalidate();
  }, [aspect, invalidate]);

  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 10]}
      left={-aspect}
      right={aspect}
      bottom={-1}
      top={1}
      near={0.1}
      far={1000}
      zoom={1}
    />
  );
}

/**
 * MOBILE FIX:
 * The original wrapper used `touch-none` which blocked ALL touch events —
 * preventing scroll, pull-to-refresh, and any page interaction on mobile.
 *
 * The fix uses `touch-action: pan-y` so vertical scrolling passes through
 * natively, while horizontal gestures are captured for the robot arm.
 * We also use `pointer-events: none` on the wrapper and only capture
 * pointer/mouse events (which work on desktop). On mobile, we listen to
 * global touchmove to drive the arm without blocking scroll.
 */
export function RobotArmCanvas({ onReady }: { onReady?: () => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const aimRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(true);

  const updateAimFromPoint = useCallback((clientX: number, clientY: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const isMobile = rect.width < 640;
    const xInset = isMobile ? rect.width * 0.06 : 0;
    const topInset = isMobile ? rect.height * 0.18 : 0;
    const bottomInset = isMobile ? rect.height * 0.12 : 0;
    const activeLeft = rect.left + xInset;
    const activeTop = rect.top + topInset;
    const activeWidth = Math.max(rect.width - xInset * 2, 1);
    const activeHeight = Math.max(rect.height - topInset - bottomInset, 1);
    const localX = clientX - activeLeft;
    const localY = clientY - activeTop;
    const x = (localX / activeWidth) * 2 - 1;
    const y = -((localY / activeHeight) * 2 - 1);

    aimRef.current.x = clamp(x, -1, 1);
    aimRef.current.y = clamp(y, -1, 1);
  }, []);

  // On mobile, listen to window-level touch events so scroll isn't blocked
  // touchstart = respond immediately on finger down
  // touchmove  = track finger movement
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 640px)").matches || "ontouchstart" in window;
    if (!isMobile) return;

    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        updateAimFromPoint(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, [updateAimFromPoint]);

  // Unmount the Canvas once the user scrolls past the landing section
  // to free the WebGL context and GPU resources
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setMounted(false);
        } else {
          setMounted(true);
        }
      },
      { threshold: 0, rootMargin: "200px 0px 0px 0px" },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-[2] h-[100svh] min-h-screen w-full"
      style={{
        // On mobile: allow vertical scrolling/pull-to-refresh to pass through.
        // On desktop: capture pointer events for robot arm interaction.
        touchAction: "pan-y",
      }}
      onPointerDown={(event) => {
        // Only capture on non-touch (desktop)
        if (event.pointerType !== "touch") {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateAimFromPoint(event.clientX, event.clientY);
        }
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "touch") {
          updateAimFromPoint(event.clientX, event.clientY);
        }
      }}
    >
      {mounted && (
        <Canvas
          orthographic
          className="h-full min-h-screen w-full"
          dpr={[1, 1.5]}
          style={{ touchAction: "pan-y" }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
        >
          <ambientLight intensity={1.45} />
          <directionalLight position={[4, 7, 5]} intensity={3.8} />
          <hemisphereLight args={["#fff8ed", "#5b4a3d", 0.75]} />
          <pointLight position={[0.5, 2.3, 3.2]} intensity={1.15} color="#ef4444" />

          <ResponsiveOrthographicCamera />

          <Suspense fallback={null}>
            <RobotArmRig aimRef={aimRef} onReady={onReady} />
          </Suspense>

          <AdaptiveDpr />
          <Preload all />

        </Canvas>
      )}
    </div>
  );
}
