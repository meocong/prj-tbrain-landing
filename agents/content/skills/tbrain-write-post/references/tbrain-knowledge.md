# Tbrain knowledge reference (public-safe)

Every fact below is verified against a source file in this repo (or a URL already published on tbrain.ai). Each section cites its source(s) in an HTML comment. If a post needs a fact that isn't here or on tbrain.ai, **ask chị Tâm** — don't guess, and don't pull numbers from `/root/drake/tbrain/tbrain-robotics-research/*` (internal strategy docs; background only, never quotable).

This file is the first thing to read before drafting. `brand-voice.md` still has voice/tone rules; this file is the fact base.

---

## 1. Positioning — the one-liners actually used on the site

<!-- Source: src/app/page.tsx (metadata), src/lib/landing/physical-ai.ts FOUNDRY_HERO, src/lib/landing/about-sections.ts -->

- Site `<title>` / meta: **"Tbrain | Trusted Human Infrastructure for Agentic AI"** — "Trusted human infrastructure for agentic AI across coding, robotics, evaluation, RLHF, SFT, and post-training data programs."
- Homepage hero (Physical AI section): **"The Robotics Data Foundry for Physical AI"** — "Real capture packs, worn by operators on the factory floor — egocentric, action-paired, deeply annotated. Sourced through an industrial partner network across Asia, QC'd, and delivered RLDS-ready."
- `/about` framing: **"The improvement layer for agentic AI"** — "Expert-validated environments, data, and evaluation programs that make agentic AI measurably better. Run by domain pods built for high-stakes work."
- Company line (about page fallback): "Tbrain builds managed data programs for frontier AI teams," combining "expert operations, workflow software, and AI-native quality control."
- Mission line: "Turn specialized human expertise into reliable model signal."
- Use **"Tbrain is a Physical AI robotics data foundry, and also a human-data partner for LLM post-training (RLHF/SFT), benchmarks, and agent evaluation"** as the one-sentence version when a post needs to introduce the whole company rather than one line.

## 2. Service lines

<!-- Source: src/lib/constants/marketing.ts (PRODUCT_PILLARS, SERVICES, DOMAIN_PODS, EXPERTISE_AREAS, EXPERT_NETWORK, PLATFORM_FEATURES) -->

Three pillars on the homepage (`PRODUCT_PILLARS`):
1. **Robotics** — "Data for embodied intelligence." Lab-grade capture (optical mocap, IMU, depth, scoped per program); household + factory focus (cooking, cleaning, laundry, assembly, picking); scene-aware egocentric video with 3D hand pose. Links to `/data/physical-ai`.
2. **AI Agent Evaluation** — "Measure what matters." Terminal Bench: multi-step reasoning across Linux, DevOps, Security, Database; layered validation (spec → oracle → LLM baseline → expert review); anti-cheat by design (no test leakage, no hardcoding). Links to `/data/terminal-bench`.
3. **Custom Data Programs** — "The fuel for post-training at scale." RLHF preference data, domain-specific SFT datasets, AI-native QC, domain expert pods (Medical, STEM, Coding, Finance), multi-modal (text/image/video/audio) in one pipeline. Links to `/services`.

`/services` page services (`SERVICES`):
- **Custom Expert Data Collection** — RLHF, SFT, and expert data for pre-training, post-training, fine-tuning, and evaluation workflows.
- **Benchmark Creation** — custom task design, rubrics, test cases, validation harnesses, datasets that expose real model failures.
- **Agent Evaluation and Analysis** — model and agent grading, failure analysis, LLM-assisted review, final human judgment from domain experts.

**Domain pods** (`DOMAIN_PODS`, six): Coding (software engineering, terminal workflows, DevOps, security, databases, code review) · Medical (clinical, imaging, diagnostics, healthcare QA) · Manufacturing (factory ops, process documentation, quality inspection) · Languages (Asian languages, Spanish, Portuguese, Baltic languages, multilingual evaluation) · Physical AI / Robotics (egocentric video, mocap, manipulation, embodied task data) · RL Environments (environments, tasks, rewards, validation loops).

