# Tbrain Drive samples — what's actually inside each dataset (public-safe)

Sources: `/tmp/drive_docs/<Category>/SUMMARY.pdf` + `SUMMARY.xlsx` (per-category data sheets,
dated 2026-09-25 to 2026-10-01), `Egocentric Human Data Samples/SAMPLE_README.md` +
`ANSWERS.md` (a vendor questionnaire), a handful of per-episode `calibration.json` /
`metadata.json` / `meta/info.json` files, and `/tmp/drive_ls.txt` (2,927-file recursive listing
used to confirm formats). Cross-checked against `tbrain-knowledge.md` (site facts) and
`src/lib/samples/{catalog,categories,datasets}.ts` (what `/samples` shows today).

## How to use this file

- This file answers "what's really in a sample episode" so a post can describe a teleop
  episode, a hand-pose clip, or a game session concretely instead of generically.
- `tbrain-knowledge.md` is still the fact base for positioning, pricing-adjacent numbers, and
  DO-NOT-SAY rules — read it first. This file only adds sample-level technical grounding.
- **Every count/hour/duration below that is not already in `tbrain-knowledge.md` or on
  `tbrain.ai` is marked "(sample-level; confirm before publishing as a company-wide claim)."**
  Treat the Drive numbers as true about the *sample folder measured*, not as a verified
  company-wide total — several are from a vendor questionnaire answering one prospect's
  checklist, not from a public page.
- Where Drive data and site copy disagree, the conflict is called out inline as **Resolved 2026-10-05 (was a conflict):**.
- See "DO NOT USE" at the end before quoting anything from the source PDFs directly — they are
  marked CONFIDENTIAL / prepared for a named prospect, and this file has already stripped what
  shouldn't travel further.

## Cross-category comparison table

| Category | Sensors / rig | File formats & layout | Best for |
|---|---|---|---|
| Egocentric | 6-camera head-mounted rig, 2–3 stereo pairs, head IMU ~200 Hz | 4× `source_<role>.mp4` + `calibration.json` + `imu.csv` + `camera_pose.csv` + `metadata.json` + `SHA256SUMS` | VLA pretraining, behavior cloning, hand-object manipulation |
| Exocentric | GoPro / phone, fixed or body-worn, camera outside looking at the worker | Raw MP4 (1080p–4K, h264/hevc), no per-clip sidecar files yet | Navigation, scene understanding, VLN, world models, whole-body pose |
| Teleoperated | Bimanual follower arm, two 7-DoF arms, five-fingered hands, 3 synced cameras (head/left/right) | LeRobot v3.0: per-episode parquet (state+action) + 3× mp4 + `meta/info.json` + `meta/stats.json` | Robot policy learning, manipulation cold-start, cross-embodiment VLA fine-tuning |
| Hand Pose | Stereo pair from a 6-camera head rig | 3D hand joints per frame (measured/guessed/missed, MANO order) + `hands.rrd` Rerun viewer | Dexterous-manipulation and hand-pose pretraining, grasp modeling |
| GoPro Single-Camera | One head-mounted GoPro at a time (3 units rotated across shifts) | MP4 + GPMF IMU `.txt` + `calib.json` + derived orientation `.csv` + 2× WAV + `lerobot.tar` + 3 preview JPGs | Lightweight / lower-cost egocentric capture, single-line factory VLA pretraining |
| Motion Capture | Full-body suit + helmet camera, studio only (this drop: no glove/finger stream) | FBX skeleton animation + Alembic `.abc` for props + reference video | Humanoid retargeting, whole-body motion priors |
| Game Data | Screen capture + synchronized input log, 2 tiers (action-only vs. +camera pose) | MP4 + `frames.csv` + `session.json` + `key_bindings.json` | World models, UI/agent-acting policies, frame-aligned action prediction |

---

## 1. Egocentric Human Data

**What it is.** Two head-mounted rigs, each 6 cameras arranged as 3 coaxial stereo pairs (a
human-IPD-width front pair, a wider pair, and a peripheral pair), fisheye lenses
(equidistant/Kannala-Brandt on one rig, double-sphere on the other), rolling shutter, 30 fps,
1920×1080 per stream on one rig and 1600×1300 on the other. A third, smaller rig variant
(2 global-shutter cameras) additionally emits an on-device 26-joint hand pose and a SLAM head
pose at 30 Hz — **(sample-level; confirm before publishing as a company-wide claim)**, this
third rig isn't mentioned on `/samples` today. Head IMU runs independently of frame rate, ~200 Hz,
not resampled down to video.

