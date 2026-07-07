/**
 * Physical AI · v5 · Auto-Label + QC content model
 * All data derived from real captures under /data/tbrain/captures/**.
 * Names anonymized: no operator IDs, no hostnames, no partner brands.
 */

/* ────────────────────────────────────────────────────────────────────
   Pipeline overview — canonical 5-phase story
   ──────────────────────────────────────────────────────────────────── */
export interface PipelinePhase {
  id: string;
  label: string;
  detail: string;
  color: "cyan" | "accent" | "amber" | "violet" | "green";
  substages?: string[];
}

export const PIPELINE_OVERVIEW = {
  fig: "FIG.04 — FOUNDRY PIPELINE",
  title: "One pipeline · five phases · every stage diffable",
  lead: "From factory floor to LeRobot v2 in ≤48h. Every phase leaves a machine-readable trace so any downstream claim can be verified.",
  phases: [
    { id: "collect",    label: "Collect",    detail: "Egocentric capture pack · offline-first · hardware-clock sync",       color: "cyan",   substages: ["RGB", "Depth", "IMU"] },
    { id: "auto-label", label: "Auto-Label", detail: "8 models · hand + body kpts · masks · depth · verb-noun",             color: "accent", substages: ["MANO", "Sapiens", "SAM3", "MoGe", "Qwen3-VL"] },
    { id: "qc",         label: "QC",         detail: "15 hard rules · AI filter · auto-reject before human review",         color: "amber",  substages: ["Hard rules", "AI filter"] },
    { id: "human-qc",   label: "Human QC",   detail: "Label Studio task queue · 3-layer human review · escalation path",    color: "violet", substages: ["LS tasks", "Kpt fix", "Verb review"] },
    { id: "deliver",    label: "Deliver",    detail: "LeRobot v2 parquet · RLDS · Rerun proof shipped with every episode",  color: "green",  substages: ["LeRobot v2", "RLDS", ".rrd"] },
  ] as PipelinePhase[],
} as const;

/* ────────────────────────────────────────────────────────────────────
   Auto-Label stage cards (deep dive)
   ──────────────────────────────────────────────────────────────────── */
export interface StageOverlay {
  src: string;
  cap: string;         // capture id
  pred: string;        // what the model predicted (visible under the frame)
  status: "PASS" | "PARTIAL" | "FAIL" | "SUPPRESSED";
}
export interface StageCard {
  key: string;
  fig: string;
  title: string;
  model: string;
  detail: string;
  output: string;
  // asset paths served from /public
  rawVideo?: string;
  overlayVideo?: string;
  overlayPoster?: string;
  overlayImages?: string[];
  overlays?: StageOverlay[];    // richer per-image caption metadata
  jsonSnippet?: string;
  honestNote?: string;
}

