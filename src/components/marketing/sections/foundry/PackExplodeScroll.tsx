"use client";

/**
 * CapturePackExplode — premium, detailed vector illustration of the Tbrain
 * Capture Pack, exploded and scroll-scrubbed (Mecka-style): real components
 * (Intel RealSense D455, Raspberry Pi 5, NVMe, power bank, GoPro, enclosure)
 * separate one-by-one as you scroll, each labeled, while the Bill of Materials
 * cycles STBY → MOV → SEP and a 0/6 counter fills.
 *
 * The components are shaded SVG (gradients) so they read as real hardware at
 * any size, in both light and dark. PackHeroArt is the static hero version.
 *
 * Driven by viewport scroll-progress (the site sets html/body overflow-x:hidden
 * which breaks position:sticky).
 */
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from "framer-motion";
import { FigLabel, IsoAxis, TitleBlock } from "@/components/marketing/blueprint/kit";

/* ── Shared gradient defs (metal / dark / pcb / gold) ─────────────── */
function Defs() {
  return (
    <defs>
      <linearGradient id="pk-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#DCE1EA" /><stop offset="1" stopColor="#9AA2B2" />
      </linearGradient>
      <linearGradient id="pk-metalTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F0F3F8" /><stop offset="1" stopColor="#C6CCD7" />
      </linearGradient>
      <linearGradient id="pk-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4C5462" /><stop offset="1" stopColor="#2B303A" />
      </linearGradient>
      <linearGradient id="pk-pcb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1F9670" /><stop offset="1" stopColor="#0F5A40" />
      </linearGradient>
      <linearGradient id="pk-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F2CD7E" /><stop offset="1" stopColor="#C8923B" />
      </linearGradient>
    </defs>
  );
}

const seq = (n: number, fn: (k: number) => React.ReactNode) => Array.from({ length: n }, (_, k) => fn(k));

