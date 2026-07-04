/**
 * Physical AI / "Robotics Data Foundry" content model.
 *
 * Single source of truth for the repositioned homepage + /data/physical-ai.
 * Public-safe: NO named anchor customers, NO internal cost figures, NO target
 * list. Anchor proof is anonymized ("frontier labs"); proof points are
 * published research stats only.
 *
 * The capture pack is Tbrain's own purpose-built hardware + pipeline (NOT an
 * off-the-shelf kit). Source research: tbrain-robotics-research/research/*,
 * and the Tbrain Capture System spec.
 */

/* ────────────────────────────────────────────────────────────────────
   Hero
   ──────────────────────────────────────────────────────────────────── */
export const FOUNDRY_HERO = {
  fig: "FIG.01 — TBRAIN CAPTURE PACK · MK-001 · REV A",
  eyebrow: "Industrial data · real production environments · not scraped, not simulated.",
  title: "The Robotics Data Foundry for Physical AI",
  sub: "Real capture packs, worn by operators on the factory floor — egocentric, action-paired, deeply annotated. Sourced through an expansive industrial network (not only Vietnam) across multiple production sites, QC'd, and delivered RLDS-ready.",
  ctaPrimary: { label: "See a sample dataset", href: "/contact" },
  ctaSecondary: { label: "How the foundry works", href: "/data/physical-ai" },
  trust: "Industrial network · real production · LeRobot / RLDS · ≤48h delivery",
} as const;

