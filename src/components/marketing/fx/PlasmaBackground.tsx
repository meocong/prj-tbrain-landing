"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

export type PlasmaTint = "default" | "green" | "purple";

const PlasmaMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(1, 1),
    uTint: 0,
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uTint;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 3; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
      vec2 st = vUv * aspect;

      float t = uTime * 0.03;
      vec2 q = vec2(fbm(st + t), fbm(st + vec2(5.2, 1.3) + t));
      vec2 r = vec2(fbm(st + q + vec2(1.7, 9.2) + 0.1 * t), fbm(st + q + vec2(8.3, 2.8) + 0.08 * t));
      float f = fbm(st + r);

      vec3 purple  = vec3(0.424, 0.235, 0.957);
      vec3 green   = vec3(0.063, 0.725, 0.506);
      vec3 midnight = vec3(0.008, 0.024, 0.090);
      vec3 accent  = vec3(0.651, 0.545, 0.980);

      vec3 baseA = (uTint > 0.5) ? mix(purple, green, 0.5) : purple;
      vec3 baseB = (uTint > 0.5) ? accent : green;

      vec3 color = mix(midnight, baseA, smoothstep(0.0, 0.8, f));
      color = mix(color, baseB,  smoothstep(0.45, 0.95, length(r)));
      color = mix(color, accent, smoothstep(0.65, 1.0, f * f));

      float vignette = 1.0 - smoothstep(0.35, 1.1, length(vUv - 0.5));
      color *= vignette * 1.12;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ PlasmaMaterial });

// Module augmentation so JSX recognises <plasmaMaterial>
// (drei's shaderMaterial doesn't register type info automatically in Next 16.)
declare module "@react-three/fiber" {
  interface ThreeElements {
    plasmaMaterial: {
      ref?: React.Ref<THREE.ShaderMaterial & { uTime: number; uResolution: THREE.Vector2; uTint: number }>;
      attach?: string;
    };
  }
}

function PlasmaPlane({ tint }: { tint: PlasmaTint }) {
  const ref = useRef<(THREE.ShaderMaterial & { uTime: number; uResolution: THREE.Vector2; uTint: number }) | null>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.uTime = state.clock.getElapsedTime();
    ref.current.uResolution.set(size.width, size.height);
    ref.current.uTint = tint === "green" ? 1 : tint === "purple" ? 2 : 0;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <plasmaMaterial ref={ref} attach="material" />
    </mesh>
  );
}

function staticFallback(tint: PlasmaTint) {
  if (tint === "green") {
    return (
      "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(16,185,129,0.38) 0%, transparent 55%)," +
      "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(108,60,244,0.3) 0%, transparent 55%)," +
      "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(167,139,250,0.18) 0%, transparent 60%)," +
      "#020617"
    );
  }
  return (
    "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(108,60,244,0.42) 0%, transparent 55%)," +
    "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(16,185,129,0.28) 0%, transparent 55%)," +
    "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(167,139,250,0.2) 0%, transparent 60%)," +
    "#020617"
  );
}

export function PlasmaBackground({
  className,
  tint = "default",
}: {
  className?: string;
  tint?: PlasmaTint;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [glReady, setGlReady] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;
    try {
      const c = document.createElement("canvas");
      if (c.getContext("webgl2") || c.getContext("webgl")) setGlReady(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showCanvas = glReady && inView;

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", background: staticFallback(tint) }}
    >
      {showCanvas && (
        <Canvas
          orthographic
          camera={{ zoom: 1, position: [0, 0, 1] }}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          dpr={1}
          frameloop="always"
          style={{ position: "absolute", inset: 0 }}
        >
          <PlasmaPlane tint={tint} />
        </Canvas>
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 10%, rgba(2,6,23,0.4) 60%, rgba(2,6,23,0.85) 100%)",
        }}
      />
    </div>
  );
}