/* ── Detailed component drawings (origin-centered) ───────────────── */
const DRAW = {
  gopro: () => (
    <g>
      <path d="M-30 2 q34 -12 58 8" fill="none" stroke="var(--bp-purple)" strokeWidth="2.4" opacity="0.85" />
      <rect x="-29" y="-21" width="58" height="42" rx="8" fill="url(#pk-metal)" stroke="#3a3f4a" strokeWidth="1" />
      <rect x="-25" y="-17" width="36" height="34" rx="5" fill="url(#pk-dark)" />
      <circle cx="-7" cy="0" r="13" fill="#22262e" /><circle cx="-7" cy="0" r="9.5" fill="#0e1116" />
      <circle cx="-7" cy="0" r="5" fill="none" stroke="var(--bp-cyan)" strokeWidth="2" /><circle cx="-10" cy="-3" r="2" fill="#cfe9ff" opacity="0.75" />
      <rect x="15" y="-13" width="11" height="26" rx="2.5" fill="#1a1d24" stroke="#4a515e" strokeWidth="0.8" />
      <rect x="-15" y="-24" width="9" height="4" rx="1.5" fill="#5b6270" />
    </g>
  ),
  realsense: () => (
    <g>
      <path d="M-70 -16 l9 -8 h131 l-9 8 z" fill="url(#pk-metalTop)" stroke="#3a3f4a" strokeWidth="0.8" />
      <path d="M70 -16 l9 -8 v32 l-9 8 z" fill="#838b9b" stroke="#3a3f4a" strokeWidth="0.8" />
      <rect x="-70" y="-16" width="140" height="32" rx="6" fill="url(#pk-metal)" stroke="#3a3f4a" strokeWidth="1" />
      <rect x="-64" y="-11" width="128" height="22" rx="4" fill="url(#pk-dark)" />
      <circle cx="-50" cy="0" r="8" fill="#0e1116" /><circle cx="-50" cy="0" r="5" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.6" />
      <circle cx="50" cy="0" r="8" fill="#0e1116" /><circle cx="50" cy="0" r="5" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.6" />
      <circle cx="-8" cy="0" r="6" fill="#0e1116" /><circle cx="-8" cy="0" r="3.4" fill="none" stroke="#cfe9ff" strokeWidth="1.3" />
      <rect x="9" y="-5" width="13" height="10" rx="2" fill="#0e1116" stroke="var(--bp-cyan)" strokeWidth="1" />
    </g>
  ),
  pi: () => (
    <g>
      <rect x="-76" y="-17" width="152" height="34" rx="4" fill="url(#pk-pcb)" stroke="#0c3f2c" strokeWidth="1" />
      <g fill="url(#pk-gold)">{seq(20, (k) => <rect key={k} x={-66 + k * 6} y={-15} width="3.4" height="6" rx="0.6" />)}</g>
      <rect x="-13" y="-9" width="22" height="20" rx="2" fill="url(#pk-dark)" stroke="#1a1d24" strokeWidth="0.8" />
      <rect x="-9" y="-5" width="14" height="12" rx="1" fill="#23272f" />
      <rect x="34" y="-12" width="20" height="13" rx="1.5" fill="url(#pk-dark)" />
      <rect x="58" y="-12" width="16" height="9" rx="1.5" fill="url(#pk-dark)" />
      <rect x="58" y="0" width="16" height="9" rx="1.5" fill="#3a6ea5" />
      <rect x="-42" y="3" width="6" height="8" rx="1" fill="#c9a227" />
      <circle cx="-54" cy="7" r="3" fill="#8a92a2" />
    </g>
  ),
  ssd: () => (
    <g>
      <rect x="-46" y="-12" width="92" height="24" rx="3" fill="url(#pk-dark)" stroke="#1a1d24" strokeWidth="1" />
      <rect x="-8" y="-7" width="24" height="14" rx="1.5" fill="#23272f" stroke="#0e1116" strokeWidth="0.6" />
      <g fill="url(#pk-gold)">{seq(8, (k) => <rect key={k} x={-44 + k * 3.4} y={6} width="2" height="6" />)}</g>
      <rect x="-30" y="6" width="3" height="6" fill="url(#pk-pcb)" />
      <rect x="24" y="-6" width="16" height="12" rx="1.5" fill="#3a3f4a" />
    </g>
  ),
  power: () => (
    <g>
      <path d="M-60 -17 l8 -7 h120 l-8 7 z" fill="#6b7280" stroke="#1a1d24" strokeWidth="0.8" />
      <rect x="-60" y="-17" width="120" height="34" rx="6" fill="url(#pk-dark)" stroke="#1a1d24" strokeWidth="1" />
      <rect x="-56" y="-12" width="112" height="24" rx="4" fill="#2c313b" />
      <rect x="40" y="-7" width="15" height="6" rx="1.5" fill="#0e1116" stroke="var(--bp-cyan)" strokeWidth="0.8" />
      <rect x="42" y="3" width="11" height="6" rx="3" fill="#0e1116" stroke="var(--bp-cyan)" strokeWidth="0.8" />
      <g fill="var(--bp-cyan)">{seq(4, (k) => <circle key={k} cx={-46 + k * 7} cy={-4} r="2" />)}</g>
      <rect x="-46" y="4" width="36" height="3" rx="1.5" fill="#5b6270" />
    </g>
  ),
  enclosure: () => (
    <g>
      <path d="M74 -28 l14 -12 v56 l-14 12 z" fill="#7a828f" stroke="#3a3f4a" strokeWidth="1" />
      <path d="M-74 -28 l14 -12 h148 l-14 12 z" fill="url(#pk-metalTop)" stroke="#3a3f4a" strokeWidth="1" />
      <rect x="-74" y="-28" width="148" height="56" rx="8" fill="url(#pk-metal)" stroke="#3a3f4a" strokeWidth="1.2" />
      <g stroke="#6b7280" strokeWidth="2">{seq(4, (k) => <line key={k} x1={-58} y1={-12 + k * 10} x2={-32} y2={-12 + k * 10} />)}</g>
      <rect x="12" y="-9" width="48" height="18" rx="3" fill="rgba(108,60,244,0.14)" stroke="var(--bp-purple)" strokeWidth="1" />
      <text x="36" y="4" textAnchor="middle" fontSize="10" fontFamily="var(--font-heading)" fontWeight="700" fill="var(--bp-purple)">Tbrain</text>
    </g>
  ),
};

