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
      "The rig we carry into a factory to record a training-grade episode — enclosure, sensors, hardware clock, and why offline-first is non-negotiable.",
    category: "robotics",
    tags: ["capture", "hardware", "egocentric", "physical-ai"],
    cover_image_url: "/images/pack/pack-hero.jpg",
    author_name: "Tbrain Robotics",
    content_md: `# Anatomy of a Physical AI capture pack

Robot foundation models don't lack compute. They lack synchronized, action-paired data captured in the messy real world. The pack is what makes that data possible.

## Why the pack matters

Teleop is expensive; web video is passive. Neither ships with per-frame joint states, gripper events, and camera intrinsics that a policy can learn from. A wearable capture pack is the cheapest bridge: it turns any operator on any factory floor into a labeled data source.

## The rig — MK-001 REV A

- **Intel RealSense D455** — stereo depth + RGB + IMU · global shutter · ~87° FOV
- **GoPro head-mount** — HyperSmooth stabilized RGB · UMI-compatible fisheye
- **Raspberry Pi 5 (8GB)** — hardware-clock sync + local pipeline
- **NVMe SSD (256GB)** — offline buffer, zero dropped frames
- **20,000mAh PD power bank** — full 8–10h shift
- **3D-printed belt** — ergonomic, all-day wearable

## The hardware clock

Software timestamps drift ~40 ms an hour. On a fast fabric fold, that is four mislabeled frames. Every stream on the pack timestamps to the same interrupt-service clock, so downstream SLAM and MANO don't inherit a lie.

## Offline-first

Factories have unreliable Wi-Fi. The pack caches locally and syncs every five minutes in the background — no capture ever waits for a connection. Uploads land in MinIO on-site, mirror to R2, then to our foundry.

## From pack to pipeline

A capture becomes a **schema_v3 labels.json** in ≤48h — through 8 auto-label models and 15 hard rules. [See the auto-label pipeline →](/data/physical-ai/auto-label)
`,
  },
  {
    slug: "eight-models-one-auto-label-pipeline",
    title: "8 models, one auto-label pipeline",
    excerpt:
      "From raw rgb.mp4 to schema_v3 labels.json in ≤48h — which model runs where, what each one emits, and how they combine into a single provenance-traced artifact.",
    category: "robotics",
    tags: ["auto-label", "annotation", "pipeline", "physical-ai"],
    cover_image_url: "/images/descriptions/pick_up_the_cup.jpg",
    author_name: "Tbrain Robotics",
    content_md: `# 8 models, one auto-label pipeline

Eight models run on every capture. They emit into a single **labels.json** with per-field provenance. Here is what each does — and why the assembly matters more than any one model.

## The eight

1. **Hand tracker** — per-frame MANO 21-kpt + per-hand SLAM
2. **Body dense** — 308-kpt whole-body regression (COCO body + feet + face + 2×21 hands + 175 mesh)
3. **Video segmenter** — text-prompted object masks + tracklet IDs
4. **6-DoF object pose** — per-frame position + orientation
5. **Monocular depth** — metric depth + pointmap
6. **Camera SLAM** — trajectory across the episode
7. **Verb-noun VLM** — action_segments with confidence + canonical noun_id
8. **Ontology resolver** — maps free-form nouns to a 200-entry industrial ontology

## Description first

The VLM is cheap and fast: it emits **verb-noun action_segments** with a confidence and a canonical noun_id. Downstream stages read this to decide what mask to track and what pose to solve.

## Provenance everywhere

Every field in labels.json records the model + version + git SHA that produced it. A rerun with a newer model creates a **diffable** update — no silent overwrites. That's how we ship "the same view our engineers see" in every episode.

## Failures we surface

On iron_T02, the segmenter locked onto shorts instead of the iron. The summary.json check flagged it. We ship that flag with the capture — not silence.

Full deep dive at [/data/physical-ai/auto-label →](/data/physical-ai/auto-label)
`,
  },
  {
    slug: "fifteen-hard-rules-we-run-on-every-capture",
    title: "15 hard rules we run on every capture (and the failures they catch)",
    excerpt:
      "Every capture crosses a 15-check machine-readable gate before a human ever sees it. Here's what each rule watches for — and a real capture where it fired.",
    category: "robotics",
    tags: ["qc", "quality-control", "hard-rules", "physical-ai"],
    cover_image_url: "/images/diagrams/diagram-qc.svg",
    author_name: "Tbrain Robotics",
    content_md: `# 15 hard rules we run on every capture

The cheapest reviewer is an assertion. We save the humans for judgment calls.

## Why hard rules first

Auto-label output is not silver bullet — it drifts, hallucinates, and occasionally locks onto the wrong object. Before any of that touches a human queue, 15 machine-checkable rules run against every capture. If any fires, the capture routes into human review with the reason attached.

## The six categories

- **Calibration** — K_consistency, camera trajectory sanity
- **Detection** — hand rate, filter pass rate, body pose rate, body dense rate
- **Temporal** — frame alignment, tracklet continuity
- **Spatial** — kpt outlier %, 3D dual-frame, world-scale sanity
- **Semantic** — class mapping rate, action segment count, grasp event density
- **Provenance** — schema_v3 + git SHA trail

## Real fires

- **K_consistency** caught a per-cap SLAM divergence on iron_T01 before it corrupted downstream 3D kpts
- **hand_detect_rate** flagged sew_02 at L=8% — routed to Label Studio for human kpt
- **body_dense_rate** shows Sapiens degrades on tight ego view — we ship the honest metric, not a hidden fallback

## Never silent

FAIL → Label Studio task with the rule name attached. Reviewers know exactly what to check. Every fix keeps the schema_v3 provenance trail intact.

Full QC playbook at [/data/physical-ai/quality →](/data/physical-ai/quality)
`,
  },
  {
    slug: "label-studio-humans-on-the-last-mile",
    title: "Label Studio + humans on the last mile",
    excerpt:
      "Auto-label + hard rules do the heavy lift. Only PARTIAL/FAIL captures reach a human — pre-populated in Label Studio with the reason attached.",
    category: "robotics",
    tags: ["hitl", "label-studio", "human-review", "physical-ai"],
    cover_image_url: "/images/hitl/annotated_sample.jpg",
    author_name: "Tbrain Robotics",
    content_md: `# Label Studio + humans on the last mile

Full-blank annotation queues waste annotator time and catch only what a fresh eye can catch. Our queue looks nothing like that.

## Pre-populated, not blank

Every task that reaches Label Studio arrives with auto-label output already loaded — MANO 21-kpt on the hand, SAM3 masks on the tracked object, verb-noun in the segment form. The annotator's job is **correction**, not from-scratch labeling.

## Three human layers

1. **Task-level correction** — kpt drift, mask edges, verb-noun override
2. **Reviewer sign-off** — a second annotator accepts / rejects / flags
3. **Escalation dashboard** — systemic failures (segmenter locked wrong object across four caps in a row) route to engineering

## Every fix is a diff

Every correction lands as a labeled diff back into the auto-label training loop. Nothing lands on the floor twice.

## The economics

Auto-label + hard rules keep human touchpoints below 10% of frames. That's what makes ≤48h delivery + 92% ship rate feasible.

Full QC playbook at [/data/physical-ai/quality →](/data/physical-ai/quality)
`,
  },
  {
    slug: "zero-trust-delivery-lerobot-plus-rerun-proof",
    title: "Zero-trust delivery · LeRobot v2 + Rerun proof",
    excerpt:
      "Every episode ships as LeRobot v2 parquet + a Rerun .rrd. No screenshots, no cherry-picked metrics — the buyer opens the scene themselves.",
    category: "robotics",
    tags: ["delivery", "lerobot", "rerun", "physical-ai"],
    cover_image_url: "/images/deliverables/all6-montage.png",
    author_name: "Tbrain Robotics",
    content_md: `# Zero-trust delivery · LeRobot v2 + Rerun proof

We ship the source of truth. The buyer chooses the flavor.

## The delivery contract

Every episode ships as **LeRobot v2 parquet + video** with the full **schema_v3 labels.json** and a **Rerun .rrd** scene. RLDS on request. No proprietary schema, no conversion contract.

## Why .rrd

A Rerun scene beats a screenshot the same way source code beats a screenshot of source code. Every claim we make in the sales pitch is **scrubbable** from the same viewer our engineers use to debug. No hidden state, no cherry-picked frame.

## What ships in the scene

- camera/rgb
- camera/depth
- hand/left · MANO 21-kpt
- hand/right · MANO 21-kpt
- body_dense · 308-kpt
- object/mask · track_id
- object/pose · 6-DoF
- camera/trajectory · SLAM
- action_segments · verb-noun timeline

## Zero-trust means diffable

Every field ships with the model + version + git SHA that produced it. A rerun with an updated model creates a diffable delta, not a silent overwrite. That is what "zero-trust" means: **the buyer never has to take our word for anything**.

Sample episode → [/data/physical-ai/quality#rerun-proof](/data/physical-ai/quality#rerun-proof)
`,
  },
];

const APPLY = process.argv.includes("--apply");
const client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log(`[seed] target: ${SUPABASE_URL}`);
  if (!APPLY) {
    console.log("[seed] DRY-RUN mode. Nothing will be written. Re-run with --apply to insert.");
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
      status: "published",
      published_at: NOW,
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
