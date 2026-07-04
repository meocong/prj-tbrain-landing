"use client";

import Link from "next/link";
import { ArrowRight, Check, X, Zap, Scan, Cpu, Boxes, Bot, Rocket, Globe, ShieldCheck } from "lucide-react";
import { Sheet, SheetHeading, FigLabel, Annotation } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { PackDiagram } from "./PackDiagram";
import { motion, useReducedMotion } from "framer-motion";
import {
  PROBLEM, COLLECTION_PACK, WORLD_MODEL_INPUTS, REAL_SAMPLES, DATA_LADDER,
  DIRECTIONS, DIRECTIONS_SYNTH, USE_CASES, VIETNAM_EDGE, AVAILABILITY,
  ENVIRONMENTS,
} from "@/lib/landing/physical-ai";
import { EnvTile } from "./EnvTile";

const USECASE_ICONS = [Cpu, Boxes, Bot, Rocket];
const EDGE_ICONS = [Scan, ShieldCheck, Globe, Boxes, Zap];

/* ════════════════════════ Problem ════════════════════════ */
export function ProblemSheet() {
  return (
    <Sheet fig={PROBLEM.fig}>
      <RevealOnScroll><SheetHeading title={PROBLEM.heading} lead={PROBLEM.lead} /></RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-5 md:grid-cols-3">
        {PROBLEM.points.map((p) => (
          <motion.div key={p.k} variants={STAGGER_ITEM} className="bp-card p-6">
            <div className="bp-mono mb-3 flex items-center gap-2" style={{ fontSize: 10, color: "var(--bp-amber)" }}><X className="h-3.5 w-3.5" /> Constraint</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--bp-ink)" }}>{p.k}</div>
            <p className="mt-2" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{p.v}</p>
          </motion.div>
        ))}
      </StaggerContainer>
      <RevealOnScroll delay={0.1}>
        <div className="mt-8 flex items-start gap-3 rounded-xl p-5 bp-card" style={{ borderColor: "var(--bp-cyan)" }}>
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--bp-cyan)" }} />
          <p style={{ fontSize: 16, color: "var(--bp-ink)" }}>{PROBLEM.punch}</p>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ Capture Pack (architecture diagram) ════════════════════ */
