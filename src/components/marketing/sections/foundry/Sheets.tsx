"use client";

import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Sheet, SheetHeading, FigLabel, Annotation } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { PackDiagram } from "./PackDiagram";
import { motion } from "framer-motion";
import {
  PROBLEM, COLLECTION_PACK, WORLD_MODEL_INPUTS, REAL_SAMPLES, DATA_LADDER,
  DIRECTIONS, DIRECTIONS_SYNTH, VIETNAM_EDGE, PROOF_POINTS, AVAILABILITY, PARTNERS,
} from "@/lib/landing/physical-ai";

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
  return (
    <Sheet fig={REAL_SAMPLES.fig} axis={false}>
      <RevealOnScroll><SheetHeading title={REAL_SAMPLES.title} lead={REAL_SAMPLES.lead} /></RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REAL_SAMPLES.items.map((s) => (
          <motion.div key={s.name} variants={STAGGER_ITEM} className="bp-card bp-card-hover overflow-hidden">
            <div style={{ aspectRatio: "16 / 10", background: "var(--bp-surface-2)", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt={s.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="p-4">
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bp-ink)" }}>{s.name}</div>
              <div className="bp-mono mt-1" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>{s.note}</div>
            </div>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}

/* ════════════════════ Data ladder + pricing completeness ════════════════════ */
const LEVELS = [
  { lvl: "RAW", desc: "Unprocessed video / episode from the field." },
  { lvl: "+ SENSOR", desc: "Synced, calibrated, standardized multi-sensor." },
  { lvl: "+ LABEL", desc: "Language, success/fail, segmentation." },
  { lvl: "+ VERIFIED", desc: "AI-filtered, 3-layer QA'd, RLDS/LeRobot." },
];

export function LadderSheet() {
  return (
    <Sheet fig={DATA_LADDER.fig}>
      <RevealOnScroll><SheetHeading title={DATA_LADDER.title} lead={DATA_LADDER.lead} /></RevealOnScroll>
      <div className="mt-12 grid gap-3">
        {DATA_LADDER.rungs.map((r, i) => (
          <RevealOnScroll key={r.step} delay={i * 0.05}>
            <div className="bp-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center" style={{ marginLeft: `${i * 5}%` }}>
              <span className="bp-mono" style={{ fontSize: 12, color: "var(--bp-cyan)" }}>{r.step}</span>
              <span className="flex-1" style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{r.name}</span>
              <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-dim)" }}>{r.difficulty}</span>
              <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{r.buyers}</span>
              <span className="bp-mono rounded-full px-3 py-1" style={{ fontSize: 10, color: "var(--bp-cyan)", background: "color-mix(in srgb, var(--bp-cyan) 12%, transparent)" }}>{r.phase}</span>
            </div>
          </RevealOnScroll>
        ))}
      </div>
      <RevealOnScroll delay={0.1}>
        <div className="mt-8">
          <div className="bp-mono mb-3" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>PRICING BY COMPLETENESS — buy the level you need</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((l, i) => (
              <div key={l.lvl} className="bp-card p-4" style={{ borderColor: i === LEVELS.length - 1 ? "var(--bp-cyan)" : undefined }}>
                <div className="bp-mono" style={{ fontSize: 12, color: i === LEVELS.length - 1 ? "var(--bp-cyan)" : "var(--bp-ink)" }}>{l.lvl}</div>
                <p className="mt-1.5" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--bp-ink-dim)" }}>{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>
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

      <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VIETNAM_EDGE.items.map((e) => (
          <motion.div key={e.k} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-5">
            <div style={{ fontWeight: 700, color: "var(--bp-cyan)" }}>{e.k}</div>
            <p className="mt-1.5" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--bp-ink-dim)" }}>{e.v}</p>
          </motion.div>
        ))}
      </StaggerContainer>

      {/* availability stats */}
      <RevealOnScroll delay={0.08}>
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl p-6 bp-card lg:grid-cols-4">
          {AVAILABILITY.stats.map((s) => (
            <div key={s.k} className="text-center">
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 34, color: "var(--bp-cyan)" }}>
                <CountUp value={s.value} suffix={s.suffix} format={(n) => n.toLocaleString()} />
              </div>
              <div className="bp-mono mt-1" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>{s.k}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      {/* proof points */}
      <RevealOnScroll delay={0.12}>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF_POINTS.map((p) => (
            <div key={p.claim} className="bp-card p-5 text-center">
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 24, color: "var(--bp-ink)" }}>{p.stat}</div>
              <div style={{ fontSize: 12, color: "var(--bp-ink-dim)", marginTop: 4 }}>{p.claim}</div>
              <div className="bp-mono mt-2" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{p.src}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      {/* partner ecosystem (condensed) */}
      <RevealOnScroll delay={0.16}>
        <div className="mt-6 rounded-xl p-6 bp-card">
          <div className="bp-mono mb-3" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{PARTNERS.title} — {PARTNERS.lead}</div>
          <div className="flex flex-wrap gap-2">
            {PARTNERS.items.map((p) => (
              <span key={p.k} className="bp-mono rounded-full px-3 py-1.5" style={{ fontSize: 10, color: "var(--bp-ink-dim)", border: "1px solid var(--bp-line)" }}>{p.k}</span>
            ))}
          </div>
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
