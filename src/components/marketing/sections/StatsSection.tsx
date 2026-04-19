"use client";

import { CountUp } from "@/components/marketing/fx/CountUp";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { motion } from "framer-motion";

const STATS = [
  { value: 48000, suffix: "+", label: "Expert annotators", sub: "across 17 countries", accent: "#A78BFA" },
  { value: 12,    suffix: "M+", label: "Motion capture frames", sub: "lab-grade precision", accent: "#10B981" },
  { value: 0.98,  suffix: "",   label: "QC confidence", sub: "AI-native verification", accent: "#6C3CF4", decimal: true },
  { value: 99.94, suffix: "%",  label: "Task completion", sub: "on agent benchmarks", accent: "#F59E0B", decimal: true },
];

export function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#020617", color: "white" }}
    >
      {/* gradient ambience */}
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
              The numbers
            </span>
            <h2
              className="text-4xl md:text-6xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Scale you can&apos;t fake.
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          stagger={0.12}
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={STAGGER_ITEM}
              className="relative overflow-hidden rounded-2xl p-6 md:p-8"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                aria-hidden
                className="absolute -top-10 -right-10 h-32 w-32 rounded-full pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, ${s.accent}55 0%, transparent 70%)`, filter: "blur(20px)" }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${s.accent}, ${s.accent}00)` }}
              />
              <p
                className="text-4xl md:text-6xl font-bold tracking-tight"
                style={{
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "-0.03em",
                  background: `linear-gradient(135deg, ${s.accent}, white)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                <CountUp
                  value={s.value}
                  suffix={s.suffix}
                  duration={2.2}
                  format={s.decimal ? (n) => (n / (s.value === 0.98 ? 100 : 1)).toFixed(2) : undefined}
                />
              </p>
              <p className="mt-3 text-sm font-semibold" style={{ color: "white" }}>
                {s.label}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "rgba(226,232,240,0.55)" }}>
                {s.sub}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
