"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls, useGLTF } from "@react-three/drei";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, "/draco/");
  return <primitive object={scene} />;
}

export function ModelViewer({ url }: { url: string }) {
  return (
    <div className="h-[min(68vh,680px)] min-h-[360px] w-full">
      <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
        <color attach="background" args={["#e5ded0"]} />
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 6, 4]} intensity={1.7} />
        <directionalLight position={[-3, 2, -4]} intensity={0.7} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <Model url={url} />
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
