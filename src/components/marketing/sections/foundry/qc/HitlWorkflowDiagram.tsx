"use client";

/**
 * HitlWorkflowDiagram — 4-stage horizontal animated diagram of the
 * human-in-the-loop flow: Human box → AI Predict → Human finetune → Ship.
 * Each stage carries a live-look counter. Particle-flow arrows link stages.
 */
import { Fragment } from "react";
import { motion } from "framer-motion";
import { Crop, Zap, Hand, PackageCheck } from "lucide-react";
import { CountUp } from "@/components/marketing/fx/CountUp";

const STAGES = [
  {
    key: "framing",
    icon: Crop,
    label: "Human framing box",
    detail: "Reviewer draws initial bounding box + verb-noun on 1 keyframe per capture.",
    counter: { value: 1247, sub: "in queue" },
    color: "#4cb5ff",
  },
  {
    key: "predict",
    icon: Zap,
    label: "AI predicts",
    detail: "Auto-label pipeline pre-fills 21-kpt hand + 308-kpt body + object mask across all 273 frames.",
    counter: { value: 68, suffix: " kpts/min", sub: "vs 12 blank" },
    color: "#00e5c7",
  },
  {
    key: "finetune",
    icon: Hand,
    label: "Human finetune",
    detail: "Annotator corrects drift, adjusts masks, overrides verb-noun. Every diff writes to the manifest.",
    counter: { value: 2.3, suffix: " min", sub: "avg per task" },
    color: "#a78bfa",
  },
  {
    key: "ship",
    icon: PackageCheck,
    label: "Ship",
    detail: "Reviewer signs off. Hard rules re-run. LeRobot v2 parquet + Rerun scene shipped.",
    counter: { value: 94, suffix: "%", sub: "first-pass · 6% escalation" },
    color: "#5ee08a",
  },
];

function ParticleArrow({ color }: { color: string }) {
  return (
    <div className="relative hidden lg:flex items-center justify-center" style={{ width: 56, height: 4 }}>
      <div style={{ position: "absolute", inset: 0, top: "50%", height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 2 }} />
      {[0, 0.3, 0.6].map((delay) => (
        <motion.div
          key={delay}
          initial={{ x: -6, opacity: 0 }}
          animate={{ x: 56, opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay, ease: "linear" }}
          style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: 6, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      ))}
    </div>
  );
}

export function HitlWorkflowDiagram() {
  return (
    <div className="bp-card" style={{ padding: 24, borderRadius: 14 }}>
      <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        FIG.06B · HUMAN-IN-THE-LOOP WORKFLOW
      </div>
      <h3 className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(20px, 2.4vw, 28px)", lineHeight: 1.15, color: "var(--bp-ink)" }}>
        Human box → AI predict → Human finetune → Ship
      </h3>
      <p className="mt-3 max-w-2xl" style={{ fontSize: 14, color: "var(--bp-ink-dim)", lineHeight: 1.55 }}>
        Humans anchor the task and finetune the edges. The pipeline propagates predictions across every frame in between. Under 10% of frames touch a human directly.
      </p>

      <div className="mt-8 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          return (
            <Fragment key={s.key}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex-1 bp-card"
                style={{ padding: 16, borderRadius: 12, borderTop: `2px solid ${s.color}`, minWidth: 0 }}
              >
                <div className="flex items-center gap-2.5">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `color-mix(in srgb, ${s.color} 18%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon className="h-4 w-4" style={{ color: s.color }} />
                  </div>
                  <div className="bp-mono" style={{ fontSize: 9.5, color: s.color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                    Stage 0{i + 1}
                  </div>
                </div>
                <div className="mt-3 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: "var(--bp-ink)", lineHeight: 1.2 }}>
                  {s.label}
                </div>
                <p className="mt-2" style={{ fontSize: 12, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{s.detail}</p>
                <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--bp-line)" }}>
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                      <CountUp value={s.counter.value} duration={1.4} />
                    </span>
                    {s.counter.suffix && (
                      <span className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>{s.counter.suffix}</span>
                    )}
                  </div>
                  <div className="bp-mono mt-1" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)", letterSpacing: "0.06em" }}>{s.counter.sub}</div>
                </div>
              </motion.div>
              {i < STAGES.length - 1 && <ParticleArrow color={s.color} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