**Modalities & streams per clip:** 4 of the rig's 6 camera streams (delivered — the widest pair
is not in the delivered container), 6-DoF head/camera pose in the world frame, full IMU trace
(accelerometer m/s², gyro rad/s), per-camera intrinsics + distortion + body extrinsics, and a
structured task/environment/operator metadata record.

**File formats & delivery layout** (per clip folder):
- `source_<role>.mp4` ×4 — camera packets copied out with `-c copy`, not re-encoded
- `calibration.json` — intrinsics (K), distortion (D), per-camera extrinsics, each with the raw
  recording `topic` string preserved verbatim (provenance over tidiness — the topic name reflects
  recording history, not the human-facing role label)
- `imu.csv` — every sample, own rate (~200 Hz), not decimated to frame rate
- `camera_pose.csv` — one row per frame: position + orientation in the world frame, plus a
  `measured` flag
- `metadata.json` — task id/description/difficulty, skill group, 3-level environment taxonomy,
  an industry classification code, operator role + consent, device generation/firmware,
  calibration status and due date, trim reasoning, and an explicit `_redacted` block naming which
  fields were stripped (business trading name, street address) and why
- `SHA256SUMS` — per-folder integrity check

**Annotation/labels:** natural-language task description, skill group, difficulty grade
(easy/medium/hard), 3-level environment taxonomy (L1 broad category → L2 venue type → L3 specific
scene), an industry classification code, operator job role, consent flag, and operator
demographics (age band, gender, handedness — no name, opaque operator id). Two-round human QC
before delivery; correction tooling is a human-in-the-loop annotation stage with an automated
mask/keypoint-correction backend.

**Example task list (by domain), from the 91 distinct tasks in this sample):**
- Industrial/manufacturing & construction: bar cutting/drilling/welding, metal grinding, frame
  crimping, cable assembly, panel/part cutting, nail driving, structure aligning
- Automotive: engine repair, bodywork polishing, car driving/polishing, motorcycle lifting
- Textiles & garment: fabric ironing/sewing/flattening, garment sewing, zipper/woven cutting
- Food & hospitality: vegetable prep/serving, dish prep, food serving/shaping, bathroom/floor
  cleaning
- Retail & creative: flower arranging/picking/pruning, sign/model work, wood carving
- Personal care: hair combing/blow-drying, beard shaving, face applying
- Repair/tool use: chisel/key/metal grinding, engine and motor repair, component repair

**Counts/hours/durations:**
- This sample drop: **100 clips, 1.32 hours total, 91 distinct tasks, 14 L1 environments, 23 L2
  venues, 44 L3 scenes, 32–70 s per clip** (from `SUMMARY.pdf`) — matches the "123-clip, 101-minute,
  182,542-frame measurement set" that `SAMPLE_README.md` says this 100-clip drop is sampled from
  (123 is the larger research set backing the wrist-trajectory numbers below, not all of it ships
  as video yet).
- **(Sample-level; confirm before publishing as a company-wide claim)** Per a 2026-09-17 vendor
  questionnaire: **12,754 clips, 1,022.9 hours delivered and accepted total**, across 1,195
  sessions, 116 venues, 2,517 distinct tasks, 385 operators, 15 top-level environment classes.
  This is in the same order of magnitude as the "~1,200 hours / ~15,000 episodes" shelf figure
  already in `tbrain-knowledge.md` §6 — treat as a later/consistent snapshot, not a contradiction,
  but don't quote the exact 1,022.9/12,754 figures as site-verified without confirming first.

**Quality/QC notes:**
- Redaction is *verified*, not asserted: the stated pipeline step scans every byte of a finished
  folder for the trading name/address and refuses to ship if either survives.
- A forthcoming `wrist_trajectory.csv` deliverable (not in this drop) is built by a 4-tier
  evidence-gated pipeline — native-fisheye hand detection on every camera, multi-view ray
  intersection, single-view-with-carried-range, and short-horizon optical-flow — each tier only
  fires where at least one detector actually found a hand, specifically to avoid hallucinating a
  wrist through hands-down stretches. Measured on the 123-clip set: 88–97% wrist recall per clip
  when a hand is visible, with a scoring methodology (generous low-threshold detector as ground
  truth) designed to be a hard bar to clear, not an easy one. Good material for a "how we measure
  recall, not just coverage" honesty-in-QC post.
