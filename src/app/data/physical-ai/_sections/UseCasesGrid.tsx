"use client";

import { motion } from "framer-motion";
import { Bot, Hand, Home as HomeIcon, Factory, Video, Gauge } from "lucide-react";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const USE_CASES = [
  { title: "Humanoid whole-body control", description: "Full-body motion for locomotion, balance, and coordination policies.", icon: Bot, accent: "#A78BFA" },
  { title: "Dexterous manipulation", description: "High-precision hand and finger tracking for grasping, tool use, and fine motor tasks.", icon: Hand, accent: "#10B981" },
  { title: "Household & domestic robotics", description: "Kitchen, cleaning, tidying, and everyday tasks — real homes, real complexity.", icon: HomeIcon, accent: "#6C3CF4" },
  { title: "Commercial & industrial", description: "Warehouse operations, retail, food service, manufacturing assembly, and logistics.", icon: Factory, accent: "#F59E0B" },
  { title: "Imitation learning pipelines", description: "Demonstration data formatted for behavioral cloning, DAgger, and inverse RL workflows.", icon: Video, accent: "#34D399" },
  { title: "Sim-to-real transfer", description: "Ground-truth trajectories for validating simulation fidelity and bridging the gap.", icon: Gauge, accent: "#8B5CF6" },
];

export function UseCasesGrid() {
  return (
    <section className="relative overflow-hidden py-24" style={{ background: "#020617", color: "white" }}>
      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#A78BFA" }}>
              Use cases
            </span>
            <h2
              className="text-3xl md:text-5xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              From research lab to factory floor
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <motion.div
              key={u.title}
              variants={STAGGER_ITEM}
              className="relative overflow-hidden rounded-2xl p-5 group transition-transform"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                aria-hidden
                className="absolute -top-8 -right-8 h-24 w-24 rounded-full pointer-events-none opacity-30 transition-opacity group-hover:opacity-60"
                style={{ background: `radial-gradient(circle, ${u.accent}55 0%, transparent 70%)`, filter: "blur(18px)" }}
              />
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${u.accent}22`, color: u.accent, border: `1px solid ${u.accent}33` }}
              >
                <u.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "white" }}>
                {u.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(226,232,240,0.65)" }}>
                {u.description}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
