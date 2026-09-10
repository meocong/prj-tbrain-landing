"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Crosshair, Layers, Camera, Shield } from "lucide-react";
import { TiltCard } from "@/components/marketing/fx/TiltCard";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const FEATURES = [
  {
    size: "md" as const,
    icon: Crosshair,
    accent: "#10B981",
    title: "Lab-grade precision",
    description:
      "Optical motion capture, infrared tracking, and depth sensors — not estimated from monocular video. Hardware and protocol tuned per program to the precision your pipeline actually needs.",
    image: "/images/mocap-studio.jpg",
  },
  {
    size: "md" as const,
    icon: Layers,
    accent: "#A78BFA",
    title: "Multi-modal coverage",
    description: "Egocentric video, MOCAP, hand pose, IMU, force/torque, depth maps, and task annotations — whatever your pipeline needs.",
    image: "/images/blog-humanoid.jpg",
  },
  {
    size: "md" as const,
    icon: Camera,
    accent: "#6C3CF4",
    title: "Scene-aware capture",
    description: "Every object tracked, environment scanned, and reconstructed in 3D. Context-rich data for world models and spatial reasoning.",
    image: "/images/robot-hand.jpg",
  },
  {
    size: "md" as const,
    icon: Shield,
    accent: "#F59E0B",
    title: "Scoped for production",
    description:
      "We design each capture program against the references your team already uses (EgoDex, OpenEgo, EPIC-KITCHENS) and deliver SDK-ready exports for your training loop.",
    image: "/images/blog-humanoid.jpg",
  },
];

export function BentoWhy() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32" style={{ background: "#020617", color: "white" }}>
      <div
        aria-hidden
        className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10B981" }}>
              Why Tbrain
            </span>
            <h2
              className="text-4xl md:text-6xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Built for{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #10B981, #A78BFA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                embodied AI pipelines
              </span>
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 auto-rows-[minmax(300px,auto)]">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={STAGGER_ITEM}
            >
              <TiltCard className="h-full" intensity={4}>
                <div
                  className="group relative block h-full overflow-hidden rounded-3xl"
                  style={{
                    background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    WebkitBackdropFilter: "blur(10px)", backdropFilter: "blur(10px)",
                  }}
                >
                  {/* Background image (dim) */}
                  <div className="absolute inset-0 opacity-25">
                    <Image src={f.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(165deg, rgba(2,6,23,0.6) 0%, rgba(2,6,23,0.95) 85%)",
                      }}
                    />
                  </div>

                  {/* Accent corner glow */}
                  <div
                    aria-hidden
                    className="absolute -top-16 -right-16 h-40 w-40 rounded-full pointer-events-none opacity-50"
                    style={{ background: `radial-gradient(circle, ${f.accent}44 0%, transparent 70%)`, filter: "blur(28px)" }}
                  />

                  <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                    <span
                      className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `${f.accent}22`, color: f.accent, border: `1px solid ${f.accent}33` }}
                    >
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-heading)", color: "white" }}>
                      {f.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: "rgba(226,232,240,0.72)" }}>
                      {f.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
