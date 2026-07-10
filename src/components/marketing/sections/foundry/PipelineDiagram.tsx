"use client";

/**
 * Animated pipeline diagram — Collect → Auto-Label → QC → Human QC → Deliver.
 * Particle-flow connectors, active-phase pulse, phase-hover reveal.
 */
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PIPELINE_OVERVIEW } from "@/lib/landing/physical-ai-qc";

const COLOR_MAP: Record<string, string> = {
  cyan:   "#4cb5ff",
  accent: "#00e5c7",
  amber:  "#ff9a4d",
  violet: "#a78bfa",
  green:  "#5ee08a",
};

/* Each phase card links to its detail: Auto-Label → the 8-model deep dive,
   QC + Human QC → the QC playbook, Collect → the rig, Deliver → the ledger. */
const PHASE_HREF: Record<string, string> = {
  "collect":    "#hardware-showcase",
  "auto-label": "/data/physical-ai/auto-label",
  "qc":         "/data/physical-ai/quality",
  "human-qc":   "/data/physical-ai/quality",
  "deliver":    "#captures-gallery",
};
const PHASE_HREF_LABEL: Record<string, string> = {
  "collect":    "see the capture rig",
  "auto-label": "open the auto-label deep dive",
  "qc":         "open the QC playbook",
  "human-qc":   "open the QC playbook",
  "deliver":    "see delivered episodes",
};