type Part = { num: string; name: string; sub: string; baseY: number; exY: number; exX: number; draw: () => React.ReactNode };
const CX = 230;
const PARTS: Part[] = [
  { num: "02", name: "GoPro (head-mount)", sub: "Stabilized RGB · ~155° fisheye", baseY: 262, exY: 84, exX: 8, draw: DRAW.gopro },
  { num: "01", name: "Intel RealSense D455", sub: "RGB · Depth · IMU · global shutter", baseY: 284, exY: 176, exX: 0, draw: DRAW.realsense },
  { num: "03", name: "Raspberry Pi 5 (8GB)", sub: "Capture + hardware-clock sync", baseY: 304, exY: 252, exX: 0, draw: DRAW.pi },
  { num: "04", name: "NVMe SSD (256GB)", sub: "Offline-first cache", baseY: 322, exY: 318, exX: 0, draw: DRAW.ssd },
  { num: "05", name: "Power bank (20,000mAh)", sub: "8–10h field shift", baseY: 342, exY: 384, exX: 0, draw: DRAW.power },
  { num: "06", name: "Tbrain belt enclosure", sub: "In-house, 3D-printed", baseY: 372, exY: 470, exX: 0, draw: DRAW.enclosure },
];
const win = (i: number) => ({ start: 0.06 + i * 0.13, end: 0.06 + i * 0.13 + 0.32 });

function PartG({ p, explode, i, frozen }: { p: Part; explode: MotionValue<number>; i: number; frozen: boolean }) {
  const { start, end } = win(i);
  const y = useTransform(explode, [start, end], [p.baseY, p.exY], { clamp: true });
  const x = useTransform(explode, [start, end], [CX, CX + p.exX], { clamp: true });
  const labelOpacity = useTransform(explode, [end - 0.1, end], [0, 1], { clamp: true });
  const lx = 388;
  return (
    <>
      <motion.g style={frozen ? { transform: `translate(${CX + p.exX}px, ${p.exY}px)` } : { x, y }}>{p.draw()}</motion.g>
      <motion.g style={frozen ? { opacity: 1 } : { opacity: labelOpacity }}>
        <line x1={CX + 92} y1={p.exY} x2={lx} y2={p.exY} stroke="var(--bp-line-strong)" strokeWidth="1" />
        <circle cx={CX + 92} cy={p.exY} r="2.6" fill="var(--bp-cyan)" />
        <text x={lx + 8} y={p.exY - 3} fontSize="13" fontWeight="700" fill="var(--bp-ink)" fontFamily="var(--font-heading)">
          <tspan className="bp-mono" fill="var(--bp-cyan)" fontSize="10">{p.num} </tspan>{p.name}
        </text>
        <text x={lx + 8} y={p.exY + 13} fontSize="10.5" fill="var(--bp-ink-faint)" fontFamily="var(--font-mono)" letterSpacing="0.04em">{p.sub}</text>
      </motion.g>
    </>
  );
}

