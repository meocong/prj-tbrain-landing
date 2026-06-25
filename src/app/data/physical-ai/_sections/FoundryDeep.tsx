"use client";

/**
 * Deep sections for /data/physical-ai, in the Foundry blueprint language:
 *  - DirectionsExplorer: the 11 Physical AI research directions, two clusters,
 *    with the "why collect game & egocentric data" explainer.
 *  - FactorySystem: the EgoKit Factory architecture (pack → factory → cloud).
 *  - PricingLadder: RAW → +SENSOR → +LABEL → +VERIFIED completeness (no prices).
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Sheet, SheetHeading, FigLabel } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll } from "@/components/marketing/fx/RevealOnScroll";
import { FactoryLine3DLazy } from "@/components/marketing/three/Lazy3D";
import { DIRECTIONS, DIRECTIONS_SYNTH, FOUNDRY_LINE, type Direction } from "@/lib/landing/physical-ai";

const panel: React.CSSProperties = {
  background: "rgba(20,18,46,0.6)",
  border: "1px solid var(--bp-line-strong)",
  borderRadius: 12,
};

function DirectionCard({ d }: { d: Direction }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={panel} className="overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 p-5 text-left">
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--bp-ink)" }}>{d.name}</span>
            <span className="bp-mono rounded-full px-2 py-0.5" style={{ fontSize: 8.5, background: d.fit === 3 ? "rgba(0,229,199,0.12)" : "rgba(232,240,255,0.05)", color: d.fit === 3 ? "var(--bp-cyan)" : "var(--bp-ink-faint)" }}>FIT {d.fit}/3</span>
            <span className="bp-mono" style={{ fontSize: 8.5, color: "var(--bp-amber)" }}>{d.hotness}</span>
          </div>
          <div style={{ fontSize: 13.5, color: "var(--bp-ink-dim)", marginTop: 4 }}>{d.kicker}</div>
        </div>
        <ChevronDown className="mt-1 h-4 w-4 shrink-0 transition-transform" style={{ color: "var(--bp-cyan)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--bp-line)" }}>
          <p className="mt-4" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>
            <span className="bp-mono" style={{ fontSize: 9, color: "var(--bp-cyan)" }}>WHY · </span>{d.why}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>DATA NEEDED</div>
              <div style={{ fontSize: 13, color: "var(--bp-ink-dim)", marginTop: 3 }}>{d.dataNeeded}</div>
            </div>
            <div>
              <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-cyan)" }}>WHAT TBRAIN SUPPLIES</div>
              <div style={{ fontSize: 13, color: "var(--bp-ink)", marginTop: 3 }}>{d.tbrainData}</div>
            </div>
          </div>
          <div className="bp-mono mt-4" style={{ fontSize: 9, color: "var(--bp-purple)" }}>MODEL AXIS · {d.axis}</div>
        </div>
      )}
    </div>
  );
}

export function DirectionsExplorer() {
  const create = DIRECTIONS.filter((d) => d.group === "create-data");
  const brains = DIRECTIONS.filter((d) => d.group === "build-brains");
  return (
    <Sheet fig={DIRECTIONS_SYNTH.fig}>
      <RevealOnScroll>
        <SheetHeading title={DIRECTIONS_SYNTH.title} lead={DIRECTIONS_SYNTH.lead} />
      </RevealOnScroll>

      {/* game/ego explainer */}
      <RevealOnScroll delay={0.05}>
        <div className="mt-8 rounded-xl p-6" style={{ ...panel, borderColor: "var(--bp-amber)" }}>
          <div className="bp-mono mb-3" style={{ fontSize: 11, color: "var(--bp-amber)" }}>{DIRECTIONS_SYNTH.gameEgoExplainer.title}</div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="bp-mono mb-1" style={{ fontSize: 9, color: "var(--bp-cyan)" }}>EGOCENTRIC</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{DIRECTIONS_SYNTH.gameEgoExplainer.ego}</p>
            </div>
            <div>
              <div className="bp-mono mb-1" style={{ fontSize: 9, color: "var(--bp-cyan)" }}>GAME</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{DIRECTIONS_SYNTH.gameEgoExplainer.game}</p>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* two clusters */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="bp-mono mb-4" style={{ fontSize: 11, color: "var(--bp-cyan)" }}>CLUSTER A — CREATE DATA CHEAPER</div>
          <div className="grid gap-3">
            {create.map((d) => <DirectionCard key={d.id} d={d} />)}
          </div>
        </div>
        <div>
          <div className="bp-mono mb-4" style={{ fontSize: 11, color: "var(--bp-purple)" }}>CLUSTER B — BUILD ROBOT BRAINS</div>
          <div className="grid gap-3">
            {brains.map((d) => <DirectionCard key={d.id} d={d} />)}
          </div>
        </div>
      </div>

      {/* sweet spot + gaps */}
      <RevealOnScroll delay={0.1}>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl p-6" style={{ ...panel, borderColor: "var(--bp-cyan)" }}>
            <div className="bp-mono mb-2" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>TBRAIN SWEET SPOT</div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--bp-ink)" }}>{DIRECTIONS_SYNTH.sweetSpot}</p>
          </div>
          <div className="rounded-xl p-6" style={panel}>
            <div className="bp-mono mb-3" style={{ fontSize: 10, color: "var(--bp-amber)" }}>OPPORTUNITY GAPS</div>
            <ul className="grid gap-2">
              {DIRECTIONS_SYNTH.gaps.map((g) => (
                <li key={g} className="flex gap-2" style={{ fontSize: 13, color: "var(--bp-ink-dim)" }}>
                  <span style={{ color: "var(--bp-cyan)" }}>›</span>{g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ── Factory system architecture ──────────────────────────────────── */
const LAYERS = [
  { name: "Worker pack", tag: "EDGE", color: "var(--bp-purple)", items: ["RealSense D455 capture", "Raspberry Pi 5 compute", "NVMe offline cache", "Tailscale client"] },
  { name: "Factory server", tag: "LOCAL", color: "var(--bp-cyan-soft)", items: ["MinIO edge (S3)", "PostgreSQL metadata", "Fleet dashboard", "TrueNAS / Synology RAID"] },
  { name: "Cloud AI pipeline", tag: "CLOUD", color: "var(--bp-cyan)", items: ["Cloudflare R2 storage", "GKE preprocessing", "Auto-labeling + QC", "RLDS / LeRobot export"] },
];

function FactoryPoster() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 320 120" className="w-[88%]" aria-hidden>
        <line x1="20" y1="60" x2="300" y2="60" stroke="#00E5C7" strokeWidth="1" opacity="0.5" />
        {[40, 90, 140, 190, 240, 290].map((x, i) => (
          <rect key={x} x={x - 9} y={51} width="18" height="18" rx="3" fill="#14122E" stroke={i < 3 ? "#6C3CF4" : "#00E5C7"} />
        ))}
      </svg>
    </div>
  );
}

export function FactorySystem() {
  return (
    <Sheet fig="FIG.09 — EGOKIT FACTORY SYSTEM" titleBlock={{ unit: "EGOKIT", title: "FACTORY SYSTEM", dwg: "MK-001 · REV A", scale: "ISO 30°", sheet: "1 OF 1" }}>
      <RevealOnScroll>
        <SheetHeading title="A real factory, end to end" lead="Three layers turn raw field capture into standardized datasets: a wearable pack, a local factory server, and a cloud AI pipeline — secured with Tailscale zero-trust." />
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <div className="relative mt-10 h-[280px] overflow-hidden rounded-xl" style={panel}>
          <FactoryLine3DLazy className="absolute inset-0" fallback={<FactoryPoster />} />
          <div className="absolute left-4 top-3 z-10"><FigLabel>50 → 500 PACKS</FigLabel></div>
        </div>
      </RevealOnScroll>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {LAYERS.map((l, i) => (
          <RevealOnScroll key={l.name} delay={i * 0.06}>
            <div style={panel} className="h-full p-6">
              <div className="flex items-center justify-between">
                <span style={{ fontWeight: 700, fontSize: 17, color: "var(--bp-ink)" }}>{l.name}</span>
                <span className="bp-mono" style={{ fontSize: 9, color: l.color }}>{l.tag}</span>
              </div>
              <ul className="mt-4 grid gap-2">
                {l.items.map((it) => (
                  <li key={it} className="flex gap-2" style={{ fontSize: 13.5, color: "var(--bp-ink-dim)" }}>
                    <span style={{ color: l.color }}>·</span>{it}
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        ))}
      </div>

      <RevealOnScroll delay={0.1}>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FOUNDRY_LINE.fleet.map((f) => (
            <div key={f.k} style={panel} className="p-4 text-center">
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 26, color: "var(--bp-cyan)" }}>{f.v}{f.suffix}</div>
              <div className="bp-mono mt-1" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{f.k}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ── Pricing ladder (completeness levels, no prices) ──────────────── */
const LEVELS = [
  { lvl: "RAW", desc: "Unprocessed video / episode straight from the field.", includes: ["Raw RGB-D + IMU", "Timestamped"] },
  { lvl: "+ SENSOR", desc: "Synced, calibrated, standardized multi-sensor packaging.", includes: ["Multi-stream sync", "Calibration", "Standard container"] },
  { lvl: "+ LABEL", desc: "Language instructions, success/fail, segmentation.", includes: ["Language captions", "Success / fail", "Segmentation"] },
  { lvl: "+ VERIFIED", desc: "AI-filtered, 3-layer human-reviewed, RLDS/LeRobot — the scarcest tier.", includes: ["AI confidence filter", "3-layer QA", "RLDS / LeRobot export"] },
];

export function PricingLadder() {
  return (
    <Sheet fig="FIG.10 — COMPLETENESS LEVELS" axis={false}>
      <RevealOnScroll>
        <SheetHeading title="Buy data at the completeness you need" lead="From raw capture to fully verified, RLDS-ready datasets. Each level adds processing — and value. Pick per-episode or a managed flat-rate program." />
      </RevealOnScroll>
      <div className="mt-12 grid gap-4 md:grid-cols-4">
        {LEVELS.map((l, i) => (
          <RevealOnScroll key={l.lvl} delay={i * 0.06}>
            <div style={{ ...panel, borderColor: i === LEVELS.length - 1 ? "var(--bp-cyan)" : "var(--bp-line-strong)" }} className="h-full p-5">
              <div className="bp-mono" style={{ fontSize: 12, color: i === LEVELS.length - 1 ? "var(--bp-cyan)" : "var(--bp-ink)" }}>{l.lvl}</div>
              <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--bp-ink-dim)" }}>{l.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {l.includes.map((it) => (
                  <span key={it} className="bp-mono rounded-full px-2 py-0.5" style={{ fontSize: 8.5, background: "rgba(0,229,199,0.07)", color: "var(--bp-cyan-soft)" }}>{it}</span>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
      <RevealOnScroll delay={0.1}>
        <div className="mt-8">
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "#06231F" }}>
            Scope a sample batch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}
