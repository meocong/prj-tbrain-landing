"use client";

/**
 * EgoKitPack3D — low-poly 3D model of the EgoKit worker pack, rendered in a
 * blueprint style (dark fill + cyan edges). Auto-rotates; explodes its parts
 * outward as the host section scrolls through the viewport.
 *
 * Built from primitives — no external glTF. Swap in a real scan later by
 * replacing <PackModel/>. Kept deliberately light (≈9 meshes) per the
 * project's documented WebGL-perf constraints.
 */
import { useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

type Part = {
  pos: [number, number, number];
  size: [number, number, number];
  dir: [number, number, number];   // explode direction
  color: string;
};

const PARTS: Part[] = [
  { pos: [0, 0, 0], size: [1.8, 1.0, 0.55], dir: [0, -0.15, 0], color: "#1A1740" },        // belt box enclosure
  { pos: [0, 0.62, 0], size: [1.1, 0.08, 0.7], dir: [0, 1.0, 0], color: "#14122E" },        // Pi 5 board
  { pos: [-0.55, 0.6, 0.12], size: [0.34, 0.1, 0.5], dir: [-1.2, 0.7, 0.3], color: "#14122E" }, // SSD
  { pos: [0.55, -0.02, 0.16], size: [0.66, 0.66, 0.3], dir: [1.3, -0.3, 0.5], color: "#14122E" }, // power bank
  { pos: [0, 1.5, 0.34], size: [0.86, 0.3, 0.24], dir: [0, 1.9, 0.7], color: "#1A1740" },   // D455 camera body
];

function PackModel({ progressRef, autoRotate }: { progressRef: RefObject<number>; autoRotate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const partRefs = useRef<(THREE.Group | null)[]>([]);
  const eased = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (autoRotate) g.rotation.y += delta * 0.35;
    g.rotation.x = -0.18 + Math.sin(state.clock.elapsedTime * 0.4) * 0.04;

    const target = Math.min(1, Math.max(0, progressRef.current ?? 0));
    eased.current += (target - eased.current) * Math.min(1, delta * 4);
    const e = eased.current;
    PARTS.forEach((p, i) => {
      const ref = partRefs.current[i];
      if (!ref) return;
      ref.position.set(
        p.pos[0] + p.dir[0] * e,
        p.pos[1] + p.dir[1] * e,
        p.pos[2] + p.dir[2] * e,
      );
    });
  });

  return (
    <group ref={group} scale={1.15}>
      {PARTS.map((p, i) => (
        <group key={i} ref={(el) => { partRefs.current[i] = el; }} position={p.pos}>
          <mesh>
            <boxGeometry args={p.size} />
            <meshStandardMaterial color={p.color} metalness={0.35} roughness={0.55} transparent opacity={0.92} />
            <Edges threshold={15} color="#00E5C7" />
          </mesh>
        </group>
      ))}
      {/* D455 stereo lenses */}
      <mesh position={[-0.22, 1.5, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.12, 20]} />
        <meshStandardMaterial color="#0B0A1F" metalness={0.6} roughness={0.3} />
        <Edges color="#5EEAD4" />
      </mesh>
      <mesh position={[0.22, 1.5, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.12, 20]} />
        <meshStandardMaterial color="#0B0A1F" metalness={0.6} roughness={0.3} />
        <Edges color="#5EEAD4" />
      </mesh>
      {/* head-strap arc */}
      <mesh position={[0, 1.18, -0.02]}>
        <torusGeometry args={[0.95, 0.04, 8, 40, Math.PI]} />
        <meshStandardMaterial color="#2A2660" metalness={0.2} roughness={0.7} />
        <Edges color="#6C3CF4" />
      </mesh>
    </group>
  );
}

function ScrollProgress({ sectionRef, progressRef }: { sectionRef: RefObject<HTMLElement | null>; progressRef: RefObject<number> }) {
  useFrame(() => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const p = 1 - (r.top + r.height * 0.2) / vh;
    progressRef.current = Math.min(1, Math.max(0, p));
  });
  return null;
}

export default function EgoKitPack3D({
  sectionRef,
  autoRotate = true,
  interactive = false,
  className,
}: {
  sectionRef?: RefObject<HTMLElement | null>;
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  const progressRef = useRef(sectionRef ? 0 : 0.32); // idle partial-explode when not scroll-driven
  const dprRef = useRef<[number, number]>([1, 1.6]);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [2.6, 1.4, 3.2], fov: 38 }}
        dpr={dprRef.current}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <PerformanceMonitor onDecline={() => (dprRef.current = [1, 1])} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} color="#bfe9ff" />
        <pointLight position={[-3, 1, -2]} intensity={30} color="#6C3CF4" />
        <pointLight position={[3, -1, 2]} intensity={18} color="#00E5C7" />
        {sectionRef && <ScrollProgress sectionRef={sectionRef} progressRef={progressRef} />}
        <PackModel progressRef={progressRef} autoRotate={autoRotate} />
        {interactive && (
          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
        )}
      </Canvas>
    </div>
  );
}
