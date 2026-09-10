"use client";

import { motion } from "framer-motion";
import { Target, Sparkles } from "lucide-react";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const TIERS = [
  {
    name: "General",
    accuracy: "Training-ready",
    description: "Locomotion, navigation, general manipulation, imitation learning from diverse scenes.",
    icon: Target,
    accent: "#A78BFA",
    recommended: false,
  },
  {
    name: "Studio-grade",
    accuracy: "Per program",
    description: "Fine manipulation and dexterous tasks — hardware + protocol scoped to the precision your policy actually needs.",
    icon: Sparkles,
    accent: "#10B981",
    recommended: true,
  },
];

export function AccuracyTiers() {
  return (
    <section className="relative overflow-hidden py-24" style={{ background: "var(--bp-bg)", color: "var(--bp-ink)" }}>
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#10B981" }}>
              Accuracy tiers
            </span>
            <h2
              className="text-3xl md:text-5xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Dialed to your task
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid gap-5 md:grid-cols-2">
          {TIERS.map((t) => (
            <motion.div
              key={t.name}
              variants={STAGGER_ITEM}
              className="relative rounded-3xl p-7 md:p-8 overflow-hidden"
              style={{
                background: t.recommended
                  ? "linear-gradient(165deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)"
                  : "var(--bp-surface)",
                border: t.recommended ? "1px solid rgba(16,185,129,0.35)" : "1px solid var(--bp-line)",
              }}
            >
              {t.recommended && (
                <span
                  className="absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: "rgba(16,185,129,0.18)", color: "#10B981", border: "1px solid rgba(16,185,129,0.35)" }}
                >
                  Recommended
                </span>
              )}
              <div
                aria-hidden
                className="absolute -top-16 -right-16 h-40 w-40 rounded-full pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, ${t.accent}55 0%, transparent 70%)`, filter: "blur(26px)" }}
              />

              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}33` }}
              >
                <t.icon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs uppercase tracking-widest" style={{ color: "var(--bp-ink-dim)" }}>
                {t.name}
              </p>
              <p
                className="mt-1 text-4xl md:text-5xl font-bold tracking-tight"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: `linear-gradient(135deg, ${t.accent}, var(--bp-ink))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.accuracy}
              </p>
              <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: "var(--bp-ink-dim)" }}>
                {t.description}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
