"use client";

/**
 * HeroSideRail — vertical pipeline stage indicator + live tick counter, sits
 * on the right side of the CinemaHero. Progressively fills a phase every ~2.4s
 * to simulate the foundry running.
 */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PHASES = [
  { k: "collect",    label: "COLLECT",    detail: "50–500 packs",       color: "var(--bp-blue)" },
  { k: "sync",       label: "SYNC",       detail: "hardware clock",     color: "var(--bp-blue)" },
  { k: "auto-label", label: "AUTO-LABEL", detail: "8 models · ≤48h",    color: "var(--bp-cyan)" },
  { k: "qc",         label: "QC",         detail: "15 rules · 92% ship",color: "var(--bp-amber)" },
  { k: "deliver",    label: "DELIVER",    detail: "LeRobot v2 · .rrd",  color: "var(--bp-green)" },
];

export function HeroSideRail() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setActive((i) => (i + 1) % PHASES.length), 2400);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div
      className="pointer-events-none absolute right-4 top-24 z-20 hidden xl:flex flex-col gap-2"
      style={{ width: 210 }}
      aria-hidden
    >
      <div
        className="bp-mono flex items-center justify-between"
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: "color-mix(in srgb, var(--bp-panel) 55%, transparent)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid var(--bp-line)",
          fontSize: 10,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <span>Foundry status</span>
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: 6, background: "var(--bp-cyan)", boxShadow: "0 0 6px var(--bp-cyan)" }}
        />
      </div>

      {PHASES.map((p, i) => {
        const on = i === active;
        return (
          <motion.div
            key={p.k}
            animate={{ borderColor: on ? p.color : "var(--bp-line)", background: on ? `color-mix(in srgb, ${p.color} 14%, color-mix(in srgb, var(--bp-panel) 55%, transparent))` : "color-mix(in srgb, var(--bp-panel) 55%, transparent)" }}
            transition={{ duration: 0.4 }}
            className="bp-mono"
            style={{
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 5,
              background: on ? p.color : "rgba(255,255,255,0.06)",
              boxShadow: on ? `0 0 10px ${p.color}` : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: on ? "#0b1220" : "rgba(255,255,255,0.55)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", color: on ? "#fff" : "rgba(255,255,255,0.75)", fontWeight: 700 }}>{p.label}</div>
              <div style={{ fontSize: 9.5, color: on ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: "0.04em" }}>{p.detail}</div>
            </div>
            {on && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ width: 6, height: 6, borderRadius: 6, background: p.color, boxShadow: `0 0 6px ${p.color}` }}
              />
            )}
          </motion.div>
        );
      })}

      <div
        className="bp-mono"
        style={{
          marginTop: 6,
          padding: "8px 12px",
          borderRadius: 8,
          background: "color-mix(in srgb, var(--bp-panel) 55%, transparent)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid var(--bp-line)",
          fontSize: 10,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.04em",
          lineHeight: 1.5,
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>next delivery</div>
        <div style={{ color: "var(--bp-cyan)" }}>ETA 34h 12m · 6 episodes</div>
      </div>
    </div>
  );
}