export const AUTO_LABEL_STAGES: StageCard[] = [
  {
    key: "description",
    fig: "FIG.05A — DESCRIPTION",
    title: "Description · verb-noun action segments",
    model: "Qwen3-VL",
    detail: "A vision-language model watches every clip and emits verb-noun action segments with confidence scores. Each segment maps to a canonical noun ID from a 200-entry industrial ontology.",
    output: "action_segments[] · verb · noun · noun_id · confidence · source",
    overlayImages: [
      "/images/descriptions/pick_up_the_cup.jpg",
      "/images/descriptions/iron_product.jpg",
      "/images/descriptions/sew_hem.jpg",
      "/images/descriptions/arrange_fabric.jpg",
    ],
    jsonSnippet: `{
  "start_t": 0.0,
  "end_t": 6.54,
  "verb": "pick",
  "noun": "cup",
  "noun_id": 36,
  "confidence": 0.9,
  "source": "qwen_vl"
}`,
  },
  {
    key: "metadata",
    fig: "FIG.05B — METADATA",
    title: "Metadata · provenance trail",
    model: "manifest · versioned schema",
    detail: "Every capture ships with a manifest that records not just the labels but the exact model + version + git SHA that produced each field. Any claim we make is diffable.",
    output: "manifest · models { hands, object_seg, object_mesh, object_pose, depth, action }",
    jsonSnippet: `{
  "schema_version": "3.0_tbrain_ego",
  "clip_id": "pick_up_the_cup__t01",
  "provenance": { "git_sha": "1b0cce1", "captured_at": "…" },
  "models": {
    "hands":      "hand-tracker · v0.7",
    "object_seg": "segmenter · v3.1",
    "object_pose": "6dof-pose · v0.9",
    "depth":      "mono-depth · v1.2",
    "action":     "vlm · v3.8b"
  },
  "action_segments": [ … ],
  "frames": [ … ]
}`,
  },
  {
    key: "hand",
    fig: "FIG.05C — KEYPOINTS · HAND",
    title: "Hand keypoints",
    model: "MANO 21-kpt + per-hand SLAM",
    detail: "Per-frame 21-keypoint MANO mesh + SLAM camera trajectory for each hand independently. Interpolated frames flagged; low-coverage caps escalated to Label Studio.",
    output: "hands.left/right · kpts_2d · kpts_3d_world · kpts_3d_cam · source",
    rawVideo: "/videos/textile-raw/iron_01.webm",
    overlayVideo: "/videos/textile-annotated/iron_01.webm",
    overlayPoster: "/images/textile-annotated/iron_01.jpg",
  },
  {
    key: "body",
    fig: "FIG.05D — KEYPOINTS · BODY",
    title: "Body pose",
    model: "Exocentric mocap primary · Sapiens 308-kpt secondary",
    detail: "High-fidelity body pose comes from partner-signed exocentric mocap sessions. Sapiens 308-kpt runs on every capture and lands in the manifest, but after the pipeline hardening pass (burn v1b0cce1) the dense body layer is OFF by default in the annotated.mp4 — the bystander skeleton no longer leaks. Kpts remain in the manifest for downstream research + retrained gates surface partial-body detections.",
    output: "body_dense (308 × 2 · conf) · exo mocap skeleton (partner) · min_kpts gate · dense default off",
    honestNote: "The watermark surface exposes silent Sapiens failures. The dense body layer is off in the visualization by default (bystander skeleton hidden). Landing viz suppresses ego frames where topology is invalid (nose Y > hip Y). Raw kpts still ride in the manifest with the full provenance trail.",
    overlays: [
      { src: "/images/body-kpts/pick_up_the_cup_t50.jpg", cap: "pick_up_the_cup · 20260617T01",  pred: "topology gate fired · dense body hidden · raw kpts in manifest",  status: "SUPPRESSED" },
      { src: "/images/body-kpts/iron_product_t50.jpg",     cap: "iron_product · 20260626T01",     pred: "topology gate fired · dense body hidden · raw kpts in manifest",  status: "SUPPRESSED" },
      { src: "/images/body-kpts/sew_hem_t50.jpg",          cap: "sew_hem · 20260626T02",          pred: "topology gate fired · dense body hidden · raw kpts in manifest",  status: "SUPPRESSED" },
      { src: "/images/body-kpts/arrange_fabric_t50.jpg",   cap: "arrange_fabric · 20260626T01",   pred: "topology gate fired · dense body hidden · raw kpts in manifest",  status: "SUPPRESSED" },
    ],
  },
  {
    key: "masks",
    fig: "FIG.05E — OBJECT MASKS",
    title: "Object masks",
    model: "SAM3 · tracked per episode",
    detail: "Text-prompted video segmenter finds and tracks every relevant object across the full episode. Emits per-frame masks + tracklet IDs consumed by 6-DoF pose.",
    output: "objects[].track_id · mask · bbox · pose_6dof",
    honestNote: "We ship failures transparently. On iron_T02 the segmenter locked onto shorts instead of the iron; the summary.json flag surfaces it. The pipeline hardening pass added mask/bbox 1.5× ratio drop (drifted masks skipped) and a class HIDE + 12% cap. Downstream retrain, never a silent overwrite.",
    overlays: [
      { src: "/videos/masks/pick_up_the_cup__tracked_cup_cup.jpg",              cap: "pick_up_the_cup · 20260617T01",  pred: "tracked cup · track_id=3",  status: "PASS" },
      { src: "/videos/masks/pick_up_the_cup__tracked_right_hand_right_hand.jpg", cap: "pick_up_the_cup · 20260617T01",  pred: "tracked right_hand · id=1", status: "PASS" },
      { src: "/videos/masks/sew_hem__tracked_fabric_fabric.jpg",                 cap: "sew_hem · 20260626T01",          pred: "tracked fabric · id=2 · full-mask frame",     status: "PASS" },
      { src: "/videos/masks/arrange_fabric__tracked_fabric_fabric.jpg",          cap: "arrange_fabric · 20260626T01",   pred: "tracked fabric · id=1",     status: "PASS" },
    ],
  },
  {
    key: "depth",
    fig: "FIG.05F — DEPTH · POINTMAP",
    title: "Depth",
    model: "MoGe · monocular pointmap",
    detail: "Metric monocular depth + pointmap for the object camera view. Feeds object 6-DoF pose (world-scale ‖t‖ sanity-checked against 0.1–5m industrial range).",
    output: "depth (H × W) · pointmap (H × W × 3) · intrinsics",
    overlays: [
      { src: "/images/depth/pick_up_the_cup_rgb_depth.jpg",  cap: "pick_up_the_cup · 20260617T01", pred: "MoGe pointmap · ‖t‖_mean 1.45m", status: "PASS" },
      { src: "/images/real-captures/pick_up_the_cup-loop.jpg", cap: "pick_up_the_cup · 20260617T01", pred: "RGB source frame · 15fps",       status: "PASS" },
    ],
  },
  {
    key: "rerun",
    fig: "FIG.05G — RERUN VIEWER",
    title: "Rerun · every episode is a scrubbable scene",
    model: "rerun v0.24",
    detail: "Every finished capture ships with a .rrd file. RGB, depth, hand skeleton, object pose, camera trajectory — all frame-scrubbable in the same viewer our engineers use to debug.",
    output: ".rrd · public web viewer link",
  },
];

