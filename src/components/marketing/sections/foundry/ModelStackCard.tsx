"use client";

import { MODEL_STACK, type ModelSpec, type ModelTier } from "@/lib/landing/physical-ai";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { motion } from "framer-motion";

const VRAM_CEIL = 24;

const TIER_TONES: Record<ModelTier, { fg: string; bg: string; label: string }> = {
  FRONTIER:   { fg: "var(--bp-cyan)",   bg: "rgba(0,229,199,0.16)",   label: "FRONTIER" },
  RESEARCH:   { fg: "var(--bp-purple)", bg: "rgba(150,100,255,0.16)", label: "RESEARCH" },
  FOUNDATION: { fg: "#4cb5ff",          bg: "rgba(76,181,255,0.16)",  label: "FOUNDATION" },
  LIGHT:      { fg: "var(--bp-ink-dim)", bg: "rgba(255,255,255,0.06)", label: "LIGHTWEIGHT" },
};

export function ModelStackCard() {
  return (
    <Sheet id="model-stack" fig={MODEL_STACK.fig} axis={false}>
      <SheetHeading title={MODEL_STACK.title} lead={MODEL_STACK.lead} />

      <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODEL_STACK.models.map((m) => (
          <ModelCard key={m.name} m={m} />
        ))}
      </StaggerContainer>

      <p className="mt-6 bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>
        {MODEL_STACK.peakVram}
      </p>
    </Sheet>
  );
}

function ModelCard({ m }: { m: ModelSpec }) {
  const pct = Math.min(100, Math.round((m.vram / VRAM_CEIL) * 100));
  const tier = TIER_TONES[m.tier];
  return (
    <motion.div
      variants={STAGGER_ITEM}
      className="bp-card"
      style={{ padding: 18, borderRadius: 14, display: "flex", flexDirection: "column", gap: 14 }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--bp-ink)", lineHeight: 1.15 }}>
            {m.name}
          </div>
          <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", marginTop: 4, letterSpacing: "0.03em" }}>
            {m.role}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5" style={{ flexShrink: 0 }}>
          <span
            className="bp-mono"
            style={{ fontSize: 9, padding: "3px 7px", borderRadius: 4, background: tier.bg, color: tier.fg, letterSpacing: "0.08em", fontWeight: 700 }}
          >
            {tier.label}
          </span>
          {m.determ && (
            <span
              className="bp-mono"
              style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 4, background: "rgba(0,229,199,0.10)", color: "var(--bp-cyan)", letterSpacing: "0.06em" }}
            >
              DETERM
            </span>
          )}
        </div>
      </div>

      {/* Task line */}
      <div style={{ fontSize: 13.5, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{m.task}</div>

      {/* IN → OUT strip */}
      <div
        className="bp-mono"
        style={{
          fontSize: 10.5,
          lineHeight: 1.55,
          padding: "10px 12px",
          borderRadius: 8,
          background: "var(--bp-surface)",
          border: "1px solid var(--bp-line)",
          color: "var(--bp-ink-dim)",
        }}
      >
        <div className="flex items-baseline gap-2">
          <span style={{ color: "var(--bp-cyan)", fontWeight: 700, letterSpacing: "0.06em" }}>IN</span>
          <span>{m.inputs}</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span style={{ color: "var(--bp-amber)", fontWeight: 700, letterSpacing: "0.06em" }}>OUT</span>
          <span>{m.outputs}</span>
        </div>
      </div>

      {/* VRAM bar */}
      <div>
        <div className="flex items-center justify-between bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)", marginBottom: 4, letterSpacing: "0.04em" }}>
          <span>VRAM</span>
          <span style={{ color: "var(--bp-ink-dim)" }}>{m.vram} GB / {VRAM_CEIL}</span>
        </div>
        <div style={{ height: 5, background: "var(--bp-line)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "100%", background: pct > 80 ? "var(--bp-amber)" : "var(--bp-cyan)" }}
          />
        </div>
      </div>

      {/* Latency + Runtime · single row */}
      <div className="flex items-center gap-3 bp-mono flex-wrap" style={{ fontSize: 10.5, color: "var(--bp-ink-dim)" }}>
        <span style={{ letterSpacing: "0.04em", color: "var(--bp-ink-faint)" }}>LAT</span>
        <span>{m.latency}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ letterSpacing: "0.04em", color: "var(--bp-ink-faint)" }}>RUN</span>
        <span>{m.runtime}</span>
      </div>

      {/* Notes */}
      {m.notes && (
        <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", lineHeight: 1.55, paddingTop: 10, borderTop: "1px solid var(--bp-line)" }}>
          {m.notes}
        </div>
      )}
    </motion.div>
  );
}
