"use client";

/**
 * BuyerLens — merged section: What we ship / What you build / What to check.
 * Single Sheet · 3-tab sticky bar · click any card → in-place right-side detail
 * panel. Replaces the 3 duplicative landing sections (Catalog + DataConcepts +
 * DataForWhatYouBuild).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Boxes, Grip, Cpu, Activity, ShieldCheck, Layers, GitBranch, Filter, Fingerprint, Sparkles, ScaleIcon, Target, Rocket, Users, Wrench } from "lucide-react";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { USE_CASES } from "@/lib/landing/physical-ai";

/* ── Tab 1 · What we ship (from DeckSections MODULES) ── */
const SHIP = [
  { id: "A", icon: Video,       name: "Egocentric video",  sub: "VLA · world-model",           status: "now",     img: "/images/real-captures/pick_up_the_cup-loop.jpg", detail: "First-person capture packs worn by operators. Every episode ships with hand kpts + object masks + verb-noun + camera SLAM in a LeRobot v2 parquet." },
  { id: "B", icon: Boxes,       name: "Spatial capture",    sub: "RGB-D · stereo · IMU",         status: "soon",    img: "/images/modalities/spatial.jpg",                  detail: "Multi-view RGB-D + stereo + IMU rigs for spatial world-model training. Consumes the same pipeline as egocentric." },
  { id: "C", icon: Grip,        name: "UMI / gripper",      sub: "handheld manipulation",        status: "now",     img: "/images/modalities/umi.jpg",                       detail: "UMI-compatible handheld gripper demos. Fisheye + gripper state + object mask. LeRobot v2 export identical to teleop." },
  { id: "D", icon: Cpu,         name: "Teleoperation",      sub: "robot-arm demos",              status: "now",     img: "/images/modalities/teleop.jpg",                    detail: "Bi-manual + single-arm robot teleop with joint states, gripper events, and camera intrinsics. Cross-embodiment mixable." },
  { id: "E", icon: Activity,    name: "Mocap / motion",     sub: "humanoid · retarget · exo",    status: "now",     img: "/images/modalities/exo-mocap.jpg",                 detail: "Lab-grade optical + IMU mocap for humanoid whole-body pose. Retarget-ready. Partner-signed exocentric sessions." },
  { id: "F", icon: ShieldCheck, name: "Annotation / QA",    sub: "formatting · cleanup",         status: "all",     img: "/images/modalities/qa.jpg",                        detail: "Standalone annotation for third-party captures: kpts, masks, verb-noun, format conversion, QC to lab standard." },
];

/* ── Tab 2 · What you build (from USE_CASES) ── */
const BUILD_ICONS: Record<string, typeof Target> = {
  "VLA / foundation-model labs": Target,
  "World-model labs": Rocket,
  "Humanoid OEMs": Users,
  "Mid-tier robotics startups": Wrench,
};

/* ── Tab 3 · What to check (from DataConcepts) ── */
const CHECK = [
  { key: "ontology",    icon: Layers,      name: "Ontology",       lead: "200-entry industrial ontology. VLM output outside gets an ontology_missing flag — never silent.",           color: "#4cb5ff" },
  { key: "taxonomy",    icon: Boxes,       name: "Modality taxonomy", lead: "Egocentric · exocentric · UMI · ALOHA · mobile-manip · OpenX · PushT · sim-teleop · exo-mocap. Ten slots.", color: "#00e5c7" },
  { key: "sampling",    icon: Filter,      name: "Sampling",       lead: "Diversity over volume. Reject a capture that adds nothing to the operator × task × environment × verb grid.", color: "#a78bfa" },
  { key: "splits",      icon: GitBranch,   name: "Splits",         lead: "Train/val/test cut on operator AND environment. Random splits over-predict generalization.",                 color: "#ff9a4d" },
  { key: "provenance",  icon: Fingerprint, name: "Provenance",     lead: "Every field records the model + version + git SHA. Reruns produce diffable updates, no silent overwrites.",    color: "#5ee08a" },
  { key: "versioning",  icon: ScaleIcon,   name: "Versioning",     lead: "schema_version pinned per capture. Bumps ship as additive, backward-compatible migrations.",                  color: "#f0a2ff" },
  { key: "augmentation",icon: Sparkles,    name: "Augmentation",   lead: "We ship raw. No synthetic frames, no color-jitter baked in, no cropped versions. Consumers own augmentation.", color: "#4cb5ff" },
  { key: "safety",      icon: ShieldCheck, name: "Consent + safety", lead: "Per-task consent. Face + brand + workspace blur before delivery. Any consent failure quarantines.",         color: "#00e5c7" },
];