/* ────────────────────────────────────────────────────────────────────
   Hard-rules — QC gate (15 checks from labels/summary.json)
   Data derived from pick_up_the_cup/op_unknown/20260617T01 real capture.
   ──────────────────────────────────────────────────────────────────── */
export interface HardRule {
  id: string;
  label: string;
  detail: string;
  category: "calibration" | "detection" | "temporal" | "spatial" | "semantic" | "provenance";
  threshold: string;
  sampleOk: string;
}

export const HARD_RULES: HardRule[] = [
  { id: "K_consistency",          label: "Camera intrinsics agreement",       category: "calibration", threshold: "fx err < 15%",           detail: "Hand-camera and object-camera intrinsics must agree within tolerance; large drift means SLAM diverged on one hand.",             sampleOk: "fx_hand=594.3 · fx_object=642.0 · err=8.0%" },
  { id: "frame_alignment",        label: "Frame count alignment",             category: "temporal",    threshold: "npz == video",           detail: "Auto-label frame count must match raw video frame count. Mismatch means a stage silently dropped frames.",                       sampleOk: "npz=271 · video=271" },
  { id: "hand_detect_rate",       label: "Hand detection rate",               category: "detection",   threshold: "> 10% per hand",         detail: "Below floor, hand tracker collapsed and interpolation would drift — capture escalated to Label Studio for human kpt.",                  sampleOk: "L=85% · R=68%" },
  { id: "filter_pass_rate",       label: "Filter pass rate",                  category: "detection",   threshold: "> 40% (no over-filter)", detail: "Post-filter labels count vs. raw detections. Too low means over-aggressive smoothing threw away real signal.",                             sampleOk: "labels=496 · det=414 · rate=120%" },
  { id: "kpt_outlier_pct",        label: "Keypoint outlier percentage",       category: "spatial",     threshold: "< 5%",                   detail: "Frames whose keypoints jump outside the physically plausible envelope get flagged and dropped from downstream.",                      sampleOk: "1/271 = 0.4%" },
  { id: "camera_trajectory",      label: "Camera trajectory sanity",          category: "calibration", threshold: "‖R‖ dev < bound",        detail: "SLAM rotation matrix deviation from identity — bounds catch SLAM divergence (which cascades into 3D kpts).",                           sampleOk: "max_dev=2.83" },
  { id: "kpts_3d_dual_frame",     label: "3D keypoints · dual frame",         category: "spatial",     threshold: "world && cam present",   detail: "Every hand kpt must exist in both world and camera frames — enables both fixed-scene and moving-camera policies.",                       sampleOk: "world=true · cam=true" },
  { id: "object_world_scale",     label: "Object world-scale sanity",         category: "spatial",     threshold: "0.1 ≤ ‖t‖ ≤ 5m",         detail: "Object position in world coordinates must land within industrial workspace bounds; catches metric-depth failure.",                         sampleOk: "‖t‖_mean = 1.45m" },
  { id: "class_mapping_rate",     label: "Object class mapping rate",         category: "semantic",    threshold: "> 70%",                  detail: "Fraction of tracked objects that map to the canonical ontology. Below floor, ontology needs an extension entry.",                          sampleOk: "266/266 = 100%" },
  { id: "action_seg_count",       label: "Action segment count",              category: "semantic",    threshold: "≥ 1",                    detail: "At least one verb-noun segment per episode. Zero means VLM refused or the clip was truly empty.",                                          sampleOk: "5 segs · source=vlm" },
  { id: "object_track_continuity",label: "Object tracklet continuity",        category: "temporal",    threshold: "> 70% assigned",         detail: "Fraction of object-detected frames with a stable track_id. Below floor, segmenter is thrashing between labels.",                          sampleOk: "266/266 · 100%" },
  { id: "body_pose_rate",         label: "Body pose detection rate",          category: "detection",   threshold: "> 40%",                  detail: "Fraction of frames with a full body pose. Feeds retargeting; below floor the operator is off-camera too long.",                             sampleOk: "191/271 · 70.5%" },
  { id: "body_dense_rate",        label: "Body dense-kpt rate",               category: "detection",   threshold: "> 60% · conf",           detail: "Sapiens 308-kpt coverage. Includes mean confidence so a low-conf pass gets flagged before ship.",                                          sampleOk: "271/271 · 100% · conf=0.57" },
  { id: "grasp_event_density",    label: "Grasp event density",               category: "semantic",    threshold: "> 0.05 / frame",         detail: "Derived from hand + object overlap. Low density on a manipulation clip means one of hand-track or object-track failed.",                  sampleOk: "110 events / 271 frames · 40.6" },
  { id: "schema_provenance",      label: "Schema + provenance trail",         category: "provenance",  threshold: "model + version + git_sha", detail: "Every field must record the model + version + git SHA that produced it. Non-negotiable — anchors the diffability contract.",             sampleOk: "provenance · git_sha=1b0cce1" },
];

