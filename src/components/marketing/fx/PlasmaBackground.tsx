"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Animated plasma mesh-gradient shader — a soft purple/green flowing
 * background inspired by motionsites.ai and higgsfield hero scenes.
 * Runs on the GPU so it's cheap at 60fps.
 */
const PlasmaMaterial = shaderMaterial(
  { uTime: 0, uResolution: new THREE.Vector2(1, 1), uMouse: new THREE.Vector2(0.5, 0.5) },
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
    uniform vec2 uMouse;
    varying vec2 vUv;

    // Signed distance noise (simplified)
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
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 st = vUv;
      vec2 mouse = uMouse - vec2(0.5);

      // Warp the UVs with flowing noise
      float t = uTime * 0.08;
      vec2 q = vec2(fbm(st + t), fbm(st + vec2(5.2, 1.3) + t));
      vec2 r = vec2(fbm(st + q + vec2(1.7, 9.2) + 0.15 * t), fbm(st + q + vec2(8.3, 2.8) + 0.126 * t));
      float f = fbm(st + r + mouse * 0.2);

      // Tbrain palette: purple #6C3CF4, green #10B981, deep blue #020617
      vec3 purple = vec3(0.424, 0.235, 0.957);
      vec3 green  = vec3(0.063, 0.725, 0.506);
      vec3 midnight = vec3(0.008, 0.024, 0.090);
      vec3 accent = vec3(0.651, 0.545, 0.980);

      vec3 color = mix(midnight, purple, smoothstep(0.0, 0.8, f));
      color = mix(color, green,  smoothstep(0.45, 0.95, length(r)));
      color = mix(color, accent, smoothstep(0.6, 1.0, f * f));

      // Radial vignette
      float vignette = 1.0 - smoothstep(0.35, 1.1, length(vUv - 0.5));
      color *= vignette * 1.15;

      // Film grain
      float grain = (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.035;
      color += grain;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ PlasmaMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    plasmaMaterial: {
      ref?: React.Ref<THREE.ShaderMaterial & { uTime: number; uMouse: THREE.Vector2 }>;
      attach?: string;
    };
  }
}

function PlasmaPlane() {
  const ref = useRef<THREE.ShaderMaterial & { uTime: number; uMouse: THREE.Vector2 } | null>(null);
  const mouse = useMemo(() => new THREE.Vector2(0.5, 0.5), []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.uTime = state.clock.getElapsedTime();
    // Smoothly follow pointer
    mouse.x += ((state.pointer.x + 1) / 2 - mouse.x) * 0.05;
    mouse.y += ((state.pointer.y + 1) / 2 - mouse.y) * 0.05;
    ref.current.uMouse.copy(mouse);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <plasmaMaterial ref={ref} attach="material" />
    </mesh>
  );
}

export function PlasmaBackground({ className }: { className?: string }) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
        style={{ position: "absolute", inset: 0 }}
      >
        <PlasmaPlane />
      </Canvas>
      {/* Darkening overlay for text contrast */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 10%, rgba(2,6,23,0.4) 60%, rgba(2,6,23,0.85) 100%)" }} />
    </div>
  );
}
