"use client";

/**
 * SystemShowcase — makes the collection machine feel real:
 *  - SystemInAction: animated local-cluster sync + operator-app mockup + fleet monitor
 *  - SensorRichness: the 8 synchronized streams per episode
 *  - WorldModelPitch: copy targeted at world-model teams
 *  - Availability: how much we can ship
 *  - Partners: the factory / environment partner ecosystem
 *
 * Pure CSS/SVG + framer-motion (no extra WebGL canvas) to stay light.
 */
import { motion } from "framer-motion";
import { Mic, Camera, Activity, Hand, Compass, Languages, Clock, Box } from "lucide-react";
import { Sheet, SheetHeading, FigLabel } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { SYSTEM, SENSORS, WORLD_MODEL, AVAILABILITY, PARTNERS } from "@/lib/landing/physical-ai";

const panel: React.CSSProperties = {
  background: "rgba(20,18,46,0.6)",
  border: "1px solid var(--bp-line-strong)",
  borderRadius: 12,
  backdropFilter: "blur(4px)",
};

const SENSOR_ICONS = [Camera, Box, Activity, Mic, Hand, Compass, Languages, Clock];

/* ── Operator app mockup ──────────────────────────────────────────── */
function OperatorApp() {
  const a = SYSTEM.workerApp;
  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div style={{ border: "1px solid var(--bp-line-strong)", borderRadius: 22, padding: 10, background: "rgba(11,10,31,0.85)" }}>
        <div style={{ border: "1px solid var(--bp-line)", borderRadius: 14, overflow: "hidden", background: "#0B0A1F" }}>
          {/* status bar */}
          <div className="bp-mono flex items-center justify-between px-4 py-2" style={{ fontSize: 9, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
            <span>{a.title}</span><span>9:41</span>
          </div>
          {/* recording */}
          <div className="px-4 py-5 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="bp-anim-blink" style={{ width: 9, height: 9, borderRadius: 99, background: "var(--bp-red)" }} />
              <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-red)", letterSpacing: "0.18em" }}>{a.status}</span>
            </div>
            <div className="mt-2 font-semibold" style={{ fontFamily: "var(--font-mono)", fontSize: 30, color: "var(--bp-ink)" }}>{a.time}</div>
          </div>
          {/* rows */}
          <div style={{ borderTop: "1px solid var(--bp-line)" }}>
            {a.rows.map((r) => (
              <div key={r.k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--bp-line)" }}>
                <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{r.k}</span>
                <span style={{ fontSize: 12, color: "var(--bp-ink)" }}>{r.v}</span>
              </div>
            ))}
          </div>
          {/* buttons */}
          <div className="flex gap-2 p-3">
            <div className="flex-1 rounded-lg py-2.5 text-center" style={{ background: "rgba(0,229,199,0.12)", border: "1px solid var(--bp-cyan)" }}>
              <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-cyan)" }}>START</span>
            </div>
            <div className="flex-1 rounded-lg py-2.5 text-center" style={{ background: "rgba(255,92,122,0.1)", border: "1px solid var(--bp-red)" }}>
              <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-red)" }}>STOP</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bp-mono mt-3 text-center" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>OPERATOR APP · ANDROID</div>
    </div>
  );
}

/* ── Supervisor fleet monitor mockup ──────────────────────────────── */
function FleetMonitor() {
  const m = SYSTEM.monitor;
  // deterministic status grid: 0 recording, 1 synced, 2 idle
  const chips = Array.from({ length: 30 }, (_, i) => (i % 7 === 6 ? 2 : i % 3 === 2 ? 1 : 0));
  const dot = (s: number) => (s === 0 ? "var(--bp-cyan)" : s === 1 ? "var(--bp-purple)" : "var(--bp-ink-faint)");
  return (
    <div style={panel} className="h-full p-5">
      <div className="bp-mono flex items-center justify-between" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>
        <span>{m.title} · Fleet overview</span><span style={{ color: "var(--bp-cyan)" }}>{m.fleet} WORKERS</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[["Recording", m.recording, "var(--bp-cyan)"], ["Synced", m.synced, "var(--bp-purple)"], ["Idle", m.idle, "var(--bp-ink-faint)"]].map(([k, v, c]) => (
          <div key={k as string} className="rounded-lg p-3 text-center" style={{ background: "rgba(11,10,31,0.6)" }}>
            <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 24, color: c as string }}>
              <CountUp value={v as number} />
            </div>
            <div className="bp-mono mt-0.5" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }}>{k as string}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-10 gap-1.5">
        {chips.map((s, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.4 }}
            animate={s === 0 ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.8 }}
            transition={s === 0 ? { duration: 1.6, repeat: Infinity, delay: (i % 10) * 0.1 } : {}}
            style={{ height: 14, borderRadius: 3, background: dot(s), opacity: 0.7 }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(11,10,31,0.6)" }}>
        <span className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>WORKER-018 · EP-0142</span>
        <span className="bp-mono" style={{ fontSize: 9, color: "var(--bp-cyan)" }}>● REC · 180GB FREE</span>
      </div>
    </div>
  );
}