**Expertise areas** (`EXPERTISE_AREAS`, for about/expert bios): Coding & DevOps (Python, C++, Java, Linux sysadmin, full stack) · Mathematics (real analysis, linear algebra, topology) · Science (physics, chemistry, biology) · Robotics (egocentric video, hand pose, motion capture, teleoperation) · Data Science (Python, SQL, ML, LLM fine-tuning) · Finance (macro, financial reporting) · Medical (clinical, imaging, diagnostics).

**Expert network** (`EXPERT_NETWORK`): "Elite domain expertise, on demand." Headline stat: **"48K+ Expert contributors across 17+ countries."** Also: "PhDs from top universities and research institutions"; "8+ domains: Coding, STEM, Medical, Robotics, Finance." ⚠️ See §9 on "48K" ambiguity before using this number.

**Expert OS platform features** (`PLATFORM_FEATURES` / `expert-os.ts`, four, shown as the "platform" section):
- **Agent Knowledge Base** — custom one-to-one training and instant reference guides that keep agents aligned with the work they need to perform.
- **LLM-as-a-Judge** — automated evaluation before final human judgment, so quality scales without removing expert accountability.
- **Agentic Workflows** — workflow loops where agents help review, route, and improve agent outputs across the delivery system.
- **Agent Identity & Soul** — persistent agent context, goals, and operating style that make agent behavior coherent over time.

