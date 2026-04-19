"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Cpu, Globe2 } from "lucide-react";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Lab-grade precision",
    body: "Optical capture, IMU, and multi-camera rigs — not video-estimated approximations.",
    accent: "#A78BFA",
  },
  {
    icon: Cpu,
    title: "AI-native QC",
    body: "Every sample runs through our confidence models before it reaches your training run.",
    accent: "#10B981",
  },
  {
    icon: Globe2,
    title: "Global expert network",
    body: "Domain experts across science, engineering, language, and annotation tasks.",
    accent: "#6C3CF4",
  },
  {
    icon: Sparkles,
    title: "Custom programs",
    body: "Scoped in days, first samples in weeks, SDK-ready exports.",
    accent: "#F59E0B",
  },
];

export function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#020617", color: "white" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,60,244,0.22) 0%, transparent 55%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#10B981" }}
            >
              Why Tbrain
            </span>
            <h2
              className="text-4xl md:text-6xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Quality your team{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #A78BFA, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                can&apos;t fake.
              </span>
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" stagger={0.1}>
          {PILLARS.map((p) => (
            <motion.div
              key={p.title}
              variants={STAGGER_ITEM}
              className="relative overflow-hidden rounded-2xl p-6"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                aria-hidden
                className="absolute -top-10 -right-10 h-32 w-32 rounded-full pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, ${p.accent}55 0%, transparent 70%)`, filter: "blur(20px)" }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}00)` }}
              />
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                style={{ background: `${p.accent}22`, color: p.accent, border: `1px solid ${p.accent}33` }}
              >
                <p.icon className="h-5 w-5" />
              </span>
              <p className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "white" }}>
                {p.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(226,232,240,0.65)" }}>
                {p.body}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