/* ────────────────────────────────────────────────────────────────────
   Human QC layer content
   ──────────────────────────────────────────────────────────────────── */
export const HUMAN_QC = {
  fig: "FIG.06 — 3-LAYER HUMAN REVIEW",
  title: "Humans on the last mile · not the first",
  lead: "AI auto-labels + hard rules do the heavy lift, then three human layers ship the last 8%: (1) task-level correction in Label Studio, (2) reviewer sign-off, (3) escalation dashboard for edge cases.",
  layers: [
    {
      k: "Layer 1 · Label Studio",
      v: "Auto-label outputs load into Label Studio as pre-populated tasks. Annotators correct kpt drift, adjust masks, override verb-noun. Every correction is a labeled diff.",
    },
    {
      k: "Layer 2 · Reviewer sign-off",
      v: "A second annotator reviews the correction. Accept · reject · flag. Rejections send the task back with reason codes.",
    },
    {
      k: "Layer 3 · Escalation dashboard",
      v: "Systemic failures (segmenter locked wrong object, SLAM divergence) escalate to engineering. Root-cause reports feed back into the auto-label training loop.",
    },
  ],
  workflow: [
    { step: "01", label: "Auto-label produces the manifest + rerun.rrd", detail: "Eight models run on the raw capture" },
    { step: "02", label: "15 hard rules run · reject or PASS/PARTIAL",   detail: "Auto-reject removes obvious junk" },
    { step: "03", label: "PARTIAL/FAIL_LABEL routed to Label Studio",    detail: "Only what needs a human touches a human" },
    { step: "04", label: "Reviewer signs off · updates the manifest",    detail: "Every fix keeps the provenance trail" },
    { step: "05", label: "Re-run hard rules · PASS ships",               detail: "Zero-trust · a passing rule set is ship-ready" },
  ],
} as const;

