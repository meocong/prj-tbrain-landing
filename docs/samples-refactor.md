# Samples — full refactor spec

Replaces [`samples-catalog-v2.md`](./samples-catalog-v2.md). Supersedes the
structure sections of
[`samples-restructure-plan.md`](./samples-restructure-plan.md); its data findings
still stand and are referenced by number below.

This is a rewrite, not a patch list. Existing components are reused where they
fit the new shape, but the shape is decided first and nothing is preserved
because it is already there.

---

## 1. The model already exists

Tam named the starting point in her first message: *"em làm samples thì bắt đầu
từ cái chị đã làm, cái samples.tbrain.ai ý."* That page was never opened during
this work, which is the single biggest reason the last three days went sideways.

`samples.tbrain.ai` is one modality done properly. Read 2026-09-09, its order is:

1. **A pack summary in one line.** "In this pack: 10 hard episodes · 37.7
   minutes · 10 skill categories · 10 distinct tasks · 7 industries · 10
   workstations · 10 professional operators · 4 cities · 2 rig families."
2. **What the preview is and is not**, before any clip: *"These are web
   previews, not the data. Each clip is downscaled and re-encoded to play in a
   browser with one stereo pair side by side. The delivery files are full
   resolution, and the rigs carry more lenses than the pair shown here."*
3. **Ten cards**, each with breadcrumb, skill group, difficulty, rig, codec and
   size, and **a working `.mcap` download plus `.metadata.json` with no gate.**
4. **The off-the-shelf story in four named blocks**: DIFFICULTY (35/47/18 with
   what "hard" means), TASK VARIETY (~3,000, 17 skill groups, largest task 6.4%),
   WHERE IT'S SHOT (70+ sites, 35 location types, 100+ professions), CAPTURE
   QUALITY (5 rig families, frame-level sync, >100° FOV, 100% in calibration).
5. **CUSTOM COLLECTION** — "Your spec, same pipeline."
6. **START HERE** — preview versus `.mcap`, and what opens it.

That is the template. The refactor is: **generalise this page across every
category, and put a chooser in front of it.**

### What our `/samples` does worse than the page it was meant to extend

| | samples.tbrain.ai | /samples today |
|---|---|---|
| Preview frame | **left + right**, 888×360 | left eye only, 576×432 |
| What the rig carries | *"more lenses than the pair shown here"* | every record says `stereo pair` |
| Download | `.mcap` on every card, no gate | gated behind a passcode |
| Pack summary | nine figures in the first line | none |
| The 1,200 h story | four named blocks with explanations | one line of body copy |

Three of those are regressions against a page that already shipped.

---

## 2. Requirements, from the sources

Numbered so the build can be checked against them rather than against a vibe.

### From Tam's *Samples Data Page* doc

| # | Requirement |
|---|---|
| R1 | Egocentric splits into **Mono**, **Stereo (2 cam)**, **Advanced Stereo (6 cam)**, **With wrist camera** |
| R2 | Both **OTS and custom collection** offered, per category |
| R3 | Show diversity: environments **residential and non-residential**, task type, difficulty |
| R4 | Delivery in **MCAP or LeRobot**, and other formats |
| R5 | **Advanced annotation**: head movement tracking and other metrics, like `tbrain-dashboard.vercel.app` |
| R6 | **Exocentric** as its own section |
| R7 | **Mocap** as its own section |
| R8 | **Gaming**: how many games, keyboard strokes, camera matrices |
| R9 | **Teleops / Simulation** as a new section |
| R10 | *"Needs to be easily sortable, able to find all samples through menus"* |
| R11 | **1 or 2 downloadable samples per type of action/activity + data type** |
| R12 | **Hours per group and task, and difficulty level** |

### From the thread

| # | Requirement |
|---|---|
| R13 | Top level is **Coding/STEM, Games, Robotics** — one system, including samples the site already has |
| R14 | Filters for **environment, difficulty, task type** |
| R15 | Robotics must **lead the customer**, not just list |
| R16 | Gaming needs its own context: diversity, capture, many titles, much metadata |
| R17 | Egocentric states *"variety of environments, devices, skills and tasks"* |
| R18 | Gaming has **100 h OTS + custom collection** |
| R19 | **Hero text rewritten** |
| R20 | A section describing **what kinds of data we have** |
| R21 | Robotics is **not only egocentric** — mocap, ordinary phone video |
| R22 | *"Không kiểu report, chỉ highlight thành các phần khác nhau"* — the content exists, it is buried |

R22 is the sentence that defines the job. Almost nothing here is new writing.
It is reorganisation of material that is already in the deck, the spreadsheet and
`samples.tbrain.ai`.

