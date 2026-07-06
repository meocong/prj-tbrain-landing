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

/* ── Tab 1 · What we ship ── */
interface ShipModule {
  id: string;
  icon: typeof Video;
  name: string;
  sub: string;
  status: "now" | "soon" | "all";
  img: string;
  video?: string;
  detail: string;
  fields: string[];
  captures: string[];
  ships: string[];
  spec: { k: string; v: string }[];
}
const SHIP: ShipModule[] = [
  {
    id: "A", icon: Video, name: "Egocentric video", sub: "VLA · world-model", status: "now",
    img: "/images/real-captures/pick_up_the_cup-loop.jpg",
    video: "/videos/real-captures/pick_up_the_cup.webm",
    detail: "First-person capture packs worn by operators on real factory floors. Every episode ships with per-frame hand kpts + object masks + verb-noun action segments + camera SLAM trajectory, all baked into one LeRobot v2 parquet.",
    fields: [
      "observation.images.rgb · uint8[T,H,W,3]",
      "observation.images.depth · float32[T,H,W]",
      "observation.hands.left.kpts · float32[T,21,3]",
      "observation.hands.right.kpts · float32[T,21,3]",
      "observation.camera.slam · float32[T,4,4]",
      "action.verb / action.noun_id · segments[]",
    ],
    captures: ["pick_up_the_cup · 20260617T01", "iron_product · 20260626T01", "sew_hem · 20260626T02", "arrange_fabric · 20260626T01"],
    ships: ["LeRobot v2 parquet + mp4", "Rerun .rrd (9 tracks)", "Annotated burn (palette-coded)", "Per-field provenance manifest"],
    spec: [{ k: "FPS", v: "15" }, { k: "Frames / ep", v: "180–540" }, { k: "Latency", v: "≤ 48h" }, { k: "Export", v: "LeRobot v2" }],
  },
  {
    id: "B", icon: Boxes, name: "Spatial capture", sub: "RGB-D · stereo · IMU", status: "soon",
    img: "/images/modalities/spatial.jpg",
    detail: "Multi-view RGB-D + stereo + IMU rigs for spatial world-model training. Consumes the same auto-label pipeline as egocentric — hand tracker + segmenter + depth all run identically. Pilot deployments Q3 2026.",
    fields: [
      "observation.images.cam_a / cam_b · uint8[T,H,W,3]",
      "observation.images.depth_a / depth_b · float32[T,H,W]",
      "observation.imu · float32[T,6]",
      "observation.calibration.extrinsics · float32[N,4,4]",
      "observation.point_cloud · optional[T,N,3]",
    ],
    captures: ["pilot batches on request · Q3 2026"],
    ships: ["Same LeRobot v2 schema as egocentric", "Point cloud aggregation across views", "Fused depth (opt-in)"],
    spec: [{ k: "Cameras", v: "2–4" }, { k: "Depth", v: "stereo + ToF" }, { k: "Sync", v: "hardware clock" }, { k: "Status", v: "pilot" }],
  },
  {
    id: "C", icon: Grip, name: "UMI / gripper", sub: "handheld manipulation", status: "now",
    img: "/images/modalities/umi.jpg",
    detail: "UMI-compatible handheld gripper demonstrations for cross-embodiment policy transfer. Fisheye camera + gripper state + object mask. LeRobot v2 export identical to teleop — the same policy trains on both.",
    fields: [
      "observation.images.fisheye · uint8[T,H,W,3]",
      "observation.gripper.state · float32[T,2]",
      "observation.gripper.events · int32[T]",
      "observation.object.mask · uint8[T,H,W]",
      "action.dpose_6dof · float32[T,6]",
    ],
    captures: ["handheld pick + place · 12 SKUs", "insertion · peg-in-hole", "cable routing (in pilot)"],
    ships: ["LeRobot v2 parquet", "Gripper event log", "Handheld → robot embodiment mapping"],
    spec: [{ k: "FOV", v: "~155° fisheye" }, { k: "Grip DoF", v: "1" }, { k: "Export", v: "LeRobot v2" }, { k: "Latency", v: "≤ 48h" }],
  },
  {
    id: "D", icon: Cpu, name: "Teleoperation", sub: "robot-arm demos", status: "now",
    img: "/images/modalities/teleop.jpg",
    video: "/videos/deliverables/aloha-4cam.mp4",
    detail: "Bi-manual + single-arm robot teleop with per-frame joint states, gripper events, and calibrated camera intrinsics. Cross-embodiment mixable with egocentric + UMI under the same LeRobot v2 schema.",
    fields: [
      "observation.images.top / left_wrist / right_wrist · uint8[T,H,W,3]",
      "observation.joints.left / right · float32[T,7]",
      "observation.gripper.left / right · float32[T,2]",
      "action.joint_target · float32[T,14]",
      "action.gripper_target · float32[T,2]",
    ],
    captures: ["ALOHA 4-cam · pick + place", "single-arm · sorting", "bi-manual · folding"],
    ships: ["LeRobot v2 parquet · 4 synced cameras", "Joint-space + task-space actions", "RLDS bridge on request"],
    spec: [{ k: "Cameras", v: "3–4" }, { k: "Arms", v: "1–2" }, { k: "DoF total", v: "7–14 + grip" }, { k: "Export", v: "LeRobot v2 / RLDS" }],
  },
  {
    id: "E", icon: Activity, name: "Mocap / motion", sub: "humanoid · retarget · exo", status: "now",
    img: "/images/modalities/exo-mocap.jpg",
    video: "/videos/modalities/exo-mocap.webm",
    detail: "Lab-grade optical + IMU mocap for humanoid whole-body pose. Retarget-ready SMPL / SMPL-X output + raw marker trajectories. Partner-signed exocentric sessions — Sapiens dense-body serves as secondary source with topology gating.",
    fields: [
      "observation.mocap.markers · float32[T,M,3]",
      "observation.mocap.smpl_pose · float32[T,72]",
      "observation.mocap.smpl_beta · float32[T,10]",
      "observation.imu.per_segment · float32[T,S,6]",
      "observation.retarget.joint_angles · float32[T,J]",
    ],
    captures: ["walking · turning · sit-stand", "reach + grasp · overhead", "dynamic throwing (partner)"],
    ships: ["SMPL/SMPL-X pose", "Retarget config for common humanoids", "Raw marker + IMU trajectories"],
    spec: [{ k: "Cameras", v: "12+ optical" }, { k: "Markers", v: "50+" }, { k: "Body model", v: "SMPL-X" }, { k: "Retarget", v: "included" }],
  },
  {
    id: "F", icon: ShieldCheck, name: "Annotation / QA", sub: "formatting · cleanup", status: "all",
    img: "/images/modalities/qa.jpg",
    detail: "Standalone annotation service for third-party captures. We take your raw video + poses and return the same lab-standard artifact we ship on our own captures: kpts, masks, verb-noun, format conversion, 15-check QC gate.",
    fields: [
      "input · rgb.mp4 or your parquet",
      "output · LeRobot v2 or your target schema",
      "hand kpts · MANO 21-kpt",
      "object masks + tracklets",
      "action_segments · verb + noun_id (200-entry ontology)",
      "per-field provenance",
    ],
    captures: ["dataset rescue · corrupt SLAM re-fit", "format conversion · RLDS ↔ LeRobot", "partial re-annotation batches"],
    ships: ["Same 15-check QC report", "Reviewer sign-off log", "Escalation trail per capture"],
    spec: [{ k: "Volume", v: "batch · rolling" }, { k: "Turnaround", v: "≤ 48h" }, { k: "Input", v: "any format" }, { k: "Output", v: "LeRobot v2 default" }],
  },
];

