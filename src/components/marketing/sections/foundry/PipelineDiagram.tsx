"use client";

/**
 * Flat labeled 5-phase pipeline diagram — Collect → Auto-Label → QC → Human QC → Deliver.
 * Inline SVG so it's theme-aware, sharp on retina, and cheap to iterate.
 * Highlighting: pass `highlight="auto-label"` to accent one phase.
 */
import { PIPELINE_OVERVIEW } from "@/lib/landing/physical-ai-qc";

const COLOR_MAP: Record<string, string> = {
  cyan:   "var(--bp-cyan)",
  accent: "var(--bp-accent, #00e5c7)",
  amber:  "#ff9a4d",
  violet: "#a78bfa",
  green:  "#5ee08a",
};

export function PipelineDiagram({ highlight, compact = false }: { highlight?: string; compact?: boolean }) {
  const phases = PIPELINE_OVERVIEW.phases;
  const W = 1200;
  const H = compact ? 260 : 340;
  const padX = 32;
  const gap = 18;
  const boxW = (W - padX * 2 - gap * (phases.length - 1)) / phases.length;
  const boxH = compact ? 130 : 168;
  const y0 = compact ? 40 : 60;

  return (
    <div className="w-full" style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Tbrain data foundry pipeline · Collect · Auto-Label · QC · Human QC · Deliver"
        style={{ minWidth: 720, width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <marker id="arrow-v5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bp-ink-faint)" />
          </marker>
        </defs>

        {/* Fig header */}
        <text x={padX} y={22} fontFamily="var(--font-mono)" fontSize="11" fill="var(--bp-ink-faint)" letterSpacing="0.08em">
          {PIPELINE_OVERVIEW.fig}
        </text>

        {phases.map((p, i) => {
          const x = padX + i * (boxW + gap);
          const c = COLOR_MAP[p.color] || COLOR_MAP.cyan;
          const isHighlight = highlight === p.id;
          const stroke = isHighlight ? c : "var(--bp-line)";
          const strokeWidth = isHighlight ? 2 : 1;
          const bg = isHighlight ? `color-mix(in srgb, ${c} 12%, transparent)` : "transparent";
          return (
            <g key={p.id}>
              {/* connector arrow */}
              {i > 0 && (
                <line
                  x1={x - gap + 2}
                  y1={y0 + boxH / 2}
                  x2={x - 2}
                  y2={y0 + boxH / 2}
                  stroke="var(--bp-ink-faint)"
                  strokeWidth="1"
                  markerEnd="url(#arrow-v5)"
                />
              )}
              {/* box */}
              <rect
                x={x}
                y={y0}
                width={boxW}
                height={boxH}
                rx="10"
                ry="10"
                fill={bg}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
              {/* phase number */}
              <text x={x + 14} y={y0 + 22} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bp-ink-faint)" letterSpacing="0.08em">
                {String(i + 1).padStart(2, "0")}
              </text>
              {/* phase label */}
              <text x={x + 14} y={y0 + 46} fontFamily="var(--font-heading)" fontSize={compact ? "18" : "22"} fontWeight="600" fill={c}>
                {p.label}
              </text>
              {/* detail */}
              <foreignObject x={x + 14} y={y0 + 56} width={boxW - 28} height={compact ? 44 : 60}>
                <div
                  suppressHydrationWarning
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: compact ? 10 : 11,
                    lineHeight: 1.4,
                    color: "var(--bp-ink-dim)",
                  }}
                >
                  {p.detail}
                </div>
              </foreignObject>
              {/* substages chips */}
              {p.substages && (
                <foreignObject x={x + 14} y={y0 + boxH - (compact ? 36 : 44)} width={boxW - 28} height={compact ? 28 : 36}>
                  <div
                    suppressHydrationWarning
                    style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                  >
                    {p.substages.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: `1px solid ${c}`,
                          color: c,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          background: `color-mix(in srgb, ${c} 8%, transparent)`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
