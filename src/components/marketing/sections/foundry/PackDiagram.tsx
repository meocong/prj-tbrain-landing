"use client";

/**
 * PackDiagram — the Tbrain Capture Pack as a labeled ENGINEERING DIAGRAM:
 * an exploded-view of the real components (Intel RealSense D455, GoPro, Pi 5…)
 * with numbered callouts (name · quality · the data stream each produces),
 * plus a capture data-flow strip. SVG + framer-motion; light/dark theme-aware
 * (uses currentColor + --bp tokens). No WebGL.
 */
import { motion } from "framer-motion";
import { COLLECTION_PACK } from "@/lib/landing/physical-ai";

/* numbered hotspot positions on the exploded SVG (right edge of each part) */
const TAGS = [
  { n: "01", y: 103 }, // RealSense
  { n: "02", y: 75 },  // GoPro
  { n: "03", y: 151 }, // Pi 5
  { n: "04", y: 189 }, // SSD
  { n: "05", y: 223 }, // power
  { n: "06", y: 286 }, // enclosure
];

function ExplodedSVG() {
  return (
    <svg viewBox="0 0 360 340" className="w-full" role="img" aria-label="Tbrain Capture Pack exploded diagram"
      style={{ color: "var(--bp-ink-dim)" }}>
      <g className="bp-draw" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        {/* head-strap arc + GoPro */}
        <path d="M250 70 q40 -2 40 26" stroke="var(--bp-purple)" />
        <rect x="248" y="58" width="40" height="26" rx="4" />
        <circle cx="268" cy="71" r="6" stroke="var(--bp-cyan)" />
        {/* RealSense module */}
        <rect x="120" y="88" width="110" height="34" rx="5" />
        <circle cx="150" cy="105" r="8" stroke="var(--bp-cyan)" />
        <circle cx="200" cy="105" r="8" stroke="var(--bp-cyan)" />
        <rect x="172" y="100" width="8" height="10" rx="2" stroke="var(--bp-cyan)" />
        {/* Pi 5 board */}
        <rect x="118" y="140" width="124" height="22" rx="3" />
        <rect x="128" y="146" width="16" height="10" rx="1.5" />
        <rect x="150" y="146" width="10" height="10" rx="1.5" />
        <circle cx="224" cy="151" r="3" />
        {/* SSD */}
        <rect x="140" y="178" width="80" height="18" rx="3" />
        {/* power bank */}
        <rect x="128" y="210" width="104" height="26" rx="4" />
        <rect x="208" y="218" width="16" height="10" rx="2" stroke="var(--bp-cyan)" />
        {/* belt enclosure (base) */}
        <rect x="108" y="252" width="144" height="64" rx="8" />
        <path d="M108 252 l16 -14 h144 l-16 14 M252 252 l16 -14 v64 l-16 14" stroke="var(--bp-line-strong)" opacity="0.7" />
        {/* dashed assembly axis */}
        <line x1="180" y1="50" x2="180" y2="318" stroke="var(--bp-line-strong)" strokeWidth="1" strokeDasharray="3 5" />
        {/* leader lines to number tags */}
        {TAGS.map((t) => (
          <line key={t.n} x1="300" y1={t.y} x2="330" y2={t.y} stroke="var(--bp-line-strong)" strokeWidth="1" />
        ))}
      </g>
      {/* number tags */}
      {TAGS.map((t) => (
        <g key={t.n}>
          <circle cx="340" cy={t.y} r="11" fill="var(--bp-surface)" stroke="var(--bp-cyan)" strokeWidth="1.2" />
          <text x="340" y={t.y + 3} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--bp-cyan)">{t.n}</text>
        </g>
      ))}
    </svg>
  );
}

function FlowStrip() {
  const nodes = ["Capture", "Hardware-clock sync", "NVMe cache", "Sync → factory"];
  return (
    <div className="mt-6 flex items-center gap-2 overflow-hidden rounded-lg px-3 py-3 bp-card">
      {nodes.map((n, i) => (
        <div key={n} className="flex flex-1 items-center gap-2">
          <span className="bp-mono whitespace-nowrap" style={{ fontSize: 10, color: i === nodes.length - 1 ? "var(--bp-cyan)" : "var(--bp-ink-dim)" }}>{n}</span>
          {i < nodes.length - 1 && (
            <div className="relative h-px flex-1" style={{ background: "var(--bp-line)" }}>
              <motion.span
                initial={{ left: "0%", opacity: 0 }}
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                style={{ position: "absolute", top: -2.5, width: 6, height: 6, borderRadius: 99, background: "var(--bp-cyan)" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Just the exploded-kit illustration card (for the hero). */
export function PackExploded({ className = "" }: { className?: string }) {
  return (
    <div className={`bp-card p-4 ${className}`}>
      <ExplodedSVG />
    </div>
  );
}

export function PackDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="bp-card p-4">
        <ExplodedSVG />
      </div>
      <div>
        <div className="grid gap-2.5">
          {COLLECTION_PACK.bom.map((b) => (
            <div key={b.num} className="bp-card bp-card-hover flex items-start gap-3 p-3.5">
              <span className="bp-mono shrink-0 rounded-full px-1.5 py-0.5" style={{ fontSize: 10, color: "var(--bp-cyan)", border: "1px solid var(--bp-line)" }}>{b.num}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--bp-ink)" }}>{b.part}</span>
                  <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>{b.quality}</span>
                </div>
                {!compact && <div style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", marginTop: 2 }}>{b.role}</div>}
              </div>
              {b.stream !== "—" && (
                <span className="bp-mono shrink-0 self-center rounded-full px-2 py-1" style={{ fontSize: 9, color: "var(--bp-cyan)", background: "color-mix(in srgb, var(--bp-cyan) 10%, transparent)" }}>{b.stream}</span>
              )}
            </div>
          ))}
        </div>
        <FlowStrip />
      </div>
    </div>
  );
}
