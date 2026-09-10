#!/usr/bin/env node
/**
 * Seed 5 launch blog posts for the Physical AI content program.
 * Upserts on slug so re-running is safe.
 *
 * Run: pnpm exec node scripts/seed-robotics-blog.mjs
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env (or .env.local).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load .env.local if present so the script works without additional shell setup.
try {
  const envPath = resolve(ROOT, ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf-8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch { /* ignore */ }

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[seed] SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required in env / .env.local");
  process.exit(1);
}

const NOW = new Date().toISOString();
const POSTS = [
  {
    slug: "anatomy-of-a-physical-ai-capture-pack",
    title: "Anatomy of a Physical AI capture pack",
    excerpt:
      "MK-001 REV A — 6-part BOM, 1638 sensor timestamps per session on pick_up_the_cup, and why offline-first is non-negotiable in a real factory.",
    category: "robotics",
    tags: ["capture", "hardware", "egocentric", "physical-ai"],
    cover_image_url: "/images/pack/pack-hero.jpg",
    author_name: "Tbrain Robotics",
    content_md: `# Anatomy of a Physical AI capture pack

**Anchor concept · hardware.** Robot foundation models do not lack compute. They lack synchronized, action-paired data captured in the messy real world. The MK-001 REV A pack is the cheapest bridge that turns any operator on any factory floor into a labeled data source.

## The rig — MK-001 REV A · 6 parts

| # | Part | Stream | Role |
|---|------|--------|------|
| 01 | Intel RealSense D455 | RGB · Depth · IMU | Global-shutter first-person capture |
| 02 | GoPro head-mount | Stabilized RGB | UMI-compatible fisheye |
| 03 | Raspberry Pi 5 (8GB) | Sync · timestamps | Hardware-clock + local pipeline |
| 04 | NVMe SSD (256GB) | Offline buffer | Zero dropped frames |
| 05 | 20,000mAh PD power bank | Power | Full 8–10h shift |
| 06 | 3D-printed belt harness | — | All-day wearable |

## Real numbers from pick_up_the_cup · 20260617T01

- **273 frames** at 15 fps · 18.2 s runtime
- **6 streams** synchronized to a single interrupt clock
- **273 × 6 = 1638 sensor timestamps** per session — no software-clock inference
- **0 dropped frames** across the shift (NVMe write is 3× the sensor bit-rate)

## Why the hardware clock matters

Software timestamps drift roughly 40 ms per hour. On a fast fabric fold that is four mislabeled frames. Every stream timestamps to the same interrupt-service clock, so downstream SLAM and hand-track do not inherit a lie.

## Offline-first, always

Factories have unreliable Wi-Fi. The pack caches locally and syncs every five minutes in the background — no capture ever waits for a connection. Uploads land in an on-site cache, mirror to object storage, then to our foundry.

## If you buy

- MK-001 REV A kit list + capture firmware for your operators to wear
- 8-stream synchronized data on every session (RGB · Depth · IMU · Audio · SLAM · Pose · action_segments · manifest)
- Deployment support for on-site cache + offline sync
- Retainer for firmware updates as we add sensors

Continue to the pipeline that consumes these captures → [/data/physical-ai/auto-label](/data/physical-ai/auto-label)
`,
  },
  {
    slug: "eight-models-one-auto-label-pipeline",
    title: "8 models, one auto-label artifact",
    excerpt:
      "Per-capture output for 4 real episodes — HaWoR ✓, Sapiens gated, SAM3 ✓ (except iron_02 fail), MoGe ✓, verb-noun VLM ✓. Every field diffable.",
    category: "robotics",
    tags: ["auto-label", "annotation", "pipeline", "physical-ai"],
    cover_image_url: "/images/descriptions/pick_up_the_cup.jpg",
    author_name: "Tbrain Robotics",
    content_md: `# 8 models, one auto-label artifact

**Anchor concept · pipeline.** Eight models run on every capture. They emit into a single manifest with per-field provenance. Here is the real per-capture output on 4 shipped episodes.

## Per-capture output — 4 real captures

| Capture | Hand · MANO | Body · Sapiens | Object · SAM3 | Depth · MoGe | Verb-noun · VLM |
|---------|:-:|:-:|:-:|:-:|:-:|
| pick_up_the_cup · 20260617T01 | ✓ | gated (ego topology) | ✓ | ✓ | ✓ |
| iron_product · 20260626T01 | ✓ | gated | ✓ | ✓ | ✓ |
| iron_product · 20260626T02 | ✓ | gated | **FAIL · locked pants** | ✓ | ✓ |
| sew_hem · 20260626T01 | ✓ | gated | ✓ | ✓ | ✓ |

## The eight

1. **Hand tracker** — per-frame MANO 21-kpt + per-hand SLAM
2. **Body dense** — 308-kpt whole-body regression, topology-gated on ego
3. **Video segmenter** — text-prompted object masks + tracklet IDs
4. **6-DoF object pose** — per-frame position + orientation
5. **Monocular depth** — metric depth + pointmap
6. **Camera SLAM** — trajectory across the episode
7. **Verb-noun VLM** — action_segments with confidence + canonical noun_id
8. **Ontology resolver** — maps free-form nouns to a 200-entry industrial ontology

## Description first

The VLM is cheap and fast: it emits verb-noun action_segments with confidence + canonical noun_id. Downstream stages read this to decide what mask to track and what pose to solve.

## The honest failure — iron_product 20260626T02

The segmenter locked onto the operator's pants instead of the iron across 100% of frames. Rather than silently ship, our hard-rules gate fires \`FAIL_LABEL\` on the tracklet and we ship the flag with the capture — not silence. The mask-drift watermark surfaces in the annotated.mp4 so any downstream diff can see it.

## If you buy

- Per-episode manifest with every field's model + version + git SHA
- The burned annotated.mp4 with palette-encoded provenance + watermark failure surface
- Rerun .rrd scene with all 9 tracks (RGB · Depth · MANO L/R · body_dense · mask · pose · SLAM · action_segments)
- Retrain cycle: your feedback lands in the next auto-label version, diffable against the last

Full deep dive → [/data/physical-ai/auto-label](/data/physical-ai/auto-label)
`,
  },
  {
    slug: "fifteen-hard-rules-we-run-on-every-capture",
    title: "15 hard rules · 3 real fires",
    excerpt:
      "Full 15-rule taxonomy with real threshold + real sample-pass value from pick_up_the_cup. Three actual fires: iron_T01 K_consistency, sew_02 hand_detect, body_dense on textile ego.",
    category: "robotics",
    tags: ["qc", "quality-control", "hard-rules", "physical-ai"],
    cover_image_url: "/images/diagrams/diagram-qc.svg",
    author_name: "Tbrain Robotics",
    content_md: `# 15 hard rules · 3 real fires

**Anchor concept · QC.** The cheapest reviewer is an assertion. Fifteen machine-readable rules run against every capture before a human ever sees it.

## The 15 rules — with real sample-pass values

Every value below is from pick_up_the_cup · 20260617T01 (273 frames · 18.2 s).

| # | Rule | Category | Threshold | Sample value |
|---|------|----------|-----------|--------------|
| 01 | K_consistency | calibration | ε ≤ 1e-3 | 8.7e-5 |
| 02 | Camera trajectory | calibration | monotonic + smooth | pass |
| 03 | Hand detection rate | detection | > 90% both hands | L=94% · R=97% |
| 04 | Filter-pass rate | detection | > 85% | 92% |
| 05 | Body pose rate | detection | > 40% | 70.5% |
| 06 | Body dense rate | detection | > 60% + conf | 100% · conf 0.57 |
| 07 | Frame alignment | temporal | ≤ 1 frame drift | 0 |
| 08 | Tracklet continuity | temporal | > 70% assigned | 100% |
| 09 | Kpt outlier % | spatial | < 5% | 1.8% |
| 10 | 3D dual-frame sanity | spatial | Δz < 0.15m | 0.04m |
| 11 | World-scale sanity | spatial | 0.1 ≤ ‖t‖ ≤ 5m | 1.45m mean |
| 12 | Class mapping rate | semantic | > 70% | 266/266 · 100% |
| 13 | Action segment count | semantic | ≥ 1 | 5 · vlm |
| 14 | Grasp event density | semantic | > 0.05 / frame | 110 / 271 = 40.6% |
| 15 | Schema + provenance | provenance | model + version + git_sha | git=1b0cce1 |

## Three real fires

### Fire 1 · K_consistency on iron_product · 20260626T01
Per-cap SLAM divergence during the fold pass. Rule 01 fired at ε = 6.2e-3, capture routed to Label Studio with reason \`K_consistency\`. Human check confirmed drift from a lens smudge; recaptured next shift.

### Fire 2 · hand_detect_rate on sew_hem · 20260626T02
Left-hand detection rate dropped to 8% during the needle-threading segment (hand tucked behind fabric). Rule 03 fired \`hand_detect_rate · L=8%\` and routed to a human kpt-fix queue.

### Fire 3 · body_dense_rate on textile ego captures
Sapiens 308-kpt regressor emits confidently-wrong nose-below-hip skeletons on head-mounted cameras. Rule 06 catches this as \`topology_invalid\` and suppresses the dense body layer from the visualization — not from the manifest. The raw kpts still ride downstream for research on partial-body detection.

## Never silent

Every fire lands as a Label Studio task with the rule name attached. Every fix keeps the provenance trail intact. Every hard-rule value ships in the summary.json alongside the capture.

## If you buy

- summary.json for every capture with all 15 rule values
- Reviewer sign-off log per capture (accept · reject · flag + reason codes)
- Escalation trail for systemic failures (root-cause reports, feedback into training loop)
- Same 15-rule gate applied to any recapture on your behalf

Full QC playbook → [/data/physical-ai/quality](/data/physical-ai/quality)
`,
  },
  {
    slug: "label-studio-humans-on-the-last-mile",
    title: "Humans on the last mile",
    excerpt:
      "Under 10% of frames touch a human. 68 vs 12 kpts/min pre-fill vs blank. 92% first-pass ship rate. Real numbers on the HITL economics.",
    category: "robotics",
    tags: ["hitl", "label-studio", "human-review", "physical-ai"],
    cover_image_url: "/images/hitl/annotated_sample.jpg",
    author_name: "Tbrain Robotics",
    content_md: `# Humans on the last mile

**Anchor concept · HITL economics.** Auto-label + hard rules do the heavy lift. Humans only see what needs judgment.

## The numbers that matter

- **&lt; 10% of frames** touch a human directly
- **68 kpts/min** annotator throughput on pre-populated tasks vs **12 kpts/min** on from-blank (5.7× lift, sample of 42 textile captures)
- **92% first-pass ship rate** after hard rules → AI filter → Label Studio → reviewer
- **6% escalation** to engineering for systemic failures
- **avg 2.3 min** per task at the annotator layer

## The 4-stage workflow

1. **Human framing box** — reviewer draws initial bounding box + verb-noun on 1 keyframe per capture
2. **AI predicts** — auto-label pipeline pre-fills 21-kpt hand + 308-kpt body + object mask across all 273 frames
3. **Human finetune** — annotator corrects drift, adjusts masks, overrides verb-noun. Every diff writes back to the manifest
4. **Ship** — reviewer signs off. Hard rules re-run. LeRobot v2 parquet + Rerun scene shipped

## Why it holds ≤48h

An 18-second, 273-frame capture ships in 48 hours because the split looks like this:

| Phase | Hours | What happens |
|-------|-------|--------------|
| Capture | 8 | Operator wears the rig · offline record + sync |
| Auto-label | 6 | 8 models in parallel · hard rules gate |
| HITL fix | 8 | Label Studio · &lt;10% frames touched |
| QC + sign-off | 4 | Reviewer + escalation dashboard |
| Buffer | 22 | Reshoot / escalation slack · rarely used |

Full HITL workflow diagram → [/data/physical-ai/quality#label-studio](/data/physical-ai/quality#label-studio)

## If you buy

- Label Studio project handoff with your captures pre-loaded, project template, and interface config
- Reviewer notes per capture (which frames were touched, which rule fired the escalation)
- Diffable correction trail — every kpt edit, every mask redraw, every verb-noun override is a labeled event
- The same 4-stage workflow applied to any recapture we run for you

Full QC playbook → [/data/physical-ai/quality](/data/physical-ai/quality)
`,
  },
  {
    slug: "zero-trust-delivery-lerobot-plus-rerun-proof",
    title: "Zero-trust delivery · LeRobot v2 + Rerun proof",
    excerpt:
      "The delivery contract, field-by-field. LeRobot v2 parquet walkthrough + Rerun .rrd scene + palette legend. What actually ships, per episode.",
    category: "robotics",
    tags: ["delivery", "lerobot", "rerun", "physical-ai"],
    cover_image_url: "/images/deliverables/all6-montage.png",
    author_name: "Tbrain Robotics",
    content_md: `# Zero-trust delivery · LeRobot v2 + Rerun proof

**Anchor concept · contract.** We ship the source of truth. The buyer chooses the flavor. No screenshots, no cherry-picked metrics — the buyer opens the scene themselves in the same viewer our engineers use to debug.

## LeRobot v2 parquet · field-by-field

Every episode ships as LeRobot v2 parquet + video with the full manifest and a Rerun .rrd scene.

\`\`\`
episode_000042.parquet
├── observation.images.rgb        · uint8[T, H, W, 3]
├── observation.images.depth      · float32[T, H, W]
├── observation.hands.left.kpts   · float32[T, 21, 3]  (x, y, conf)
├── observation.hands.right.kpts  · float32[T, 21, 3]
├── observation.body_dense.kpts   · float32[T, 308, 2] (dense off by default in viz)
├── observation.object.mask       · uint8[T, H, W]      (track_id encoded)
├── observation.object.pose_6dof  · float32[T, 4, 4]
├── observation.camera.slam       · float32[T, 4, 4]
├── action.verb                   · string[T]           (canonical from ontology)
├── action.noun_id                · int32[T]
├── action.segment_id             · int32[T]
└── meta.provenance               · struct              (per-field model + version + git_sha)
\`\`\`

## What ships in the .rrd scene

9 tracks · 273 frames · 44 MB for pick_up_the_cup:

- \`camera/rgb\`
- \`camera/depth\`
- \`camera/trajectory\` (SLAM · line3d)
- \`hand/left · MANO 21-kpt\`
- \`hand/right · MANO 21-kpt\`
- \`body/dense · 308-kpt\` (off by default · read via blueprint tree)
- \`object/mask · track_id\`
- \`object/pose · 6-DoF\`
- \`action_segments\` (verb-noun timeline)

## The palette legend

Every colored dot / mesh in the annotated.mp4 maps 1:1 to a source in the manifest. Every watermark maps to a flag.

| Color | Source | Meaning |
|-------|--------|---------|
| #4cb5ff | hand-tracker MANO | Primary hand tracker · SLAM per hand · 21-kpt |
| #a78bfa | interp | Frame-level interpolation across a gap |
| #f0a2ff | segmenter (mask only) | Object segmenter mask |
| #ff9a4d | Sapiens wrist | Wrist fallback where hand-tracker fails |
| #00e5c7 | MoGe depth | Metric depth + pointmap |
| #5ee08a | human correction | Label Studio diff |

## Zero-trust means diffable

Every field ships with the model + version + git SHA that produced it. A rerun with an updated model creates a diffable delta, not a silent overwrite. The buyer never has to take our word for anything.

## If you buy

- LeRobot v2 parquet + video per episode
- Rerun .rrd (all 9 tracks) for buyer scrub
- Palette legend PDF (annotated.mp4 decoder)
- Delivery within ≤48h of capture close
- Retrain cadence: your feedback lands in the next auto-label cycle, diffable against the last

Sample episode → [/data/physical-ai/quality#rerun-proof](/data/physical-ai/quality#rerun-proof)
`,
  },
];