export function CapturePackSheet() {
  return (
    <Sheet fig={COLLECTION_PACK.fig} titleBlock={{ unit: "TBRAIN", title: "CAPTURE PACK", dwg: "MK-001 · REV A", scale: "1:2 · ISO 30°", sheet: "1 OF 1" }}>
      <RevealOnScroll><SheetHeading title={COLLECTION_PACK.title} lead={COLLECTION_PACK.lead} /></RevealOnScroll>
      <RevealOnScroll delay={0.05}><div className="mt-10"><PackDiagram /></div></RevealOnScroll>
      <RevealOnScroll delay={0.1}>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTION_PACK.specs.map((s) => (
            <div key={s.k} className="bp-card p-4">
              <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>{s.k}</div>
              <div className="mt-1.5" style={{ fontSize: 13.5, color: "var(--bp-ink-dim)" }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl p-5 bp-card" style={{ borderColor: "var(--bp-cyan)" }}>
          <Annotation index="✦" label="Mecka & Claru ship concept art. We ship hardware we built." sub="OUR OWN RIG — RESEARCH-GRADE COMPONENTS — AND WE FORGE THE DATA FROM IT" />
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ What we capture (data types) ════════════════════ */
export function WhatWeCaptureSheet() {
  return (
    <Sheet fig={WORLD_MODEL_INPUTS.fig}>
      <RevealOnScroll><SheetHeading title={WORLD_MODEL_INPUTS.title} lead={WORLD_MODEL_INPUTS.lead} /></RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WORLD_MODEL_INPUTS.inputs.map((it) => (
          <motion.div key={it.k} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-5">
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--bp-ink)" }}>{it.k}</span>
              <span className="bp-mono rounded-full px-2 py-0.5" style={{ fontSize: 8.5, color: "var(--bp-cyan)", background: "color-mix(in srgb, var(--bp-cyan) 10%, transparent)" }}>{it.from}</span>
            </div>
            <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--bp-ink-dim)" }}>{it.v}</p>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}

/* ════════════════════ Real data, not concept ════════════════════ */
export function RealSamplesSheet() {
  const reduce = useReducedMotion() ?? false;
  return (
    <Sheet fig={REAL_SAMPLES.fig} axis={false}>
      <RevealOnScroll><SheetHeading title={REAL_SAMPLES.title} lead={REAL_SAMPLES.lead} /></RevealOnScroll>
      <StaggerContainer className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REAL_SAMPLES.items.map((s) => (
          <motion.div key={s.name} variants={STAGGER_ITEM} className="bp-card bp-card-hover overflow-hidden" style={s.defect ? { borderColor: "var(--bp-amber)" } : undefined}>
            <div className="relative" style={{ aspectRatio: "16 / 10", background: "#0a0a14", overflow: "hidden" }}>
              {reduce ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.poster} alt={s.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video autoPlay loop muted playsInline preload="none" poster={s.poster} style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                  <source src={s.video} type="video/mp4" />
                </video>
              )}
              <span className="bp-mono absolute left-2 top-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5" style={{ fontSize: 8, color: s.defect ? "var(--bp-amber)" : "#fff", background: "rgba(0,0,0,0.55)" }}>
                {s.defect ? "✕ REJECTED" : "● REC"}
              </span>
            </div>
            <div className="p-4">
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bp-ink)" }}>{s.name}</div>
              <div className="bp-mono mt-1" style={{ fontSize: 9.5, color: s.defect ? "var(--bp-amber)" : "var(--bp-ink-faint)" }}>{s.note}</div>
            </div>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}

/* ════════════════════ Sample captures (real environments) ════════════════════ */
export function SampleCapturesSheet() {
  return (
    <Sheet fig={ENVIRONMENTS.fig} axis={false}>
      <RevealOnScroll>
        <SheetHeading title={ENVIRONMENTS.title} lead={ENVIRONMENTS.lead} />
      </RevealOnScroll>
      <StaggerContainer className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ENVIRONMENTS.items.map((s) => (
          <motion.div key={s.key} variants={STAGGER_ITEM}>
            <EnvTile slot={s} />
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}

/* ════════════════════ Data for what you're building (merged) ════════════════════ */
export function DataForWhatYouBuild() {
  return (
    <Sheet fig="FIG.14 — DATA FOR WHAT YOU'RE BUILDING">
      <RevealOnScroll><SheetHeading title="Whatever you're building, here's the data it needs" lead="Raw video isn't enough. We deliver model-ready inputs — labeled, synchronized, QC'd — matched to exactly what you're training." /></RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="mt-10">
          <div className="bp-mono mb-3" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>MATCHED TO WHAT YOU'RE BUILDING</div>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {USE_CASES.map((u, i) => {
              const Icon = USECASE_ICONS[i] ?? Cpu;
              return (
                <motion.div key={u.segment} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--bp-cyan) 12%, transparent)" }}><Icon className="h-4.5 w-4.5" style={{ color: "var(--bp-cyan)", height: 18, width: 18 }} /></span>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--bp-ink)" }}>{u.segment}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {u.data.map((d) => (
                      <span key={d} className="bp-mono rounded-full px-2.5 py-1" style={{ fontSize: 9, color: "var(--bp-cyan)", background: "color-mix(in srgb, var(--bp-cyan) 10%, transparent)" }}>{d}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </StaggerContainer>

          <div className="mt-8">
            <Link href="/data/physical-ai" className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)" }}>
              Explore all 11 research directions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ Data ladder ════════════════════ */
export function LadderSheet() {
  return (
    <Sheet fig={DATA_LADDER.fig}>
      <RevealOnScroll><SheetHeading title={DATA_LADDER.title} lead={DATA_LADDER.lead} /></RevealOnScroll>
      <div className="mt-12 grid gap-3">
        {DATA_LADDER.rungs.map((r, i) => {
          const pc = r.phase === "Now" ? "var(--bp-cyan)" : r.phase.startsWith("Year") ? "var(--bp-amber)" : "var(--bp-purple)";
          return (
            <RevealOnScroll key={r.step} delay={i * 0.05}>
              <div className="bp-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center" style={{ marginLeft: `${i * 5}%` }}>
                <span className="bp-mono" style={{ fontSize: 12, color: "var(--bp-cyan)" }}>{r.step}</span>
                <span className="flex-1" style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{r.name}</span>
                <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-dim)" }}>{r.difficulty}</span>
                <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{r.buyers}</span>
                <span className="bp-mono rounded-full px-3 py-1" style={{ fontSize: 10, color: pc, background: `color-mix(in srgb, ${pc} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${pc} 30%, transparent)` }}>{r.phase}</span>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ════════════════════ Directions teaser + game/ego ════════════════════ */
export function DirectionsTeaser() {
  return (
    <Sheet fig={DIRECTIONS_SYNTH.fig}>
      <RevealOnScroll><SheetHeading title={DIRECTIONS_SYNTH.title} lead={DIRECTIONS_SYNTH.lead} /></RevealOnScroll>
      <RevealOnScroll delay={0.05}>
        <div className="mt-8 rounded-xl p-6 bp-card" style={{ borderColor: "var(--bp-amber)" }}>
          <div className="bp-mono mb-3" style={{ fontSize: 11, color: "var(--bp-amber)" }}>{DIRECTIONS_SYNTH.gameEgoExplainer.title}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}><span className="bp-mono" style={{ fontSize: 9, color: "var(--bp-cyan)" }}>EGO · </span>{DIRECTIONS_SYNTH.gameEgoExplainer.ego}</p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}><span className="bp-mono" style={{ fontSize: 9, color: "var(--bp-cyan)" }}>GAME · </span>{DIRECTIONS_SYNTH.gameEgoExplainer.game}</p>
          </div>
        </div>
      </RevealOnScroll>
      <StaggerContainer className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DIRECTIONS.map((d) => (
          <motion.div key={d.id} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-4">
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
        <div className="mt-8 flex flex-col items-start gap-4 rounded-xl p-6 bp-card sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--bp-cyan)" }}>
          <p style={{ fontSize: 15, color: "var(--bp-ink)" }}>{DIRECTIONS_SYNTH.sweetSpot}</p>
          <Link href="/data/physical-ai" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)" }}>
            Explore all 11 directions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ Why Tbrain (edge + proof + availability + partners) ════════════════════ */
export function WhyTbrainSheet() {
  return (
    <Sheet fig={VIETNAM_EDGE.fig}>
      <RevealOnScroll><SheetHeading title={VIETNAM_EDGE.title} lead={VIETNAM_EDGE.lead} /></RevealOnScroll>

      {/* Raw source showcase — annotated overlay temporarily removed pending re-track */}
      <div className="mt-10">
        <div className="bp-card mx-auto" style={{ padding: 0, borderRadius: 12, overflow: "hidden", maxWidth: 720 }}>
          <div className="bp-mono flex items-center justify-between" style={{ padding: "9px 14px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)", letterSpacing: "0.06em" }}>
            <span>RAW SOURCE · EGOCENTRIC</span>
            <span style={{ color: "var(--bp-ink-dim)" }}>rgb.mp4 · 1920×1080 · 30 fps</span>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src="/videos/textile-raw/arrange_02.webm" poster="/images/textile-raw/arrange_02.jpg" muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", display: "block", background: "#0b1220" }} />
        </div>
      </div>

      <StaggerContainer className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {VIETNAM_EDGE.items.map((e, i) => {
          const Icon = EDGE_ICONS[i] ?? ShieldCheck;
          return (
            <motion.div key={e.k} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--bp-cyan) 12%, transparent)" }}><Icon style={{ color: "var(--bp-cyan)", height: 20, width: 20 }} /></span>
              <div className="mt-3" style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.25, color: "var(--bp-ink)" }}>{e.k}</div>
              <div className="bp-mono mt-1.5" style={{ fontSize: 9.5, lineHeight: 1.4, color: "var(--bp-ink-faint)" }}>{e.v}</div>
            </motion.div>
          );
        })}
      </StaggerContainer>

      {/* availability stats */}
      <RevealOnScroll delay={0.08}>
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl p-6 bp-card lg:grid-cols-4">
          {AVAILABILITY.capacity.stats.map((s) => (
            <div key={s.k} className="text-center">
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 34, color: "var(--bp-cyan)" }}>
                <CountUp value={s.value} suffix={s.suffix} format={(n) => n.toLocaleString()} />
              </div>
              <div className="bp-mono mt-1" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>{s.k}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ════════════════════ Beyond robotics ════════════════════ */
export function BeyondRobotics() {
  return (
    <section className="bp-grid" style={{ borderTop: "1px solid var(--bp-line)", paddingTop: 40, paddingBottom: 40 }}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-5 text-center sm:flex-row sm:text-left">
        <div>
          <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>BEYOND ROBOTICS</div>
          <p className="mt-1" style={{ fontSize: 14, color: "var(--bp-ink-dim)" }}>Tbrain also runs coding, evaluation, and RLHF / SFT data programs.</p>
        </div>
        <Link href="/services" className="bp-mono inline-flex items-center gap-2" style={{ fontSize: 12, color: "var(--bp-cyan)" }}>Explore all services <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
