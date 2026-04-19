"use client";

import { motion } from "framer-motion";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const REFS = [
  { name: "EgoDex", volume: "829 hours", quality: "21-joint hand (sub-mm)", useCase: "Dexterous manipulation" },
  { name: "OpenEgo", volume: "1,107 hours", quality: "21-joint unified", useCase: "Diverse egocentric tasks" },
  { name: "EPIC-KITCHENS", volume: "100 hours", quality: "Action labels", useCase: "Household activities" },
  { name: "UMI Community", volume: "1,400 hours", quality: "SLAM 6DoF", useCase: "Gripper manipulation" },
];

export function RefDatasets() {
  return (
    <section className="relative overflow-hidden py-24" style={{ background: "#020617", color: "white" }}>
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#A78BFA" }}>
              Reference datasets
            </span>
            <h2
              className="text-3xl md:text-5xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Benchmarked against the field
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm md:text-base" style={{ color: "rgba(226,232,240,0.6)" }}>
              Our capture quality is validated against the datasets the embodied-AI community already trusts.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="grid grid-cols-[1.2fr_1fr_1.6fr_1.6fr] gap-4 px-5 py-3 text-[11px] uppercase tracking-widest font-semibold"
              style={{ color: "rgba(226,232,240,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
            >
              <span>Dataset</span>
              <span>Volume</span>
              <span>Quality</span>
              <span>Use case</span>
            </div>
            <StaggerContainer stagger={0.08}>
              {REFS.map((r) => (
                <motion.div
                  key={r.name}
                  variants={STAGGER_ITEM}
                  className="grid grid-cols-[1.2fr_1fr_1.6fr_1.6fr] gap-4 px-5 py-4 text-sm transition-colors hover:bg-white/[0.02]"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.78)" }}
                >
                  <span className="font-semibold" style={{ color: "white" }}>{r.name}</span>
                  <span className="font-mono text-xs" style={{ color: "var(--color-brand-500, #A78BFA)" }}>
                    {r.volume}
                  </span>
                  <span>{r.quality}</span>
                  <span style={{ color: "rgba(226,232,240,0.6)" }}>{r.useCase}</span>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