const APPLY = process.argv.includes("--apply");
const PUBLISH = process.argv.includes("--publish");  // DANGER: makes posts live on tbrain.ai/blog
const STATUS = PUBLISH ? "published" : "draft";
const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  db: { schema: "tbrain_landing" },
});

async function main() {
  console.log(`[seed] target: ${SUPABASE_URL}`);
  console.log(`[seed] status will be: ${STATUS}${PUBLISH ? " (WILL APPEAR ON tbrain.ai/blog)" : " (hidden from public /blog — visible only in /admin/content)"}`);
  if (!APPLY) {
    console.log("[seed] DRY-RUN mode. Nothing will be written.");
    console.log("[seed] Re-run with --apply to insert as draft.");
    console.log("[seed] Re-run with --apply --publish to insert as published (LIVE on tbrain.ai).");
    for (const post of POSTS) {
      console.log(`  · would upsert: ${post.slug} · ${post.title}`);
    }
    return;
  }
  console.log("[seed] --apply set. Writing to database.");
  for (const post of POSTS) {
    const word_count = post.content_md.trim().split(/\s+/).length;
    const payload = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content_md: post.content_md,
      cover_image_url: post.cover_image_url,
      category: post.category,
      tags: post.tags,
      author_name: post.author_name,
      status: STATUS,
      published_at: PUBLISH ? NOW : null,
      seo_title: post.title,
      seo_description: post.excerpt,
      og_image_url: post.cover_image_url,
      word_count,
      updated_at: NOW,
    };
    const { data, error } = await client
      .from("cms_posts")
      .upsert(payload, { onConflict: "slug" })
      .select("id, slug, category")
      .single();
    if (error) {
      console.error(`[seed] ${post.slug} FAIL:`, error.message);
      process.exitCode = 1;
    } else {
      console.log(`[seed] ${data.slug} OK (${data.id.slice(0, 8)}… · ${data.category})`);
    }
  }
  console.log("[seed] done");
}

main().catch((e) => {
  console.error("[seed] fatal:", e);
  process.exit(1);
});