/* ── Tab 2 · What you build ── */
const BUILD_ICONS: Record<string, typeof Target> = {
  "VLA / foundation-model labs": Target,
  "World-model labs": Rocket,
  "Humanoid OEMs": Users,
  "Mid-tier robotics startups": Wrench,
};

interface BuildDetail {
  recommendedModules: string[];
  typicalScope: { k: string; v: string }[];
  starterMix: string;
  timelineHours: number;
}
const BUILD_DETAILS: Record<string, BuildDetail> = {
  "VLA / foundation-model labs": {
    recommendedModules: ["A · Egocentric", "C · UMI", "D · Teleop"],
    typicalScope: [
      { k: "Batch size", v: "500–2000 episodes" },
      { k: "Task count", v: "20–80 SKUs" },
      { k: "Operators", v: "10–30" },
      { k: "Environments", v: "3–6" },
    ],
    starterMix: "70% egocentric + 20% UMI + 10% teleop · pooled under one LeRobot v2 schema · operator-split eval",
    timelineHours: 72,
  },
  "World-model labs": {
    recommendedModules: ["A · Egocentric", "B · Spatial (pilot)"],
    typicalScope: [
      { k: "Batch size", v: "50–200 hrs of video" },
      { k: "Environments", v: "5–15 diverse" },
      { k: "Action label", v: "verb-noun + gripper" },
      { k: "Cameras", v: "1–4 per session" },
    ],
    starterMix: "long-form ego video · minimal augmentation · full manifest · Rerun scene per hour",
    timelineHours: 96,
  },
  "Humanoid OEMs": {
    recommendedModules: ["E · Mocap", "D · Teleop", "A · Egocentric"],
    typicalScope: [
      { k: "Subjects", v: "8–24 demographic mix" },
      { k: "Session length", v: "30–90 min" },
      { k: "Body model", v: "SMPL-X" },
      { k: "Retarget", v: "included" },
    ],
    starterMix: "mocap primary · exo camera secondary · retarget config for target humanoid",
    timelineHours: 120,
  },
  "Mid-tier robotics startups": {
    recommendedModules: ["A · Egocentric", "D · Teleop"],
    typicalScope: [
      { k: "Batch size", v: "50–200 episodes" },
      { k: "Task count", v: "3–10 SKUs" },
      { k: "Pilot ", v: "1–2 weeks" },
      { k: "Format", v: "your schema" },
    ],
    starterMix: "cold-start pilot · 1 task · 50 episodes · reviewer sign-off report · retrain-ready in ≤48h",
    timelineHours: 48,
  },
};

