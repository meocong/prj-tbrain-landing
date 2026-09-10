"use client";

/**
 * PipelineFlow — the foundry's data pipeline as one animated picture.
 *
 * A horizontal "assembly line": Capture → Sync → AI QC → Human QA → Deliver.
 * Data packets flow left→right; at the AI-QC gate ~1 in 4 turns amber and peels
 * off into a "Rejected" tray (with the reason), the rest continue to "Verified".
 * Tells the how-it-works + QC story with almost no reading.
 *
 * Theme-aware (var(--bp-*)). Respects prefers-reduced-motion (static fallback).
 */
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Clock, ShieldCheck, Users, PackageCheck } from "lucide-react";
import { CountUp } from "@/components/marketing/fx/CountUp";

const STATIONS = [
  { icon: Camera, k: "Capture", x: 7, gate: false, detail: "50–500 packs in the field" },
  { icon: Clock, k: "Sync", x: 30, gate: false, detail: "Hardware-clock aligned" },
  { icon: ShieldCheck, k: "AI QC", x: 52, gate: true, detail: "Auto-rejects ~28%" },
  { icon: Users, k: "Human QA", x: 74, gate: false, detail: "3-layer human review" },
  { icon: PackageCheck, k: "Deliver", x: 93, gate: false, detail: "RLDS / LeRobot · ≤48h" },
];
const GATE_X = 52;
const REASONS = ["Sync drift", "Occluded hands", "Tracking loss", "Motion blur"];
const PACKETS = Array.from({ length: 9 }, (_, i) => ({ id: i, rejected: i % 4 === 1, delay: i * 0.62 }));
const LINE_TOP = "46%";

function Packet({ rejected, delay }: { rejected: boolean; delay: number }) {
  const base = { position: "absolute" as const, width: 15, height: 9, borderRadius: 3, marginTop: -4 };
  if (rejected) {
    return (
      <motion.div
        style={{ ...base, background: "var(--bp-amber)", boxShadow: "0 0 8px color-mix(in srgb, var(--bp-amber) 60%, transparent)" }}
        animate={{ left: ["5%", `${GATE_X}%`, `${GATE_X}%`, `${GATE_X}%`], top: [LINE_TOP, LINE_TOP, "74%", "84%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay, times: [0, 0.45, 0.6, 0.8], ease: "linear" }}
      />
    );
  }
  return (
    <motion.div
      style={{ ...base, top: LINE_TOP, background: "var(--bp-cyan)", boxShadow: "0 0 8px color-mix(in srgb, var(--bp-cyan) 55%, transparent)" }}
      animate={{ left: ["5%", "93%", "93%"], opacity: [0, 1, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay, times: [0, 0.86, 1], ease: "linear" }}
    />
  );
}

export function PipelineFlow() {
  const reduce = useReducedMotion() ?? false;
  return (
    <div className="bp-card p-5 sm:p-8">
      {/* counters */}
      <div className="mb-7 grid grid-cols-3 gap-3">
        {[
          { v: <CountUp value={1000} format={(n) => n.toLocaleString()} />, k: "Ingested · per 1k batch", c: "var(--bp-ink)" },
          { v: <>~<CountUp value={28} suffix="%" /></>, k: "Auto-rejected · AI filter", c: "var(--bp-amber)" },
          { v: "≤48h", k: "Raw → delivered", c: "var(--bp-cyan)" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg p-3 text-center" style={{ background: "var(--bp-surface-2)" }}>
            <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px,3vw,30px)", color: s.c }}>{s.v}</div>
            <div className="bp-mono mt-1" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* the line */}
      <div className="relative w-full" style={{ height: 210 }}>
        <div className="absolute" style={{ left: "7%", right: "7%", top: LINE_TOP, height: 2, background: "var(--bp-line-strong)" }} />
        {!reduce && (
          <motion.div className="absolute" style={{ left: "7%", right: "7%", top: LINE_TOP, height: 2, marginTop: -0.5, backgroundImage: "repeating-linear-gradient(90deg, var(--bp-cyan) 0 8px, transparent 8px 22px)", backgroundSize: "22px 3px", opacity: 0.7 }}
            animate={{ backgroundPositionX: ["0px", "22px"] }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
        )}
        <div className="absolute" style={{ left: `${GATE_X}%`, top: "71%", height: "15%", width: 2, marginLeft: -1, background: "color-mix(in srgb, var(--bp-amber) 45%, transparent)" }} />
        {!reduce && (
          <motion.span className="absolute" style={{ left: `${GATE_X}%`, top: LINE_TOP, transform: "translate(-50%,-50%)", width: 48, height: 48, borderRadius: "50%", border: "1.5px solid var(--bp-amber)" }}
            animate={{ scale: [1, 1.55], opacity: [0.55, 0] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }} />
        )}

        <div className="absolute -translate-x-1/2" style={{ left: "93%", top: "18%" }}>
          <span className="bp-mono inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: 9, color: "var(--bp-cyan)", background: "color-mix(in srgb, var(--bp-cyan) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--bp-cyan) 35%, transparent)" }}>✓ Verified · RLDS</span>
        </div>

        {STATIONS.map((s) => {
          const col = s.gate ? "var(--bp-amber)" : "var(--bp-cyan)";
          return (
            <div key={s.k} className="group absolute" style={{ left: `${s.x}%`, top: LINE_TOP, transform: "translate(-50%,-50%)" }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110" style={{ background: "var(--bp-surface)", border: `1.5px solid ${col}`, boxShadow: "var(--bp-card-shadow)" }}>
                <s.icon className="h-5 w-5" style={{ color: col }} />
              </span>
              <span className="bp-mono pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ bottom: "100%", marginBottom: 9, fontSize: 9, color: "var(--bp-bg)", background: "var(--bp-ink)" }}>{s.detail}</span>
            </div>
          );
        })}
        {STATIONS.map((s) => (
          <div key={s.k} className="bp-mono absolute -translate-x-1/2 text-center" style={{ left: `${s.x}%`, top: "62%", fontSize: 9.5, color: "var(--bp-ink-dim)", width: 80 }}>{s.k}</div>
        ))}

        <div className="absolute -translate-x-1/2 text-center" style={{ left: `${GATE_X}%`, top: "86%", width: 130 }}>
          <span className="bp-mono rounded px-1.5 py-0.5" style={{ fontSize: 8.5, color: "var(--bp-amber)", background: "color-mix(in srgb, var(--bp-amber) 14%, transparent)" }}>✕ REJECTED ~28%</span>
        </div>

        {reduce ? (
          <>
            {[20, 40, 84].map((l, i) => <div key={i} style={{ position: "absolute", left: `${l}%`, top: LINE_TOP, marginTop: -4, width: 15, height: 9, borderRadius: 3, background: "var(--bp-cyan)" }} />)}
            <div style={{ position: "absolute", left: `${GATE_X}%`, top: "80%", marginTop: -4, width: 15, height: 9, borderRadius: 3, background: "var(--bp-amber)" }} />
          </>
        ) : (
          PACKETS.map((p) => <Packet key={p.id} rejected={p.rejected} delay={p.delay} />)
        )}
      </div>

      {/* reject reasons legend */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {REASONS.map((r) => (
          <span key={r} className="bp-mono inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: 9.5, color: "var(--bp-amber)", border: "1px solid color-mix(in srgb, var(--bp-amber) 30%, transparent)" }}>✕ {r}</span>
        ))}
      </div>
    </div>
  );
}
