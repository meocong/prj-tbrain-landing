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
  eyebrow: "Data is the bottleneck — not compute.",
  title: "The Robotics Data Foundry for Physical AI",
  sub: "We forge lab-grade, action-paired datasets — egocentric, UMI, teleoperation — captured on our own purpose-built hardware, synchronized and QC'd by an AI-native pipeline, delivered RLDS-ready. Not a concept. A working data engine.",
  ctaPrimary: { label: "See a sample dataset", href: "/contact" },
  ctaSecondary: { label: "How the foundry works", href: "/data/physical-ai" },
  trust: "Trusted by 3 of the world's leading AI labs · LeRobot / RLDS standard · Tailscale zero-trust",
} as const;

export const ANCHOR_TRUST = {
  headline: "The data layer behind frontier robot foundation models",
  // Anonymized — do not name the labs publicly.
  labs: "Trusted by 3 of the world's leading AI labs",
  standards: [
    { name: "LeRobot", detail: "Hugging Face dataset standard" },
    { name: "RLDS", detail: "Open X-Embodiment format" },
    { name: "Tailscale", detail: "Zero-trust delivery" },
    { name: "ISO 27001 → SOC 2", detail: "Security roadmap" },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   The problem
   ──────────────────────────────────────────────────────────────────── */
export const PROBLEM = {
  fig: "FIG.00 — PROBLEM STATEMENT",
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
  part: string;      // component name
  spec: string;      // technical spec
  role: string;      // what data capability it gives
}

export const COLLECTION_PACK = {
  fig: "FIG.01 — TBRAIN CAPTURE PACK",
  title: "Our own capture rig — purpose-built to collect, tuned for the factory",
  lead: "Mecka and Claru ship concept art. We ship hardware. The Tbrain Capture Pack is developed in-house — device, capture firmware, and data pipeline are all ours. Each worker wears a stereo egocentric pack that records RGB + depth + IMU, timestamps it against a hardware clock, caches offline, and syncs to the factory — at 50 to 500 packs in parallel.",
  bom: [
    { num: "01", part: "Stereo depth camera", spec: "Stereo RGB + depth + IMU", role: "First-person capture aligned to the robot's eye view" },
    { num: "02", part: "On-pack compute (SBC)", spec: "8GB, on-board", role: "Capture, timestamp sync, local pipeline" },
    { num: "03", part: "NVMe SSD", spec: "256GB cache", role: "Offline-first local buffer — never drop a frame" },
    { num: "04", part: "Power bank", spec: "20,000mAh PD", role: "A full 8–10h collection shift" },
    { num: "05", part: "Tbrain belt enclosure", spec: "In-house wearable", role: "Comfortable all-day field capture" },
    { num: "06", part: "Head-mount rig", spec: "Stabilized mount", role: "Stable egocentric viewpoint" },
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
  fig: "FIG.02 — FOUNDRY LINE / DATA PIPELINE",
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
  fig: "FIG.06 — PRODUCT MAP · EASY → HARD",
  title: "We climb difficulty and margin, deliberately",
  lead: "Start with the data type that's cheap on hardware and where we hit quality immediately. Nail the first batch, earn references, then climb — no detours.",
  rungs: [
    { step: "01", name: "Egocentric + exocentric human video", difficulty: "Low–Med", buyers: "World model · VLA", phase: "Now" },
    { step: "02", name: "Language + success/fail + QC labels", difficulty: "Low", buyers: "Any policy", phase: "Now" },
    { step: "03", name: "UMI / handheld gripper", difficulty: "Med", buyers: "VLA manipulation", phase: "Q2" },
    { step: "04", name: "Teleoperation (ALOHA / SO-100)", difficulty: "High", buyers: "VLA · imitation", phase: "Q3" },
    { step: "05", name: "Dexterous · tactile · lab-grade mocap", difficulty: "Very high", buyers: "Humanoid", phase: "Year 2 · moat" },
  ] as LadderRung[],
} as const;

/* ────────────────────────────────────────────────────────────────────
   FIG.07 — Real-world environments
   ──────────────────────────────────────────────────────────────────── */
export const ENVIRONMENTS = {
  fig: "FIG.07 — ENVIRONMENT LIBRARY",
  title: "Data synthetic never sees",
  lead: "A diverse, real-world environment library is the asset simulation can't fake and US-centric vendors don't have. We capture the East-Asian, industrial, and agricultural settings world-model labs are starved for.",
  items: [
    { name: "Home kitchens", note: "Cooking, dishes, tidying" },
    { name: "Wet markets & retail", note: "Picking, bagging, handling" },
    { name: "Small workshops", note: "Assembly, tool use, repair" },
    { name: "Agriculture", note: "Sorting, harvesting, packing" },
    { name: "Warehouse & food service", note: "Commercial manipulation" },
    { name: "In-the-wild egocentric", note: "Walking, multi-room tasks" },
  ],
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
    why: "Humanoids need dexterous data to fold fabric, handle eggs, assemble. Hardware-heavy — a Year-2 moat product, not a day-one wedge.",
    dataNeeded: "Tactile / force + dexterous hand pose",
    tbrainData: "Dexterous + mocap (roadmap)", fit: 2, hotness: "Rising",
    group: "build-brains", axis: "Humanoid · Dexterous",
  },
  {
    id: "mocap", name: "Capture human movement", formal: "Mocap / human motion",
    kicker: "Optical + IMU whole-body capture, retargeted to humanoid robots.",
    why: "The humanoid boom is driving demand for whole-body motion — and diverse body types. A defensible, higher-margin growth product.",
    dataNeeded: "Optical + IMU suits, retarget pipeline",
    tbrainData: "Lab-grade mocap (optical + IMU)", fit: 3, hotness: "Rising",
    group: "create-data", axis: "Humanoid locomotion",
  },
];

export const DIRECTIONS_SYNTH = {
  fig: "FIG.09 — RESEARCH DIRECTIONS",
  title: "Whatever you're building, here's the data it needs",
  lead: "Eleven research directions, two clusters: ways to create data cheaper, and ways to turn data into robot brains. Each one consumes a specific kind of data — and most of them consume exactly what we forge.",
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

export const PROOF_POINTS = [
  { stat: "10×", claim: "Egocentric video vs teleop demo efficiency", src: "EgoMimic, Georgia Tech" },
  { stat: "log-linear", claim: "More egocentric hours → steadily better robots", src: "NVIDIA EgoScale" },
  { stat: "62 hrs", claim: "Robot video + 1M hrs web video → zero-shot grasp", src: "Meta V-JEPA 2" },
  { stat: "~10,000 hrs", claim: "Across 7 platforms trains one VLA (π0)", src: "Physical Intelligence" },
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
      { k: "Session", v: "EP-2026-0617-0142" },
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

/* How much we can ship */
export const AVAILABILITY = {
  fig: "FIG.15 — DATA AVAILABILITY",
  title: "Capacity that scales with your program",
  lead: "Built to ship volume fast — and to grow from a pilot batch to a continuous pipeline.",
  stats: [
    { value: 500, suffix: "", k: "Parallel capture packs" },
    { value: 10000, suffix: "+", k: "Episodes / month at scale" },
    { value: 6, suffix: "+", k: "Environment categories" },
    { value: 8, suffix: "", k: "Synchronized streams" },
  ],
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
