"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const LINKS = [
  { label: "Robotics data foundry · overview", href: "/data/physical-ai", desc: "Egocentric capture packs · 8-model auto-label · zero-trust QC" },
  { label: "Auto-Label pipeline", href: "/data/physical-ai/auto-label", desc: "Hand + body kpts · masks · depth · verb-noun · schema_v3" },
  { label: "QC playbook", href: "/data/physical-ai/quality", desc: "15 hard rules · Label Studio · 3-layer human review" },
];

const STATS = [
  { k: "8", v: "auto-label models" },
  { k: "15", v: "hard-rule QC gates" },
  { k: "≤48h", v: "raw → delivered" },
  { k: "92%", v: "ship-ready after QC" },
];

export function PhysicalAITeaser() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: "clamp(72px, 8vw, 120px) 0",
        background: "linear-gradient(180deg, #0b1220 0%, #050a12 100%)",
        color: "#e8ecf5",
      }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 20% 30%, rgba(76,181,255,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(0,229,199,0.10), transparent 60%)", pointerEvents: "none" }} />
      <div className="container relative z-10 mx-auto max-w-6xl px-5">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
          {/* Left · pitch */}
          <div>
            <div
              className="inline-flex items-center gap-2"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: "#4cb5ff",
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: 20, height: 1, background: "#4cb5ff" }} /> Physical AI
            </div>
            <h2
              className="mt-4 font-semibold"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(32px, 4.8vw, 56px)",
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
              }}
            >
              The data foundry for robot foundation models.
            </h2>
            <p className="mt-5 max-w-xl" style={{ fontSize: 17, lineHeight: 1.6, color: "#a9b5cf" }}>
              Egocentric capture packs, worn by operators on the factory floor — deeply annotated, QC&apos;d against 15 machine-checkable rules, and shipped in LeRobot v2 with a Rerun scene per episode.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.k}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, color: "#4cb5ff", lineHeight: 1 }}>{s.k}</div>
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10.5, letterSpacing: "0.06em", color: "#8fa0c8", marginTop: 4, textTransform: "uppercase" }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right · nav cards */}
          <div className="grid gap-3">
            {LINKS.map((l, i) => (
              <motion.div key={l.href}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={l.href}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 transition-colors hover:border-[#4cb5ff]/60 hover:bg-white/[0.04]"
                >
                  <div className="min-w-0">
                    <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "#e8ecf5" }}>{l.label}</div>
                    <div className="mt-1" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, color: "#8fa0c8", lineHeight: 1.5 }}>{l.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#4cb5ff" }} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
