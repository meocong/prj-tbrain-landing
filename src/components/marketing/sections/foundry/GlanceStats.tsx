"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/marketing/fx/CountUp";

// Theme-aware stat band: light panel + dark ink in light mode, dark panel +
// bright ink in dark. Accent colours use the theme-aware tokens (neon in dark,
// AA-dark on paper in light).
const STATS: { k: string; v: number; suffix?: string; sub: string; color: string }[] = [
  { k: "Models · auto-label pipeline",  v: 8,   sub: "Hand · body · masks · depth · verb-noun", color: "var(--bp-blue)" },
  { k: "Hard rules · per capture",       v: 15,  sub: "Machine-checkable QC gate",              color: "var(--bp-cyan)" },
  { k: "Ship rate · after QC",           v: 92,  suffix: "%", sub: "Auto-accept + Label Studio + reviewer", color: "var(--bp-green)" },
  { k: "Delivery latency",               v: 48,  suffix: "h", sub: "Raw → LeRobot v2 · zero-trust", color: "var(--bp-purple)" },
];

export function GlanceStats() {
  return (
    <section className="relative overflow-hidden" style={{ padding: "clamp(48px,6vw,80px) 0", background: "var(--bp-bg-2)", color: "var(--bp-ink)", borderTop: "1px solid var(--bp-line)", borderBottom: "1px solid var(--bp-line)" }}>
      <div className="container relative z-10 mx-auto grid grid-cols-2 gap-8 px-5 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.k}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative text-center lg:text-left"
          >
            {/* Solid accent bar (no neon glow). */}
            <div style={{ position: "absolute", left: 0, top: 4, width: 3, height: 44, background: s.color, borderRadius: 3 }} />
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(42px, 5.4vw, 68px)",
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-0.035em",
              color: s.color,
              paddingLeft: 14,
            }}>
              <CountUp value={s.v} duration={1.6} />{s.suffix ?? ""}
            </div>
            <div className="bp-mono mt-3" style={{ paddingLeft: 14, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--bp-ink-faint)" }}>{s.k}</div>
            <div className="mt-1.5" style={{ paddingLeft: 14, fontSize: 13, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