function Bom({ explode, frozen }: { explode: MotionValue<number>; frozen: boolean }) {
  const [p, setP] = useState(frozen ? 1 : 0);
  useMotionValueEvent(explode, "change", (v) => setP(v));
  const status = (i: number) => { const { start, end } = win(i); return p >= end ? "SEP" : p >= start ? "MOV" : "STBY"; };
  const sep = PARTS.filter((_, i) => status(i) === "SEP").length;
  return (
    <div className="bp-card" style={{ minWidth: 250 }}>
      <div className="bp-mono flex items-center justify-between" style={{ fontSize: 9, color: "var(--bp-ink-faint)", padding: "7px 12px", borderBottom: "1px solid var(--bp-line)" }}>
        <span>Bill of Materials</span><span style={{ color: "var(--bp-cyan)" }}>{sep} / 6</span>
      </div>
      {PARTS.map((part, i) => {
        const s = status(i);
        return (
          <div key={part.num} className="flex items-center justify-between" style={{ borderTop: "1px solid var(--bp-line)", padding: "6px 12px", background: s !== "STBY" ? "color-mix(in srgb, var(--bp-cyan) 7%, transparent)" : undefined }}>
            <div className="flex items-center gap-2.5"><span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>{part.num}</span><span style={{ fontSize: 12, color: "var(--bp-ink-dim)" }}>{part.name}</span></div>
            <span className={`bp-status bp-status-${s.toLowerCase()}`}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CapturePackExplode() {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start end", "end start"] });
  const explode = useTransform(scrollYProgress, [0.16, 0.62], [0, 1], { clamp: true });
  return (
    <section ref={wrap} className="bp-grid bp-frame relative overflow-hidden" style={{ color: "var(--bp-ink)", paddingTop: 96, paddingBottom: 88 }}>
      <div className="container mx-auto px-5">
        <div className="flex items-start justify-between">
          <div>
            <FigLabel>FIG.01 — TBRAIN CAPTURE PACK · EXPLODED</FigLabel>
            <h2 className="mt-4 max-w-xl font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px,4vw,44px)", lineHeight: 1.08 }}>Every sensor on the rig, named</h2>
            <p className="mt-3 max-w-md" style={{ fontSize: 15, color: "var(--bp-ink-dim)" }}>Scroll to disassemble it. Each part names the data stream it produces.</p>
          </div>
          <IsoAxis className="hidden lg:block" />
        </div>
        <div className="relative mx-auto mt-6" style={{ maxWidth: 940, height: "clamp(460px, 66vh, 620px)" }}>
          <svg viewBox="0 0 560 540" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="Capture pack exploded view">
            <Defs />
            <line x1={CX} y1="56" x2={CX} y2="510" stroke="var(--bp-line-strong)" strokeWidth="1" strokeDasharray="3 6" />
            {PARTS.map((p, i) => <PartG key={p.num} p={p} explode={explode} i={i} frozen={reduce} />)}
          </svg>
        </div>
        <div className="mt-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <Bom explode={explode} frozen={reduce} />
          <TitleBlock unit="TBRAIN" title="CAPTURE PACK" dwg="MK-001 · REV A" scale="1:2 · ISO 30°" sheet="1 OF 1" className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}

/* ── Static premium illustration for the hero ─────────────────────── */
export function PackHeroArt({ className = "" }: { className?: string }) {
  const tagY = [84, 176, 252, 318, 384, 470];
  return (
    <div className={`bp-card p-4 ${className}`}>
      <svg viewBox="0 0 460 540" className="w-full" aria-label="Tbrain Capture Pack" style={{ maxHeight: 460 }}>
        <Defs />
        <line x1={CX} y1="56" x2={CX} y2="510" stroke="var(--bp-line-strong)" strokeWidth="1" strokeDasharray="3 6" />
        {PARTS.map((p, i) => (
          <g key={p.num}>
            <g transform={`translate(${CX + p.exX}, ${p.exY})`}>{p.draw()}</g>
            <line x1={CX + 92} y1={tagY[i]} x2={392} y2={tagY[i]} stroke="var(--bp-line-strong)" strokeWidth="1" />
            <circle cx={406} cy={tagY[i]} r="11" fill="var(--bp-surface)" stroke="var(--bp-cyan)" strokeWidth="1.2" />
            <text x={406} y={tagY[i] + 3} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--bp-cyan)">{p.num}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* shared primitives for WorkerHero */
export { Defs, CX, PARTS, PartG, Bom };
