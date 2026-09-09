# /samples — what is done, what is missing

Audited 2026-09-09 against Tam's R1–R22 and against the competition read
first-hand the same day. Every "done" below was checked in the rendered page,
not in the source.

---

## 1. Where the competition actually ends

Worth fixing the picture, because three of the gaps below look bigger than they
are.

`claru.ai/explore` → `/egocentric` → `/processed` → `/kitchens` is four levels of
navigation, and the leaf is **four clips with no metadata, no filenames, no
formats, no licence and no download** — the page reads "Showcase clips from
Processed" and ends in *Book a Call*. Zero `<img>` and zero `<video>` at the
three levels above it.

`humanoidlayer.dev` prints Format / License / Enrichment per dataset card and
hosts no player at all.

We publish 200 playable clips, a per-record telemetry panel, a spec table per
record, and a `.mcap` per delivery. Depth is not our problem.

## 2. What they do that we do not

| # | They | Us | Req |
|---|---|---|---|
| A | Claru navigates by **environment**, split *Residential — indoor / Residential — outdoor / Commercial — outdoor / Tabletop & craft work* | `environment` is a facet value, never a split, and "residential vs not" appears nowhere | **R3** |
| B | Claru sells by **use case** as well as modality — *VLA Training Data, Teleoperation Data, Egocentric Video, Manipulation Data* | modality only | — |
| C | Claru runs a content surface: *glossary, models, tasks, guides, datasets, formats, industries, labs, benchmarks, compare* | none | — |

B and C are merchandising decisions with a content cost, not bugs. A is a
requirement we have not met.

## 3. Tam's list, item by item

| # | Requirement | State |
|---|---|---|
| R1 | Egocentric splits: Mono, Stereo (2 cam), **Advanced Stereo (6 cam)**, with wrist | **partial.** Five tiers ship from the sheet — Egocentric, RGB-D/LiDAR, Stereo, + wrist, + gripper. There is no "Advanced Stereo (6 cam)" row in the sheet, though the head rig on the published records is six cameras. Needs a decision, not code. |
| R2 | OTS and custom, per category | **done.** `TwoRoutes`, front door and per category. |
| R3 | Diversity: environments **residential and non-residential**, task type, difficulty | **not done.** No residential split; difficulty is on 118 of 126 records and appears nowhere. |
| R4 | MCAP or LeRobot, and other formats | **done.** Per tier and per dataset card. |
| R5 | Advanced annotation, head tracking, "like tbrain-dashboard" | **not done.** No link to the dashboard demo anywhere on the page. |
| R6 | Exocentric its own section | **done** as a route; **no footage.** |
| R7 | Mocap its own section | **done,** with 80 real keyframes and the pose explorer embedded. |
| R8 | Gaming: how many games, keystrokes, camera matrices | **partial.** All of it is in `spec` — 8 titles, 41,982 frames, per-frame keystrokes, camera-to-world 4×4 — and only the facet rail surfaces any of it. No gaming section like `OtsShelf` / `TeleopSet` / `MocapDemo`. |
| R9 | Teleops as a section | **done,** 11 episodes and a three-camera synced player. |
| R10 | Sortable, findable through menus | **done.** Per-category facets, values from that category's records. |
| R11 | 1–2 downloadable samples per action type + data type | **not done.** Records say "behind access". `samples.tbrain.ai` gates nothing. |
| R12 | Hours per group and task, and **difficulty level** | **partial.** Hours per skill group are derivable and not shown; difficulty is not shown at all. |
| R13 | Top level Coding/STEM, Games, Robotics | **done.** |
| R14 | Filters for environment, **difficulty**, task type | **partial.** Environment and task type yes, difficulty no. |
| R15 | Robotics leads rather than lists | **done.** Category pages open on their own footage and state what records them. |
| R16 | Gaming's own context | **not done.** Same gap as R8. |
| R17 | Egocentric states variety of environments, devices, skills, tasks | **done.** `CoverageChart`, four ranked axes. |
| R18 | Gaming: **100 h OTS** + custom collection | **not done.** No sheet row prices gaming; the figure is not on the page. |
| R19 | Hero text rewritten | **done.** |
| R20 | A section describing what kinds of data we have | **done.** `Coverage`, 32 trades. |
| R21 | Robotics is not only egocentric | **done.** Five categories. |
| R22 | Not a report — highlight the parts | **done.** |

**14 done, 5 partial, 3 not done.**

---

## 4. What I can build without asking

1. **Difficulty**, as a rail facet and a `CoverageChart` axis. 118 records carry
   easy / medium / hard. Closes the difficulty half of R3, R12 and R14.
2. **Hours per skill group**, on the coverage axis rather than record counts
   alone. R12.
3. **A gaming section** in the shape of `OtsShelf` and `TeleopSet`: 8 titles,
   41,982 frames, per-frame keystrokes, semantic actions, mouse delta,
   camera-to-world 4×4 and pinhole intrinsics, plus the two-player session with
   a shared clock. R8, R16.
4. **Residential vs non-residential**, derived from `environment` — but see the
   question below, because the split is a judgement about our own sites.

## 5. What I need from you

| # | Need | Why it blocks |
|---|---|---|
| 1 | **Exocentric footage** — a Drive link | The only category with nothing on disk. It is the one place still showing a drawing. |
| 2 | Are the `Sample tại xưởng` GoPro sessions **exocentric or egocentric**? | Single wired GoPro at 1080p60 with audio, KIT-JETSON, in a garment factory. The metadata does not record whether it was head-mounted or on a tripod, and the difference decides which category they belong to. |
| 3 | **Is "Advanced Stereo (6 cam)" a tier we sell?** | R1 names it; the capability sheet does not have that row. The published records are six-camera rigs delivering four streams. |
| 4 | **The annotation demo URL** (R5, "like tbrain-dashboard") | Nothing on the page links it. |
| 5 | **Can per-sample downloads be ungated?** | R11 asks for downloadable samples; ours are behind access; `samples.tbrain.ai` gates nothing. Two of our own pages disagree. |
| 6 | **Gaming's 100 h OTS figure** (R18) | No sheet row for gaming. |
| 7 | Which shelf figure is right for egocentric | The deck says ~15,000 episodes / 1,200 h; the OTS sheet says 12,900+ / ~72 h. 1,200 h ÷ 15,000 is 4.8 min an episode, which matches the published records; 72 h ÷ 12,900 is 20 s, which matches "10–30 s clips". Two corpora, and the card currently states one. |
| 8 | Tam: use-case axis (§2 B) and the three `draft` licence terms | Merchandising and legal. |
