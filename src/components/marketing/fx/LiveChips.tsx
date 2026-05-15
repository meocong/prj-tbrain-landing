"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Radio, Cpu, Video, Activity } from "lucide-react";

const CHIPS = [
  {
    icon: Radio,
    label: "Motion capture",
    value: "47,213 frames/hr",
    accent: "#10B981",
    top: "14%",
    left: "6%",
    delay: 0.8,
  },
  {
    icon: Cpu,
    label: "Terminal-bench",
    value: "agent.task #1284 ✓",
    accent: "#A78BFA",
    top: "20%",
    right: "4%",
    delay: 1.0,
  },
  {
    icon: Video,
    label: "Annotation queue",
    value: "2,091 clips in review",
    accent: "#6C3CF4",
    bottom: "30%",
    left: "4%",
    delay: 1.2,
  },
  {
    icon: Activity,
    label: "QC confidence",
    value: "0.982 · lab-grade",
    accent: "#34D399",
    bottom: "18%",
    right: "7%",
    delay: 1.4,
  },
] as const;

export function LiveChips() {
  const shouldReduce = useReducedMotion();
  return (
    <>
      {CHIPS.map((c) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={shouldReduce ? {} : { opacity: 0, y: 24, scale: 0.9 }}
            animate={shouldReduce ? {} : { opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: c.delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute hidden md:block"
            style={{
              top: "top" in c ? c.top : undefined,
              bottom: "bottom" in c ? c.bottom : undefined,
              left: "left" in c ? c.left : undefined,
              right: "right" in c ? c.right : undefined,
              zIndex: 5,
            }}
          >
            <motion.div
              animate={shouldReduce ? {} : { y: [0, -8, 0] }}
              transition={shouldReduce ? {} : { duration: 4 + Math.random() * 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 backdrop-blur-md"
              style={{
                background: "rgba(15, 23, 42, 0.55)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 18px 40px -12px rgba(0,0,0,0.55)",
              }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                style={{ background: `${c.accent}22`, color: c.accent }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider opacity-60" style={{ color: "#E2E8F0" }}>
                  {c.label}
                </p>
                <p className="text-xs font-medium" style={{ color: "white", fontFamily: "ui-monospace, monospace" }}>
                  {c.value}
                </p>
              </div>
              <span
                className="ml-1 h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: c.accent, boxShadow: `0 0 8px ${c.accent}` }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}