- Rectification tradeoff, stated generically (no vendor name needed): on a wide fisheye lens the
  wearer's own hands sit at the extreme edge of the frame — rectifying to a pinhole projection
  before delivery would lose roughly half the frames in which a hand is detectable. Shipping
  native fisheye + full calibration keeps that choice with the customer.

**Best for:** VLA pretraining and behavior cloning (multi-camera egocentric manipulation),
hand-object interaction modeling, provenance/traceability case studies.

**Blog angles:**
1. "What's actually inside an egocentric episode" — walk the `source_<role>.mp4` /
   `calibration.json` / `imu.csv` / `camera_pose.csv` / `metadata.json` layout end to end.
2. "We don't pre-rectify your fisheye video, and here's the math on why" — the hand-at-the-edge /
   lost-frames tradeoff, told generically.
3. "Measuring recall, not coverage" — the 4-tier, evidence-gated wrist-detection methodology as
   an honest-QC story (frame it as upcoming/in development, not yet shipped).
4. "A redaction you can verify instead of a promise" — the byte-scan-before-seal pattern as a
   concrete trust mechanic.
5. "One field that tells the truth about where a sensor came from" — the `topic` string kept
   verbatim in calibration even after a human-facing camera role gets renamed; a short piece on
   why raw provenance fields outlive their own relabeling.

---

## 2. Exocentric Data

**What it is.** Camera placed outside the body, looking at the worker/pedestrian — the inverse of
the egocentric rig. Capture devices are GoPro action cameras and phones (not a purpose-built rig).
This is **raw capture, prior to the cut-and-anonymize pipeline** — no per-clip sidecar files
(calibration, pose, metadata) yet exist for this category in the sample set.

**Modalities & streams:** RGB video only, in this sample set (no IMU/pose/annotation sidecar
files observed). Codec mix: hevc and h264; resolution mostly 1920×1080 with some 3840×2160;
frame rates vary clip to clip (24–120 fps) because capture devices and settings vary by session.

**File formats & delivery layout:** flat per-clip MP4 files grouped into scene folders; no
calibration/pose/metadata files alongside them yet (unlike Egocentric/Hand Pose/GoPro).

**Example task/scene list (by domain):** pedestrian walking in varied public environments
(driveway, indoor hallway, shopping mall, open-air market, park, retail store), plus
vehicle-mounted driving/navigation footage and a few mixed/office-environment clips.

**Counts/hours/durations (sample-level; confirm before publishing as a company-wide claim):**
this sample folder: **239 clips, 27.2 hours total, 14 scene groups.** **Resolved 2026-10-05 (was a conflict):** `/samples`
currently describes Exocentric as "in-collection, not yet playable — 20 hours in collection since
5 Sept 2026, 15 operators (10h urban walking, 5h vehicular navigation, 5h structured indoor),
1080p30 with audio, GoPro + phone." The sample folder's actual pool (27.2 h, mixed frame rates
and resolutions, more scene variety than 3 buckets) is larger and more varied than that site
description — treat the site figure as stale/conservative rather than wrong, and don't publish
the 27.2-hour number as a site fact without confirming it replaces the "20 hours" line.

**Quality/QC notes:** explicitly labeled raw/pre-pipeline in the source doc — no anonymization or
QC claims apply to this sample yet, unlike every other category here. Don't imply this category
has the same QC guarantees (85% pass-rate floor, etc.) as Egocentric/Teleoperated until it ships
through the same pipeline.

**Best for:** navigation and scene understanding, vision-language navigation (VLN), world models
that need outside-in context, whole-body pose estimation (the frame holds the whole person, which
egocentric video structurally cannot).

**Blog angles:**
1. "The same work, seen from outside" — pairing an exocentric clip conceptually with an
   egocentric one to explain why robotics labs want both views.
2. "What unscripted pedestrian video buys a world model" — navigation/VLN framing using the
   walking-scene variety (mall, market, park, store) as evidence of real-world diversity.
3. "Before the pipeline touches it" — an honest post about what raw capture looks like prior to
   anonymization/QC, and why that gap matters to a buyer evaluating a vendor.

