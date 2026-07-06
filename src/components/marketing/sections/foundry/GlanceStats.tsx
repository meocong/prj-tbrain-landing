"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { MeshBackdrop } from "@/components/marketing/fx/MeshBackdrop";

const STATS: { k: string; v: number; suffix?: string; sub: string; color: string }[] = [
  { k: "Models · auto-label pipeline",  v: 8,   sub: "Hand · body · masks · depth · verb-noun", color: "#4cb5ff" },
  { k: "Hard rules · per capture",       v: 15,  sub: "Machine-checkable QC gate", color: "#00e5c7" },
  { k: "Ship rate · after QC",           v: 92,  suffix: "%", sub: "Auto-accept + Label Studio + reviewer", color: "#5ee08a" },
  { k: "Delivery latency",               v: 48,  suffix: "h", sub: "Raw → LeRobot v2 · zero-trust", color: "#a78bfa" },
];

export function GlanceStats() {
  return (
    <section className="relative overflow-hidden" style={{ padding: "clamp(48px,6vw,80px) 0", color: "#e8ecf5" }}>
      <MeshBackdrop variant="cyan" gridOpacity={0.03} />
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
            <div style={{ position: "absolute", left: 0, top: 4, width: 3, height: 44, background: s.color, borderRadius: 3, boxShadow: `0 0 12px ${s.color}` }} />
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(38px, 5.2vw, 64px)",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              background: `linear-gradient(135deg, ${s.color} 0%, #ffffff 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              paddingLeft: 14,
            }}>
              <CountUp value={s.v} duration={1.6} />{s.suffix ?? ""}
            </div>
            <div className="bp-mono mt-3" style={{ paddingLeft: 14, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8fa0c8" }}>{s.k}</div>
            <div className="mt-1.5" style={{ paddingLeft: 14, fontSize: 13, color: "#a9b5cf", lineHeight: 1.5 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
