"use client";

import Link from "next/link";
import { ArrowRight, Check, X, Cpu, Cctv, HardDrive, BatteryFull, Box, Camera, ShieldCheck, Lock, FileCheck, Fingerprint } from "lucide-react";
import { Sheet, SheetHeading, FigLabel, Annotation } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { FactoryLine3DLazy } from "@/components/marketing/three/Lazy3D";
import { motion } from "framer-motion";
import {
  PROBLEM, COLLECTION_PACK, FOUNDRY_LINE, QC, QUALITY_PROCESS, SECURITY, DATA_LADDER,
  ENVIRONMENTS, MODALITIES, DIRECTIONS, DIRECTIONS_SYNTH, USE_CASES, STANDARDS, PROOF_POINTS,
} from "@/lib/landing/physical-ai";

/* shared panel styling */
const panel: React.CSSProperties = {
  background: "rgba(20,18,46,0.6)",
  border: "1px solid var(--bp-line-strong)",
  borderRadius: 12,
  backdropFilter: "blur(4px)",
};

const PART_ICONS = [Cctv, Cpu, HardDrive, BatteryFull, Box, Camera];
const SEC_ICONS = [Lock, ShieldCheck, FileCheck, Fingerprint];

/* ════════════════════════ FIG.00 — Problem ════════════════════════ */
export function ProblemSheet() {
  return (
    <Sheet fig={PROBLEM.fig}>
      <RevealOnScroll>
        <SheetHeading title={PROBLEM.heading} lead={PROBLEM.lead} />
      </RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-5 md:grid-cols-3">
        {PROBLEM.points.map((p) => (
          <motion.div key={p.k} variants={STAGGER_ITEM} style={panel} className="bp-card p-6">
            <div className="bp-mono mb-3 flex items-center gap-2" style={{ fontSize: 10, color: "var(--bp-amber)" }}>
              <X className="h-3.5 w-3.5" /> Constraint
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--bp-ink)" }}>{p.k}</div>
            <p className="mt-2" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{p.v}</p>
          </motion.div>
        ))}
      </StaggerContainer>
      <RevealOnScroll delay={0.1}>
        <div className="mt-8 flex items-start gap-3 rounded-xl p-5" style={{ ...panel, borderColor: "var(--bp-cyan)" }}>
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--bp-cyan)" }} />
          <p style={{ fontSize: 16, color: "var(--bp-ink)" }}>{PROBLEM.punch}</p>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ FIG.01 — Collection pack ════════════════════ */
export function CollectionPackSheet() {
  return (
    <Sheet
      fig={COLLECTION_PACK.fig}
      titleBlock={{ unit: "TBRAIN", title: "CAPTURE PACK", dwg: "MK-001 · REV A", scale: "1:2 · ISO 30°", sheet: "1 OF 1" }}
    >
      <RevealOnScroll>
        <SheetHeading title={COLLECTION_PACK.title} lead={COLLECTION_PACK.lead} />
      </RevealOnScroll>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Parts list (engineering BOM) */}
        <RevealOnScroll>
          <div style={panel} className="bp-card overflow-hidden">
            <div className="bp-mono flex items-center justify-between px-5 py-3" style={{ fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span>Bill of Materials</span><span style={{ color: "var(--bp-cyan)" }}>6 ITEMS</span>
            </div>
            {COLLECTION_PACK.bom.map((b, i) => {
              const Icon = PART_ICONS[i] ?? Box;
              return (
                <div key={b.num} className="flex items-start gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--bp-line)" }}>
                  <span className="bp-mono pt-0.5" style={{ fontSize: 11, color: "var(--bp-cyan-soft)" }}>{b.num}</span>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--bp-cyan)" }} />
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span style={{ fontWeight: 600, color: "var(--bp-ink)" }}>{b.part}</span>
                      <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{b.spec}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--bp-ink-dim)", marginTop: 2 }}>{b.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* Specs */}
        <RevealOnScroll delay={0.1}>
          <div className="grid gap-4">
            {COLLECTION_PACK.specs.map((s) => (
              <div key={s.k} style={panel} className="bp-card p-5">
                <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>{s.k}</div>
                <div className="mt-1.5" style={{ fontSize: 15, color: "var(--bp-ink-dim)" }}>{s.v}</div>
              </div>
            ))}
            <div className="rounded-xl p-5" style={{ ...panel, borderColor: "var(--bp-cyan)" }}>
              <Annotation index="✦" label="Mecka & Claru ship concept art." sub="WE SHIP HARDWARE WE BUILT — AND FORGE THE DATA FROM IT" />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </Sheet>
  );
}

/* ════════════════════ FIG.02 — Foundry line ═══════════════════════ */
function FactoryPoster() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 320 120" className="bp-draw w-[90%]" aria-hidden>
        <line x1="20" y1="60" x2="300" y2="60" stroke="#00E5C7" strokeWidth="1" opacity="0.5" fill="none" />
        {[40, 90, 140, 190, 240, 290].map((x, i) => (
          <rect key={x} x={x - 9} y={51} width="18" height="18" rx="3" fill="none" stroke={i < 3 ? "#6C3CF4" : "#00E5C7"} />
        ))}
      </svg>
    </div>
  );
}