---

## 3. Structure

```
/samples                            chooser. Three lines, six categories.
│
├── /samples/robotics               (R13, R15) what physical AI data is for
│   ├── /samples/egocentric         (R1) four tiers described
│   ├── /samples/exocentric         (R6)
│   ├── /samples/teleoperation      (R9)
│   └── /samples/mocap              (R7)
│
├── /samples/gaming                 (R8, R16, R18)
└── /samples/coding-stem            (R13) exists as a line, links out to
                                    terminal-bench; no samples of its own yet
```

### 3.1 `/samples` — the chooser

Hero (R19), one paragraph of what we collect (R20), then six category cards.
Each card: name, one sentence of what the category **is**, the shelf figure
hedged, what is playable now, and a link in. No facets, no grid.

### 3.2 A category page — the `samples.tbrain.ai` skeleton, generalised

Same order for every category, so a buyer who reads two learns the shape once:

| Block | Source | Req |
|---|---|---|
| Pack summary line | derived from the records in that category | - |
| What the preview is, and is not | fixed copy per category | - |
| **Tiers** | `capability.ts` + the tier table | R1, R2 |
| Datasets, each with poster and counts | `datasets.ts` | R11, R12 |
| Clips, with facets | existing grid and rail, relocated | R10, R14 |
| Diversity blocks | deck + derived | R3, R17 |
| Delivery and formats | `capability.ts` | R4 |
| Annotation depth | link to the dashboard demo | R5 |
| Custom collection | `capability.ts` | R2 |

### 3.2a The delivery schema, from `manifest.csv`

The 6-cam pack ships a `manifest.csv` that is the canonical record shape, 27
columns:

```
episode_uuid · session_id · seg_idx · task_id · task_description · skill_group
task_difficulty · environment_l1/l2/l3 · environment_id · business_name
city · country · naics_primary_code · operator_id · operator_job
device_type · device_id · duration_s · n_cameras · video_codec
mcap_bytes · video_bytes
```

Two columns the page does not currently carry and should: **`n_cameras`**, which
is the tier in one number, and **`city` / `country`**, which is the GEO axis
Claru states and we approximate with a `Site` string.

`device_type` reads `Ego Rig A` / `Ego Rig B` here where our records say
`Robocap` / `DAS Ego V6`.

### 3.2b The camera question is answered

Tam's "data 6 cam" folder (`1qj7AE20b2qWBIxymNZBaQKfj7UcEb23A`) is a
customer-facing pack with its own README, read 2026-09-09. It settles what three
days of inference could not:

> Our standard delivery carries **four of the six cameras** (the required head
> stereo pair plus the front pair). This package carries **all six**, including
> the peripheral pair and its extrinsics.

The rig, in its own words:

| Role | Topic | What it is |
|---|---|---|
| `primary_left` / `primary_right` | `/top-{left,right}-camera/image-raw` | **Required** head stereo. Human IPD, aimed down at the hands. |
| `mid_left` / `mid_right` | `/ego/head_front_{left,right}/image_raw` | Front pair. Holds the work when the wearer's head is up. |
| `outer_left` / `outer_right` | `/ego/side_of_head_{left,right}/image_raw` | Peripheral pair, widest baseline. Sees the room, not just the task. |

So `stereo pair` on 118 records is wrong in the other direction from what was
assumed: the standard delivery is not two cameras and not six, it is **four** -
two stereo pairs. `Streams: 4` on those records is consistent with exactly that.

Three more things that pack settles:

- **The customer-facing rig names are `Ego Rig A` and `Ego Rig B`**, not Robocap
  and DAS Ego V6. Both are six-camera head-mounted platforms differing in sensor
  resolution, codec and lens model. Our page prints the internal names.
- **Intrinsics and extrinsics ship in the mcap**: a `camera_info` per image
  topic (Kannala-Brandt on Rig B, double-sphere on Rig A) and `/tf_static` with
  all six relative to the body frame, "so the full rig geometry is
  reconstructable from the mcap alone".
- **The mp4s are stream copies**, not re-encodes: the rig's own H.264/H.265,
  re-anchored to the first keyframe.

Every mcap also carries `/ego/imu`, `/ego/vio/system_info`,
`/environment_annotation`, `/session_metadata`, `/task_annotation`, `/tf_static`.

### 3.3 The tier block, which does not exist anywhere yet

The piece Tam asked for twice and we have never built. One row per tier:

