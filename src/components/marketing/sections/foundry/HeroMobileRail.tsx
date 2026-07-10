"use client";

/**
 * HeroMobileRail — bottom-anchored horizontal foundry status strip visible on
 * mobile/tablet where HeroSideRail is hidden. Same 5 phases, cycles same beat.
 */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PHASES = [
  { k: "collect",    label: "COLLECT",    color: "#4cb5ff" },
  { k: "sync",       label: "SYNC",       color: "#4cb5ff" },
  { k: "auto-label", label: "AUTO-LABEL", color: "#00e5c7" },
  { k: "qc",         label: "QC",         color: "#ff9a4d" },
  { k: "deliver",    label: "DELIVER",    color: "#5ee08a" },
];

export function HeroMobileRail() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setActive((i) => (i + 1) % PHASES.length), 2400);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <div
      className="pointer-events-none absolute inset-x-4 bottom-24 z-20 flex xl:hidden"
      aria-hidden
    >
      <div
        className="flex w-full items-center gap-1 overflow-hidden rounded-full"
        style={{
          padding: "6px 10px",
          background: "rgba(11,18,32,0.65)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {PHASES.map((p, i) => {
          const on = i === active;
          return (
            <motion.div
              key={p.k}
              animate={{ background: on ? `${p.color}4D` : "rgba(11,18,32,0)", flex: on ? 2 : 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center overflow-hidden rounded-full"
              style={{
                padding: "5px 6px",
                borderRight: i < PHASES.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                minWidth: 0,
                whiteSpace: "nowrap",
              }}
            >
              <motion.span
                className="bp-mono"
                animate={{ color: on ? "#fff" : "rgba(255,255,255,0.55)" }}
                style={{ fontSize: 10, letterSpacing: "0.1em", fontWeight: 700 }}
              >
                {on ? p.label : String(i + 1).padStart(2, "0")}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