export function FoundryLineSheet() {
  return (
    <Sheet fig={FOUNDRY_LINE.fig}>
      <RevealOnScroll>
        <SheetHeading title={FOUNDRY_LINE.title} lead={FOUNDRY_LINE.lead} />
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <div className="relative mt-10 h-[300px] overflow-hidden rounded-xl sm:h-[360px]" style={panel}>
          <FactoryLine3DLazy className="absolute inset-0" fallback={<FactoryPoster />} />
          <div className="bp-scan" />
          <div className="absolute left-4 top-3 z-10"><FigLabel>MK-001 · PIPELINE</FigLabel></div>
        </div>
      </RevealOnScroll>

      {/* stages */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FOUNDRY_LINE.stages.map((s, i) => (
          <RevealOnScroll key={s.id} delay={i * 0.04}>
            <div style={panel} className="bp-card h-full p-4">
              <div className="bp-mono flex items-center justify-between" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ color: s.layer === "cloud" ? "var(--bp-cyan)" : s.layer === "factory" ? "var(--bp-cyan-soft)" : "var(--bp-purple)" }}>{s.layer.toUpperCase()}</span>
              </div>
              <div className="mt-2" style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{s.label}</div>
              <div style={{ fontSize: 13, color: "var(--bp-ink-dim)", marginTop: 2 }}>{s.detail}</div>
            </div>
          </RevealOnScroll>
        ))}
      </div>

      {/* fleet stats */}
      <RevealOnScroll delay={0.1}>
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl p-6 md:grid-cols-4" style={panel}>
          {FOUNDRY_LINE.fleet.map((f) => (
            <div key={f.k}>
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 34, color: "var(--bp-cyan)" }}>
                <CountUp value={f.v} suffix={f.suffix} />
              </div>
              <div className="bp-mono mt-1" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{f.k}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════════ FIG.03 — QC ═════════════════════════════ */
export function QCSheet() {
  const widths = ["100%", "74%", "58%", "46%"];
  return (
    <Sheet fig={QC.fig}>
      <RevealOnScroll>
        <SheetHeading title={QC.title} lead={QC.lead} />
      </RevealOnScroll>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
        {/* funnel */}
        <div className="flex flex-col items-center gap-3">
          {QC.funnel.map((f, i) => (
            <RevealOnScroll key={f.stage} delay={i * 0.08} className="w-full">
              <div className="mx-auto rounded-lg px-5 py-4 text-center" style={{
                width: widths[i],
                background: i === QC.funnel.length - 1 ? "rgba(0,229,199,0.12)" : "rgba(20,18,46,0.7)",
                border: `1px solid ${i === QC.funnel.length - 1 ? "var(--bp-cyan)" : i === 1 ? "var(--bp-amber)" : "var(--bp-line-strong)"}`,
              }}>
                <div style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{f.stage}</div>
                <div style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", marginTop: 2 }}>{f.note}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
        {/* stats */}
        <RevealOnScroll delay={0.1}>
          <div className="grid grid-cols-2 gap-4">
            {QC.stats.map((s) => (
              <div key={s.k} style={panel} className="bp-card p-5">
                <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 30, color: "var(--bp-cyan)" }}>
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="bp-mono mt-1" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{s.k}</div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </Sheet>
  );
}

/* ════════════════ FIG.04 — Quality assurance process ══════════════ */
export function QualityProcessSheet() {
  return (
    <Sheet fig={QUALITY_PROCESS.fig}>
      <RevealOnScroll>
        <SheetHeading title={QUALITY_PROCESS.title} lead={QUALITY_PROCESS.lead} />
      </RevealOnScroll>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUALITY_PROCESS.steps.map((s, i) => (
          <RevealOnScroll key={s.step} delay={i * 0.05}>
            <div style={panel} className="bp-card h-full p-6">
              <div className="flex items-center gap-3">
                <span className="bp-mono" style={{ fontSize: 13, color: "var(--bp-cyan)" }}>{s.step}</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--bp-ink)" }}>{s.title}</span>
              </div>
              <p className="mt-3" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{s.detail}</p>
              <div className="mt-4 flex items-center gap-2 rounded-md px-3 py-2" style={{ background: "rgba(0,229,199,0.07)" }}>
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--bp-cyan)" }} />
                <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-cyan-soft)" }}>GATE · {s.gate}</span>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </Sheet>
  );
}

/* ════════════════════ FIG.05 — Security ═══════════════════════════ */
export function SecuritySheet() {
  return (
    <Sheet fig={SECURITY.fig} axis={false}>
      <RevealOnScroll>
        <SheetHeading title={SECURITY.title} lead={SECURITY.lead} />
      </RevealOnScroll>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {SECURITY.items.map((s, i) => {
          const Icon = SEC_ICONS[i] ?? Lock;
          return (
            <RevealOnScroll key={s.k} delay={i * 0.06}>
              <div style={panel} className="bp-card flex h-full gap-4 p-6">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--bp-cyan)" }} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{s.k}</div>
                  <p className="mt-1" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{s.v}</p>
                </div>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ════════════════════════ FIG.06 — Ladder ═════════════════════════ */
export function LadderSheet() {
  return (
    <Sheet fig={DATA_LADDER.fig}>
      <RevealOnScroll>
        <SheetHeading title={DATA_LADDER.title} lead={DATA_LADDER.lead} />
      </RevealOnScroll>
      <div className="mt-12 grid gap-3">
        {DATA_LADDER.rungs.map((r, i) => (
          <RevealOnScroll key={r.step} delay={i * 0.05}>
            <div className="bp-card flex flex-col gap-3 rounded-xl p-5 sm:flex-row sm:items-center" style={{ ...panel, marginLeft: `${i * 6}%` }}>
              <span className="bp-mono" style={{ fontSize: 12, color: "var(--bp-cyan)" }}>{r.step}</span>
              <span className="flex-1" style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{r.name}</span>
              <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-dim)" }}>{r.difficulty}</span>
              <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{r.buyers}</span>
              <span className="rounded-full px-3 py-1 bp-mono" style={{ fontSize: 10, background: "rgba(0,229,199,0.1)", color: "var(--bp-cyan)" }}>{r.phase}</span>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </Sheet>
  );
}

/* ════════════════════ FIG.07 — Environments ═══════════════════════ */
export function EnvironmentsSheet() {
  return (
    <Sheet fig={ENVIRONMENTS.fig}>
      <RevealOnScroll>
        <SheetHeading title={ENVIRONMENTS.title} lead={ENVIRONMENTS.lead} />
      </RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ENVIRONMENTS.items.map((e) => (
          <motion.div key={e.name} variants={STAGGER_ITEM} style={panel} className="bp-card p-5">
            <div style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{e.name}</div>
            <div style={{ fontSize: 13, color: "var(--bp-ink-dim)", marginTop: 3 }}>{e.note}</div>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}

/* ════════════════════ FIG.08 — Modalities ═════════════════════════ */
export function ModalitiesStrip() {
  return (
    <Sheet fig={MODALITIES.fig} axis={false}>
      <RevealOnScroll>
        <SheetHeading title={MODALITIES.title} />
      </RevealOnScroll>
      <StaggerContainer className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODALITIES.items.map((m) => (
          <motion.div key={m.k} variants={STAGGER_ITEM} style={panel} className="bp-card flex items-baseline justify-between gap-3 p-4">
            <span style={{ fontWeight: 600, color: "var(--bp-ink)" }}>{m.k}</span>
            <span className="bp-mono text-right" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{m.v}</span>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}

/* ════════════════════ FIG.09 — Directions teaser ══════════════════ */
export function DirectionsTeaser() {
  return (
    <Sheet fig={DIRECTIONS_SYNTH.fig}>
      <RevealOnScroll>
        <SheetHeading title={DIRECTIONS_SYNTH.title} lead={DIRECTIONS_SYNTH.lead} />
      </RevealOnScroll>

      {/* game/ego callout */}
      <RevealOnScroll delay={0.05}>
        <div className="mt-8 rounded-xl p-6" style={{ ...panel, borderColor: "var(--bp-amber)" }}>
          <div className="bp-mono mb-3" style={{ fontSize: 11, color: "var(--bp-amber)" }}>{DIRECTIONS_SYNTH.gameEgoExplainer.title}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{DIRECTIONS_SYNTH.gameEgoExplainer.ego}</p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{DIRECTIONS_SYNTH.gameEgoExplainer.game}</p>
          </div>
        </div>
      </RevealOnScroll>

      {/* directions chips */}
      <StaggerContainer className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DIRECTIONS.map((d) => (
          <motion.div key={d.id} variants={STAGGER_ITEM} style={panel} className="bp-card p-4">
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{d.name}</span>
              <span className="bp-mono" style={{ fontSize: 9, color: d.fit === 3 ? "var(--bp-cyan)" : "var(--bp-ink-faint)" }}>FIT {d.fit}/3</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", marginTop: 4 }}>{d.kicker}</div>
            <div className="bp-mono mt-3" style={{ fontSize: 9, color: "var(--bp-purple)" }}>{d.axis}</div>
          </motion.div>
        ))}
      </StaggerContainer>

      <RevealOnScroll delay={0.1}>
        <div className="mt-8 flex flex-col items-start gap-4 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between" style={{ ...panel, borderColor: "var(--bp-cyan)" }}>
          <p style={{ fontSize: 15, color: "var(--bp-ink)" }}>{DIRECTIONS_SYNTH.sweetSpot}</p>
          <Link href="/data/physical-ai" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "#06231F" }}>
            Explore all 11 directions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ FIG.10 — Standards + proof ══════════════════ */
export function StandardsStrip() {
  return (
    <Sheet fig="FIG.10 — DELIVERY & STANDARDS" axis={false}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STANDARDS.map((s) => (
          <RevealOnScroll key={s.k}>
            <div style={panel} className="bp-card h-full p-5">
              <div style={{ fontWeight: 700, color: "var(--bp-cyan)" }}>{s.k}</div>
              <div style={{ fontSize: 13.5, color: "var(--bp-ink-dim)", marginTop: 4 }}>{s.v}</div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
      <RevealOnScroll delay={0.1}>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF_POINTS.map((p) => (
            <div key={p.claim} className="bp-card rounded-xl p-5 text-center" style={panel}>
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 26, color: "var(--bp-ink)" }}>{p.stat}</div>
              <div style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", marginTop: 4 }}>{p.claim}</div>
              <div className="bp-mono mt-2" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{p.src}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ FIG.11 — Use cases teaser ═══════════════════ */
export function UseCasesTeaser() {
  return (
    <Sheet fig="FIG.11 — USE CASES" axis={false}>
      <RevealOnScroll>
        <SheetHeading title="Who we forge data for" lead="Four segments, one foundry. Each gets the data their models actually need — captured, QC'd, and delivered to standard." />
      </RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-5 md:grid-cols-2">
        {USE_CASES.map((u) => (
          <motion.div key={u.segment} variants={STAGGER_ITEM} style={panel} className="bp-card p-6">
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--bp-ink)" }}>{u.segment}</div>
            <div className="bp-mono mt-1" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{u.who}</div>
            <p className="mt-3" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}><span style={{ color: "var(--bp-amber)" }}>Need · </span>{u.need}</p>
            <p className="mt-2" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}><span style={{ color: "var(--bp-cyan)" }}>We deliver · </span>{u.deliver}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {u.data.map((d) => (
                <span key={d} className="bp-mono rounded-full px-2.5 py-1" style={{ fontSize: 9, background: "rgba(0,229,199,0.08)", color: "var(--bp-cyan-soft)", border: "1px solid var(--bp-line)" }}>{d}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </StaggerContainer>
      <RevealOnScroll delay={0.1}>
        <div className="mt-8">
          <Link href="/casestudy" className="bp-mono inline-flex items-center gap-2" style={{ fontSize: 12, color: "var(--bp-cyan)" }}>
            See case studies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ Beyond robotics (demoted verticals) ═════════ */
export function BeyondRobotics() {
  return (
    <section className="bp-grid" style={{ borderTop: "1px solid var(--bp-line)", paddingTop: 40, paddingBottom: 40 }}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-5 text-center sm:flex-row sm:text-left">
        <div>
          <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>BEYOND ROBOTICS</div>
          <p className="mt-1" style={{ fontSize: 14, color: "var(--bp-ink-dim)" }}>
            Tbrain also runs coding, evaluation, and RLHF / SFT data programs.
          </p>
        </div>
        <Link href="/services" className="bp-mono inline-flex items-center gap-2" style={{ fontSize: 12, color: "var(--bp-cyan)" }}>
          Explore all services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
