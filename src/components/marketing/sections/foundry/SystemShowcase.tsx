"use client";

/**
 * SystemShowcase — the collection machine + the QC flow, made real:
 *  - SystemInAction: animated local-cluster sync + operator app + fleet monitor
 *  - QCFlowSheet: the QC pipeline with gates + what gets rejected
 *  - SensorRichness / Availability / Partners / WorldModelPitch (deep page)
 * Theme-aware (light/dark) via --bp tokens; framer-motion only (no WebGL).
 */
import { motion } from "framer-motion";
import { Mic, Camera, Activity, Hand, Compass, Languages, Clock, Box, X, Check } from "lucide-react";
import { Sheet, SheetHeading, FigLabel } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { SYSTEM, SENSORS, WORLD_MODEL, AVAILABILITY, PARTNERS, QC_FLOW, REAL_SAMPLES } from "@/lib/landing/physical-ai";
import { PipelineFlow } from "./PipelineFlow";
import { QcChip } from "./QcChip";

const SENSOR_ICONS = [Camera, Box, Activity, Mic, Hand, Compass, Languages, Clock];

/* ── Operator app mockup (device screen stays dark — it's a device) ── */
function OperatorApp() {
  const a = SYSTEM.workerApp;
  return (
    <div className="mx-auto w-full max-w-[250px]">
      <div style={{ border: "1px solid var(--bp-line-strong)", borderRadius: 22, padding: 9, background: "#0B0A1F" }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", background: "#0B0A1F" }}>
          <div className="bp-mono flex items-center justify-between px-4 py-2" style={{ fontSize: 9, color: "rgba(232,240,255,0.45)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span>{a.title}</span><span>9:41</span>
          </div>
          <div className="px-4 py-5 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="bp-blink" style={{ width: 9, height: 9, borderRadius: 99, background: "#FF5C7A" }} />
              <span className="bp-mono" style={{ fontSize: 11, color: "#FF5C7A", letterSpacing: "0.18em" }}>{a.status}</span>
            </div>
            <div className="mt-2 font-semibold" style={{ fontFamily: "var(--font-mono)", fontSize: 28, color: "#EAF0FF" }}>{a.time}</div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {a.rows.map((r) => (
              <div key={r.k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="bp-mono" style={{ fontSize: 10, color: "rgba(232,240,255,0.45)" }}>{r.k}</span>
                <span style={{ fontSize: 12, color: "#EAF0FF" }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3">
            <div className="flex-1 rounded-lg py-2.5 text-center" style={{ background: "rgba(0,229,199,0.14)", border: "1px solid #00E5C7" }}><span className="bp-mono" style={{ fontSize: 11, color: "#00E5C7" }}>START</span></div>
            <div className="flex-1 rounded-lg py-2.5 text-center" style={{ background: "rgba(255,92,122,0.12)", border: "1px solid #FF5C7A" }}><span className="bp-mono" style={{ fontSize: 11, color: "#FF5C7A" }}>STOP</span></div>
          </div>
        </div>
      </div>
      <div className="bp-mono mt-3 text-center" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>OPERATOR APP · REFERENCE SESSION</div>
    </div>
  );
}

/* ── Real captures ledger — driven by REAL_SAMPLES (single source of truth) */
function FleetMonitor() {
  const rows = REAL_SAMPLES.items.slice(0, 8);
  const pass = REAL_SAMPLES.items.filter((s) => s.qc.state === "PASS").length;
  const partial = REAL_SAMPLES.items.filter((s) => s.qc.state === "PARTIAL").length;
  const labeling = REAL_SAMPLES.items.filter((s) => s.qc.state === "LABELING").length;
  const fail = REAL_SAMPLES.items.filter((s) => s.qc.state === "FAIL_LABEL").length;
  return (
    <div className="bp-card h-full p-5">
      <div className="bp-mono flex items-center justify-between" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>
        <span>Capture ledger · live</span><span style={{ color: "var(--bp-cyan)" }}>{REAL_SAMPLES.items.length} EPISODES</span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {([["PASS", pass, "var(--bp-cyan)"], ["LABELING", labeling, "#4cb5ff"], ["PARTIAL", partial, "var(--bp-amber)"], ["FAIL LABEL", fail, "#ff5f57"]] as const).map(([k, v, c]) => (
          <div key={k} className="rounded-lg p-3 text-center" style={{ background: "var(--bp-surface-2)" }}>
            <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 24, color: c }}><CountUp value={v as number} /></div>
            <div className="bp-mono mt-0.5" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }}>{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-lg" style={{ border: "1px solid var(--bp-line)" }}>
        <div className="bp-mono grid grid-cols-[1.9fr_0.7fr_0.9fr_1.2fr] gap-2 px-3 py-1.5" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)", background: "var(--bp-surface-2)", borderBottom: "1px solid var(--bp-line)" }}>
          <span>EPISODE</span><span>FRAMES</span><span>SENSOR</span><span>QC</span>
        </div>
        {rows.map((d, i) => (
          <div key={d.skill} className="grid grid-cols-[1.9fr_0.7fr_0.9fr_1.2fr] items-center gap-2 px-3 py-2" style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--bp-line)" : undefined }}>
            <span className="bp-mono truncate" style={{ fontSize: 10, color: "var(--bp-ink-dim)" }}>{d.skill}</span>
            <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-dim)" }}>{(d.frames ?? 0).toLocaleString()}</span>
            <span className="bp-mono truncate" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{d.sensor ?? "—"}</span>
            <div className="flex items-center justify-end">
              <QcChip qc={d.qc} defect={d.defect} inline />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Local cluster sync (collection flow) ─────────────────────────── */
function ClusterSync() {
  const groups = [
    { tag: "EDGE", color: "var(--bp-purple)", items: SYSTEM.cluster.filter((c) => c.layer === "edge") },
    { tag: "FACTORY", color: "var(--bp-cyan-soft)", items: SYSTEM.cluster.filter((c) => c.layer === "factory") },
    { tag: "CLOUD", color: "var(--bp-cyan)", items: SYSTEM.cluster.filter((c) => c.layer === "cloud") },
  ];
  return (
    <div className="bp-card relative overflow-hidden p-6">
      <div className="absolute left-4 top-3 z-10"><FigLabel>COLLECTION FLOW · WiFi 6 / 5G → EDGE → CLOUD</FigLabel></div>
      <div className="mt-6 grid items-stretch gap-3 md:grid-cols-3">
        {groups.map((g, gi) => (
          <div key={g.tag} className="relative">
            <div className="bp-mono mb-2" style={{ fontSize: 9, color: g.color }}>{g.tag}</div>
            <div className="grid gap-2">
              {g.items.map((it) => (
                <div key={it.k} className="rounded-lg p-3" style={{ background: "var(--bp-surface-2)", border: "1px solid var(--bp-line)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bp-ink)" }}>{it.k}</div>
                  <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{it.v}</div>
                </div>
              ))}
            </div>
            {gi < groups.length - 1 && (
              <div className="absolute top-1/2 z-10 hidden md:block" style={{ right: -14, width: 28, height: 2, background: "var(--bp-line-strong)" }}>
                <motion.span initial={{ left: 0, opacity: 0 }} animate={{ left: [0, 24], opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: gi * 0.4 }} style={{ position: "absolute", top: -3, width: 8, height: 8, borderRadius: 99, background: "var(--bp-cyan)" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SystemInAction() {
  return (
    <Sheet fig={SYSTEM.fig}>
      <RevealOnScroll><SheetHeading title={SYSTEM.title} lead={SYSTEM.lead} /></RevealOnScroll>
      <RevealOnScroll delay={0.05}><div className="mt-10"><ClusterSync /></div></RevealOnScroll>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <RevealOnScroll><div className="bp-card flex h-full items-center justify-center p-6"><OperatorApp /></div></RevealOnScroll>
        <RevealOnScroll delay={0.1}><FleetMonitor /></RevealOnScroll>
      </div>
    </Sheet>
  );
}

/* ── QC FLOW (with gates + rejects) ───────────────────────────────── */
export function QCFlowSheet() {
  return (
    <Sheet fig={QC_FLOW.fig}>
      <RevealOnScroll><SheetHeading title={QC_FLOW.title} lead={QC_FLOW.lead} /></RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QC_FLOW.steps.map((s) => (
          <motion.div key={s.step} variants={STAGGER_ITEM} className="bp-card bp-card-hover flex h-full flex-col p-5" style={s.rejects ? { borderColor: "var(--bp-amber)" } : undefined}>
            <div className="flex items-center gap-3">
              <span className="bp-mono" style={{ fontSize: 13, color: "var(--bp-cyan)" }}>{s.step}</span>
              <span style={{ fontWeight: 700, fontSize: 15.5, color: "var(--bp-ink)" }}>{s.title}</span>
            </div>
            <p className="mt-2 flex-1" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--bp-ink-dim)" }}>{s.note}</p>
            {s.rejects && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.rejects.map((r) => (
                  <span key={r} className="bp-mono inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ fontSize: 9, color: "var(--bp-amber)", background: "color-mix(in srgb, var(--bp-amber) 12%, transparent)" }}><X className="h-2.5 w-2.5" />{r}</span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 rounded-md px-3 py-2" style={{ background: "color-mix(in srgb, var(--bp-cyan) 8%, transparent)" }}>
              <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--bp-cyan)" }} />
              <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-cyan)" }}>GATE · {s.gate}</span>
            </div>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}

/* ── Episode manifest (metadata every episode carries) ────────────── */
const MANIFEST = [
  { k: "Skill", v: "pick_up_the_cup" },
  { k: "Operator", v: "Trained · verified" },
  { k: "Sensor", v: "Stereo depth cam · 640×480 · 15 fps" },
  { k: "Environment", v: "Hanoi · Asia/Ho_Chi_Minh" },
  { k: "Streams", v: "RGB · Depth · IMU · 21-kpt hand · pose" },
  { k: "Consent / release", v: "Signed ✓" },
  { k: "Sync", v: "Hardware clock · per-frame" },
  { k: "Provenance", v: "Capture → 8-model auto-label → 8-check diag → HITL → RLDS/LeRobot" },
];

function EpisodeManifest() {
  return (
    <div className="bp-card h-full p-5">
      <div className="bp-mono flex items-center justify-between" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>
        <span>EPISODE MANIFEST · REFERENCE</span><span style={{ color: "var(--bp-cyan)" }}>pick_up_the_cup · reference session</span>
      </div>
      <p className="mt-2 mb-3" style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--bp-ink-dim)" }}>Every episode is a <strong style={{ color: "var(--bp-ink)" }}>tagged record</strong>, not just a clip — full provenance travels with the data.</p>
      <div className="grid gap-1.5">
        {MANIFEST.map((r, i) => (
          <motion.div key={r.k} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2" style={{ background: "var(--bp-surface-2)" }}>
            <span className="bp-mono shrink-0" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>{r.k}</span>
            <span className="text-right" style={{ fontSize: 11.5, color: "var(--bp-ink-dim)" }}>{r.v}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── How the foundry works (homepage: animated pipeline) ──────────── */
export function HowItWorks() {
  return (
    <Sheet fig="FIG.06 — FROM PACK TO PARQUET">
      <RevealOnScroll><SheetHeading title="From pack to parquet" lead="Field capture → offline cache → factory MinIO → cloud R2 → auto-label → HITL → LeRobot v2 parquet. Same clock domain, same schema, from the operator's belt to your training loader." /></RevealOnScroll>

      <RevealOnScroll delay={0.05}><div className="mt-10"><PipelineFlow /></div></RevealOnScroll>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <RevealOnScroll><div className="bp-card flex h-full items-center justify-center p-6"><OperatorApp /></div></RevealOnScroll>
        <RevealOnScroll delay={0.1}><EpisodeManifest /></RevealOnScroll>
      </div>
      <RevealOnScroll delay={0.05}><div className="mt-6"><FleetMonitor /></div></RevealOnScroll>
    </Sheet>
  );
}

/* ── Sensor richness (deep page) ──────────────────────────────────── */
export function SensorRichness() {
  return (
    <Sheet fig={SENSORS.fig}>
      <RevealOnScroll><SheetHeading title={SENSORS.title} lead={SENSORS.lead} /></RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SENSORS.streams.map((s, i) => {
          const Icon = SENSOR_ICONS[i] ?? Activity;
          return (
            <motion.div key={s.k} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-5">
              <Icon className="h-5 w-5" style={{ color: "var(--bp-cyan)" }} />
              <div className="mt-3" style={{ fontWeight: 700, color: "var(--bp-ink)" }}>{s.k}</div>
              <div style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", marginTop: 2 }}>{s.v}</div>
            </motion.div>
          );
        })}
      </StaggerContainer>
    </Sheet>
  );
}

/* ── World-model pitch ────────────────────────────────────────────── */
export function WorldModelPitch() {
  return (
    <Sheet fig={WORLD_MODEL.fig} axis={false}>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <RevealOnScroll>
          <div>
            <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-cyan)" }}>{WORLD_MODEL.fig}</div>
            <h2 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.08, color: "var(--bp-ink)" }}>{WORLD_MODEL.kicker}</h2>
            <p className="mt-5" style={{ fontSize: 16, lineHeight: 1.7, color: "var(--bp-ink-dim)" }}>{WORLD_MODEL.body}</p>
          </div>
        </RevealOnScroll>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2">
          {WORLD_MODEL.points.map((p) => (
            <motion.div key={p.k} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-5" style={{ borderColor: "var(--bp-cyan)" }}>
              <div style={{ fontWeight: 700, color: "var(--bp-cyan)" }}>{p.k}</div>
              <p className="mt-1.5" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{p.v}</p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </Sheet>
  );
}

/* ── Availability (deep page) ─────────────────────────────────────── */
export function Availability() {
  return (
    <Sheet fig={AVAILABILITY.fig} axis={false}>
      <RevealOnScroll><SheetHeading title={AVAILABILITY.title} lead={AVAILABILITY.lead} /></RevealOnScroll>
      <RevealOnScroll delay={0.05}>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {AVAILABILITY.capacity.stats.map((s) => (
            <div key={s.k} className="bp-card p-6 text-center">
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 40, color: "var(--bp-cyan)" }}><CountUp value={s.value} suffix={s.suffix} format={(n) => n.toLocaleString()} /></div>
              <div className="bp-mono mt-1" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{s.k}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ── Partner ecosystem (deep page) ────────────────────────────────── */
export function Partners() {
  return (
    <Sheet fig={PARTNERS.fig}>
      <RevealOnScroll><SheetHeading title={PARTNERS.title} lead={PARTNERS.lead} /></RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PARTNERS.items.map((p) => (
          <motion.div key={p.k} variants={STAGGER_ITEM} className="bp-card bp-card-hover p-5">
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--bp-ink)" }}>{p.k}</div>
            <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{p.v}</p>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}