export const ANCHOR_TRUST = {
  headline: "Industrial data · real production environments · at network scale",
  // Anonymized — do not name the labs publicly.
  labs: "Sourced through an expansive industrial network (not only Vietnam) — factories, workshops, assembly lines",
  standards: [
    { name: "Industrial", detail: "Real factory floors · not staged" },
    { name: "Multi-site", detail: "Textile · kitchen · electronics roadmap" },
    { name: "LeRobot / RLDS", detail: "Ready for the training loop" },
    { name: "≤ 48h", detail: "Raw → QC'd → delivered" },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   The problem
   ──────────────────────────────────────────────────────────────────── */
/* Hero cross-fade — ops-team specified 3 clips, 10s each.
   Placeholder paths point at ops-content pipeline output; component falls back
   to worker-hero.mp4 if these are not yet on disk. */
export const HERO_MIX = {
  clips: [
    { src: "/videos/hero-mix/5.webm", mp4: "/videos/hero-mix/5.mp4", poster: "/videos/hero-mix/5.jpg", label: "Egocentric · GoPro rig · folding shorts", source: "in-house" },
    { src: "/videos/hero-mix/1.webm", mp4: "/videos/hero-mix/1.mp4", poster: "/videos/hero-mix/1.jpg", label: "Real production · textile factory", source: "in-house" },
    { src: "/videos/hero-mix/2.webm", mp4: "/videos/hero-mix/2.mp4", poster: "/videos/hero-mix/2.jpg", label: "Industrial · textile factory · Vietnam", source: "in-house" },
    { src: "/videos/hero-mix/3.webm", mp4: "/videos/hero-mix/3.mp4", poster: "/videos/hero-mix/3.jpg", label: "Real production · manipulation", source: "in-house" },
    { src: "/videos/hero-mix/4.webm", mp4: "/videos/hero-mix/4.mp4", poster: "/videos/hero-mix/4.jpg", label: "Exocentric mocap · partner-signed", source: "partner" },
  ],
  fallback: { src: "/videos/worker-hero.webm", mp4: "/videos/worker-hero.mp4", poster: "/images/worker-hero-poster.jpg" },
  clipDurationSec: 10,
} as const;

export const PROBLEM = {
  fig: "FIG.01 — PROBLEM STATEMENT",
  heading: "Physical AI is blocked by real-world data",
  lead: "Robot foundation models don't lack compute. They lack synchronized, action-paired data captured in the messy real world — and every lab is hitting the same wall.",
  points: [
    {
      k: "Teleoperation is expensive and slow",
      v: "Packaged teleop fell from ~$340/hr (Q1 2024) to ~$118/hr (2026) — still costly, still ~135 demos an hour. It can't scale alone.",
    },
    {
      k: "Web video has no action labels",
      v: "YouTube is infinite but passive — no synchronized joint angles, gripper state, or force. Models can't learn to act from pixels alone.",
    },
    {
      k: "Synthetic data doesn't generalize",
      v: "Simulation amplifies, but a policy trained only in sim breaks on real friction, lighting, and deformable objects. It needs real ground truth.",
    },
  ],
  punch: "The scarce resource is real, diverse, action-paired demonstrations — QC'd to lab standard. That's what we forge.",
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.01 — Tbrain Capture Pack (Bill of Materials)
   ──────────────────────────────────────────────────────────────────── */
export interface BomItem {
  num: string;       // "01"
  part: string;      // real component name
  spec: string;      // technical spec
  quality: string;   // why it's good (quality/grade)
  stream: string;    // the data stream it produces
  role: string;      // what data capability it gives
}

export const COLLECTION_PACK = {
  fig: "FIG.01 — TBRAIN CAPTURE PACK",
  title: "Our own rig — built from best-in-class components",
  lead: "Mecka and Claru ship concept art. We ship hardware. The Tbrain Capture Pack is our own design — enclosure, capture firmware, and data pipeline are in-house — assembled from research-grade parts. It records synchronized RGB + depth + IMU + audio, timestamps everything to a hardware clock, caches offline, and syncs to the factory — at 50 to 500 packs in parallel.",
  bom: [
    { num: "01", part: "Intel RealSense D455", spec: "Stereo depth + RGB + IMU", quality: "Global shutter · ~87° FOV · depth ≤ 6m", stream: "RGB · Depth · IMU", role: "Research-grade first-person capture, aligned to the robot's eye view" },
    { num: "02", part: "GoPro (head-mount)", spec: "Egocentric RGB", quality: "HyperSmooth · up to 5.3K · fisheye ~155° for UMI", stream: "Stabilized RGB", role: "Wide, stable first-person video — UMI-compatible" },
    { num: "03", part: "Raspberry Pi 5 (8GB)", spec: "On-pack compute", quality: "Quad-core · runs capture + hardware-clock sync", stream: "Sync · timestamps", role: "Captures, synchronizes, runs the local pipeline" },
    { num: "04", part: "NVMe SSD (256GB)", spec: "Offline cache", quality: "High-throughput, never drops a frame", stream: "Buffered episodes", role: "Offline-first local buffer in the field" },
    { num: "05", part: "Power bank (20,000mAh PD)", spec: "Field power", quality: "A full 8–10h collection shift", stream: "—", role: "All-day capture without a tether" },
    { num: "06", part: "Tbrain belt enclosure", spec: "In-house, 3D-printed", quality: "Ergonomic, all-day wearable — our design", stream: "—", role: "Houses the rig comfortably for field operators" },
  ] as BomItem[],
  specs: [
    { k: "Hardware-clock sync", v: "Per-frame timestamp alignment across every stream" },
    { k: "Offline-first", v: "Local cache → background upload every 5 min" },
    { k: "Fleet scale", v: "50 → 500 packs collecting in parallel" },
    { k: "Zero-trust", v: "Tailscale secure tunnel, role-based access, audit log" },
  ],
  drawing: { unit: "TBRAIN", title: "CAPTURE PACK", dwg: "MK-001 · REV A", scale: "1:2 · ISO 30°", sheet: "1 OF 1" },
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.02 — Foundry line (factory pipeline)
   ──────────────────────────────────────────────────────────────────── */
export interface PipelineStage {
  id: string;
  label: string;
  detail: string;
  layer: "pack" | "factory" | "cloud";
}

export const FOUNDRY_LINE = {
  fig: "FIG.06 — FOUNDRY LINE / DATA PIPELINE",
  title: "From raw motion to RLDS-ready dataset",
  lead: "Every pack feeds one pipeline. Capture is synchronized, cached, synced overnight to edge storage, then forged into standardized, QC'd datasets in the cloud AI pipeline.",
  stages: [
    { id: "capture", label: "Capture", detail: "Stereo + depth + IMU", layer: "pack" },
    { id: "sync", label: "Timestamp sync", detail: "Hardware-clock alignment", layer: "pack" },
    { id: "cache", label: "Local cache", detail: "NVMe offline buffer", layer: "pack" },
    { id: "night", label: "Night sync", detail: "Off-peak background upload", layer: "factory" },
    { id: "minio", label: "MinIO edge", detail: "S3-compatible object store", layer: "factory" },
    { id: "r2", label: "Cloudflare R2", detail: "Durable cloud storage", layer: "cloud" },
    { id: "ai", label: "AI pipeline (GKE)", detail: "Auto-label · QC · RLDS export", layer: "cloud" },
  ] as PipelineStage[],
  fleet: [
    { k: "Workers", v: 50, suffix: "→500" },
    { k: "Recording", v: 47, suffix: "" },
    { k: "Synced", v: 42, suffix: "" },
    { k: "Turnaround", v: 48, suffix: "h" },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.03 — AI-native QC (the quality moat)
   ──────────────────────────────────────────────────────────────────── */
export const QC = {
  fig: "FIG.03 — QUALITY CONTROL / TOLERANCE GATE",
  title: "AI-native QC is the moat",
  lead: "Cheap data farms ship whatever they record. We don't. An AI confidence model rejects the 20–30% of demonstrations that are broken before a human ever looks — then three layers of human review verify what's left.",
  funnel: [
    { stage: "Raw demos", note: "Everything captured in the field" },
    { stage: "AI confidence filter", note: "Auto-reject ~25% — bad sync, occluded hands, tracking drift" },
    { stage: "L1 → L2 → L3 human QA", note: "Annotator → Reviewer → PM audit" },
    { stage: "Verified dataset", note: "Lab-grade, RLDS/LeRobot, ready to train" },
  ],
  stats: [
    { value: 85, suffix: "%", k: "QC pass-rate floor" },
    { value: 30, suffix: "%", k: "Bad demos auto-filtered" },
    { value: 3, suffix: "-layer", k: "Human review" },
    { value: 48, suffix: "h", k: "Raw → delivery" },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.04 — Professional quality-assurance process (end to end)
   ──────────────────────────────────────────────────────────────────── */
export interface ProcessStep {
  step: string;
  title: string;
  detail: string;
  gate: string; // the acceptance checkpoint
}

export const QUALITY_PROCESS = {
  fig: "FIG.04 — QUALITY ASSURANCE PROCESS",
  title: "A professional pipeline, with a checkpoint at every stage",
  lead: "Quality isn't a final step — it's enforced end to end. Every batch passes a defined gate before it advances, from capture SOP to signed-off delivery.",
  steps: [
    { step: "01", title: "Capture SOP", detail: "Calibrated rig, scripted task, environment logged. Operators trained to a standard.", gate: "Calibration + sync check pass" },
    { step: "02", title: "Ingest & sync", detail: "Streams aligned to the hardware clock; metadata and provenance attached.", gate: "Timestamp drift < tolerance" },
    { step: "03", title: "AI confidence filter", detail: "Model scores every episode; the broken 20–30% are auto-rejected before human time is spent.", gate: "Confidence ≥ threshold" },
    { step: "04", title: "3-layer human QA", detail: "L1 annotator → L2 reviewer → L3 PM audit, each with a checklist and sampling.", gate: "Pass-rate ≥ 85%" },
    { step: "05", title: "Standardize & label", detail: "Language, success/fail, segmentation; exported to RLDS / LeRobot.", gate: "Schema + format validation" },
    { step: "06", title: "Sign-off & deliver", detail: "Batch report, unit-economics, and acceptance sign-off; delivered over zero-trust.", gate: "Customer acceptance" },
  ] as ProcessStep[],
} as const;

/* ────────────────────────────────────────────────────────────────────
   Security & trust
   ──────────────────────────────────────────────────────────────────── */
export const SECURITY = {
  fig: "FIG.05 — SECURITY & DATA GOVERNANCE",
  title: "Built for frontier-lab trust",
  lead: "Selling to the most demanding AI teams means security and data governance are non-negotiable — engineered in from day one.",
  items: [
    { k: "Zero-trust delivery", v: "Tailscale encrypted tunnels, role-based access, full audit log on every transfer." },
    { k: "ISO 27001 → SOC 2", v: "Active certification roadmap; controls and policies mapped from the start." },
    { k: "IP & data sovereignty", v: "Clear ownership terms, transparent storage location, signed releases for every environment." },
    { k: "Provenance & traceability", v: "Every episode carries metadata: operator, rig, environment, consent, processing history." },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.06 — The data ladder (easy → hard product map)
   ──────────────────────────────────────────────────────────────────── */
export interface LadderRung {
  step: string;
  name: string;
  difficulty: "Low" | "Low–Med" | "Med" | "High" | "Very high";
  buyers: string;
  phase: string;
}

export const DATA_LADDER = {
  fig: "FIG.09 — WHAT SHIPS NOW → NEXT",
  title: "The climb: what ships now, and what's next",
  lead: "We start with the data that's light on hardware and hits quality immediately, then climb: UMI, teleoperation, and lab-grade dexterous mocap. Buy what's ready today; layer in the rest as your roadmap needs it.",
  rungs: [
    { step: "01", name: "Egocentric + exocentric human video", difficulty: "Low–Med", buyers: "World model · VLA", phase: "Now" },
    { step: "02", name: "Language + success/fail + QC labels", difficulty: "Low", buyers: "Any policy", phase: "Now" },
    { step: "03", name: "UMI / handheld gripper", difficulty: "Med", buyers: "VLA manipulation", phase: "Now" },
    { step: "04", name: "Teleoperation (ALOHA / SO-100)", difficulty: "High", buyers: "VLA · imitation", phase: "Now" },
    { step: "05", name: "Dexterous · tactile · lab-grade mocap", difficulty: "Very high", buyers: "Humanoid", phase: "Now · moat" },
  ] as LadderRung[],
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.07 — Real-world environments
   ──────────────────────────────────────────────────────────────────── */
/* Capture environments — 4 real (ops-provided drive drops), 2 sourced (public/partner).
   Video paths match scripts/encode-ops-content.mjs output.
   Component falls back to `stock` still if video not yet on disk. */
export interface EnvSlot {
  key: string;
  name: string;
  note: string;
  video?: string;    // /videos/env/{key}.webm — from ops-team Drive
  poster: string;    // /images/env/{key}.jpg
  stock: string;     // legacy stock fallback used until video lands
  source: "OPS" | "PUBLIC";
  driveRef?: string;
  durationHint: string;
}
export const ENVIRONMENTS = {
  fig: "FIG.05 — CAPTURE ENVIRONMENTS",
  title: "Seven textile-factory skills · one schema",
  lead: "Real ops from a running Vietnamese textile line — sewing, ironing, tagging, printing, QC, sorting, packing. Seventy-one raw wearable-cam sessions ingested, fourteen already flowing through the auto-label pipeline. Same 8-model stack, same 8-check diag, same LeRobot export.",
  items: [
    { key: "may_san_pham", name: "Sewing · hem machine",        note: "Wearable-cam · factory-floor egocentric",         video: "/videos/env/may_san_pham.webm", poster: "/images/env/may_san_pham-poster.jpg", stock: "/images/env/textile.jpg",     source: "OPS", driveRef: "1LTXPUhGmBgsCRDSKfTGX3aot4RRxb7kq", durationHint: "10s" },
    { key: "is_san_pham",  name: "Ironing",                     note: "Contact-heavy · long-horizon manipulation",       video: "/videos/env/is_san_pham.webm",  poster: "/images/env/is_san_pham-poster.jpg",  stock: "/images/env/textile.jpg",     source: "OPS", driveRef: "1LTXPUhGmBgsCRDSKfTGX3aot4RRxb7kq", durationHint: "10s" },
    { key: "gan_tag",      name: "Product tagging",             note: "Fine-motor · dexterous tool use",                 video: "/videos/env/gan_tag.webm",      poster: "/images/env/gan_tag-poster.jpg",      stock: "/images/env/textile.jpg",     source: "OPS", driveRef: "1LTXPUhGmBgsCRDSKfTGX3aot4RRxb7kq", durationHint: "10s" },
    { key: "in_ma_so",     name: "Code printing on fabric",     note: "Two-handed · alignment task",                     video: "/videos/env/in_ma_so.webm",     poster: "/images/env/in_ma_so-poster.jpg",     stock: "/images/env/textile.jpg",     source: "OPS", driveRef: "1LTXPUhGmBgsCRDSKfTGX3aot4RRxb7kq", durationHint: "10s" },
    { key: "kiem_tra_qc",  name: "Quality inspection",          note: "Vision-driven · pass / fail decisions",           video: "/videos/env/kiem_tra_qc.webm",  poster: "/images/env/kiem_tra_qc-poster.jpg",  stock: "/images/env/sorting.jpg",     source: "OPS", driveRef: "1LTXPUhGmBgsCRDSKfTGX3aot4RRxb7kq", durationHint: "10s" },
    { key: "sap_xep_vai",  name: "Fabric sorting & feed",       note: "Pick + place · machine feeding",                  video: "/videos/env/sap_xep_vai.webm",  poster: "/images/env/sap_xep_vai-poster.jpg",  stock: "/images/env/sorting.jpg",     source: "OPS", driveRef: "1LTXPUhGmBgsCRDSKfTGX3aot4RRxb7kq", durationHint: "10s" },
    { key: "dong_goi",     name: "Packaging into bag",          note: "Deformable-object handling",                      video: "/videos/env/dong_goi.webm",     poster: "/images/env/dong_goi-poster.jpg",     stock: "/images/env/warehouse.jpg",   source: "OPS", driveRef: "1LTXPUhGmBgsCRDSKfTGX3aot4RRxb7kq", durationHint: "10s" },
    { key: "kitchen",      name: "Kitchen · pantry",            note: "Delivered · reference from kitchen ledger",       video: "/videos/real-captures/wiping_pantry_surface.webm", poster: "/images/real-captures/wiping_pantry_surface-loop.jpg", stock: "/images/env/kitchen.jpg", source: "OPS", durationHint: "delivered" },
    { key: "electronics",  name: "Electronics assembly",        note: "Roadmap · sourced reference",                     video: undefined,                       poster: "/images/env/electronics.jpg",         stock: "/images/env/electronics.jpg", source: "PUBLIC", durationHint: "sourced" },
  ] as EnvSlot[],
} as const;

/* ────────────────────────────────────────────────────────────────────
   Data modalities we deliver
   ──────────────────────────────────────────────────────────────────── */
export const MODALITIES = {
  fig: "FIG.08 — DATA MODALITIES",
  title: "What we deliver",
  items: [
    { k: "Egocentric RGB-D", v: "First-person stereo + depth" },
    { k: "3D hand & wrist pose", v: "MANO-style, per-finger" },
    { k: "Proprioception", v: "Joint angles, gripper, IMU" },
    { k: "Action labels", v: "Synchronized, frame-accurate" },
    { k: "Language", v: "Task instructions & captions" },
    { k: "Success / fail + QC", v: "Verified outcome flags" },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.09 — 11 research directions (which data each needs)
   ──────────────────────────────────────────────────────────────────── */
export interface Direction {
  id: string;
  name: string;        // catchy EN handle
  formal: string;      // formal name
  kicker: string;      // one-line "what"
  why: string;         // to-do-what (purpose)
  dataNeeded: string;  // short
  tbrainData: string;  // what Tbrain sells for it
  fit: 0 | 1 | 2 | 3;  // tbrain fit
  hotness: "Hot" | "Very hot" | "Rising" | "Mainstream";
  group: "create-data" | "build-brains"; // the two clusters
  axis: string;        // model axis label
}

export const DIRECTIONS: Direction[] = [
  {
    id: "web-video", name: "Learn from YouTube", formal: "Internet-scale passive video",
    kicker: "Pretrain physical intuition from millions of hours of unlabeled web video.",
    why: "Cheap world/physics priors before any robot data. V-JEPA 2 learned zero-shot grasping from 1M hrs web video + only 62 hrs of robot video.",
    dataNeeded: "Egocentric + manipulation video, diverse, with captions",
    tbrainData: "Egocentric video + QC + language labels", fit: 3, hotness: "Very hot",
    group: "create-data", axis: "World Model · VLA pretrain",
  },
  {
    id: "egocentric", name: "See like a robot", formal: "Egocentric human video — human-as-data",
    kicker: "First-person human video teaches the 'human prior' for manipulation.",
    why: "1 hr of egocentric video ≈ 10× the demos of teleop (EgoMimic). NVIDIA found log-linear scaling: more ego hours → steadily better robots.",
    dataNeeded: "Ego RGB + 3D hand pose + SLAM + captions",
    tbrainData: "Tbrain Capture Pack — our flagship", fit: 3, hotness: "Very hot",
    group: "create-data", axis: "VLA · Imitation",
  },
  {
    id: "teleop-il", name: "Learn by watching", formal: "Teleoperation + imitation learning",
    kicker: "Operate a robot through a task; it learns to imitate the demonstration.",
    why: "The gold-standard, action-paired data behind ACT, Diffusion Policy, and π0. Diversity beats raw count — many scenes, not one repeated.",
    dataNeeded: "Synced (image + state + action) pairs, diverse",
    tbrainData: "Teleop on ALOHA / SO-100, QC'd", fit: 3, hotness: "Very hot",
    group: "build-brains", axis: "Imitation · VLA",
  },
  {
    id: "umi", name: "The cheapest robot", formal: "UMI / handheld gripper",
    kicker: "A $700 handheld gripper + camera captures robot-transferable demos — no robot.",
    why: "Bridges human video and robot action: natural hand mechanics, 100× cheaper than a robot, 10× faster to collect than teleop.",
    dataNeeded: "6-DoF SLAM pose + gripper trajectory + sync",
    tbrainData: "UMI demonstrations + pipeline", fit: 3, hotness: "Hot",
    group: "create-data", axis: "VLA manipulation",
  },
  {
    id: "world-model-game", name: "Teach a robot to imagine", formal: "World models + game data",
    kicker: "Train an 'imagination engine' so a robot predicts consequences before acting.",
    why: "Why game data? Every keystroke is a free, perfect action label — infinite, controllable, safe-to-fail environments (Genie, GameNGen, Cosmos, Dreamer).",
    dataNeeded: "Action-paired frames, long ego video, IDM seed labels",
    tbrainData: "Action-labeled real video as ground truth", fit: 2, hotness: "Very hot",
    group: "build-brains", axis: "World Model",
  },
  {
    id: "sim", name: "Practice in simulation", formal: "Simulation + sim-to-real",
    kicker: "Train in Isaac Lab, amplify a few real demos into thousands, transfer to real.",
    why: "MimicGen turns ~50 teleop demos into thousands of synthetic trajectories. But it needs real seed data and QC to stay anchored to physics.",
    dataNeeded: "Seed demos + 3D assets + synthetic QC",
    tbrainData: "Seed demos + rollout QC service", fit: 3, hotness: "Very hot",
    group: "create-data", axis: "Locomotion · Manipulation",
  },
  {
    id: "vla", name: "One brain for every robot", formal: "Cross-embodiment / VLA",
    kicker: "One model trained across many robot types, deployable with light fine-tuning.",
    why: "π0 trained on ~10,000 hrs across 7 platforms. The endgame foundation model — and it's hungry for pooled, standardized, multi-embodiment data.",
    dataNeeded: "RLDS / LeRobot multi-embodiment, standardized",
    tbrainData: "RLDS-standardized datasets across types", fit: 3, hotness: "Very hot",
    group: "build-brains", axis: "VLA / Foundation",
  },
  {
    id: "rl", name: "From good to excellent", formal: "Reinforcement learning",
    kicker: "Fine-tune an imitation policy by trial-and-error to beat the human demo.",
    why: "RL needs demo initialization, plus preference comparisons (A vs B) and human intervention logs — exactly the labels a data partner provides.",
    dataNeeded: "Demo init + preference labels + intervention logs",
    tbrainData: "Preference + intervention data", fit: 3, hotness: "Hot",
    group: "build-brains", axis: "RL post-training",
  },
  {
    id: "spatial-3d", name: "See the shape of things", formal: "3D / spatial intelligence",
    kicker: "Depth, point clouds, and 3D reconstruction so robots reason about geometry.",
    why: "NeRF / 3D Gaussian Splatting scenes (World Labs, real-to-sim) need real-world multi-view captures and scans as ground truth.",
    dataNeeded: "Multi-view RGB-D + scans + point clouds",
    tbrainData: "Multi-view + 3D scan capture", fit: 3, hotness: "Hot",
    group: "create-data", axis: "Spatial / 3D",
  },
  {
    id: "tactile-dex", name: "Feel and grip", formal: "Tactile / dexterous / force",
    kicker: "High-DoF hands with tactile and force sensing for fine manipulation.",
    why: "Humanoids need dexterous data to fold fabric, handle eggs, and assemble — high-value, contact-rich capture we deliver with tactile sensing and lab-grade mocap.",
    dataNeeded: "Tactile / force + dexterous hand pose",
    tbrainData: "Dexterous + tactile + mocap", fit: 3, hotness: "Rising",
    group: "build-brains", axis: "Humanoid · Dexterous",
  },
  {
    id: "mocap", name: "Capture human movement", formal: "Mocap / human motion",
    kicker: "Optical + IMU whole-body capture, retargeted to humanoid robots.",
    why: "The humanoid boom is driving demand for whole-body motion — and the diverse body types only a field-scale capture network delivers. We capture it optical + IMU and retarget to any humanoid.",
    dataNeeded: "Optical + IMU suits, retarget pipeline",
    tbrainData: "Lab-grade mocap (optical + IMU)", fit: 3, hotness: "Rising",
    group: "create-data", axis: "Humanoid locomotion",
  },
];

export const DIRECTIONS_SYNTH = {
  fig: "FIG.09 — RESEARCH DIRECTIONS",
  title: "Eleven research directions — the data each one needs",
  lead: "Two clusters: ways to create data cheaper, and ways to turn data into robot brains. Each direction consumes a specific kind of data — and most consume exactly what we forge.",
  gameEgoExplainer: {
    title: "Why collect game & egocentric data? (the question everyone asks)",
    ego: "Egocentric: a robot's camera sees roughly what a person's first-person view sees, so human ego video transfers directly — and it's ~10× cheaper to collect than teleoperating a robot.",
    game: "Game: to teach an AI 'action → consequence' you need (frame, action) pairs. In a game every keystroke is a free, perfect, frame-synced action label — infinite, controllable, safe to fail a million times. Then you ground that world model in real robot video so its predictions match real friction and physics.",
  },
  sweetSpot: "VLA foundation models and imitation policies together account for ~140 of the targets we track — and both run on teleoperation + egocentric video. That is precisely our sweet spot.",
  gaps: [
    "Egocentric + UMI at scale, in diverse Asian environments, QC'd — proven effective, almost no one supplies it well.",
    "AI-native QC + annotation as a defensible layer between cheap farms and pricey platforms.",
    "Real seed + ground-truth data for synthetic / world-model pipelines.",
    "Whole-body mocap for humanoids, with body-type diversity.",
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   Use cases (by customer segment)
   ──────────────────────────────────────────────────────────────────── */
export interface UseCase {
  segment: string;
  who: string;
  need: string;
  deliver: string;
  data: string[];
}

export const USE_CASES: UseCase[] = [
  {
    segment: "VLA / foundation-model labs",
    who: "Teams training cross-embodiment robot foundation models",
    need: "High-volume, diverse, standardized demonstrations across embodiments — more than they can collect internally.",
    deliver: "Egocentric + teleop + UMI pooled and exported in RLDS / LeRobot, QC'd to lab standard.",
    data: ["Egocentric", "Teleop", "UMI", "RLDS export"],
  },
  {
    segment: "World-model labs",
    who: "Teams training generative world models and neural simulators",
    need: "Real, action-paired video from diverse environments to ground sim and game-trained models in physics.",
    deliver: "Long egocentric video with synchronized action labels from environments synthetic data never sees.",
    data: ["Egocentric video", "Action labels", "Asian environments"],
  },
  {
    segment: "Humanoid OEMs",
    who: "Companies building humanoid robots",
    need: "Whole-body motion data across diverse body types to train locomotion and manipulation.",
    deliver: "Lab-grade optical + IMU mocap, retarget-ready, with demographic diversity.",
    data: ["Mocap", "Whole-body", "Retarget"],
  },
  {
    segment: "Mid-tier robotics startups",
    who: "Teams scaling a policy to new tasks and SKUs",
    need: "Fast cold-start data for new tasks without building a collection org.",
    deliver: "Pre-QC'd egocentric + teleop datasets, plugged into your pipeline in days, RLDS-ready.",
    data: ["Egocentric", "Teleop", "48h turnaround"],
  },
];

/* ────────────────────────────────────────────────────────────────────
   Standards / delivery + proof points (public research stats only)
   ──────────────────────────────────────────────────────────────────── */
export const STANDARDS = [
  { k: "RLDS / LeRobot export", v: "Industry-standard formats — no lock-in" },
  { k: "≤ 48h turnaround", v: "Raw capture to delivered, QC'd batch" },
  { k: "Tailscale zero-trust", v: "Encrypted delivery, role-based access, audit log" },
  { k: "ISO 27001 → SOC 2", v: "Security certification roadmap" },
] as const;

// Published research (verified against primary sources). Keep framing accurate.
export const PROOF_POINTS = [
  { stat: "10×", claim: "More demos per hour from egocentric human video than teleoperation", src: "EgoMimic · Georgia Tech", href: "https://arxiv.org/abs/2410.24221" },
  { stat: "log-linear", claim: "20k+ hrs of egocentric video → predictable gains in robot dexterity", src: "EgoScale · NVIDIA", href: "https://arxiv.org/abs/2602.16710" },
  { stat: "<62 hrs", claim: "Robot data + 1M hrs of web video → zero-shot manipulation", src: "V-JEPA 2 · Meta", href: "https://arxiv.org/abs/2506.09985" },
  { stat: "~10,000 hrs", claim: "π0: data across 7 platforms trains one cross-embodiment VLA", src: "Physical Intelligence", href: "https://www.pi.website/blog/pi0" },
] as const;

/* ────────────────────────────────────────────────────────────────────
   The system, in action — operator app, monitor, local cluster
   ──────────────────────────────────────────────────────────────────── */
export const SYSTEM = {
  fig: "FIG.02·B — THE SYSTEM IN ACTION",
  title: "See the whole collection machine",
  lead: "Not a render — a working system. The capture pack feeds a factory local cluster; operators drive it from an app; supervisors watch the whole fleet sync in real time.",
  workerApp: {
    title: "Operator app",
    status: "RECORDING",
    time: "01:32:45",
    rows: [
      { k: "Battery", v: "82%" },
      { k: "Storage", v: "180 GB free" },
      { k: "Sync pending", v: "12.4 GB" },
      { k: "Session", v: "pick_up_the_cup · reference" },
    ],
  },
  monitor: {
    title: "Supervisor monitor",
    fleet: 50, recording: 47, synced: 42, idle: 3,
  },
  cluster: [
    { k: "Capture packs", v: "WiFi 6 / private 5G", layer: "edge" },
    { k: "MinIO edge", v: "S3-compatible store", layer: "factory" },
    { k: "PostgreSQL", v: "Metadata + fleet state", layer: "factory" },
    { k: "NAS RAID", v: "40–100 TB buffer", layer: "factory" },
    { k: "Night sync → R2", v: "Off-peak, resumable", layer: "cloud" },
    { k: "GKE AI pipeline", v: "Auto-label · QC · RLDS", layer: "cloud" },
  ],
} as const;

/* Multi-sensor richness — what every episode actually contains */
export const SENSORS = {
  fig: "FIG.13 — WHAT EVERY EPISODE CONTAINS",
  title: "Eight synchronized streams — not just a video clip",
  lead: "Quality lives in the data, not only the process. Every episode is a multi-sensor bundle, frame-aligned to a hardware clock.",
  streams: [
    { k: "Stereo RGB", v: "Dual-camera first-person" },
    { k: "Depth", v: "Per-pixel, aligned to RGB" },
    { k: "IMU", v: "6-axis, 200 Hz motion" },
    { k: "Audio / voice", v: "Operator narration + ambient" },
    { k: "3D hand & wrist pose", v: "MANO-style, per-finger" },
    { k: "Head / device pose", v: "SLAM / VIO, drift-corrected" },
    { k: "Language", v: "Task instruction + step captions" },
    { k: "Hardware timestamps", v: "Per-frame sync across streams" },
  ],
} as const;

/* For world-model teams — Mecka-style pitch, our angle */
export const WORLD_MODEL = {
  fig: "FIG.14 — FOR WORLD-MODEL TEAMS",
  kicker: "Built for the people training world models",
  body: "Your model imagines the next frame. To keep those imagined worlds honest, it needs (frame, action) pairs grounded in real physics — long, continuous, multi-sensor, from places simulation never renders. We forge exactly that: real ground truth that anchors your generated worlds to reality.",
  points: [
    { k: "Long-horizon continuity", v: "Minutes-long, unbroken sequences — not 2-second clips." },
    { k: "Action-paired ground truth", v: "Every frame carries synchronized action + state." },
    { k: "Diversity sim can't fake", v: "Real friction, deformables, lighting, clutter." },
    { k: "Multi-sensor anchoring", v: "RGB-D + IMU + audio + pose to ground every prediction." },
  ],
} as const;

/* Two-tier availability — never mix delivered vs aspirational */
export const AVAILABILITY = {
  fig: "FIG.04 — WHAT SHIPS NOW → NEXT",
  title: "Delivered today. Scaling to program.",
  lead: "One rule: verifiable numbers on the left, aspirational capacity on the right — labeled, not blended. We don't ship stats we can't defend to a research engineer.",
  delivered: {
    tag: "Delivered today",
    stats: [
      { value: 10,   suffix: "",  k: "Real capture skills on disk" },
      { value: 5016, suffix: "",  k: "Annotated frames · LeRobot v2" },
      { value: 8,    suffix: "",  k: "Episodes · parquet + video + depth" },
      { value: 8,    suffix: "",  k: "Auto-label models in prod pipeline" },
    ],
  },
  capacity: {
    tag: "Capacity 2026",
    stats: [
      { value: 500,   suffix: "",  k: "Parallel capture packs at scale" },
      { value: 10000, suffix: "+", k: "Episodes / month at scale" },
      { value: 6,     suffix: "+", k: "Environment categories" },
      { value: 8,     suffix: "",  k: "Synchronized streams / episode" },
    ],
  },
} as const;

/* Capture partner ecosystem — factories & environments */
export const PARTNERS = {
  fig: "FIG.16 — CAPTURE PARTNER ECOSYSTEM",
  title: "An ecosystem that produces real environments",
  lead: "Diverse real-world data needs diverse real-world places and skilled hands. We source both through a partner network across Vietnam's manufacturing belt — a model like Figure × Brookfield, at data scale.",
  items: [
    { k: "Manufacturing & electronics assembly", v: "Dexterous, disciplined operators trained for precise capture." },
    { k: "Restaurants & home kitchens", v: "Filming-rights partnerships for cooking, dishes, tidying." },
    { k: "Markets, retail & food service", v: "Picking, bagging, handling at real commercial pace." },
    { k: "Workshops & repair", v: "Assembly, tool use, fine manipulation." },
    { k: "Farms & agriculture", v: "Sorting, harvesting, packing — outdoor variability." },
    { k: "Vocational schools & industrial parks", v: "Fast, ethical staffing with transparent wages." },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   What we capture — data types & value (Mecka "World Model Inputs" style)
   ──────────────────────────────────────────────────────────────────── */
export interface WmInput { k: string; from: string; v: string; }

export const WORLD_MODEL_INPUTS = {
  fig: "FIG.06 — WHAT WE CAPTURE",
  title: "Every input a world model or VLA needs",
  lead: "Raw video isn't enough. We deliver ten synchronized, model-ready data types — the inputs a robot model actually trains on — labeled and QC'd, not just recorded.",
  inputs: [
    { k: "Pixel & appearance", from: "RGB", v: "Texture, objects, materials — what the scene looks like." },
    { k: "Depth & spatial", from: "RealSense depth", v: "3D geometry, distances, grasp points." },
    { k: "Motion & dynamics", from: "IMU 200 Hz", v: "Acceleration, rotation, contact events." },
    { k: "Hand & gripper action", from: "3D pose", v: "The action being performed — frame by frame." },
    { k: "Egomotion & viewpoint", from: "SLAM / VIO", v: "Camera & head trajectory, drift-corrected." },
    { k: "Sound & voice", from: "Audio", v: "Operator narration, intent, ambient cues." },
    { k: "Task semantics", from: "Language", v: "What the task is, step by step." },
    { k: "Action conditioning", from: "Synced actions", v: "(frame, action) pairs — the world-model fuel." },
    { k: "Outcome supervision", from: "Success / fail + QC", v: "Did it work — verified, not guessed." },
    { k: "Object & scene", from: "Segmentation", v: "Masks, tracking, scene parsing." },
  ] as WmInput[],
} as const;

/* The QC flow (with gates + what gets rejected) */
export interface QcStep { step: string; title: string; note: string; gate: string; rejects?: string[]; }

export const QC_FLOW = {
  fig: "FIG.05·B — QC FLOW",
  title: "Where we reject what others ship",
  lead: "Cheap farms ship whatever they record. Our QC flow gates every batch — an AI filter kills broken demos before a human looks, then three human layers verify the rest.",
  steps: [
    { step: "01", title: "Ingest & calibrate", note: "Streams aligned to the hardware clock; provenance attached.", gate: "Calibration + sync check" },
    { step: "02", title: "AI confidence filter", note: "A model scores every episode and auto-rejects the broken 20–30%.", gate: "Confidence ≥ threshold", rejects: ["Sync drift", "Occluded hands", "Tracking loss", "Motion blur"] },
    { step: "03", title: "L1 annotate", note: "Language, segmentation, success/fail — to a checklist.", gate: "Checklist pass" },
    { step: "04", title: "L2 review", note: "A second reviewer verifies every accepted episode.", gate: "Reviewer sign-off" },
    { step: "05", title: "L3 PM audit", note: "10% sampled audit holds the batch to standard.", gate: "Pass-rate ≥ 85%" },
    { step: "06", title: "Standardize & deliver", note: "Exported to RLDS / LeRobot with a batch report.", gate: "Schema + acceptance" },
  ] as QcStep[],
} as const;

/* Real captures scanned from /data/tbrain/captures — QC status per labels/summary.json */
export type QcState = "PASS" | "PARTIAL" | "FAIL_LABEL" | "PARTNER" | "LABELING";
export interface QcMeta {
  state: QcState;
  passCount: number;
  total: number;
  failedCheck?: string;
  note?: string;
}
export type SampleGroup = "KITCHEN" | "TEXTILE";
export interface RealSample {
  name: string;
  skill: string;
  video: string;
  poster: string;
  note: string;
  defect?: boolean;
  frames?: number;
  seconds?: number;
  sensor?: string;
  takes?: number;      // >1 = grouped card
  group: SampleGroup;
  qc: QcMeta;
}

export const REAL_SAMPLES = {
  fig: "FIG.10 — CAPTURE LEDGER",
  title: "Real episodes · shipped and in-flight",
  lead: "Two environments, one ledger. Kitchen: seven delivered, one grouped mobile take pending re-run. Textile: eight auto-labeled takes — six with solid MANO mesh on both hands, two with intermittent overlay (dropout on high-motion frames) — we publish only what passes visual sanity.",
  montage: "/images/deliverables/all6-montage.png",
  groups: {
    KITCHEN: { label: "Kitchen ledger", note: "Delivered · QC-verified" },
    TEXTILE: { label: "Textile factory", note: "8 auto-labeled · 6 solid · 2 intermittent" },
  },
  items: [
    // Kitchen · PASS (5)
    { group: "KITCHEN", name: "Pick up the cup",         skill: "pick_up_the_cup",         video: "/videos/real-captures/pick_up_the_cup.webm",              poster: "/images/real-captures/pick_up_the_cup-loop.jpg",              note: "Reference episode · MANO 21-kpt hand + verb-noun label", frames: 271, seconds: 18, sensor: "Stereo depth cam",    qc: { state: "PASS", passCount: 14, total: 14 } },
    { group: "KITCHEN", name: "Open & close door",       skill: "open_and_close_door",     video: "/videos/real-captures/open_and_close_door.webm",          poster: "/images/real-captures/open_and_close_door-loop.jpg",          note: "Two-phase task · sub-action segments",                    frames: 234, seconds: 16, sensor: "Stereo depth cam",    qc: { state: "PASS", passCount: 14, total: 14 } },
    { group: "KITCHEN", name: "Pick from fridge",        skill: "pick_up_item_from_fridge", video: "/videos/real-captures/pick_up_item_from_fridge.webm",     poster: "/images/real-captures/pick_up_item_from_fridge-loop.jpg",     note: "Reach + grasp under occlusion",                          frames: 339, seconds: 23, sensor: "Stereo depth cam",    qc: { state: "PASS", passCount: 13, total: 14, note: "1 optional check skipped" } },
    { group: "KITCHEN", name: "Wiping pantry surface",   skill: "wiping_pantry_surface",   video: "/videos/real-captures/wiping_pantry_surface.webm",        poster: "/images/real-captures/wiping_pantry_surface-loop.jpg",        note: "Long-horizon · continuous contact",                       frames: 680, seconds: 59, sensor: "Stereo depth cam",    qc: { state: "PASS", passCount: 14, total: 14 } },
    { group: "KITCHEN", name: "Clean workstation",       skill: "clean_workstation",       video: "/videos/real-captures/clean_workstation.webm",            poster: "/images/real-captures/clean_workstation-loop.jpg",            note: "Tool use · multi-object rearrange",                       frames: 839, seconds: 56, sensor: "Stereo depth cam",    qc: { state: "PASS", passCount: 13, total: 14, note: "1 optional check skipped" } },
    // Kitchen · PASS defect (2)
    { group: "KITCHEN", name: "Pick up cup — defect",    skill: "pick_up_cup_defect",      video: "/videos/real-captures/pick_up_cup_defect.webm",           poster: "/images/real-captures/pick_up_cup_defect-loop.jpg",           note: "Intentional-defect capture · trains failure detection",   defect: true, frames: 642, seconds: 43, sensor: "Stereo depth cam", qc: { state: "PASS", passCount: 14, total: 14, note: "Defect on purpose — QC passes" } },
    { group: "KITCHEN", name: "Clean workstation — defect", skill: "clean_workstation_defect", video: "/videos/real-captures/clean_workstation_defect.webm", poster: "/images/real-captures/clean_workstation_defect-loop.jpg",    note: "Intentional-defect capture · tool-switch stress test",     defect: true, frames: 1041, seconds: 70, sensor: "Stereo depth cam", qc: { state: "PASS", passCount: 14, total: 14, note: "Defect on purpose — QC passes" } },
    // Kitchen · mobile PASS (1) — grouped tagging card
    { group: "KITCHEN", name: "Retail tagging (mobile)", skill: "gan_tag_grouped",         video: "/videos/real-captures/gan_tag_cho_san_pham.webm",         poster: "/images/real-captures/gan_tag_cho_san_pham-loop.jpg",         note: "Mobile portrait capture · 3 takes",                       takes: 3, frames: 3752, seconds: 125, sensor: "Mobile phone",           qc: { state: "PARTIAL", passCount: 0, total: 14, note: "QC re-run pending" } },
    // Textile · PARTIAL (solid MANO mesh on both hands · QC gate pending) — 6 clean takes after HaWoR rerun + burn fix
    { group: "TEXTILE", name: "Ironing · T01",                 skill: "iron_product_01",         video: "/videos/textile-annotated/iron_01.webm",     poster: "/images/textile-annotated/iron_01.jpg",     note: "MANO mesh on both hands · object · pants",        frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Auto-label passes visual sanity · QC gate pending" } },
    { group: "TEXTILE", name: "Ironing · T02",                 skill: "iron_product_02",         video: "/videos/textile-annotated/iron_02.webm",     poster: "/images/textile-annotated/iron_02.jpg",     note: "Hand overlay clean · SAM3 tracked garment instead of iron tool", frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Object detection off · re-prompt queued" } },
    { group: "TEXTILE", name: "Sew on hem machine",            skill: "sew_hem_02",              video: "/videos/textile-annotated/sew_02.webm",      poster: "/images/textile-annotated/sew_02.jpg",      note: "MANO mesh on both hands · object · cloth",        frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Auto-label passes visual sanity · QC gate pending" } },
    { group: "TEXTILE", name: "Fabric sort + feed · T01",      skill: "arrange_fabric_01",       video: "/videos/textile-annotated/arrange_01.webm",  poster: "/images/textile-annotated/arrange_01.jpg",  note: "MANO mesh on both hands · object · cloth",        frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Auto-label passes visual sanity · QC gate pending" } },
    { group: "TEXTILE", name: "Fabric sort + feed · T02",      skill: "arrange_fabric_02",       video: "/videos/textile-annotated/arrange_02.webm",  poster: "/images/textile-annotated/arrange_02.jpg",  note: "Hand overlay clean · SAM3 color-confused (cardboard as fabric)", frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Object detection off · re-prompt queued" } },
    { group: "TEXTILE", name: "Package into bag · T02",        skill: "package_product_02",      video: "/videos/textile-annotated/package_02.webm",  poster: "/images/textile-annotated/package_02.jpg",  note: "MANO mesh on both hands · objects · cloth + bag", frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Auto-label passes visual sanity · QC gate pending" } },
    { group: "TEXTILE", name: "Sew on hem machine · T01",      skill: "sew_hem_01",              video: "/videos/textile-annotated/sew_01.webm",      poster: "/images/textile-annotated/sew_01.jpg",      note: "MANO mesh · dropout on high-motion frames",       frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Overlay intermittent · re-track queued" } },
    { group: "TEXTILE", name: "Package into bag · T01",        skill: "package_product_01",      video: "/videos/textile-annotated/package_01.webm",  poster: "/images/textile-annotated/package_01.jpg",  note: "MANO mesh · dropout when hand off-frame",         frames: 450, seconds: 15, sensor: "Wearable capture pack", qc: { state: "PARTIAL", passCount: 0, total: 14, note: "Overlay intermittent · re-track queued" } },
  ] as RealSample[],
} as const;

/* ────────────────────────────────────────────────────────────────────
   Auto-label model stack — anonymized (generic role · tier).
   No brand names, no HF handles, no GPU model, no ports, no env vars.
   ──────────────────────────────────────────────────────────────────── */
export type ModelTier = "FRONTIER" | "RESEARCH" | "FOUNDATION" | "LIGHT";
export interface ModelSpec {
  name: string;         // Generic role label
  role: string;         // Short tag under name
  tier: ModelTier;
  task: string;         // What it does in one sentence
  inputs: string;       // IN: description
  outputs: string;      // OUT: description
  vram: number;         // GB (rendered as bar 0–24)
  latency: string;      // Human-readable
  runtime: "gpu · isolated" | "gpu-node · remote" | "cpu";
  determ?: boolean;
  notes?: string;
}

export const MODEL_STACK = {
  fig: "FIG.08 — AUTO-LABEL MODEL STACK",
  title: "Eight production models · one pipeline",
  lead: "Every capture flows through eight pinned, versioned, VRAM-profiled models before a human sees it. Each is swappable behind a role interface — the pipeline stays the same regardless of the underlying weights.",
  models: [
    { name: "Segmenter",              role: "Video object + hand masks",         tier: "FRONTIER",   task: "Frame-accurate masks for every object and both hands.",              inputs: "RGB video · 720p",           outputs: "Masks · per-frame · track-linked",     vram: 10,   latency: "0.3 s/frame",         runtime: "gpu · isolated",  notes: "Video-native · masks travel with track_id." },
    { name: "3D Hand + Camera",       role: "MANO 21-kpt + SLAM",                tier: "RESEARCH",   task: "Reconstructs 3D hand pose plus the camera trajectory.",              inputs: "RGB video",                  outputs: "21-kpt MANO hand · R,t camera pose",    vram: 13,   latency: "1.2× clip length",    runtime: "gpu · isolated",  notes: "DROID-style SLAM · MANO body pinned." },
    { name: "Monocular Depth",        role: "Per-pixel depth + intrinsics",      tier: "FOUNDATION", task: "Predicts dense depth and camera intrinsics from a single frame.",    inputs: "RGB frame",                  outputs: "Depth map · 3×3 intrinsics K",          vram: 5,    latency: "0.4 s/frame",         runtime: "gpu · isolated",  notes: "Feeds 6-DoF pose tracker." },
    { name: "Mesh Reconstruction",    role: "Object → .glb mesh",                tier: "FRONTIER",   task: "Reconstructs a per-object 3D mesh from monocular input.",            inputs: "RGB frame · object mask",    outputs: ".glb mesh · watertight",                vram: 14,   latency: "2–4 s / object",      runtime: "gpu · isolated",  notes: "Multi-checkpoint encoder/decoder chain." },
    { name: "6-DoF Pose Tracker",     role: "Per-frame per-object pose",         tier: "RESEARCH",   task: "Tracks object 6-DoF pose using depth + mask + prior mesh.",          inputs: "Depth · mask · mesh",        outputs: "4×4 pose matrix · per object · per frame", vram: 6, latency: "0.4 s / frame / obj", runtime: "gpu · isolated",  notes: "Swappable behind a common interface." },
    { name: "Frontier VLA",           role: "Verb + noun · 8-frame windows",     tier: "FRONTIER",   task: "Classifies action verb and object noun on every 8-frame window.",    inputs: "8 RGB frames · task prompt", outputs: "Verb · noun · confidence",              vram: 22,   latency: "2.5 s / window",      runtime: "gpu-node · remote", determ: true, notes: "Deterministic decoding · 86 % verb-noun accuracy on internal eval." },
    { name: "Lightweight Hand",       role: "21-kpt fallback",                   tier: "LIGHT",      task: "Fast bbox → 21 keypoints when the frontier model drops the hand.",   inputs: "RGB bbox",                   outputs: "21 hand keypoints · confidence",        vram: 0,    latency: "0.02 s / frame",      runtime: "cpu",             notes: "Patches gaps · runs on CPU." },
    { name: "Lightweight Body",       role: "33-kpt body pose",                  tier: "LIGHT",      task: "Full-body keypoints for humanoid-transfer downstream tasks.",         inputs: "RGB frame",                  outputs: "33 body keypoints",                     vram: 0,    latency: "0.05 s / frame",      runtime: "cpu",             notes: "Runs on CPU · humanoid retarget input." },
  ] as ModelSpec[],
  peakVram: "Peak sequential VRAM: ~22 GB · verified on NVIDIA data-center GPUs.",
} as const;

/* ────────────────────────────────────────────────────────────────────
   HITL Studio — real screenshots from the running system
   ──────────────────────────────────────────────────────────────────── */
export interface HitlShot { src: string; caption: string; backend: string; }

export interface HitlTab {
  key: "segmenter" | "hand" | "vla" | "burn";
  label: string;
  backendLabel: string;
  image: string;
  images?: string[]; // burn tab: 4-frame strip
  caption: string;
  alt: string;
}

export const HITL_STUDIO = {
  fig: "FIG.09 — AUTO-LABEL PIPELINE · COCKPIT",
  title: "Cockpit",
  lead: "One annotation workspace, three model-backed assistants. Click once to propagate a mask, draw a bbox to drop keypoints, and let the frontier VLA score every window. What a reviewer touches becomes the ground-truth label for the pipeline.",
  ls: {
    // Public-safe labels — no hostname, no port.
    host: "Annotation workspace",
    backends: [
      { name: "Segmenter backend",   model: "Frontier segmenter",            task: "Click → mask · ±15 frame fill" },
      { name: "Hand-kpt backend",    model: "Lightweight hand detector",     task: "Bbox → 21 MANO keypoints" },
      { name: "VLA backend",         model: "Frontier VLA",                   task: "8-frame window → verb + noun" },
    ],
    projects: [
      { k: "Video project",    v: "Bounding boxes + track_id · video-native" },
      { k: "Keypoint project", v: "42 keypoints per keyframe · per-hand overlay" },
    ],
  },
  tabs: [
    {
      key: "segmenter",
      label: "Segmenter",
      backendLabel: "Segmenter backend",
      image: "/images/hitl/hitl_capture_thumb.jpg",
      caption: "Click once — mask propagates ±15 frames across the video. Reviewer verifies, edits if needed, and moves on.",
      alt: "Segmenter cockpit screenshot",
    },
    {
      key: "hand",
      label: "Hand keypoints",
      backendLabel: "Hand-kpt backend",
      image: "/images/hitl/hitl_clean_thumb.jpg",
      caption: "Draw a bounding box on the hand — the backend drops 21 anatomical keypoints with per-joint confidence.",
      alt: "Hand keypoints cockpit screenshot",
    },
    {
      key: "vla",
      label: "Verb + noun",
      backendLabel: "VLA backend",
      image: "/images/hitl/hitl_wiping_thumb.jpg",
      caption: "Every 8-frame window is scored deterministically for action verb and object noun. Same prompt, same output, every run.",
      alt: "Verb + noun cockpit screenshot",
    },
    {
      key: "burn",
      label: "Overlay preview",
      backendLabel: "Burn pipeline",
      image: "/images/hitl/annotated_sample.jpg",
      images: [
        "/images/hitl/preview_first.jpg",
        "/images/hitl/preview_mid.jpg",
        "/images/hitl/preview_last.jpg",
        "/images/hitl/reel_frame.png",
      ],
      caption: "Once QC passes, every stream is burned back into a single annotated video — hand pose, object bbox, track_id, action label per frame.",
      alt: "Burn overlay preview strip",
    },
  ] as HitlTab[],
} as const;

/* ────────────────────────────────────────────────────────────────────
   8-check auto-label QC diagnostic (real, from AUTOLABEL_QA.md)
   ──────────────────────────────────────────────────────────────────── */
export interface DiagCheck { key: string; label: string; criterion: string; failMode: string; }

export const QC_DIAG = {
  fig: "FIG.09 — AUTO-LABEL PIPELINE · DIAGNOSTIC",
  title: "Diagnostic · eight named gates",
  lead: "Before HITL sees a single frame, `tbrain-ego diag` runs eight quantitative checks against the auto-label output. If a capture fails any gate, it's tagged and either re-processed or rejected. These are the exact check names in production.",
  cmd: "$ auto-label diag <capture>",
  checks: [
    { key: "K_consistency",       label: "Intrinsics match",       criterion: "|K_depth − K_hand| / K < 5%",                      failMode: "Camera-model disagreement" },
    { key: "frame_alignment",     label: "Frame alignment",        criterion: "len(tracker output) == frame count",               failMode: "Off-by-N frame drift" },
    { key: "hand_detect_rate",    label: "Hand detected",           criterion: "Hand tracker valid frames > 10%",                  failMode: "Hands out of view · pipeline unusable" },
    { key: "filter_pass_rate",    label: "Filter pass rate",        criterion: "hands_in_labels / raw detections > 40%",           failMode: "Fallback dominates · low quality" },
    { key: "kpt_outlier_pct",     label: "Keypoint jitter",         criterion: "< 5% frames with > 200 px jump",                   failMode: "Tracking drift · joint teleport" },
    { key: "camera_trajectory",   label: "Camera trajectory",       criterion: "‖R_c2w − I‖ ≥ 1e-3",                              failMode: "SLAM never converged · flat scene" },
    { key: "kpts_3d_dual_frame",  label: "3D dual-frame",           criterion: "Both world + cam frames present",                  failMode: "Missing frame · downstream break" },
    { key: "object_world_scale",  label: "Object world scale",      criterion: "0.1 m < mean ‖t‖ < 5.0 m",                        failMode: "Scale collapse · object at ∞" },
  ] as DiagCheck[],
  bottomLine: "8/8 pass ⇒ eligible for HITL. Anything less ⇒ rejected, re-run, or downgraded to reference-only.",
} as const;

/* ────────────────────────────────────────────────────────────────────
   LeRobot v2 export snapshot (real from meta/info.json)
   ──────────────────────────────────────────────────────────────────── */
export const LEROBOT_EXPORT = {
  fig: "FIG.12 — LeROBOT v2 EXPORT",
  title: "Shipped in the format frontier labs already train on",
  lead: "No proprietary schema. No conversion contract. Every batch exports directly to LeRobot v2 parquet + video, drops into your pipeline the day you sign, and mirrors to RLDS on request.",
  meta: {
    dataset_name: "tbrain_ego_v2",
    robot_type: "egocentric_human",
    codebase_version: "v2.0",
    total_episodes: 8,
    total_frames: 5016,
    total_tasks: 6,
    total_videos: 16,
    total_chunks: 1,
    chunks_size: 1000,
    fps: 15.0,
    resolution: "640×480 · h264 · yuv420p",
    streams: ["observation.images.rgb", "observation.images.depth", "action_type"],
  },
  snippet: `{
  "dataset_name": "tbrain_ego_v2",
  "robot_type":   "egocentric_human",
  "total_episodes": 8,
  "total_frames":   5016,
  "total_tasks":    6,
  "total_videos":   16,
  "fps": 15.0,
  "features": {
    "observation.images.rgb":   { "dtype": "video", "shape": [3, 480, 640] },
    "observation.images.depth": { "dtype": "video", "shape": [3, 480, 640], "is_depth_map": true },
    "action_type": { "dtype": "string" }
  }
}`,
} as const;

/* ────────────────────────────────────────────────────────────────────
   Partner-profile data-type deliverables
   (7 modality bundles in tbrain-robotics-research/Tbrain-Robotics-Data-Deliverables)
   ──────────────────────────────────────────────────────────────────── */
export interface PartnerModality { key: string; name: string; source: string; video?: string; poster?: string; note: string; own: boolean; }

export const PARTNER_MODALITIES = {
  fig: "FIG.13 — MODALITY LIBRARY",
  title: "Every data type in one shipping catalog",
  lead: "Egocentric is our own capture. UMI, ALOHA, mobile-manipulation, PushT, sim-teleop and OpenX single-arm come through validated partner profiles — same LeRobot v2 schema, same QC-gate contract. If your foundation model consumes it, we ship it.",
  items: [
    { key: "egocentric",   name: "Egocentric human video",   source: "Tbrain Capture Pack",           video: "/videos/real-captures/pick_up_the_cup.webm", poster: "/images/real-captures/pick_up_the_cup-loop.jpg", note: "8 episodes shipped · MANO hand + depth + verb-noun", own: true },
    { key: "aloha",        name: "ALOHA bimanual teleop",    source: "Partner profile · 4-camera",    video: "/videos/deliverables/aloha-4cam.mp4",         poster: "",                                                note: "4-cam synchronized · dual-arm imitation learning",   own: false },
    { key: "umi",          name: "UMI / handheld gripper",   source: "Partner profile · $700 rig",     video: "",                                            poster: "/images/deliverables/all6-montage.png",           note: "6-DoF SLAM pose + gripper trajectory",               own: false },
    { key: "mobile-manip", name: "Mobile manipulation",      source: "Partner profile · wheeled base", video: "",                                            poster: "/images/deliverables/all6-montage.png",           note: "Base + arm coordinated demos",                       own: false },
    { key: "openx",        name: "OpenX single-arm real",    source: "Partner profile · OpenX",       video: "",                                            poster: "/images/deliverables/all6-montage.png",           note: "Single-arm real robot · cross-embodiment ready",     own: false },
    { key: "pusht",        name: "PushT · 2D simple",        source: "Partner profile · 2D pushing",  video: "/videos/deliverables/pusht.mp4",              poster: "",                                                note: "Diffusion Policy explainer benchmark",               own: false },
    { key: "sim-teleop",   name: "Simulation teleop",        source: "Partner profile · Isaac Lab",   video: "",                                            poster: "/images/deliverables/all6-montage.png",           note: "MimicGen-ready seed · sim + real bridged",           own: false },
    { key: "exo-mocap",    name: "Exocentric mocap",         source: "Partner profile · signed",       video: "/videos/modalities/exo-mocap.webm",           poster: "/images/modalities/exo-mocap.jpg",                note: "Throwing motion · body-scale mocap · retarget-ready", own: false },
  ] as PartnerModality[],
  disclosure: "Own = captured on Tbrain hardware. Partner profile = validated third-party sample bundles delivered under the same QC-gate contract.",
} as const;

/* ────────────────────────────────────────────────────────────────────
   Public egocentric datasets — reference wall (not ours, credited)
   ──────────────────────────────────────────────────────────────────── */
export interface PublicDataset { name: string; org: string; hours: string; domain: string; sensor: string; href: string; }

export const PUBLIC_DATASETS = {
  fig: "FIG.15 — PUBLIC REFERENCE WALL",
  title: "We build on top of the open frontier",
  lead: "Public egocentric datasets set the ceiling for what a research team already expects. We benchmark to them, extend them into East-Asian environments simulation never sees, and deliver in the same schemas. Everything below is credited public work — not ours.",
  items: [
    { name: "Ego4D",           org: "Meta AI · 88 orgs",         hours: "3,025 h",  domain: "Multi-domain · 74 cities", sensor: "Head-mounted, 855 wearers", href: "https://ego4d-data.org" },
    { name: "EPIC-Kitchens",   org: "Univ. Bristol · Toronto",   hours: "100 h",    domain: "Kitchen · cooking",         sensor: "Head-mounted GoPro",         href: "https://epic-kitchens.github.io" },
    { name: "EGTEA Gaze+",     org: "Georgia Tech",              hours: "28 h",     domain: "Kitchen · 86 sessions",     sensor: "Eye-gaze + head cam",        href: "https://cbs.ic.gatech.edu/fpv/" },
    { name: "EgoCom",          org: "Facebook AI Research",      hours: "38 h",     domain: "Human conversation",        sensor: "Multi-modal ego",            href: "https://github.com/facebookresearch/EgoCom-Dataset" },
    { name: "TREK-150",        org: "Univ. Bologna",             hours: "1.5 h",    domain: "First-person tracking",     sensor: "Head-mounted",               href: "https://machinelearning.uniud.it/datasets/trek150/" },
  ] as PublicDataset[],
  disclosure: "Public references only · we do not resell public data · all links go to the original project pages.",
} as const;

/* ────────────────────────────────────────────────────────────────────
   Rerun episode viewer (one real episode)
   ──────────────────────────────────────────────────────────────────── */
export const RERUN_EMBED = {
  fig: "FIG.11 — RERUN EPISODE VIEWER",
  title: "Every episode is a multi-track Rerun scene",
  lead: "Rerun is how our engineers actually debug a capture — RGB, depth, hand skeleton, object pose, camera trajectory, all frame-scrubbable. We publish one .rrd from a real episode so you can open the same view we do.",
  rrd: "/videos/rerun/aloha-4cam.rrd",
  fallbackVideo: "/videos/deliverables/aloha-4cam.mp4",
  externalLabel: "Open in Rerun web viewer",
  externalHrefPrefix: "https://app.rerun.io/version/0.24.0/index.html?url=",
  tracks: [
    "camera/rgb", "camera/depth", "hand/left · 21 kpt", "hand/right · 21 kpt",
    "object/bbox · track_id", "object/pose · 6-DoF", "camera/trajectory · SLAM",
  ],
} as const;

/* Why Tbrain — Vietnam edge */
export const VIETNAM_EDGE = {
  fig: "FIG.16 — WHY TBRAIN",
  title: "Annotation depth, accountability & field-scale ops",
  lead: "We win on annotation depth, accountability, and a field-scale operation no US-centric vendor has — not a race to the bottom on price.",
  items: [
    { k: "Annotation depth", v: "Hand pose · sub-action · failure/recovery · human audit" },
    { k: "Accountability", v: "Recruit · train · QC · QA report on every delivery" },
    { k: "Environment diversity", v: "Residential · commercial · industrial · retail · field" },
    { k: "Interoperability", v: "LeRobot / RLDS — plugs into modern training pipelines" },
    { k: "Field scale", v: "Vietnam university partner network · ramps in parallel" },
  ],
} as const;