/* ── Local cluster sync diagram (animated) ────────────────────────── */
function ClusterSync() {
  const groups = [
    { tag: "EDGE", color: "var(--bp-purple)", items: SYSTEM.cluster.filter((c) => c.layer === "edge") },
    { tag: "FACTORY", color: "var(--bp-cyan-soft)", items: SYSTEM.cluster.filter((c) => c.layer === "factory") },
    { tag: "CLOUD", color: "var(--bp-cyan)", items: SYSTEM.cluster.filter((c) => c.layer === "cloud") },
  ];
  return (
    <div style={panel} className="relative overflow-hidden p-6">
      <div className="absolute left-4 top-3 z-10"><FigLabel>SYNC · WiFi 6 / 5G → EDGE → CLOUD</FigLabel></div>
      <div className="mt-6 grid items-stretch gap-3 md:grid-cols-3">
        {groups.map((g, gi) => (
          <div key={g.tag} className="relative">
            <div className="bp-mono mb-2" style={{ fontSize: 9, color: g.color }}>{g.tag}</div>
            <div className="grid gap-2">
              {g.items.map((it) => (
                <div key={it.k} className="rounded-lg p-3" style={{ background: "rgba(11,10,31,0.55)", border: "1px solid var(--bp-line)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bp-ink)" }}>{it.k}</div>
                  <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{it.v}</div>
                </div>
              ))}
            </div>
            {/* connector with flowing dot */}
            {gi < groups.length - 1 && (
              <div className="absolute top-1/2 z-10 hidden md:block" style={{ right: -14, width: 28, height: 2, background: "var(--bp-line-strong)" }}>
                <motion.span
                  initial={{ left: 0, opacity: 0 }}
                  animate={{ left: [0, 24], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: gi * 0.4 }}
                  style={{ position: "absolute", top: -3, width: 8, height: 8, borderRadius: 99, background: "var(--bp-cyan)", boxShadow: "0 0 10px var(--bp-cyan)" }}
                />
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
      <RevealOnScroll>
        <SheetHeading title={SYSTEM.title} lead={SYSTEM.lead} />
      </RevealOnScroll>
      <RevealOnScroll delay={0.05}>
        <div className="mt-10"><ClusterSync /></div>
      </RevealOnScroll>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <RevealOnScroll>
          <div style={panel} className="flex h-full items-center justify-center p-6"><OperatorApp /></div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}><FleetMonitor /></RevealOnScroll>
      </div>
    </Sheet>
  );
}

/* ── Sensor richness ──────────────────────────────────────────────── */
export function SensorRichness() {
  return (
    <Sheet fig={SENSORS.fig}>
      <RevealOnScroll>
        <SheetHeading title={SENSORS.title} lead={SENSORS.lead} />
      </RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SENSORS.streams.map((s, i) => {
          const Icon = SENSOR_ICONS[i] ?? Activity;
          return (
            <motion.div key={s.k} variants={STAGGER_ITEM} style={panel} className="bp-card p-5">
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
            <motion.div key={p.k} variants={STAGGER_ITEM} style={{ ...panel, borderColor: "var(--bp-cyan)" }} className="bp-card p-5">
              <div style={{ fontWeight: 700, color: "var(--bp-cyan)" }}>{p.k}</div>
              <p className="mt-1.5" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{p.v}</p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </Sheet>
  );
}

/* ── Availability ─────────────────────────────────────────────────── */
export function Availability() {
  return (
    <Sheet fig={AVAILABILITY.fig} axis={false}>
      <RevealOnScroll>
        <SheetHeading title={AVAILABILITY.title} lead={AVAILABILITY.lead} />
      </RevealOnScroll>
      <RevealOnScroll delay={0.05}>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {AVAILABILITY.stats.map((s) => (
            <div key={s.k} style={panel} className="bp-card p-6 text-center">
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 40, color: "var(--bp-cyan)" }}>
                <CountUp value={s.value} suffix={s.suffix} format={(n) => n.toLocaleString()} />
              </div>
              <div className="bp-mono mt-1" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{s.k}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}

/* ── Partner ecosystem ────────────────────────────────────────────── */
export function Partners() {
  return (
    <Sheet fig={PARTNERS.fig}>
      <RevealOnScroll>
        <SheetHeading title={PARTNERS.title} lead={PARTNERS.lead} />
      </RevealOnScroll>
      <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PARTNERS.items.map((p) => (
          <motion.div key={p.k} variants={STAGGER_ITEM} style={panel} className="bp-card p-5">
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--bp-ink)" }}>{p.k}</div>
            <p className="mt-2" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{p.v}</p>
          </motion.div>
        ))}
      </StaggerContainer>
    </Sheet>
  );
}