---

## 3. Teleoperated Data

**What it is.** A real bimanual robot follower arm: two 7-DoF arms, each ending in a
five-fingered anthropomorphic hand with 6 actuated joints (thumb metacarpal + thumb proximal,
then index/middle/ring/little proximal). Three synchronized cameras — head, left, right — at
20 fps. (Vendor/model naming for the arm is not reproduced here — not yet public; see DO-NOT-USE.)

**Modalities & streams:** joint-level state and action, both **40-dimensional per frame**: 14 arm
joint angles (7 per arm) + 12 hand joint angles (6 per hand) + 14 end-effector TCP values (3D
position + quaternion, 7 per hand) — confirmed directly from a sample `meta/info.json`'s
`observation.state` feature list. **Resolved 2026-10-05 (was a conflict):** `tbrain-knowledge.md` §6 currently describes this
product as "16-dim joint state + 16-dim action" — the actual sample schema is 40-dim state and
40-dim action. Flag this for correction before the next time a post states the dimensionality.

**File formats & delivery layout:** LeRobot v3.0 — `meta/info.json` (feature schema, fps,
codebase version), `meta/stats.json`, per-episode parquet under `data/`, per-episode index under
`episodes/`, and three video streams under `observation.images.cam_{head,left,right}`.

**Example task list:** this sample set ships one task across all 11 dataset folders — "pick up a
box and place it into a bin" — repeated across many short episodes rather than many distinct
tasks. Useful specifically as a **demonstration-diversity / cold-start** example, not a
task-variety one.

**Counts/hours/durations:** this sample folder (sample-level; confirm before publishing as a
company-wide claim): **11 dataset folders, 134 total episodes, 20,790 total frames, 17.3 minutes
total, 20 fps.** Per-dataset episode counts range 7–18. **Resolved 2026-10-05 (was a conflict):** `tbrain-knowledge.md` §6
says "11 episodes, several thousand frames, held/available" — the "11" in the sample data is the
number of *dataset folders*, not episodes; actual total episodes across those 11 folders is 134.
Worth correcting the "11 episodes" framing the next time this is cited.

**Quality/QC notes:** none specific to this category beyond the general pipeline; episodes in
this drop are described as "already delivered to a customer and accepted."

**Best for:** robot policy learning / imitation learning on a real bimanual platform, manipulation
cold-start data, cross-embodiment VLA fine-tuning (the three-camera, structured joint+TCP schema
is compatible with common robot-learning modality maps).

**Blog angles:**
1. "Forty numbers per frame" — decompose the state/action vector (14 arm + 12 hand + 14 TCP) as a
   concrete answer to "what does a teleop frame actually contain."
2. "One task, eleven takes" — using repeated single-task episodes to talk about demonstration
   diversity and what a cold-start manipulation dataset is actually for.
3. "Three cameras, one controller" — why head/left/right camera placement matters for bimanual
   manipulation policies.

---

## 4. Hand Pose Data

