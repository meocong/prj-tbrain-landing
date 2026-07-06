"use client";

/**
 * LabelSpeedPanel — two-column card.
 *   Left  · bar chart · traditional vs pre-populated annotator throughput.
 *   Right · ≤48h breakdown of a shipped capture.
 */
import { motion } from "framer-motion";
import { CountUp } from "@/components/marketing/fx/CountUp";

const BARS = [
  { k: "Traditional · from blank",    v: 12,  color: "#8fa0c8" },
  { k: "Auto-label pre-populated",    v: 68,  color: "#00e5c7" },
];

const BREAKDOWN = [
  { k: "Capture",     h: 8,  color: "#4cb5ff", detail: "Operator wears the rig · offline record + sync" },
  { k: "Auto-label",  h: 6,  color: "#00e5c7", detail: "8 models in parallel · hard rules gate" },
  { k: "HITL fix",    h: 8,  color: "#a78bfa", detail: "Label Studio · <10% frames touched" },
  { k: "QC + sign-off", h: 4, color: "#ff9a4d", detail: "Reviewer + escalation dashboard" },
  { k: "Buffer",      h: 22, color: "#5ee08a", detail: "Reshoot / escalation slack · rarely used" },
];
const TOTAL = BREAKDOWN.reduce((s, b) => s + b.h, 0);

export function LabelSpeedPanel() {
  const maxV = Math.max(...BARS.map((b) => b.v));
  return (
    <div className="bp-card" style={{ padding: 24, borderRadius: 14 }}>
      <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        FIG.06C · LABEL SPEED · WHY ≤48h HOLDS
      </div>
      <h3 className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(20px, 2.4vw, 28px)", lineHeight: 1.15, color: "var(--bp-ink)" }}>
        Pre-populated annotators are 5.7× faster than from-blank
      </h3>
      <p className="mt-3 max-w-2xl" style={{ fontSize: 14, color: "var(--bp-ink-dim)", lineHeight: 1.55 }}>
        Every capture arrives in Label Studio with 8-model outputs already drawn on the frame. Annotators correct — they don&apos;t create. That&apos;s how a 273-frame capture ships in ≤48h.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Left · bar chart */}
        <div>
          <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            · annotator throughput · kpts / minute
          </div>
          <div className="mt-4 space-y-4">
            {BARS.map((b, i) => (
              <div key={b.k}>
                <div className="flex items-baseline justify-between">
                  <span style={{ fontSize: 13, color: "var(--bp-ink)", fontWeight: 600 }}>{b.k}</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: b.color, fontWeight: 700 }}>
                    <CountUp value={b.v} duration={1.4} />
                  </span>
                </div>
                <div className="mt-1.5" style={{ height: 12, background: "var(--bp-surface-2)", borderRadius: 6, overflow: "hidden", border: "1px solid var(--bp-line)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(b.v / maxV) * 100}%` }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                    style={{ height: "100%", background: `linear-gradient(90deg, ${b.color}, color-mix(in srgb, ${b.color} 60%, transparent))`, boxShadow: `0 0 12px ${b.color}55` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="bp-mono mt-4" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", lineHeight: 1.55 }}>
            Sample of 42 textile captures · Q2 2026 · reviewer sign-off log.
          </div>
        </div>

        {/* Right · breakdown */}
        <div>
          <div className="bp-mono" style={{ fontSize: 10, color: "#a78bfa", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            · ≤48h delivery · shipped capture breakdown
          </div>
          <div className="mt-4 flex h-6 overflow-hidden" style={{ borderRadius: 6, border: "1px solid var(--bp-line)" }}>
            {BREAKDOWN.map((b, i) => (
              <motion.div
                key={b.k}
                initial={{ width: 0 }}
                whileInView={{ width: `${(b.h / TOTAL) * 100}%` }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: "easeOut" }}
                style={{ background: b.color, height: "100%", flexShrink: 0 }}
                title={`${b.k} · ${b.h}h`}
              />
            ))}
          </div>
          <div className="mt-3 grid gap-2">
            {BREAKDOWN.map((b) => (
              <div key={b.k} className="flex items-start gap-2">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, marginTop: 5, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: 12.5, color: "var(--bp-ink)", fontWeight: 600 }}>{b.k}</span>
                    <span className="bp-mono" style={{ fontSize: 10.5, color: b.color, fontWeight: 700 }}>{b.h}h</span>
                  </div>
                  <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", lineHeight: 1.4 }}>{b.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