export function PipelineDiagram({ highlight, compact = false }: { highlight?: string; compact?: boolean }) {
  const phases = PIPELINE_OVERVIEW.phases;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const W = 1200;
  const H = compact ? 300 : 380;
  const padX = 32;
  const gap = 24;
  const boxW = (W - padX * 2 - gap * (phases.length - 1)) / phases.length;
  const boxH = compact ? 150 : 200;
  const y0 = compact ? 40 : 60;

  return (
    <div className="w-full" style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Tbrain data foundry pipeline"
        style={{ minWidth: 760, width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          {phases.map((p) => {
            const c = COLOR_MAP[p.color];
            return (
              <linearGradient key={`grad-${p.id}`} id={`grad-${p.id}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={c} stopOpacity="0.02" />
                <stop offset="50%" stopColor={c} stopOpacity="0.18" />
                <stop offset="100%" stopColor={c} stopOpacity="0.02" />
              </linearGradient>
            );
          })}
          {phases.slice(0, -1).map((p, i) => {
            const next = phases[i + 1];
            const c1 = COLOR_MAP[p.color];
            const c2 = COLOR_MAP[next.color];
            return (
              <linearGradient key={`arrow-${i}`} id={`arrow-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor={c1} />
                <stop offset="1" stopColor={c2} />
              </linearGradient>
            );
          })}
          <filter id="phase-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <text x={padX} y={22} fontFamily="var(--font-mono)" fontSize="11" fill="var(--bp-ink-faint)" letterSpacing="0.08em">
          {PIPELINE_OVERVIEW.fig}
        </text>

        {phases.map((p, i) => {
          const x = padX + i * (boxW + gap);
          const c = COLOR_MAP[p.color] || COLOR_MAP.cyan;
          const isHighlight = highlight === p.id;
          const isHover = hoverIdx === i;
          const emph = isHighlight || isHover;
          const stroke = emph ? c : "var(--bp-line-strong)";
          const strokeWidth = emph ? 2 : 1;
          const href = PHASE_HREF[p.id];
          return (
            <a
              key={p.id}
              href={href}
              aria-label={`${p.label} — ${PHASE_HREF_LABEL[p.id] ?? ""}`}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: href ? "pointer" : "default" }}
            >
              {/* connector */}
              {i > 0 && (
                <>
                  <line
                    x1={x - gap + 4}
                    y1={y0 + boxH / 2}
                    x2={x - 4}
                    y2={y0 + boxH / 2}
                    stroke={`url(#arrow-${i - 1})`}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  {/* animated particle sliding along connector */}
                  {!reduce && (
                    <motion.circle
                      r="2.5"
                      fill={c}
                      cy={y0 + boxH / 2}
                      filter="url(#phase-glow)"
                      animate={{ cx: [x - gap + 4, x - 4] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.28 }}
                    />
                  )}
                </>
              )}

              {/* box background */}
              <rect
                x={x}
                y={y0}
                width={boxW}
                height={boxH}
                rx="12"
                ry="12"
                fill={`url(#grad-${p.id})`}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />

              {/* pulse ring on highlight */}
              {emph && !reduce && (
                <motion.rect
                  x={x}
                  y={y0}
                  width={boxW}
                  height={boxH}
                  rx="12"
                  ry="12"
                  fill="none"
                  stroke={c}
                  strokeWidth="1.5"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: [0.9, 0.15, 0.9], strokeWidth: [1.5, 3.5, 1.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* phase number */}
              <text x={x + 18} y={y0 + 24} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bp-ink-faint)" letterSpacing="0.1em">
                {String(i + 1).padStart(2, "0")}
              </text>

              {/* phase label */}
              <text x={x + 18} y={y0 + 52} fontFamily="var(--font-heading)" fontSize={compact ? "20" : "26"} fontWeight="600" fill={c} filter={emph ? "url(#phase-glow)" : undefined}>
                {p.label}
              </text>

              {/* status pip */}
              <circle cx={x + boxW - 18} cy={y0 + 22} r="3" fill={c} filter="url(#phase-glow)" />
              {!reduce && (
                <motion.circle
                  cx={x + boxW - 18}
                  cy={y0 + 22}
                  r="6"
                  fill="none"
                  stroke={c}
                  strokeWidth="1"
                  initial={{ opacity: 0.8, r: 3 }}
                  animate={{ opacity: [0.8, 0, 0.8], r: [3, 10, 3] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: i * 0.35 }}
                />
              )}

              {/* detail */}
              <foreignObject x={x + 18} y={y0 + 62} width={boxW - 36} height={compact ? 44 : 62}>
                <div
                  suppressHydrationWarning
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: compact ? 10.5 : 11.5,
                    lineHeight: 1.45,
                    color: "var(--bp-ink-dim)",
                  }}
                >
                  {p.detail}
                </div>
              </foreignObject>

              {/* substages chips */}
              {p.substages && (
                <foreignObject x={x + 18} y={y0 + boxH - (compact ? 48 : 62)} width={boxW - 36} height={compact ? 42 : 56}>
                  <div suppressHydrationWarning style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {p.substages.map((s, si) => (
                      <motion.span
                        key={s}
                        initial={{ opacity: 0.75, y: 0 }}
                        animate={emph ? { opacity: 1, y: [-0.5, 0.5, -0.5] } : { opacity: 0.75, y: 0 }}
                        transition={{ duration: 2.2, delay: si * 0.08, repeat: emph ? Infinity : 0, ease: "easeInOut" }}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9.5,
                          padding: "3px 7px",
                          borderRadius: 5,
                          border: `1px solid ${c}`,
                          color: c,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          background: `color-mix(in srgb, ${c} 10%, transparent)`,
                          display: "inline-block",
                        }}
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </foreignObject>
              )}

              {/* clickable affordance — small ↗ on hover for phases with a target */}
              {href && emph && (
                <text x={x + boxW - 30} y={y0 + boxH - 16} fontFamily="var(--font-mono)" fontSize="12" fill={c} filter="url(#phase-glow)">↗</text>
              )}
            </a>
          );
        })}

        {/* base rail */}
        <line
          x1={padX}
          y1={y0 + boxH + 20}
          x2={W - padX}
          y2={y0 + boxH + 20}
          stroke="var(--bp-line)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
      </svg>

      {/* hover reveal tooltip below diagram */}
      <AnimatePresence mode="wait">
        {hoverIdx !== null && (
          <motion.div
            key={phases[hoverIdx].id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="bp-card bp-mono mt-4"
            style={{
              padding: "10px 14px",
              fontSize: 11.5,
              color: "var(--bp-ink-dim)",
              borderRadius: 10,
              borderLeft: `3px solid ${COLOR_MAP[phases[hoverIdx].color]}`,
            }}
          >
            <span style={{ color: COLOR_MAP[phases[hoverIdx].color], fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {phases[hoverIdx].label}
            </span>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
            {phases[hoverIdx].detail}
            {phases[hoverIdx].substages && (
              <>
                <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
                <span style={{ opacity: 0.6 }}>{phases[hoverIdx].substages!.join(" · ")}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