**What it is.** 3D hand pose triangulated from the stereo pair (the two cameras nearest the
wearer's eyes) of a 6-camera egocentric head rig — a dedicated hand-tracking product built on top
of the same rig family as the Egocentric category, not a separate capture setup.

**Modalities & streams:** 21 joints per hand (MANO joint order), in the rig's own body frame, in
metres. Every joint is tagged by how it was produced:
- **Measured** — triangulated from both stereo cameras seeing the hand
- **Guessed** — single-camera estimate when only one camera sees the hand (occluded, or at the
  image edge), using that wearer's own measured hand size/shape; flagged `<side>_guessed`
- **Missed** — a QC metric, not a data field: frames where a hand is clearly visible to a camera
  but no 3D hand pose was produced at all
- Each hand track is temporally smoothed, with short occlusions bridged
- Bone lengths are fixed to one per-wearer hand size over a clip (a built-in internal-consistency
  check, and a usable "palm size" field per sample, ~79–92 mm in this set)

**File formats & delivery layout:** per-sample hand-joint data (frame-indexed, measured/guessed
status per joint) plus a `hands.rrd` file that opens in the Rerun viewer, showing the 3D hand
track alongside every camera with the hand re-projected through that camera's own calibration.

**Example task list (by domain), from the 15 environments in this sample:** agriculture (washing
plant cuttings), automotive (engine cleaning), outdoor/yard (clearing debris), personal care
(hair washing), cleaning/sanitation (trash disposal), textiles (notebook writing in a sewing
environment — administrative task inside a garment factory), construction (wire untangling),
creative workshop (material organizing), electromechanical (wrapping a shaft), events (light
setup), food & beverage (table clearing), hospitality (bathroom cleaning), industrial
manufacturing (arranging sewn fabric), printing/signage (moving frames), repair services
(bathroom cleaning), retail (cutting cards for a flower arrangement).

**Counts/hours/durations (sample-level; confirm before publishing as a company-wide claim):**
**16 samples, 15 environments, 24.0 minutes total (43,167 frames at 30 fps)** — clip durations
range roughly 65–204 seconds.

**Quality/QC notes — the standout angle for this category:** per-clip hand-visibility rate swings
enormously by task: from **99.9%/99.6%** (organizing materials, hands constantly in frame) down to
**22.6%/29.3%** (a light-setup task where hands are often out of frame or far away). "Missed" rate
(visible-but-undelivered) stays low across the set, mostly 0–2%, spiking to ~4% on one
high-occlusion hair-washing clip. This is a genuinely strong, numbers-backed honesty-in-data-quality
story: visibility is reported per clip, not asserted as a single blanket number.

**Best for:** dexterous-manipulation and hand-pose model pretraining, grasp modeling, as a
labeled-confidence example for any "how do you know your hand-pose data is good" explainer.

**Blog angles:**
1. "Measured, guessed, or missed — three different things a hand-pose dataset can say about a
   frame," using the exact taxonomy above.
2. "From 99% to 23%: why hand visibility swings by task," grounded in the real per-clip range.
3. "One hand size, one wearer, one clip" — bone-length constancy as a built-in QC signal, and why
   a fixed anatomical constraint catches tracking drift that a frame-by-frame metric would miss.
4. "A stereo pair most people never look at" — explaining why hand pose is triangulated from the
   *inner* camera pair on an egocentric rig, tying back to the Egocentric category's own
   front-pair-vs-eye-pair framing.

---

## 5. GoPro Single-Camera Data

**What it is.** A single head-mounted GoPro (rotated across 3 physical units over capture shifts),
not the full 6-camera rig — the lightest-weight capture setup in the lineup. Captured on a real
garment/textile production line (consistent with the "Vietnamese textile line" already described
in `tbrain-knowledge.md` §3 — task names in the source sheet are given in Vietnamese with English
glosses, e.g. "Là sản phẩm" = ironing finished garments). **This is explicitly raw capture, before
the cut-and-anonymize pipeline** — audio is present, clips are not yet trimmed to a standard
length, and nothing is anonymized yet.

**Modalities & streams:** 1080p60 video; GoPro-native accelerometer/gyro (from the GPMF metadata
track); a derived roll/pitch/yaw orientation stream (Madgwick 6-axis fusion in the camera frame —
**yaw drifts over a clip because a GoPro has no magnetometer**, a real and stated sensor
limitation, not a bug); two separate audio tracks (an external mic and the camera's own mic,
later stripped at delivery).

**File formats & delivery layout** (per clip):
- `gopro/gopro_<n>/gopro_<n>_original.mp4` — unmodified camera output
- `gopro/gopro_<n>/imu_gopro_<n>.txt` — raw GPMF accelerometer/gyro
- `gopro/gopro_<n>/gopro_<n>.calib.json` — lens intrinsics for that camera
- `derived/imu_orientation_gopro_<n>.csv` — roll/pitch/yaw per sample
- `audio/mic.wav` + `gopro_<n>_audio.wav` — two audio tracks
- `lerobot.tar` — the same clip, already packed into LeRobot layout
- `preview_first_*.jpg`, `preview_mid_*.jpg`, `preview_last_*.jpg` — three representative frames
- `metadata.json` / `session.json` / `context.json` / `kit.json` — device, capture mode, and
  session bookkeeping (device-id/host/GPS fields in the raw files are internal and excluded here
  — see DO-NOT-USE)

**Example task list** — 7 tasks on one sewing line: ironing finished garments, inspecting stitch
quality, arranging fabric and feeding the sewing machine, bagging finished garments, attaching
tags to garments, printing codes onto fabric pieces, hemming on the edge-sewing machine.

**Counts/hours/durations (sample-level; confirm before publishing as a company-wide claim):**
**59 clips, 2.01 hours total, 7 distinct tasks, 2 capture dates**, 1080p60, operator consent
recorded on every clip.

**Quality/QC notes:** explicitly flagged as pre-pipeline (not cut to standard length, not
anonymized, audio still attached) — same caveat as Exocentric: don't imply this sample has already
passed the QC gates described for delivered Egocentric/Teleoperated data.

**Best for:** lightweight/lower-cost single-camera egocentric capture, fast task-specific VLA
pretraining on one production line, an approachable "what does a day on a real factory floor look
like" illustrative dataset.

**Blog angles:**
1. "What a factory-floor dataset looks like before we touch it" — using the explicit raw/pre-pipeline
   labeling as a transparency story (cut length, anonymization, audio-stripping all still pending).
2. "Seven tasks, one sewing line" — walk the task list as a concrete, groundable description of
   what "real capture environments" (already claimed on site) actually looks like day to day.
3. "What a GoPro's IMU can't tell you" — the yaw-drift-without-a-magnetometer limitation as an
   honest sensor-literacy post.
4. "One clip, nine files" — a plain tour of the delivery bundle (video, IMU, calibration,
   orientation, two audio tracks, LeRobot archive, three previews, four metadata files).

---

## 6. Motion Capture Data

**What it is.** Full-body motion capture, studio-only (no field/factory-floor mocap exists in this
sample set, consistent with the site's own stated limitation that mocap is studio-only). This
particular sample batch contains **body + camera + prop tracking only — no per-finger glove data**,
unlike the Metagloves-equipped rig already described on site; treat per-finger mocap and this
body-only batch as two different captures of the same product line until confirmed otherwise.

**Modalities & streams:** full-body skeletal animation, a camera track (so the capture is
re-renderable from the recorded viewpoint), and — where relevant to the action — a prop/object
track (e.g., a cart, a box) plus an OBS reference video for every action in the set (8 of 8).

**File formats & delivery layout:** FBX for skeletal animation, Alembic (`.abc`) for props,
plus a reference video per action. 3–4 files per action (skeleton + camera + prop, as applicable).

**Example task list — 8 actions, all humanoid-relevant primitives:** checking a document,
mopping a floor, reaching to a high shelf, jumping over an object, throwing an object, crossing
an obstacle, carrying something on the shoulder, climbing stairs.

**Counts/hours/durations (sample-level; confirm before publishing as a company-wide claim):**
**8 actions, 26 files, 137 MB total** — no per-action duration given in the summary sheet.
**Conflict/clarification:** `tbrain-knowledge.md` §6 cites "one published demo bundle: 160 s
recording, 4,801 wrist-pose frames, 21 joints/hand" as the Mocap category's proof point — that
figure describes a *different*, glove-equipped capture, not any of these 8 body-only actions.
Don't conflate the two when citing mocap stats.

**Quality/QC notes:** the source doc states explicitly "no personal data in the capture" and
calls the skeleton "retargetable" — both safe, useful phrases for a privacy/retargeting-focused
post.

**Best for:** humanoid retargeting and whole-body motion priors; this body-only slice is not the
right sample to cite for dexterous/per-finger claims.

**Blog angles:**
1. "Body, camera, and prop — three tracks per clip" — a plain walkthrough of the FBX/Alembic
   layout for someone retargeting to a humanoid rig.
2. "Eight actions worth retargeting" — stair climbing, shoulder carrying, high-shelf reaching,
   and obstacle crossing as concrete, humanoid-relevant motion primitives.
3. "What a controlled studio buys you, and what it costs" — an honest piece on the studio-only
   limitation already acknowledged on site, paired with real action examples.

---

## 7. Game Data

**What it is.** Screen capture from live play of commercial PC titles, with a synchronized input
log — not camera footage. Two tiers exist side by side in the sample set: "Action-labeled only"
(input/action stream, no camera pose) and "Camera pose + Action-labeled" (adds a camera-to-world
pose stream, when the title/engine made it extractable).

**Modalities & streams:** 1920×1080 video; per-frame input state (keys/mouse); camera pose, for
the subset of sessions where it's extractable; key-binding metadata so raw inputs can be mapped
back to in-game actions.

**File formats & delivery layout:** per session — `video.mp4`, `frames.csv`, `session.json`,
`key_bindings.json`.

**Example task/title list: 14 commercial PC titles.** Genres: open-world / driving and off-road simulation, RPG / looter, co-op shooter, open-world stealth, action-RPG / hunting. The spread was chosen for input and camera-control diversity, not for a single game type.
**Never name the game titles or publishers in any post or social copy.** Licensing of gameplay data is a live legal question in the industry. Say "14 commercial PC titles across five genres".

**Counts/hours/durations (sample-level; confirm before publishing as a company-wide claim):**
this sample folder: **28 sessions, 14 titles, 18 of 28 sessions ship a full session record
(video+frames+session+key-bindings), 18 of 28 sessions carry camera pose, 0.62 hours total across
the 18 sessions that do ship a record**, all at 1920×1080. (The other 10 sessions in the folder
have placeholder/zero-duration entries in the summary sheet — worth a data-completeness caveat if
citing "28 sessions" as a usable count; the usable, playable figure is closer to 18.)

**Quality/QC notes:** no per-session anonymization concerns (no humans/PII — this is screen
capture of gameplay), but note the real/zero split above before quoting "28 sessions" as fully
usable.

**Best for:** world-model pretraining and UI/agent-acting policies that need frame-aligned
action-to-outcome pairs; the two-tier (action-only vs. +camera-pose) structure is itself a useful
thing to explain since it shows which signal is available per title/engine.

**Blog angles:**
1. "Two tiers of game data, and why they're not the same product" — action-labeled-only vs.
   camera-pose-plus-action-labeled, explained via the real two-group split across 14 titles (unnamed).
2. "What a frame-aligned input stream actually contains" — walk `video.mp4` + `frames.csv` +
   `session.json` + `key_bindings.json` concretely.
3. "Fourteen very different control schemes" — using genre spread (driving, RPG, looter-shooter,
   stealth, hunting) as evidence for why game data generalizes better than any single title would.

---

## DO-NOT-USE — omitted categories of information (no specifics repeated here)

Deliberately left out of every section above, per the source documents' own confidentiality and
this file's public-safety brief:
- The named prospect/buyer the source PDFs were prepared for, and any buyer-specific framing,
  requirements, or RFI-style question/answer structure.
- Third-party capture-rig / robot-arm vendor or product names that the source vendor
  questionnaire itself states are under NDA and not for open disclosure (rig and arm model
  identifiers were replaced with generic "Rig A/B/C/D" or role descriptions above; the few
  hardware names that already appear in `tbrain-knowledge.md`, e.g. Xsens/Metagloves, were kept
  since they're already treated as site-public there).
- Internal hostnames, device/control-plane IP addresses, device IDs, and internal kit/tool
  naming found in raw per-clip metadata files.
- Exact GPS coordinates and city/ward-level locations (the source sheets list specific Vietnamese
  cities and wards per clip); generalized to "Vietnam"/"Asia," matching what's already public.
- Operator-identifying details beyond the anonymized fields already public on `/samples`
  (job/experience-band/handedness): no operator IDs, ages-as-identifiers, or photos reproduced.
- Internal cost/pricing, contract, or licensing language from the source documents.
- Any confidentiality/distribution marking, document version number, or "prepared for" header
  text from the source PDFs.

---

## Site-sync status (updated 2026-10-05)

Resolved — the site and `tbrain-knowledge.md` §6 now match the Drive samples; do not flag these:
1. Teleoperated: 40-dim state/action; 11 sessions · 134 episodes · 20,790 frames; LeRobot v3.0.
2. Exocentric: 27.2 h, 239 clips, 14 scene groups, mixed resolution/frame rate.
3. Mocap: site copy only describes the glove demo bundle (160 s / 4,801 frames / 21 joints per
   hand); it never claims the 8-action body-only batch has finger data. When you write about the
   batch, say it is body + camera + prop, no fingers.

Still open (do not blend, ask the reviewer):
4. Egocentric scale: the site's "~1,200 hours / ~15,000 episodes" shelf figure is the sales-deck
   number chosen by the content lead; the vendor questionnaire (2026-09-17) counts 12,754 clips /
   1,022.9 h. Use the site figure, labelled "the shelf", unless the reviewer says otherwise.