/* ── Tab 3 · What to check ── */
interface CheckItem {
  key: string;
  icon: typeof Layers;
  name: string;
  lead: string;
  color: string;
  question: string;
  ourAnswer: string;
  redFlag: string;
  proof: string[];
}
const CHECK: CheckItem[] = [
  {
    key: "ontology", icon: Layers, name: "Ontology",
    lead: "200-entry industrial ontology. VLM output outside gets an ontology_missing flag — never silent.",
    color: "#4cb5ff",
    question: "Does the vendor define a canonical noun_id list, and what happens to nouns outside it?",
    ourAnswer: "200-entry industrial ontology maps every verb-noun to a canonical noun_id. Anything outside surfaces as ontology_missing in the manifest — the buyer decides: extend the ontology or drop the capture.",
    redFlag: "Vendor emits free-form nouns without an ID mapping · every dataset diverges silently.",
    proof: ["ontology.json shipped with every batch", "ontology_missing count in summary.json", "diffable across schema bumps"],
  },
  {
    key: "taxonomy", icon: Boxes, name: "Modality taxonomy",
    lead: "Egocentric · exocentric · UMI · ALOHA · mobile-manip · OpenX · PushT · sim-teleop · exo-mocap. Ten slots.",
    color: "#00e5c7",
    question: "How is each capture tagged so downstream filters can select cleanly?",
    ourAnswer: "Every capture declares its modality slot + sensor stack + operator kind + environment in the manifest. Ten slots covered · no fuzzy 'demo' catch-all.",
    redFlag: "Vendor mixes ego + teleop under one 'video' label · your dataloader can't split them.",
    proof: ["capture.modality field required", "10 canonical slots enumerated", "declared upstream of any export"],
  },
  {
    key: "sampling", icon: Filter, name: "Sampling",
    lead: "Diversity over volume. Reject a capture that adds nothing to the operator × task × environment × verb grid.",
    color: "#a78bfa",
    question: "How do they avoid shipping 200 identical episodes for hour count?",
    ourAnswer: "Every capture computes a coverage delta against the operator × task × environment × verb grid. Delta ≈ 0 → reject before auto-label runs. We chase distribution coverage, not raw hours.",
    redFlag: "Vendor sells 'hours' as the primary metric · no per-capture diversity report.",
    proof: ["coverage delta per capture", "reject log with reason codes", "distribution grid published per batch"],
  },
  {
    key: "splits", icon: GitBranch, name: "Splits",
    lead: "Train/val/test cut on operator AND environment. Random splits over-predict generalization.",
    color: "#ff9a4d",
    question: "How are train/val/test cut? Random splits inflate your eval numbers.",
    ourAnswer: "Splits cut on operator AND environment axes. Model trained on operator A + factory X is eval'd on operator B + factory Y — the only split that predicts field generalization.",
    redFlag: "Vendor ships random splits · your ship-day eval is 20+ pts optimistic.",
    proof: ["operator × environment matrix in splits.json", "held-out operator + held-out environment", "reproducible seed"],
  },
  {
    key: "provenance", icon: Fingerprint, name: "Provenance",
    lead: "Every field records the model + version + git SHA. Reruns produce diffable updates, no silent overwrites.",
    color: "#5ee08a",
    question: "Can you diff yesterday's dataset against today's, field by field?",
    ourAnswer: "Every field in the manifest records the model + version + git SHA that produced it. A re-run with a newer model produces a new manifest; the diff is machine-readable. No silent overwrites, no black-box updates.",
    redFlag: "Vendor emits labels only · you can't tell why frame N changed.",
    proof: ["per-field provenance in manifest", "git SHA pinned per model", "diffable across reruns"],
  },
  {
    key: "versioning", icon: ScaleIcon, name: "Versioning",
    lead: "schema_version pinned per capture. Bumps ship as additive, backward-compatible migrations.",
    color: "#f0a2ff",
    question: "What happens when the vendor bumps their schema mid-program?",
    ourAnswer: "Every capture ships with schema_version + a global capture_id (task__operator__timestamp). Downstream can pin. When we bump schema we ship a migration diff — additive, backward-compatible.",
    redFlag: "Breaking schema bumps land silently · dataloader breaks after a re-pull.",
    proof: ["schema_version required", "capture_id namespaced globally", "additive migrations only"],
  },
  {
    key: "augmentation", icon: Sparkles, name: "Augmentation",
    lead: "We ship raw. No synthetic frames, no color-jitter baked in, no cropped versions. Consumers own augmentation.",
    color: "#4cb5ff",
    question: "Is what you receive raw, or has the vendor pre-augmented?",
    ourAnswer: "We ship raw + minimal-augment. No synthetic frames, no color-jitter baked in, no cropped versions in the ship contract. Consumers own augmentation. If it isn't real, it isn't in the ship.",
    redFlag: "Vendor pre-crops / pre-jitters · you can't run your own aug pipeline honestly.",
    proof: ["raw video + raw sensor streams", "augment = consumer's job", "no synthetic frames"],
  },
  {
    key: "safety", icon: ShieldCheck, name: "Consent + safety",
    lead: "Per-task consent. Face + brand + workspace blur before delivery. Any consent failure quarantines.",
    color: "#00e5c7",
    question: "Whose face is on your training data?",
    ourAnswer: "Every operator signs consent per task. Face-blur + brand-blur + workspace-blur pipelines run before delivery. Any capture that fails consent spot-check is quarantined — buyers get a clean parquet with a documented provenance chain.",
    redFlag: "Vendor cannot produce consent per operator × task · legal exposure.",
    proof: ["per-task consent forms", "auto-blur pipeline", "3-step spot-check log"],
  },
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
  return (
    <div className="lg:sticky lg:top-32 self-start">
      <AnimatePresence mode="wait">
        {tab === "ship" && <ShipDetail key={`ship-${selection.ship}`} id={selection.ship} />}
        {tab === "build" && <BuildDetail key={`build-${selection.build}`} segment={selection.build} />}
        {tab === "check" && <CheckDetail key={`check-${selection.check}`} keyId={selection.check} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Shared card wrapper ─── */
function PanelCard({ accent, children, eyebrow }: { accent: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
      className="bp-card"
      style={{ padding: 22, borderRadius: 14, borderColor: accent, boxShadow: `0 0 0 1px color-mix(in srgb, ${accent} 40%, transparent)` }}
    >
      <div className="bp-mono" style={{ fontSize: 10, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
        {eyebrow}
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Ship module detail ─── */
function ShipDetail({ id }: { id: string }) {
  const m = SHIP.find((s) => s.id === id)!;
  const accent = "#4cb5ff";
  return (
    <PanelCard accent={accent} eyebrow={`Module ${m.id} · ${m.status.toUpperCase()}`}>
      {/* Media */}
      <div className="mt-3 relative overflow-hidden" style={{ aspectRatio: "16 / 10", borderRadius: 10, background: "#050a12" }}>
        {m.video ? (
          <video src={m.video} poster={m.img} muted loop autoPlay playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.img} alt={m.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(5,10,18,0.55), transparent 55%)" }} />
        <div className="absolute bottom-2 left-2">
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{m.name}</div>
          <div className="bp-mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>{m.sub}</div>
        </div>
      </div>

      <p className="mt-4" style={{ fontSize: 13.5, color: "var(--bp-ink-dim)", lineHeight: 1.6 }}>{m.detail}</p>

      {/* Spec chips */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {m.spec.map((s) => (
          <div key={s.k} className="bp-mono" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--bp-surface-2)" }}>
            <div style={{ fontSize: 9, color: "var(--bp-ink-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.k}</div>
            <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginTop: 2 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* LeRobot v2 fields */}
      <div className="mt-5">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>LeRobot v2 fields · per episode</div>
        <div className="mt-2 rounded-lg bp-mono" style={{ background: "#050a12", padding: "10px 12px", border: `1px solid color-mix(in srgb, ${accent} 26%, transparent)`, fontSize: 10.5, color: "#c8d3f0", lineHeight: 1.7 }}>
          {m.fields.map((f) => (
            <div key={f} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ color: accent, marginRight: 6 }}>·</span>{f}
            </div>
          ))}
        </div>
      </div>

      {/* Sample captures */}
      <div className="mt-5">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sample captures</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {m.captures.map((c) => (
            <span key={c} className="bp-mono" style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 999, background: "color-mix(in srgb, #4cb5ff 12%, transparent)", color: accent }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Ships list */}
      <div className="mt-5">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>You receive</div>
        <ul className="mt-2 space-y-1.5">
          {m.ships.map((s) => (
            <li key={s} className="flex items-start gap-2" style={{ fontSize: 12.5, color: "var(--bp-ink)" }}>
              <span style={{ color: accent, marginTop: 2 }}>✓</span> {s}
            </li>
          ))}
        </ul>
      </div>
    </PanelCard>
  );
}

/* ─── Build segment detail ─── */
function BuildDetail({ segment }: { segment: string }) {
  const u = USE_CASES.find((x) => x.segment === segment)!;
  const b = BUILD_DETAILS[segment];
  const accent = "#a78bfa";
  return (
    <PanelCard accent={accent} eyebrow="Segment detail">
      <h3 className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--bp-ink)", lineHeight: 1.15 }}>{u.segment}</h3>
      <div className="bp-mono mt-1" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>{u.who}</div>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>What you're solving</div>
        <p className="mt-1.5" style={{ fontSize: 13, color: "var(--bp-ink-dim)", lineHeight: 1.6 }}>{u.need}</p>
      </div>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>How we deliver</div>
        <p className="mt-1.5" style={{ fontSize: 13, color: "var(--bp-ink-dim)", lineHeight: 1.6 }}>{u.deliver}</p>
      </div>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recommended modules</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {b.recommendedModules.map((m) => (
            <span key={m} className="bp-mono" style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent, fontWeight: 700 }}>{m}</span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Typical scope</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {b.typicalScope.map((s) => (
            <div key={s.k} className="bp-mono" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--bp-surface-2)" }}>
              <div style={{ fontSize: 9, color: "var(--bp-ink-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.k}</div>
              <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Starter mix</div>
        <div className="mt-1.5 rounded-lg" style={{ padding: "10px 12px", background: `color-mix(in srgb, ${accent} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`, fontSize: 12.5, color: "var(--bp-ink)", lineHeight: 1.55 }}>
          {b.starterMix}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>
        <span>Pilot timeline</span>
        <span style={{ color: accent, fontWeight: 700 }}>≈ {b.timelineHours}h · raw → shipped</span>
      </div>
    </PanelCard>
  );
}

/* ─── Check invariant detail ─── */
function CheckDetail({ keyId }: { keyId: string }) {
  const c = CHECK.find((x) => x.key === keyId)!;
  return (
    <PanelCard accent={c.color} eyebrow="Invariant to ask before you buy">
      <h3 className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--bp-ink)", lineHeight: 1.15 }}>{c.name}</h3>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>The question</div>
        <p className="mt-1.5" style={{ fontSize: 13.5, color: "var(--bp-ink)", lineHeight: 1.55, fontStyle: "italic" }}>&ldquo;{c.question}&rdquo;</p>
      </div>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: c.color, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Our answer</div>
        <p className="mt-1.5" style={{ fontSize: 13, color: "var(--bp-ink-dim)", lineHeight: 1.6 }}>{c.ourAnswer}</p>
      </div>

      <div className="mt-4 rounded-lg" style={{ padding: "10px 12px", background: "color-mix(in srgb, #ff5f57 8%, transparent)", border: "1px solid color-mix(in srgb, #ff5f57 30%, transparent)" }}>
        <div className="bp-mono" style={{ fontSize: 10, color: "#ff5f57", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Red flag on a vendor</div>
        <p className="mt-1" style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", lineHeight: 1.55 }}>{c.redFlag}</p>
      </div>

      <div className="mt-4">
        <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Proof we ship</div>
        <ul className="mt-2 space-y-1.5">
          {c.proof.map((p) => (
            <li key={p} className="flex items-start gap-2" style={{ fontSize: 12.5, color: "var(--bp-ink)" }}>
              <span style={{ color: c.color, marginTop: 2 }}>✓</span> {p}
            </li>
          ))}
        </ul>
      </div>
    </PanelCard>
  );
}
