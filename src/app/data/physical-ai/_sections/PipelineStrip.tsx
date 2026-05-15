"use client";

import { motion } from "framer-motion";
import { PersonStanding, Video, GitBranch, Cpu, Bot } from "lucide-react";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const STEPS = [
  {
    icon: PersonStanding,
    label: "Human demonstrates",
    body: "Real performers execute the target skill in our capture studio — locomotion, dexterous tasks, coordinated movement.",
    accent: "#10B981",
  },
  {
    icon: Video,
    label: "Multi-modal capture",
    body: "Optical mocap + IMU + force/torque + depth. Synchronous streams, studio-calibrated per program.",
    accent: "#34D399",
  },
  {
    icon: GitBranch,
    label: "Retarget to your robot",
    body: "Kinematic retargeting onto your embodiment (URDF/USD). Joint limits, contacts, and timing preserved.",
    accent: "#A78BFA",
  },
  {
    icon: Cpu,
    label: "Policy training",
    body: "SDK-ready exports for behavioral cloning, DAgger, inverse RL, or diffusion-policy pipelines.",
    accent: "#6C3CF4",
  },
  {
    icon: Bot,
    label: "Deploy to hardware",
    body: "Sim-validated trajectories ready for sim-to-real transfer onto your humanoid platform.",
    accent: "#F59E0B",
  },
];

export function PipelineStrip() {
  return (
    <section className="relative overflow-hidden py-24 md:py-28" style={{ background: "#020617", color: "white" }}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.18) 0%, transparent 55%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <RevealOnScroll>
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10B981" }}>
              The pipeline
            </span>
            <h2
              className="text-3xl md:text-5xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              From human demonstration to{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #10B981, #A78BFA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                humanoid policy
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base" style={{ color: "rgba(226,232,240,0.6)" }}>
              Five steps we own end-to-end. You get training-ready data — not raw files your team spends a quarter cleaning.
            </p>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4" stagger={0.1}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={STAGGER_ITEM}
              className="relative overflow-hidden rounded-2xl p-5 group"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Step connector arrow on md+ */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -right-2 z-10 hidden md:flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(2,6,23,0.9)",
                    border: `1px solid ${s.accent}55`,
                    color: s.accent,
                    fontSize: 10,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  →
                </span>
              )}

              <div
                aria-hidden
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.accent}00)` }}
              />

              <div className="flex items-center justify-between mb-3">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${s.accent}22`, color: s.accent, border: `1px solid ${s.accent}33` }}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <span
                  className="text-xs font-mono tabular-nums"
                  style={{ color: `${s.accent}99` }}
                >
                  0{i + 1}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color: "white" }}>
                {s.label}
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(226,232,240,0.65)" }}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