Use "Expert OS" as the name for this software layer (it's a distinct, under-covered angle — see §12 open lanes).

## 3. Physical AI — hardware, pipeline, QC

<!-- Source: src/lib/landing/physical-ai.ts, src/lib/landing/physical-ai-qc.ts -->

### Capture Pack MK-001 (canonical name — see §11)
Six-piece bill of materials (`COLLECTION_PACK`), in-house enclosure + firmware + pipeline, research-grade parts:
1. **Intel RealSense D455** — stereo depth + RGB + IMU, global shutter, ~87° FOV, depth ≤6m. Research-grade first-person capture, aligned to the robot's eye view.
2. **GoPro (head-mount)** — egocentric RGB, HyperSmooth, up to 5.3K, fisheye ~155° for UMI-style capture.
3. **Raspberry Pi 5 (8GB)** — on-pack compute, captures + synchronizes + runs the local pipeline.
4. **NVMe SSD (256GB)** — offline cache, buffered episodes, never drops a frame.
5. **Power bank (20,000mAh PD)** — a full 8–10h collection shift.
6. **Tbrain belt enclosure** — in-house, 3D-printed, ergonomic, all-day wearable, Tbrain's own design.

Specs: hardware-clock per-frame timestamp sync across every stream; offline-first (local cache → background upload every 5 min); fleet scale 50 → 500 packs collecting in parallel; zero-trust (Tailscale secure tunnel, role-based access, audit log).

### Pipeline (5-phase canonical story, `PIPELINE_OVERVIEW`)
**Collect → Auto-Label → QC → Human QC → Deliver**, "From factory floor to LeRobot v2 in ≤48h. Every phase leaves a machine-readable trace so any downstream claim can be verified."
- **Collect**: egocentric capture pack, offline-first, hardware-clock sync (RGB, Depth, IMU).
- **Auto-Label**: 8 models — hand + body keypoints, masks, depth, verb-noun description.
- **QC**: 15 hard rules + AI filter, auto-reject before human review.
- **Human QC**: Label Studio task queue, 3-layer human review, escalation path.
- **Deliver**: LeRobot v2 parquet, RLDS, Rerun `.rrd` proof shipped with every episode.

Also described at factory scale (`FOUNDRY_LINE`): capture → timestamp sync → local cache (NVMe) → night sync (off-peak upload) → MinIO edge (S3-compatible) → Cloudflare R2 (durable cloud storage) → AI pipeline on GKE (auto-label, QC, RLDS export).

### Auto-label model stack — 8 models (`MODEL_STACK`)
Keep these **generic/anonymized role names** in posts (no brand/HF handles, no GPU model) — this matches how the site itself describes them:
1. **Segmenter** — video object + hand masks, frame-accurate, track-linked.
2. **3D Hand + Camera** — MANO 21-keypoint hand pose + SLAM camera trajectory (DROID-style).
3. **Monocular Depth** — per-pixel depth + camera intrinsics from a single frame.
4. **Mesh Reconstruction** — object → `.glb` mesh from monocular input.
5. **6-DoF Pose Tracker** — per-frame, per-object pose from depth + mask + prior mesh.
6. **Frontier VLA** — verb + noun classification on 8-frame windows; deterministic decoding; "86% verb-noun accuracy on internal eval" (internal benchmark, not a published paper — attribute it as Tbrain's own internal eval if used).
7. **Lightweight Hand** — 21-keypoint fallback, CPU, patches gaps when the frontier model drops the hand.
8. **Lightweight Body** — 33-keypoint body pose, CPU, humanoid-retarget input.

Peak sequential VRAM: ~22GB, "verified on NVIDIA data-center GPUs" (no GPU model named).

Every capture also ships a **manifest** recording the exact model + version + git SHA that produced each field — "any claim we make is diffable" (`schema_version`, `provenance.git_sha`, per-field model versions). Use "provenance-traced" / "diffable" as the honest-engineering angle — it's a real, distinctive claim.

### QC — two layers, keep them separate
**Layer A: 15 hard rules** (`HARD_RULES` in physical-ai-qc.ts) — machine-readable gate, 6 categories (calibration, detection, temporal, spatial, semantic, provenance). Examples: camera-intrinsics agreement (fx err < 15%), frame-count alignment (npz == video), hand-detection rate (>10% per hand), keypoint-outlier percentage (<5%), object world-scale sanity (0.1–5m), schema + provenance trail (model + version + git SHA on every field). Full list of 15 rule IDs: `K_consistency, frame_alignment, hand_detect_rate, filter_pass_rate, kpt_outlier_pct, camera_trajectory, kpts_3d_dual_frame, object_world_scale, class_mapping_rate, action_seg_count, object_track_continuity, body_pose_rate, body_dense_rate, grasp_event_density, schema_provenance`.

**Layer B: 8 diagnostic gates** (`QC_DIAG`, `tbrain-ego diag`) — a distinct, narrower pre-HITL check run before a capture reaches hard rules review: `K_consistency, frame_alignment, hand_detect_rate, filter_pass_rate, kpt_outlier_pct, camera_trajectory, kpts_3d_dual_frame, object_world_scale`. "8/8 pass ⇒ eligible for HITL. Anything less ⇒ rejected, re-run, or downgraded to reference-only." **Don't conflate this with the 15 hard rules** — some rule IDs overlap by name but the diagnostic set is the narrower, earlier gate; write "a 15-rule hard-QC gate, plus an 8-check diagnostic pass before human review" if you need both in one sentence.

**3-layer human review** (`HUMAN_QC`): Layer 1 Label Studio (annotators correct kpt drift, adjust masks, override verb-noun — every correction is a labeled diff) → Layer 2 reviewer sign-off (accept/reject/flag, rejections get reason codes) → Layer 3 escalation dashboard (systemic failures escalate to engineering, root-cause feeds back into the auto-label training loop).

**QC pass-rate floor: 85%** (`QC.stats`, `QUALITY_PROCESS` step 04 gate: "Pass-rate ≥ 85%"). AI confidence filter auto-rejects **~20–30%** of raw demos before a human ever looks (worded as "~25%" in one place, "20–30%" in another — safe to say "roughly a quarter to a third of raw demos are auto-filtered before human review").

**Ship-rate delta** (`QC_DELTA`, one real example trace, don't present as a universal guarantee): raw auto-label 100% → after hard-rules gate ~78% auto-accept (22% reject) → after AI-filter refine ~85% → after Label Studio fix ~92% → after reviewer sign-off ~92% ship-ready.

**Turnaround: ≤48h**, raw capture to QC'd, delivered batch (repeated everywhere — hero, QC stats, standards, case studies).

**Security** (`SECURITY`): zero-trust delivery (Tailscale encrypted tunnels, role-based access, full audit log on every transfer); IP & data sovereignty (clear ownership terms, transparent storage location, signed releases per environment); provenance & traceability (every episode carries operator, rig, environment, consent, processing history).

> **ISO 27001 → SOC 2 is a ROADMAP. Never say "certified."** The site's own wording is "Active certification roadmap; controls and policies mapped from the start." Always phrase it as in-progress/roadmap, never as an achieved certification.

### Delivery formats
LeRobot v2 (parquet + video) is the primary export; RLDS on request / "mirrors to RLDS." A real exported snapshot (`LEROBOT_EXPORT`): `dataset_name: tbrain_ego_v2`, `robot_type: egocentric_human`, `codebase_version: v2.0`, 8 episodes, 5,016 frames, 6 tasks, 16 videos, 15 fps, 640×480 h264/yuv420p. Every episode also ships a Rerun `.rrd` scene (RGB, depth, hand skeleton, object pose, camera trajectory — frame-scrubbable in the public Rerun web viewer).

### Real capture environments
Seven textile-factory skills from a running Vietnamese textile line (sewing/hem machine, ironing, product tagging, code printing on fabric, quality inspection, fabric sorting & feed, packaging into bag) plus a kitchen/pantry line and an "electronics assembly" environment marked as **roadmap / sourced reference only** (not yet captured) — don't claim electronics capture as delivered. 71 raw wearable-cam sessions ingested; 14 episodes flowing through the auto-label pipeline this quarter (per `ENVIRONMENTS` / `REAL_SAMPLES`).

## 4. Numbers — delivered vs. capacity (never blend these)

<!-- Source: src/lib/landing/physical-ai.ts AVAILABILITY -->

The site itself enforces a hard split: **"One rule: verifiable numbers on the left, aspirational capacity on the right — labeled, not blended. We don't ship stats we can't defend to a research engineer."** Always label which column a number comes from.

**Delivered today:**
- **10** real capture skills on disk
- **5,016** annotated frames · LeRobot v2
- **8** episodes · parquet + video + depth
- **8** auto-label models in production pipeline

**Capacity 2026 (aspirational — always say "planned" / "targeted" / "capacity"):**
- **500** parallel capture packs at scale
- **10,000+** episodes / month at scale
- **6+** environment categories
- **8** synchronized streams / episode

Use **"10 real capture skills"** (not "7 textile skills" or similar) as the canonical shipped-skills number when a post needs it — it's the number the site itself badges as "delivered."

## 5. Published research the site cites (safe to reference, always link the primary source)

<!-- Source: src/lib/landing/physical-ai.ts PROOF_POINTS -->

- **10×** — egocentric human video yields more demos per hour than teleoperation. Source: EgoMimic, Georgia Tech. https://arxiv.org/abs/2410.24221
- **Log-linear scaling** — 20k+ hours of egocentric video → predictable gains in robot dexterity. Source: EgoScale, NVIDIA. https://arxiv.org/abs/2602.16710
- **<62 hours** — robot data + 1M hours of web video → zero-shot manipulation. Source: V-JEPA 2, Meta. https://arxiv.org/abs/2506.09985
- **~10,000 hours** — π0: data across 7 platforms trains one cross-embodiment VLA. Source: Physical Intelligence. https://www.pi.website/blog/pi0

Also cited in `PROBLEM` (teleop economics, not independently sourced in code — treat as a claim to re-verify against a fresh primary source before using in a new post, don't just copy): "Packaged teleop fell from ~$340/hr (Q1 2024) to ~$118/hr (2026) — still costly, still ~135 demos an hour."

Public reference datasets the site credits (not Tbrain's own data — always attribute): **Ego4D** (Meta AI · 88 orgs, 3,025h, 74 cities, 855 wearers, https://ego4d-data.org), **EPIC-Kitchens** (Univ. Bristol/Toronto, 100h, https://epic-kitchens.github.io), **EGTEA Gaze+** (Georgia Tech, 28h, https://cbs.ic.gatech.edu/fpv/), **EgoCom** (FAIR, 38h, https://github.com/facebookresearch/EgoCom-Dataset), **TREK-150** (Univ. Bologna, 1.5h, https://machinelearning.uniud.it/datasets/trek150/). Also referenced (not linked in code, verify before citing): EgoDex (829h), OpenEgo (1,107h), UMI Community (1,400h).

## 6. Samples catalog — what's actually on `/samples`

<!-- Source: src/lib/samples/categories.ts, src/lib/samples/catalog.ts, src/lib/samples/datasets.ts -->

Six categories/chooser cards, across three product **lines** (robotics, gaming, coding):

1. **Egocentric** (robotics) — "First-person capture from a head-mounted rig: skilled trades at work in operating businesses, and everyday manipulation at home." For: behaviour cloning and VLA training. **Playable on site: 118 delivery files.** Rig: 4–6 cameras (two or three stereo pairs — not a flat "6 cameras" for every record). Head IMU at 200 Hz. **Shelf behind it** (quoted from the internal deck, not all indexed on site — always label as "the shelf," not "delivered"): ~1,200 hours of stereo capture, ~15,000 episodes averaging 4m49s, 70+ operating businesses across 35 location types and 100 operator professions, ~3,000 task types across 17 skill groups, 82% graded medium or hard, 100% human QC'd.
2. **Exocentric** (robotics) — "The same work seen from outside the body." For: navigation, scene understanding, VLN, world models, and whole-body pose where the frame holds the whole person. Status: **in-collection**, not yet playable — 27.2 hours in collection since 5 Sept 2026 (239 clips, 14 scene groups: urban walking, vehicular navigation, structured indoor, mixed capture), 15 operators, mostly 1080p with some 4K, mixed frame rates, with audio, GoPro + phone. (Site updated 2026-10-05.)
3. **Teleoperation** (robotics) — two distinct products under one name: (a) a real bimanual robot follower arm (7-DoF per arm, five-fingered hands, three synced 640×480 cameras, 40-dim joint state + 40-dim action per frame = 14 arm joints + 12 hand joints + 14 TCP pose values, 20 fps, LeRobot v3.0 with a GR00T-compatible modality map) — **11 sessions · 134 episodes · 20,790 frames · ~17 min, held/available** (one pick-and-place task); (b) a person wearing a UMI handheld-gripper rig (priced tier, not yet on disk as of this writing). Always say which one a post is about.
4. **Mocap** (robotics) — full-body + per-finger pose. Rig: helmet GoPro (~150° FOV) + Xsens MVN HD suit, 17 IMUs native 240Hz **delivered at 30Hz** (always state both numbers, not just the native rate), Metagloves per-finger hand pose. Shot in a controlled studio only (not field/factory floor — a real limitation, say so). Exports: FBX / BVH / SMPL. One published demo bundle: 160s recording, 4,801 wrist-pose frames, 21 joints/hand.
5. **Gaming** (own product line, not robotics) — screen capture from live play, every keystroke/mouse delta/camera pose frame-aligned. 8 titles playable, 1080p at 60fps, 27-column telemetry (camera-to-world matrix, pinhole intrinsics, keys/mouse deltas, semantic action labels). For: world models and UI-acting agents.
6. **Coding & STEM** — routes to `/data/terminal-bench` (see §7); no separate catalog here.

**Fleet-wide proof points** (`catalog.ts PROOF_POINTS`, about the off-the-shelf/egocentric corpus specifically — don't generalize to all six categories): 100% of the capture fleet in calibration, 100% of episodes human QC'd, 70+ operating businesses recorded in, 82% of episodes rated medium or hard.

**Delivery layers every sample ships with** (`DELIVERY_LAYERS`): source video (full-res, every lens), motion/pose (camera trajectory, IMU, VIO; or camera-to-world + intrinsics for games), action stream (robotics: head IMU + VIO at 30fps; gaming: keystrokes/mouse at 60Hz — no hand/gripper-state claim exists in the catalogue, don't invent one), annotation (task id, description, skill category, difficulty, environment, industry, workstation — human QC'd), provenance (per-session consent, opaque operator IDs, calibration date), integrity (SHA-256 checksum on MCAP deliveries — 118 of 126 records; the 8 game sessions ship mp4+csv with no checksum row).

**Formats a buyer can load directly:** MCAP (opens in Foxglove/Lichtblick), MP4+CSV+JSON (game sessions), Rerun `.rrd` (recent game sessions).

**Operators stay anonymous** — identified only by an opaque ID; job/experience-band/handedness ship with the record, names never do.

### Dataset groupings (task-oriented, for pitching a vertical use case)
Robotics-line datasets grouped by skill (`datasets.ts`): Tools/machines/repair · Cleaning and tidying · Handling, packing and stock · Assembly and construction · Textiles and laundry · Food preparation · Electronics and diagnostics · Retail and service counters. Plus one gaming dataset: Gameplay with frame-aligned input.

## 7. Terminal-Bench facts

<!-- Source: src/lib/constants/marketing.ts FEATURED_CASE_STUDIES, src/app/data/terminal-bench/page.tsx -->

- "500+ multi-step reasoning tasks with 4-layer validation." Each task requires multi-step reasoning across **Linux, DevOps, Security, and Database** domains.
- "4-layer validation ensures tasks are genuinely hard — **GPT-5 passes ≤20% of them.**" (Attribute this as Tbrain's own benchmark result if used in a post; it's a Tbrain claim, not a third-party-published paper.)
- Case-study metrics: 500+ tasks, ≤20% GPT-5 pass rate, 4 validation layers, 8+ domains.
- Validation pipeline described on `/data/terminal-bench`: **spec → oracle → LLM baseline → expert review.**
- Every sample ships four artifacts: `task.toml` (metadata: author, difficulty, tags, time estimates, resource caps, verifier timeout), `instruction.md` (the exact prompt the agent sees), `solution/solve.sh` (reference expert solution), `tests/` (deterministic pytest harness — PASS/FAIL, no LLM-as-judge).
- Design principles: difficulty engineering (expert-yet-solvable band), real Docker environments (not a toy sandbox), deliberate spread across debugging/devops/library-work/API-integration, expert authoring (PhD or senior engineer per domain, peer-reviewed), full provenance (author, review notes, time estimates, versioned/auditable).
- Access: passcode-gated showcase (`TB-XXXX-XXXX` format) or a request-access form; sales reviews each request, "usually responds within one business day."

## 8. Case studies (anonymized — use only what's below, never add a name)

<!-- Source: src/lib/landing/case-studies.ts (fallback, live on /casestudy unless DB overrides) -->

- **Egocentric Data for a Robot Foundation Model** — "A frontier robotics team needed diverse egocentric manipulation data to pretrain a cross-embodiment VLA." Metrics: Egocentric capture type, RLDS delivery format, ≥85% QC pass-rate, ≤48h turnaround. *(Note: the fallback text now says "Tbrain Capture Pack (MK-001)" (fixed 2026-10-05); always use that name, never "EgoKit." EgoKit is a third-party open-source kit referenced in internal research, not Tbrain's own branded hardware — see §11.)*
- **Real-World Video to Ground a World Model** — "A world-model lab trained on game and simulated environments needed real, action-paired video to anchor its predictions in physics." Delivered long egocentric sequences from East-Asian kitchens, markets, and workshops with synchronized action labels and language captions.
- **Teleop Cold-Start for a Manipulation Startup** — "A mid-tier robotics startup needed cold-start data for a new manipulation task without standing up a collection org." Delivered pre-QC'd teleoperation + UMI demonstrations, plugged into the customer's pipeline in days, LeRobot format.
- **Evaluation and Benchmarks for Agents** — "A global enterprise engaged Tbrain to stand up 6 domain-specific Q&A agents and a practical evaluation framework." 6 agents, 1 month kickoff-to-handoff, 720 test queries, 270 curated knowledge files.
- **High-Accuracy CAD Annotation and Review Project** — 500 CAD drawings, 15 annotation fields, 95%+ accuracy, 30-day delivery window, for "a leading AI-powered manufacturing company."
- **Scalable Multimodal Data Labeling for Advanced GenAI Training** — scaled from zero to **48,000 high-quality visual prompts in 4 months** across chemistry, biology, medical sciences, mathematics, physics, engineering, economics (7 scientific domains), 600 expert "makers," 90% pass rate. ⚠️ This is the "48K" that means **visual prompts/annotations**, not expert contributors — see §9.

## 9. Canonical naming — resolve the inconsistencies before writing

<!-- Cross-referenced across physical-ai.ts, physical-ai-qc.ts, case-studies.ts, marketing.ts -->

- **Hardware name:** always **"Tbrain Capture Pack"** or **"Capture Pack MK-001"** (the drawing title is `MK-001 · REV A`). Never "EgoKit" — that name only appears as a *third-party* open-source reference kit in internal strategy notes; it is not Tbrain's product.
- **Shipped-skills number:** say **"10 real capture skills on disk"** (the `AVAILABILITY.delivered` figure, the one the site itself badges as verifiable-today). Don't use the "seven textile-factory skills" count from `ENVIRONMENTS` as if it were the total — that's one environment's skill breakdown, not the company-wide shipped number.
- **"48K" is overloaded — always carry its exact context, never bare:**
  - "48K+ Expert contributors across 17+ countries" (`EXPERT_NETWORK` stat, homepage/about).
  - "48,000 high-quality annotations" / "48,000 complex visual prompts" (two different case-study descriptions of the *same* multimodal-labeling engagement — annotations in one write-up, visual prompts in the other; use whichever the specific case study you're citing says, don't mix).
  - These are three different things (people vs. two phrasings of one deliverable count). Never write "48K" alone — always attach "expert contributors" or "annotations/visual prompts (in the multimodal GenAI case study)."
- **QC gates:** 15 hard rules (ship/reject gate) and 8 diagnostic checks (`tbrain-ego diag`, pre-HITL) are two different, overlapping-but-distinct lists — see §3. Don't say "15 QC checks" when you mean the diagnostic pass, or vice versa.
- **Teleoperation** means two different capture types depending on page — a real bimanual robot arm, or a human in a UMI gripper rig. Name which one.
- **ISO 27001 / SOC 2**: roadmap, never "certified" (see §3).

## 10. Internal links map — verified routes under `src/app`

<!-- Source: find src/app -maxdepth 3 -type d -->

Use only these as CTA / internal-link targets (don't invent a path):
- `/data/physical-ai` — Physical AI foundry page (has `#pipeline` anchor; also `/data/physical-ai/quality` and `/data/physical-ai/auto-label` subpages).
- `/data/terminal-bench` — Terminal Bench landing (`/enter`, `/request-access`, `/request-sent`, `/s` subpaths are passcode/access flows, not for public linking).
- (Not `/samples` or anything under it: samples are shared privately with buyers. Never link them from a post.)
- `/services` — services + domain pods page.
- `/about` — company/mission/team/experts page.
- `/casestudy` — case study index; `/casestudy/[slug]` for individual studies (slugs: `egocentric-foundation-model`, `world-model-ground-truth`, `teleop-cold-start`, `agent-evaluation`, `manufacturing`, `scalable-multimodal`).
- `/contact` — contact form (CTA target for "talk to us").
- `/blog` and `/blog/[slug]` — the blog itself.
- `/technology`, `/platform`, `/policy`, `/accessibility` — exist but rarely relevant to a blog CTA.

Do **not** link to anything under `(admin)`, `/admin`, or `/api/*` — those are internal/auth surfaces.

## 11. Company credentials

<!-- Source: src/lib/constants/marketing.ts LEADERSHIP, src/components/marketing/InceptionBadge.tsx -->

- **NVIDIA Inception Program member.** Badge links to `https://www.nvidia.com/en-us/startups/`. Shown on the homepage hero and in the footer on every page. Safe to say "Tbrain is a member of the NVIDIA Inception Program" — don't embellish into a partnership, investment, or endorsement claim; Inception membership is a startup-program enrollment, not funding or co-development.
- "Trusted by frontier AI labs" / "frontier-lab trust" phrasing appears in the SECURITY section framing ("Built for frontier-lab trust") — safe as a general aspiration/positioning line, never paired with a specific lab name.
- Leadership bios (public on `/about`, mentionable only as the site states them, no elaboration): **Tam Le** — "data science and analytics leader with 15+ years across Google, Adobe, and Asana," brings "deep AI training data expertise from close work with the AI trainer industry at Turing." **David Do** — "senior software engineering leader with 20 years of experience managing outsourced engineering teams, including a 500+ person engineering organization and multi-million-dollar delivery contracts." The company-logo chips shown next to each bio (Google, Adobe, Asana, Turing, IBM, Ericsson, Techcombank, etc.) are **past employers of the individual, not Tbrain customers or investors** — never imply otherwise in a post.

## 12. Topics already covered on the blog — don't repeat without a genuinely new angle

<!-- Source: scripts/blog-drafts-content.mjs, scripts/seed-robotics-blog.mjs, docs/blog-drafts/*.md -->

1. "Why Egocentric Video Is the Future of Robot Learning" (`egocentric-video-future-robot-learning`)
2. "The VLA Revolution: One Brain for Every Robot" (`vla-revolution-one-brain-every-robot`)
3. "World Models & Game Data: Teaching Robots to Imagine" (`world-models-game-data-teaching-robots-imagine`)
4. "Data Quality Is the Hidden Moat in Physical AI" (`data-quality-hidden-moat`)
5. "Anatomy of a Physical AI capture pack" (`anatomy-of-a-physical-ai-capture-pack`)
6. "8 models, one auto-label pipeline" (`eight-models-one-auto-label-pipeline`)
7. "15 hard rules · 3 real fires" (`fifteen-hard-rules-we-run-on-every-capture`)
8. "Humans on the last mile" (Label Studio) (`label-studio-humans-on-the-last-mile`)
9. "Zero-trust delivery · LeRobot v2 + Rerun proof" (`zero-trust-delivery-lerobot-plus-rerun-proof`)

All nine cover the egocentric capture pipeline (capture hardware, auto-label, QC, delivery) plus VLA / world-model explainers.

### Content priority (set by Viet / chị Tâm, Oct 2026)
**Robotics data is the core business. Most posts should be about it.** Rough mix: ~80% robotics data, ~20% LLM data / evaluation.

Robotics data lines, each a real sample line on Drive / `/samples` (details in `tbrain-samples.md`):
- **Egocentric human data**: factory + household tasks, head-mounted, IMU + camera pose + calibration. Already covered as a concept; go deeper per task domain, sensor and QC detail.
- **Game data**: gameplay video with frame-aligned inputs for world models / game agents. **Thin coverage, high interest.**
- **Teleoperated robot data**: bimanual arms, UMI grippers, MCAP / LeRobot. **No dedicated post yet.**
- **Motion capture**: humanoid retargeting (FBX / ABC). **No post yet.**
- **Hand pose**: 3D hands, dexterous manipulation. **No post yet.**
- **Exocentric / multi-view** and **GoPro single-camera** capture. **No post yet.**

Robotics trend context, per data type, is in `tbrain-topic-scout/references/robotics-data-trends.md`.

### Secondary lanes (about 1 post in 5, only with real news)
- LLM training data (RLHF / SFT / preference), Terminal-Bench and agent evaluation, coding / STEM data, multilingual data, Expert OS.

## 13. DO-NOT-SAY — hard constraints (quoted from the code and editorial rules)

<!-- Source: physical-ai.ts header comment, physical-ai-qc.ts header, editorial-rules.md -->

- **No named anchor customers, no internal cost figures, no target list.** (`physical-ai.ts` header, verbatim design rule for this whole content model.) Never name a customer, prospect, or partner. Always anonymize: "a frontier AI lab," "an industrial partner," "a world-model lab," "a mid-tier robotics startup."
- **Anonymize labs and partners** in every proof point and case study — match the pattern already used on the live site (§8).
- **No hostnames, ports, or operator IDs.** Internal infra details (annotation-tool hostnames, port numbers, individual operator identifiers) never appear in public copy — the code itself replaces these with generic labels like "Annotation workspace" (see `HITL_STUDIO.ls.host`).
- **Never cite `PHYSICAL_AI_TIERS` hardware dollar costs** from `marketing.ts` (the per-tier hardware-cost table) in marketing copy — that table is an internal capability/costing reference, not a public price list.
- **Never name customers, prospects, or partners** by name: no lab, company or brand Tbrain has worked with, pitched or partnered with, even if you saw the name in a source or a chat. Say "a frontier AI lab" / "an industrial partner" instead.
- **ISO/SOC2: roadmap only**, never "certified" (§3).
- **No internal pricing.** Don't state day rates, per-hour costs, margins, or deal sizes, beyond what's already printed on tbrain.ai (which currently states none).
- **Operators stay anonymous** — opaque IDs only, never a name, never a photo identifying a specific individual beyond what's already public.
- **`/root/drake/tbrain/tbrain-robotics-research/*` is background only.** It contains internal strategy, named anchor customers (do not repeat), funding/financial projections, and competitor intelligence. Reading it may inform *framing* (why real-world data matters, why QC is a moat) but **never quote a number, price, customer name, or plan from it that is not independently already public on tbrain.ai.**
- Standard editorial rules still apply on top of this (see `editorial-rules.md`): every number/date/claim sourced and opened, no fabricated stats or quotes, no competitor disparagement by name, no superlatives ("the best," "the only," "the largest") unless verifiable, absolute dates not "recently."
