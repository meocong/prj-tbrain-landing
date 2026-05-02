"use client";

import { motion } from "framer-motion";

const CAPABILITIES = [
  "Motion capture",
  "Humanoid control",
  "Sim-to-real",
  "Agent benchmarks",
  "Tool-use traces",
  "Video annotation",
  "Instance segmentation",
  "Semantic masks",
  "RLHF preference",
  "Red-team evals",
  "Active learning",
  "AI-native QC",
];

/** Infinite horizontal marquee of capability tags. Two layers scrolling opposite directions. */
export function CapabilitiesMarquee() {
  return (
    <section
      className="relative overflow-hidden py-12 md:py-16 border-y"
      style={{
        background: "var(--bg-page)",
        borderColor: "var(--marquee-border)",
        color: "var(--text-primary)",
      }}
    >
      <MarqueeRow reverse={false} speed={38} />
      <MarqueeRow reverse={true} speed={46} className="mt-4" />

      {/* Edge fades */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-32 pointer-events-none"
        style={{ background: "linear-gradient(90deg, var(--bg-page) 0%, transparent 100%)" }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-32 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, var(--bg-page) 0%, transparent 100%)" }}
      />
    </section>
  );
}

function MarqueeRow({ reverse, speed, className = "" }: { reverse: boolean; speed: number; className?: string }) {
  const list = [...CAPABILITIES, ...CAPABILITIES];
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="flex gap-3"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}
      >
        {list.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap"
            style={{
              background: "var(--marquee-chip-bg)",
              border: "1px solid var(--marquee-chip-border)",
              color: "var(--marquee-chip-text)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i % 3 === 0 ? "#A78BFA" : i % 3 === 1 ? "#10B981" : "#F59E0B" }} />
            {c}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