type TabKey = "ship" | "build" | "check";

const TABS: { key: TabKey; label: string; accent: string; count: number }[] = [
  { key: "ship",  label: "What we ship",   accent: "#4cb5ff", count: SHIP.length },
  { key: "build", label: "What you build", accent: "#a78bfa", count: USE_CASES.length },
  { key: "check", label: "What to check",  accent: "#00e5c7", count: CHECK.length },
];

export function BuyerLens() {
  const [tab, setTab] = useState<TabKey>("ship");
  const [selection, setSelection] = useState<{ ship: string; build: string; check: string }>({
    ship: SHIP[0].id,
    build: USE_CASES[0].segment,
    check: CHECK[0].key,
  });

  return (
    <Sheet id="buyer-lens" fig="FIG.08 — BUYER LENS · SHIP · BUILD · CHECK" axis>
      <SheetHeading
        title="One page, three answers"
        lead="What we ship, what you're building, what to check before you buy. Same buyer question, three lenses. Click any tile to expand its detail."
      />

      {/* Tab bar */}
      <div className="mt-8 sticky top-16 z-20 flex flex-wrap gap-2 bp-mono" style={{ paddingBottom: 8 }}>
        {TABS.map((t) => {
          const activeTab = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                fontSize: 11,
                padding: "10px 16px",
                borderRadius: 8,
                border: activeTab ? `1px solid ${t.accent}` : "1px solid var(--bp-line-strong)",
                background: activeTab ? `color-mix(in srgb, ${t.accent} 14%, transparent)` : "transparent",
                color: activeTab ? t.accent : "var(--bp-ink)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {t.label}
              <span style={{ fontSize: 9.5, opacity: 0.7, padding: "1px 6px", borderRadius: 999, background: activeTab ? "rgba(255,255,255,0.08)" : "var(--bp-surface-2)" }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Body · grid + detail panel */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          {tab === "ship" && (
            <ShipGrid selected={selection.ship} onSelect={(id) => setSelection((s) => ({ ...s, ship: id }))} />
          )}
          {tab === "build" && (
            <BuildGrid selected={selection.build} onSelect={(id) => setSelection((s) => ({ ...s, build: id }))} />
          )}
          {tab === "check" && (
            <CheckGrid selected={selection.check} onSelect={(id) => setSelection((s) => ({ ...s, check: id }))} />
          )}
        </div>
        <DetailPanel tab={tab} selection={selection} />
      </div>
    </Sheet>
  );
}

/* ─── Ship grid ─── */
function ShipGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SHIP.map((m) => {
        const Icon = m.icon;
        const on = m.id === selected;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="bp-card group text-left overflow-hidden"
            style={{ padding: 0, borderColor: on ? "#4cb5ff" : "var(--bp-line)", boxShadow: on ? "0 0 0 1px #4cb5ff, 0 12px 32px -18px rgba(76,181,255,0.5)" : undefined, cursor: "pointer" }}
          >
            <div className="relative" style={{ aspectRatio: "16 / 10", overflow: "hidden", background: "var(--bp-surface-2)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.img} alt={m.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,5,12,0.9), rgba(5,5,12,0.1) 60%, transparent)" }} />
              <div className="absolute left-2 top-2 flex items-center gap-1.5 bp-mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.5)", color: "#fff" }}>
                <Icon className="h-3 w-3" /> Module {m.id}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: "#fff", fontWeight: 600 }}>{m.name}</div>
                  <div className="bp-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{m.sub}</div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Build grid ─── */
function BuildGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {USE_CASES.map((u) => {
        const Icon = BUILD_ICONS[u.segment] ?? Target;
        const on = u.segment === selected;
        return (
          <button
            key={u.segment}
            onClick={() => onSelect(u.segment)}
            className="bp-card text-left"
            style={{ padding: 18, borderRadius: 12, borderColor: on ? "#a78bfa" : "var(--bp-line)", boxShadow: on ? "0 0 0 1px #a78bfa, 0 12px 32px -18px rgba(167,139,250,0.5)" : undefined, cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "color-mix(in srgb, #a78bfa 18%, transparent)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon className="h-4 w-4" style={{ color: "#a78bfa" }} />
              </span>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: "var(--bp-ink)", fontWeight: 600 }}>{u.segment}</div>
            </div>
            <p className="mt-3" style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{u.who}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {u.data.slice(0, 3).map((d) => (
                <span key={d} className="bp-mono" style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 999, background: "color-mix(in srgb, #a78bfa 12%, transparent)", color: "#a78bfa" }}>{d}</span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Check grid ─── */
function CheckGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {CHECK.map((c) => {
        const Icon = c.icon;
        const on = c.key === selected;
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            className="bp-card text-left"
            style={{ padding: 14, borderRadius: 10, borderColor: on ? c.color : "var(--bp-line)", boxShadow: on ? `0 0 0 1px ${c.color}, 0 12px 32px -18px ${c.color}55` : undefined, cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, background: `color-mix(in srgb, ${c.color} 18%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon className="h-3.5 w-3.5" style={{ color: c.color }} />
              </span>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 13.5, color: "var(--bp-ink)", fontWeight: 600 }}>{c.name}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Detail panel ─── */
function DetailPanel({ tab, selection }: { tab: TabKey; selection: { ship: string; build: string; check: string } }) {
  let content: { title: string; body: string; meta?: { k: string; v: string }[]; color: string; sub?: string } | null = null;

  if (tab === "ship") {
    const m = SHIP.find((s) => s.id === selection.ship)!;
    content = {
      title: m.name,
      sub: m.sub,
      body: m.detail,
      color: "#4cb5ff",
      meta: [
        { k: "Module", v: m.id },
        { k: "Status", v: m.status },
        { k: "Export", v: "LeRobot v2" },
        { k: "Latency", v: "≤ 48h" },
      ],
    };
  } else if (tab === "build") {
    const u = USE_CASES.find((x) => x.segment === selection.build)!;
    content = {
      title: u.segment,
      sub: u.who,
      body: `${u.need} ${u.deliver}`,
      color: "#a78bfa",
      meta: u.data.slice(0, 4).map((d) => ({ k: "signal", v: d })),
    };
  } else {
    const c = CHECK.find((x) => x.key === selection.check)!;
    content = {
      title: c.name,
      sub: "invariant to ask before you buy",
      body: c.lead,
      color: c.color,
    };
  }

  return (
    <div className="lg:sticky lg:top-32 self-start">
      <AnimatePresence mode="wait">
        {content && (
          <motion.div
            key={`${tab}-${selection.ship}-${selection.build}-${selection.check}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="bp-card"
            style={{ padding: 24, borderRadius: 14, borderColor: content.color, boxShadow: `0 0 0 1px color-mix(in srgb, ${content.color} 40%, transparent)` }}
          >
            <div className="bp-mono" style={{ fontSize: 10, color: content.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              {tab === "ship" ? "MODULE DETAIL" : tab === "build" ? "SEGMENT DETAIL" : "INVARIANT DETAIL"}
            </div>
            <h3 className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--bp-ink)", lineHeight: 1.15 }}>{content.title}</h3>
            {content.sub && (
              <div className="bp-mono mt-1" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>{content.sub}</div>
            )}
            <p className="mt-4" style={{ fontSize: 13.5, color: "var(--bp-ink-dim)", lineHeight: 1.6 }}>{content.body}</p>
            {content.meta && content.meta.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {content.meta.map((m, i) => (
                  <div key={`${m.k}-${i}`} className="bp-mono" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--bp-surface-2)" }}>
                    <div style={{ fontSize: 9.5, color: "var(--bp-ink-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.k}</div>
                    <div style={{ fontSize: 12.5, color: "var(--bp-ink)", fontWeight: 700, marginTop: 2 }}>{m.v}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
