"use client";

/**
 * CapturePackExplode — Mecka-style scroll-scrubbed exploded view of the
 * Tbrain Capture Pack. As the section scrolls through the viewport, the real
 * components separate one-by-one, each labeled with a callout, while the Bill
 * of Materials cycles STBY → MOV → SEP and a 0/6 counter fills.
 *
 * Note: the site sets `overflow-x:hidden` on html/body which breaks
 * position:sticky, so the explode is driven by the section's viewport
 * progress rather than a pinned element.
 */
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from "framer-motion";
import { FigLabel, IsoAxis, TitleBlock } from "@/components/marketing/blueprint/kit";

type Part = {
  num: string; name: string; sub: string;
  baseY: number; exY: number; exX: number; tag: number;
  draw: () => React.ReactNode;
};

const CX = 230;
const PARTS: Part[] = [
  { num: "02", name: "GoPro (head-mount)", sub: "Stabilized RGB · ~155° fisheye", baseY: 268, exY: 92, exX: 8, tag: 92, draw: () => (
    <g>
      <path d="M-44 6 q44 -2 44 24" fill="none" stroke="var(--bp-purple)" strokeWidth="1.6" />
      <rect x="-22" y="-14" width="44" height="28" rx="5" fill="var(--bp-surface)" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="0" cy="0" r="7" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.6" />
    </g>
  ) },
  { num: "01", name: "Intel RealSense D455", sub: "RGB · Depth · IMU · global shutter", baseY: 286, exY: 178, exX: 0, tag: 178, draw: () => (
    <g>
      <rect x="-58" y="-19" width="116" height="38" rx="6" fill="var(--bp-surface)" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="-28" cy="0" r="9" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.6" />
      <circle cx="28" cy="0" r="9" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.6" />
      <rect x="-5" y="-6" width="10" height="12" rx="2" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.4" />
    </g>
  ) },
  { num: "03", name: "Raspberry Pi 5 (8GB)", sub: "Capture + hardware-clock sync", baseY: 304, exY: 252, exX: 0, tag: 252, draw: () => (
    <g>
      <rect x="-66" y="-13" width="132" height="26" rx="4" fill="var(--bp-surface)" stroke="currentColor" strokeWidth="1.6" />
      <rect x="-54" y="-6" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="-28" y="-6" width="11" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="44" cy="0" r="3.5" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.2" />
    </g>
  ) },
  { num: "04", name: "NVMe SSD (256GB)", sub: "Offline-first cache", baseY: 322, exY: 316, exX: 0, tag: 316, draw: () => (
    <rect x="-44" y="-11" width="88" height="22" rx="4" fill="var(--bp-surface)" stroke="currentColor" strokeWidth="1.6" />
  ) },
  { num: "05", name: "Power bank (20,000mAh)", sub: "8–10h field shift", baseY: 342, exY: 382, exX: 0, tag: 382, draw: () => (
    <g>
      <rect x="-56" y="-15" width="112" height="30" rx="5" fill="var(--bp-surface)" stroke="currentColor" strokeWidth="1.6" />
      <rect x="34" y="-6" width="14" height="12" rx="2" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.4" />
    </g>
  ) },
  { num: "06", name: "Tbrain belt enclosure", sub: "In-house, 3D-printed", baseY: 372, exY: 466, exX: 0, tag: 466, draw: () => (
    <g>
      <rect x="-74" y="-34" width="148" height="68" rx="9" fill="var(--bp-surface)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M-74 -34 l16 -14 h148 l-16 14 M74 -34 l16 -14 v68 l-16 14" fill="none" stroke="var(--bp-line-strong)" strokeWidth="1.2" />
    </g>
  ) },
];

const win = (i: number) => ({ start: 0.06 + i * 0.13, end: 0.06 + i * 0.13 + 0.32 });

function PartG({ p, explode, i, frozen }: { p: Part; explode: MotionValue<number>; i: number; frozen: boolean }) {
  const { start, end } = win(i);
  const y = useTransform(explode, [start, end], [p.baseY, p.exY], { clamp: true });
  const x = useTransform(explode, [start, end], [CX, CX + p.exX], { clamp: true });
  const labelOpacity = useTransform(explode, [end - 0.1, end], [0, 1], { clamp: true });
  const leaderX2 = 388;
  return (
    <>
      <motion.g style={frozen ? { transform: `translate(${CX + p.exX}px, ${p.exY}px)` } : { x, y }} color="var(--bp-ink-dim)">
        {p.draw()}
      </motion.g>
      <motion.g style={frozen ? { opacity: 1 } : { opacity: labelOpacity }}>
        <line x1={CX + 84} y1={p.tag} x2={leaderX2} y2={p.tag} stroke="var(--bp-line-strong)" strokeWidth="1" />
        <circle cx={CX + 84} cy={p.tag} r="2.6" fill="var(--bp-cyan)" />
        <text x={leaderX2 + 8} y={p.tag - 3} fontSize="13" fontWeight="700" fill="var(--bp-ink)" fontFamily="var(--font-heading)">
          <tspan className="bp-mono" fill="var(--bp-cyan)" fontSize="10">{p.num} </tspan>{p.name}
        </text>
        <text x={leaderX2 + 8} y={p.tag + 13} fontSize="10.5" fill="var(--bp-ink-faint)" fontFamily="var(--font-mono)" letterSpacing="0.04em">{p.sub}</text>
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
            <div className="flex items-center gap-2.5">
              <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>{part.num}</span>
              <span style={{ fontSize: 12, color: "var(--bp-ink-dim)" }}>{part.name}</span>
            </div>
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
  // explode during the first half of the section's pass, then hold separated
  const explode = useTransform(scrollYProgress, [0.16, 0.62], [0, 1], { clamp: true });

  return (
    <section ref={wrap} className="bp-grid bp-frame relative overflow-hidden" style={{ color: "var(--bp-ink)", paddingTop: 96, paddingBottom: 88 }}>
      <div className="container mx-auto px-5">
        <div className="flex items-start justify-between">
          <div>
            <FigLabel>FIG.01 — TBRAIN CAPTURE PACK · EXPLODED</FigLabel>
            <h2 className="mt-4 max-w-xl font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px,4vw,44px)", lineHeight: 1.08 }}>Our own rig — built from research-grade parts</h2>
            <p className="mt-3 max-w-md" style={{ fontSize: 15, color: "var(--bp-ink-dim)" }}>Scroll to disassemble it. Each part names the data stream it produces.</p>
          </div>
          <IsoAxis className="hidden lg:block" />
        </div>

        <div className="relative mx-auto mt-6" style={{ maxWidth: 940, height: "clamp(440px, 64vh, 600px)" }}>
          <svg viewBox="0 0 560 540" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="Capture pack exploded view">
            <line x1={CX} y1="64" x2={CX} y2="508" stroke="var(--bp-line-strong)" strokeWidth="1" strokeDasharray="3 6" />
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