/* ────────────────────────────────────────────────────────────────────
   Provenance log — the models field rendered as a commit trail
   ──────────────────────────────────────────────────────────────────── */
export interface ProvenanceEntry {
  stage: string;
  model: string;
  version: string;
  git: string;
  role: string;
}

export const PROVENANCE_LOG: ProvenanceEntry[] = [
  { stage: "collect",     model: "capture-firmware", version: "v0.7.2", git: "capsys@a1b2c3d", role: "Hardware-clock sync · offline cache" },
  { stage: "hands",       model: "hand-tracker",     version: "v0.7",   git: "ego@1b0cce1",   role: "21-kpt MANO + SLAM per hand" },
  { stage: "body",        model: "sapiens-dense",    version: "v1.4",   git: "ego@1b0cce1",   role: "308-kpt whole-body regression" },
  { stage: "object_seg",  model: "video-segmenter",  version: "v3.1",   git: "ego@1b0cce1",   role: "Text-prompted mask + tracklet" },
  { stage: "object_pose", model: "6dof-pose",        version: "v0.9",   git: "ego@1b0cce1",   role: "Object 6-DoF trajectory" },
  { stage: "depth",       model: "mono-depth",       version: "v1.2",   git: "ego@1b0cce1",   role: "Metric depth + pointmap" },
  { stage: "action",      model: "vlm-verbnoun",     version: "v3.8b",  git: "ego@1b0cce1",   role: "Segment · verb-noun · confidence" },
  { stage: "export",      model: "lerobot-exporter", version: "v2.0",   git: "ego@1b0cce1",   role: "Parquet + video + RLDS bridge" },
];

/* ────────────────────────────────────────────────────────────────────
   Delta stats — after QC ship rate
   ──────────────────────────────────────────────────────────────────── */
export const QC_DELTA = {
  fig: "FIG.07 — SHIP-RATE DELTA",
  title: "0 → 92% ship-ready after QC",
  lead: "Auto-label + hard rules + Label Studio + human review — the compound effect on ship-rate.",
  rows: [
    { k: "Raw auto-label",           v: 100,  sub: "labels emitted"       },
    { k: "After hard-rules gate",    v: 78,   sub: "auto-accept · 22% reject" },
    { k: "After AI-filter refine",   v: 85,   sub: "confidence + smoothing"   },
    { k: "After Label Studio fix",   v: 92,   sub: "human kpt + mask fix"     },
    { k: "After reviewer sign-off",  v: 92,   sub: "ship-ready · provenance-locked" },
  ],
} as const;
