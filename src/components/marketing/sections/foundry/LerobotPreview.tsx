"use client";

import { LEROBOT_EXPORT } from "@/lib/landing/physical-ai";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { motion, useReducedMotion } from "framer-motion";

const HERO_STATS: { k: string; v: number; sub?: string }[] = [
  { k: "Episodes",  v: LEROBOT_EXPORT.meta.total_episodes,  sub: "chunk-000" },
  { k: "Frames",    v: LEROBOT_EXPORT.meta.total_frames,    sub: "annotated" },
  { k: "Tasks",     v: LEROBOT_EXPORT.meta.total_tasks,     sub: "verb-noun" },
  { k: "Videos",    v: LEROBOT_EXPORT.meta.total_videos,    sub: "RGB + depth" },
];

export function LerobotPreview() {
  const reduce = useReducedMotion();
  return (
    <Sheet id="lerobot-export" fig={LEROBOT_EXPORT.fig} axis={false}>
      <SheetHeading title={LEROBOT_EXPORT.title} lead={LEROBOT_EXPORT.lead} />

      {/* Hero row · 4 giant stats */}
      <div className="mt-8 bp-card" style={{ padding: 0, borderRadius: 14, overflow: "hidden" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {HERO_STATS.map((s, i) => (
            <div
              key={s.k}
              style={{
                padding: "22px 20px",
                borderTop: i >= 2 ? "1px solid var(--bp-line)" : "none",
                borderLeft: i % 2 === 1 ? "1px solid var(--bp-line)" : "none",
                // desktop 4-col: only borders between (i % 4 !== 0)
              }}
              className="lg:!border-t-0"
            >
              <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.k}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(38px, 5.6vw, 60px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--bp-cyan)", lineHeight: 1, marginTop: 6 }}>
                <CountUp value={s.v} duration={1.6} />
              </div>
              {s.sub && (
                <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", marginTop: 8, letterSpacing: "0.04em" }}>{s.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* Growth ribbon */}
        <motion.div
          animate={reduce ? {} : { opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="bp-mono flex items-center gap-2 flex-wrap"
          style={{
            padding: "10px 18px",
            fontSize: 11,
            color: "var(--bp-ink-dim)",
            borderTop: "1px solid var(--bp-line)",
            background: "linear-gradient(90deg, rgba(76,181,255,0.08), rgba(0,229,199,0.06) 40%, transparent)",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 6, background: "#4cb5ff", boxShadow: "0 0 8px #4cb5ff" }} />
          <span style={{ color: "#4cb5ff", letterSpacing: "0.06em", fontWeight: 700 }}>+8 auto-labeled</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>textile · iron + sew + sort + package</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>6 solid · 2 intermittent</span>
          <span style={{ marginLeft: "auto", color: "var(--bp-ink-faint)", letterSpacing: "0.04em" }}>
            {LEROBOT_EXPORT.meta.resolution} · {LEROBOT_EXPORT.meta.fps} fps
          </span>
        </motion.div>
      </div>

      {/* Code panel + streams · lower priority */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div
          className="bp-card"
          style={{ padding: 0, borderRadius: 12, overflow: "hidden", background: "#0b1220" }}
        >
          <div
            className="flex items-center justify-between bp-mono"
            style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}
          >
            <span>meta/info.json · chunk-000</span>
            <span style={{ color: "var(--bp-cyan)" }}>LeRobot v2.0</span>
          </div>
          <pre
            className="bp-mono"
            style={{
              margin: 0,
              padding: "16px 18px",
              fontSize: 11.5,
              lineHeight: 1.65,
              color: "#c8d3f0",
              whiteSpace: "pre-wrap",
              overflowX: "auto",
            }}
          >
            {LEROBOT_EXPORT.snippet}
          </pre>
        </div>

        <div className="bp-card" style={{ padding: "14px 18px", borderRadius: 10 }}>
          <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Streams</div>
          <ul className="mt-2 bp-mono" style={{ fontSize: 12, color: "var(--bp-ink-dim)", lineHeight: 1.75 }}>
            {LEROBOT_EXPORT.meta.streams.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
