#!/usr/bin/env node
/**
 * Seed rich `extended_content` for case studies into the LOCAL Supabase dev DB
 * (tbrain_landing.case_studies). Idempotent — upsert on slug.
 *
 * The case-study detail page splits `extended_content` on <h2> into sections
 * (src/app/casestudy/[slug]/page.tsx :: splitCaseStudySections), each rendered
 * as a blueprint card. Body uses h3/p/ul/blockquote/figure+figcaption — styled
 * by `.case-study-body` (token-based, dark-mode-aware).
 *
 * Images: OWNED, visually verified assets only (no debug-banner captures).
 * Public-safe: no named anchor customers, no internal pricing.
 *
 * Usage: node scripts/seed-case-studies.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
loadEnv(".env.development.local");
loadEnv(".env.local");

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing SUPABASE creds."); process.exit(1); }
if (!/127\.0\.0\.1|localhost/.test(url)) { console.error("Refusing: not a local DB URL:", url); process.exit(1); }

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, db: { schema: "tbrain_landing" } });

const ROBOTICS_MOCAP = `
<h2>The challenge</h2>
<p>Robot foundation models for manipulation need something synthetic data can't fake: <strong>ground-truth human motion and 3D hand pose, captured in the real world, at sub-millimetre precision</strong> — and across enough task, object, and environment diversity that a policy actually generalizes.</p>
<p>The usual sources all fall short. Teleoperation is the gold standard for clean action labels but it's slow and costly — 1 to 10 minutes of skilled operator time per episode, and it only covers the tasks you can afford to script. Web video is effectively infinite but passive: no joint angles, no gripper state, no metric scale. The scarce resource is <strong>real, action-paired, metrically-accurate motion data</strong>.</p>
<figure>
<img src="/images/modalities/teleop.jpg" alt="VR teleoperation of robot arms">
<figcaption>The expensive baseline: teleoperation yields exact labels but only ~135 demonstrations an hour, per robot, per operator — it can't cover the diversity a generalist policy needs.</figcaption>
</figure>

<h2>The approach</h2>
<p>We combined two capture regimes on one synchronized clock. Egocentric capture packs worn by operators on real production floors supply the diversity and first-person viewpoint a robot actually acts from; lab-grade optical motion capture supplies the sub-millimetre reference that validates it. Every stream — RGB, depth, markers, hand pose, object pose — is hardware-clock aligned so a MANO-style 21-keypoint hand, a 33-keypoint body, and the object it manipulates all share a single timeline.</p>
<figure>
<img src="/images/modalities/mocap.jpg" alt="Performer in a marker-based motion-capture suit">
<figcaption>Lab-grade optical MOCAP provides the sub-mm ground-truth trajectories that anchor every egocentric capture to real-world scale.</figcaption>
</figure>

<h2>Data and modalities</h2>
<p>Each episode ships as a bundle of <strong>12+ synchronized modalities</strong>, not a single video — so a training pipeline can pick exactly the signals its model consumes.</p>
<figure>
<img src="/images/modalities/spatial.jpg" alt="Multi-camera spatial capture rig reconstructing an object">
<figcaption>Multi-view spatial capture reconstructs objects and scene geometry, co-registered with the egocentric and mocap streams.</figcaption>
</figure>
<ul>
<li><strong>Egocentric RGB</strong> — first-person, close to the robot's own sensor pose.</li>
<li><strong>Multi-view RGB-D</strong> — spatial reconstruction + metric depth.</li>
<li><strong>Optical MOCAP markers</strong> — sub-mm ground-truth body and hand trajectories.</li>
<li><strong>MANO 21-keypoint hands + 33-keypoint body</strong> — per-frame pose.</li>
<li><strong>Object masks + 6-DoF pose</strong> — track-linked across every frame.</li>
<li><strong>Verb-noun action segments</strong> — what happens, when.</li>
<li><strong>IMU, audio, and SLAM camera trajectory</strong> — full sensor context.</li>
</ul>
<p>Across the corpus that's <strong>829 hours</strong> of reference-grade capture spanning household and commercial robotics tasks.</p>

<h2>The QC pipeline</h2>
<p>Precision claims mean nothing without a gate that enforces them. Every capture flows through an <strong>8-model auto-label pipeline</strong> that pre-fills hand, body, masks, depth, and verb-noun on all frames, then through <strong>15 machine-checkable hard rules</strong> before a human ever looks.</p>
<figure>
<img src="/images/hitl/annotated_sample.jpg" alt="Annotated capture with object mask and 21-keypoint hand skeletons under review">
<figcaption>Auto-label output under QC: object mask plus a 21-keypoint skeleton on each hand. A confidence model auto-rejects the broken 20–30% so reviewers spend their time on genuine edge cases.</figcaption>
</figure>
<p>The hard rules catch the failures that quietly poison a policy — stream desync, out-of-range world scale (an object's position ‖t‖ must land inside 0.1–5 m), dropped tracks, idle frames. What survives gets layered human review: annotator, reviewer, audit.</p>
<blockquote>The moat isn't the capture rig. It's the judgment encoded in the QC pipeline — the checks that separate sub-mm ground truth from noise that looks fine until a robot trains on it.</blockquote>

<h2>The outcome</h2>
<p>Sub-millimetre precision, validated against peer-reviewed motion-capture benchmarks, across <strong>6+ manipulation use cases</strong>. Every episode ships with its QC report and manifest, delivered <strong>RLDS- and LeRobot-ready in ≤48 hours</strong> — no proprietary format, no conversion tax.</p>
<figure>
<img src="/images/depth/pick_up_the_cup_rgb_depth.jpg" alt="RGB frame beside its metric depth heatmap">
<figcaption>Metric depth with a world-scale sanity check ships alongside every capture — the kind of verifiable ground truth a frontier manipulation model can train on directly.</figcaption>
</figure>
`.trim();

const now = new Date().toISOString();
const rows = [
  {
    slug: "robotics-mocap",
    extended_content: ROBOTICS_MOCAP,
    image_url: "/images/robotics-hero.jpg",
    updated_at: now,
  },
];

console.log(`Seeding ${rows.length} case study/-ies to ${url} …`);
for (const r of rows) {
  const { error } = await db.from("case_studies").update({ extended_content: r.extended_content, image_url: r.image_url, updated_at: r.updated_at }).eq("slug", r.slug);
  if (error) { console.error("Update failed for", r.slug, error); process.exit(1); }
  console.log(`  ✓ ${r.slug} — extended_content ${r.extended_content.length} chars`);
}
console.log("Done.");
