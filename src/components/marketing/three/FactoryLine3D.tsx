"use client";

/**
 * FactoryLine3D — isometric 3D "foundry line": a row of pipeline nodes
 * (capture → sync → QC → R2 → AI), glowing data packets that travel the line,
 * and an instanced fleet of worker packs that scales up. Blueprint styling.
 * Light scene (~7 nodes + 4 packets + instanced fleet) per WebGL-perf budget.
 */
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Instances, Instance, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

const NODES = 7;
const SPAN = 6.4;          // total line length on X
const x0 = -SPAN / 2;
const step = SPAN / (NODES - 1);

function Node({ x, accent }: { x: number; accent: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => Math.abs(Math.sin(x * 12.9898) * 43758.5), [x]);
  useFrame((state) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2 + seed));
  });
  return (
    <mesh ref={ref} position={[x, 0, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#14122E" emissive={accent} emissiveIntensity={0.5} metalness={0.4} roughness={0.5} />
      <Edges color={accent} />
    </mesh>
  );
}

function Packet({ offset }: { offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * 0.32 + offset) % 1;
    ref.current.position.x = x0 + t * SPAN;
    ref.current.position.y = Math.sin(t * Math.PI) * 0.12;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = t < 0.04 || t > 0.96 ? 0 : 1;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.09, 16, 16]} />
      <meshStandardMaterial color="#00E5C7" emissive="#00E5C7" emissiveIntensity={2} transparent />
    </mesh>
  );
}

function Fleet() {
  // instanced worker-pack cubes on the left, "scaling up"
  const positions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 36; i++) {
      const col = i % 6, row = Math.floor(i / 6);
      arr.push([x0 - 1.7 - col * 0.34, -0.9 + row * 0.34, -0.2 + (i % 3) * 0.18]);
    }
    return arr;
  }, []);
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.children.forEach((c, i) => {
      c.scale.setScalar(0.5 + 0.5 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.5 + i)));
    });
  });
  return (
    <group ref={group}>
      <Instances limit={40} range={36}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color="#1A1740" emissive="#6C3CF4" emissiveIntensity={0.5} />
        {positions.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>
    </group>
  );
}

function Scene() {
  const accents = ["#6C3CF4", "#6C3CF4", "#6C3CF4", "#00E5C7", "#00E5C7", "#00E5C7", "#00E5C7"];
  return (
    <group rotation={[0.5, -0.5, 0]} position={[0.6, 0.1, 0]}>
      {/* the line */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[SPAN + 0.4, 0.02, 0.02]} />
        <meshStandardMaterial color="#00E5C7" emissive="#00E5C7" emissiveIntensity={0.6} transparent opacity={0.5} />
      </mesh>
      {Array.from({ length: NODES }).map((_, i) => (
        <Node key={i} x={x0 + i * step} accent={accents[i]} />
      ))}
      {[0, 0.25, 0.5, 0.75].map((o) => <Packet key={o} offset={o} />)}
      <Fleet />
    </group>
  );
}

export default function FactoryLine3D({ className }: { className?: string }) {
  const dprRef = useRef<[number, number]>([1, 1.5]);
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 1.4, 7], fov: 36 }}
        dpr={dprRef.current}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <PerformanceMonitor onDecline={() => (dprRef.current = [1, 1])} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={0.9} color="#bfe9ff" />
        <pointLight position={[-4, 0, 2]} intensity={20} color="#6C3CF4" />
        <pointLight position={[4, 0, 2]} intensity={16} color="#00E5C7" />
        <Scene />
      </Canvas>
    </div>
  );
}
