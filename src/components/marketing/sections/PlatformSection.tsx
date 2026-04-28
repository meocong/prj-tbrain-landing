"use client";

import { motion } from "framer-motion";
import { PLATFORM_FEATURES } from "@/lib/constants/marketing";
import { ShieldCheck, BarChart3, Lock, Workflow } from "lucide-react";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  BarChart3,
  Lock,
  Workflow,
};

export function PlatformSection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(108,60,244,0.08) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#6C3CF4" }}
            >
              The platform
            </span>
            <h2
              className="text-4xl md:text-6xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Built on our{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #A78BFA, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI-native platform
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg" style={{ color: "var(--text-secondary)" }}>
              Custom infrastructure that scales quality. Not a spreadsheet — a production system with automated QC, real-time visibility, and agentic workflows.
            </p>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          {PLATFORM_FEATURES.map((feature, i) => {
            const Icon = (ICON_MAP[feature.icon] || ShieldCheck) as React.ComponentType<{ className?: string }>;
            return (
              <motion.div
                key={i}
                variants={STAGGER_ITEM}
                className="relative overflow-hidden rounded-2xl p-6 flex gap-4"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.06)",
                  boxShadow: "0 4px 18px -6px rgba(15,23,42,0.08)",
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(108,60,244,0.10)", border: "1px solid rgba(108,60,244,0.18)", color: "#6C3CF4" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
