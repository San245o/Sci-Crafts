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
    <div className="h-[420px] w-full border border-black">
      <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
        <ambientLight intensity={1.6} />
        <directionalLight position={[4, 6, 4]} intensity={1.5} />
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