| Tier | Rig | What it carries | Ready in | Price | Published here |
|---|---|---|---|---|---|
| Mono | head-mounted phone | RGB | 5-10 d | $30-40/h | 0 |
| Stereo (2 cam) | RealSense D455 / Pico 4 Ultra | RGB stereo, IMU 200-400 Hz | 14-21 d | $80-120/h | 0 |
| **Advanced stereo (6 cam)** | Ego Rig A / B | three stereo pairs; standard delivery ships four of the six | - | - | see §3.2b |
| With wrist camera | phone + wrist cam | head + wrist, time-synced | 5-10 d | $120-180/h | 0 |

No longer blocked. The 118 published records are the six-camera platform
delivering its standard four-camera package, so they belong in the advanced tier
and should say four cameras, two stereo pairs - not `stereo pair`. What remains
is a copy decision on whether the page uses the internal rig names or the
customer-facing `Ego Rig A` / `Ego Rig B`.

---

## 4. What gets reused, changed, or deleted

| Component | Fate |
|---|---|
| `SampleCatalog` grid and card | **reuse**, moved to the category page |
| Facet rail | **reuse**, moved; gains environment as residential/non-residential (R3) |
| `Fields.tsx` dropdowns | **reuse** unchanged |
| `SampleModal` | **reuse**; deep link already works |
| `DatasetBand` | **reuse** as the dataset block on a category page |
| `CapabilityPanel` | **becomes** the tier block, which is its real job |
| `capability.ts`, `datasets.ts` | **reuse**; both were built for this |
| `CorpusLines` | **replaced** by the chooser cards |
| `HeroSamples` copy | **rewritten** (R19) |
| Access gate on downloads | **question for Tam**: `samples.tbrain.ai` gates nothing, and R11 asks for downloadable samples |
| `/samples/s` | **keep** as the full-archive page behind a passcode |

Nothing is thrown away because it is old. Two things go because the chooser
replaces them.

---

## 5. Blocked, and by whom

Revised after re-reading every source file end to end. Most of what was listed
here was already answered in material sent on day one; the list was long because
the reading was shallow, not because the answers were missing.

| Item | Needs | Blocks |
|---|---|---|
| ~~Which tier each record is~~ | **answered** by the 6-cam pack README, §3.2b | - |
| Rig naming: internal or `Ego Rig A/B` | Tam | rig labels on every card |
| ~~OTS-Stereo vs OTS-Mono~~ | **answered.** The deck's 1,200 h corpus is stereo on Ego Rig A/B; the xlsx's 12,900-episode corpus is mono head-mounted smartphone. Two corpora, two names. | - |
| Teleops beyond the one dataset | Sơn | how much of R9 is real |
| ~~Sơn's list of sample types~~ | **superseded.** `manifest.csv` in the 6-cam pack is the canonical delivery schema in 27 columns, and `samples.json` plus the xlsx cover what exists. A list would confirm, not unblock. | - |
| Licence | legal / BD | a field on every card. **The only genuine unknown.** |
| ~~Coding/STEM samples~~ | **they exist.** `/data/terminal-bench` is a full product with its own gated sample area at `/s/[batchSlug]/[sampleSlug]`, request-access flow and Supabase-backed records. R13's third line has content; it has never been linked into the samples system. | - |
| ~~Download gate~~ | **answered by precedent.** `samples.tbrain.ai` puts `.mcap` and `.metadata.json` on every card with no gate at all. Our per-sample downloads should match it; `/samples/s` stays gated as the full-archive route. Worth confirming with Tam, not worth blocking on. | - |
| Hero copy | Tam, from options | R19 |

Everything else is unblocked.

---

## 6. Order

1. **Chooser** at `/samples`. Hero, what-we-collect paragraph, six cards.
2. **Category route** with the §3.2 skeleton, data-driven so all six share it.
3. **Move** grid, rail and dataset band onto it. No rewrites, just relocation.
4. **Tier block** from `capability.ts`, with the counts left blank where blocked.
5. **Diversity blocks**, lifted from the deck and `samples.tbrain.ai`.
6. **Gaming page** in its own vocabulary.
7. **Preview regeneration** to left+right at 888×360, matching
   `samples.tbrain.ai`, if that page's approach is the one we are standardising
   on.

Steps 1 to 3 are structural and unblocked. Step 4 is where the page answers
"what does each tier contain". Steps 5 and 6 are writing.

---

## 7. Acceptance

Open the result beside `samples.tbrain.ai` and `claru.ai/explore`.

- A reader who has never heard of egocentric data can say what it is.
- A reader can say what separates two tiers.
- A reader can play something within one screen of arriving.
- A salesperson can send one link instead of `Tbrain_Capability_Catalog_w_Pricing.xlsx`.
- Nothing on the page says less than `samples.tbrain.ai` already says.

The last one is the regression test this work needed from the start.
