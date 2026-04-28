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
    kicker: "01",
  },
  {
    icon: Cpu,
    title: "AI-native QC",
    body: "Every sample runs through our confidence models before it reaches your training run.",
    accent: "#10B981",
    kicker: "02",
  },
  {
    icon: Globe2,
    title: "Global expert network",
    body: "Domain experts across science, engineering, language, and annotation tasks.",
    accent: "#6C3CF4",
    kicker: "03",
  },
  {
    icon: Sparkles,
    title: "Custom programs",
    body: "Scoped in days, first samples in weeks, SDK-ready exports.",
    accent: "#F59E0B",
    kicker: "04",
  },
];

export function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-28 md:py-36"
      style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,60,244,0.10) 0%, transparent 55%)," +
            "radial-gradient(ellipse 60% 50% at 90% 100%, rgba(16,185,129,0.07) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4"
              style={{ color: "#10B981" }}
            >
              Why Tbrain
            </span>
            <h2
              className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Quality your team{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #A78BFA 0%, #6C3CF4 40%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                can&apos;t fake.
              </span>
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid gap-5 md:grid-cols-2" stagger={0.12}>
          {PILLARS.map((p) => (
            <motion.div
              key={p.title}
              variants={STAGGER_ITEM}
              className="group relative overflow-hidden rounded-3xl p-8 md:p-10 transition-transform duration-500 hover:-translate-y-1"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)",
                border: "1px solid rgba(15,23,42,0.06)",
                boxShadow: "0 6px 24px -8px rgba(15,23,42,0.08)",
                backdropFilter: "blur(12px)",
                minHeight: "220px",
              }}
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}00 70%)` }}
              />

              <span
                aria-hidden
                className="absolute -top-16 -right-16 h-48 w-48 rounded-full pointer-events-none opacity-40 transition-opacity duration-500 group-hover:opacity-80"
                style={{
                  background: `radial-gradient(circle, ${p.accent}55 0%, transparent 70%)`,
                  filter: "blur(28px)",
                }}
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                    style={{
                      background: `${p.accent}22`,
                      color: p.accent,
                      border: `1px solid ${p.accent}44`,
                      boxShadow: `0 12px 36px -12px ${p.accent}55`,
                    }}
                  >
                    <p.icon className="h-7 w-7" />
                  </span>
                  <span
                    className="text-4xl md:text-5xl font-bold tabular-nums"
                    style={{ fontFamily: "var(--font-heading)", color: `${p.accent}33` }}
                  >
                    {p.kicker}
                  </span>
                </div>

                <h3
                  className="mt-7 text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  {p.title}
                </h3>
                <p
                  className="mt-3 text-base leading-relaxed max-w-md"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
