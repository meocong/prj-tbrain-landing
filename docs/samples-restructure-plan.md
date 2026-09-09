# Samples page — restructure plan

Status: **draft, blocked on two answers from Sơn** (§6). Teleoperation was the
third and is now answered — there is a dataset (§5.4). Written 2026-09-09.

Companion to [`samples-runbook.md`](./samples-runbook.md), which covers how the
current 126 records were built. This file covers what replaces them.

---

## 1. What this is actually for

Not a redesign. From Tam's own note at the bottom of *Samples Data Page*:

> I'm getting asked for a data catalog (by multiple customers). If we can
> incorporate into this page, downloadable samples (1 or 2) for each type of
> action/activity + data type, it would be ideal **so we don't need to send out
> manual dated-spreadsheets**. Additionally, how many hours we have in each of
> those groups/tasks, difficulty level, etc.

So the acceptance test is blunt: **can a salesperson stop attaching
`Tbrain_Capability_Catalog_w_Pricing.xlsx` to an email and send a link instead?**

Everything below is scoped to that. A tab that looks good but does not carry
hours, difficulty mix and a downloadable sample has not replaced a row of that
spreadsheet.

Two audiences, and Tam is explicit that they do not mix: *"con game là 1 cái
khác… gần như nó là 2 phần khác nhau, 2 đối tượng mua khác nhau."*

---

## 2. Sources this plan was built from

All fetched 2026-09-09. Google files are reachable with rclone — the machine has
three Drive remotes (`drive:`, `drive7:`, `drive2nf:`) and they do not all see
the same files, so try each:

```bash
rclone backend copyid drive7: <FILE_ID> /tmp/out.txt --drive-export-formats txt
```

| Source | ID / URL | What it gave |
|---|---|---|
| Tam — *Samples Data Page* | `1Z3Jm4L_BcLFHDtdXotcmQEAxRw3Mj9wzTt7-3nUypD0` | the requested taxonomy, and the goal above |
| **`Tbrain_Capability_Catalog_w_Pricing.xlsx`** | `1e1j5ZpyNEzImduPrE8MuTSww8DufeaEC` | the real inventory: 3 sheets, per-modality pricing |
| Sales deck — OTS Stereo | `11hyiv3jmdBWAYjSA8aNR2IJf_DoTgj3swOHBwYITIn8` | 1,200 h corpus figures, difficulty mix, provenance chain |
| Ngọc Anh — exocentric proposal | `1zKkyKPQxr2iz_0ShEo-Vf4KhylJAq1QuJqfzT1a6h_s` | the 20 h exocentric collection now in progress |
| 6-cam demo | `tbrain-dashboard.vercel.app` | 6-camera geometry + chain-of-thought annotation |
| **Teleop dataset** | folder `1yHbZfuBI9j0GBw-6Jme7htpkuaqXnOpP` | a real LeRobot v2.1 set — see §5.4 |
| Reference Tam sent | `claru.ai/data-catalog` | competitor framing |
| `src/lib/samples/samples.json` | in repo | what the page ships today |

`drive:` returns 404 for Tam's doc; `drive7:` has it.

---

## 3. What the page ships today, measured

```
126 records · 14.4 hours of source
  robotics 79 · ots 39 · game 8
  first-person 120 · third-person 6
  stereo pair 118 · 1920x1080 8
  Robocap 84 · DAS Ego V6 33 · GameDataCollector 8 · EgoSense E6 1
```

**Everything non-game is egocentric stereo.** Zero exocentric, zero mocap, zero
mono, zero wrist-camera, zero teleop, zero Coding/STEM — though teleop data does
exist off-page (§5.4).

### The structural bug

The three domains are not one axis:

```
ots      / DAS Ego V6   33   ← egocentric stereo
ots      / Robocap       5   ← egocentric stereo
robotics / Robocap      79   ← egocentric stereo, same rig
```

`ots` is a **provenance**, not a modality, and it is sitting where a modality
belongs. Tam says the same thing in one line: *"Off the shelf thuộc robotics
egocentric."* Modality is the axis; OTS-vs-custom is an attribute of a record.

---

## 4. What actually exists, per the capability catalogue

### Ready to license

| Corpus | Figures | Source |
|---|---|---|
| **OTS Stereo (commercial)** | 1,200 h · ~15,000 episodes · 70+ commercial sites · 35 location types · 100+ operator professions · ~3,000 tasks · 17 skill groups | deck |
| **OTS Mono (daily)** | 12,900+ episodes · ~72 h · 9 skills · head-mounted smartphone · .mp4 30 fps · 10–30 s · **$30–40/h** · delivery in 7 business days | xlsx sheet 1 |

OTS Mono skill mix: pick up a cup **49 %**, screwdriver 13 %, refrigerator 8 %,
door 7 %, hammer 6 %, utensils 6 %, wipe 5 %, fold cloth 5 %, other 1 %.

OTS Stereo difficulty mix: **hard 35 % · medium 47 % · easy 18 %**, average
episode 4 m 49 s. Handcraft/creative 25 %; four more domains 10–12 % each; top
five environments are 71 % of the pool *by design*.

### Custom collection — seven tiers, priced

| Tier | Rig | Ramp | Ceiling/month | Price |
|---|---|---|---|---|
| Egocentric | head-mounted phone | 5–10 d | 20,000 h | $30–40/h |
| Egocentric RGB-D / LiDAR | body-worn iPad Pro | 5–10 d | 5,000 h | $40–60/h + $0.1–2/cuboid |
| **Egocentric Stereo** | RealSense D455 / Pico 4 Ultra | 14–21 d | 2,000 h | **$80–120/h** |
| Exocentric (basic) | fixed / tripod | 14–21 d | 10,000 h | $36–56/h |
| Egocentric + Wrist | phone + wrist cam | 5–10 d | 2,000 h | $120–180/h |
| **Egocentric + Mocap** | GoPro + Xsens MVN HD + Metagloves | 14–21 d | 1,000 h | **$720–1,200/h** |
| Egocentric + Gripper (UMI) | UMI kit | 14–21 d | 1,000 h | $100–150/h |

Plus services: annotation $0.1–1.0/ep, QA & formatting per SOW.

Interop already claimed: **LeRobot v3 · HDF5 · RLDS · MCAP**, mocap to
**FBX / BVH / SMPL**, delivery S3-compatible or physical drive.

### Skill & Environment sheet

33 of 54 skills qualified · 25 Normal + 10 Complex · Office · Restaurant ·
Warehouse · Workshop. Each skill carries an ID, a duration band and an execution
guide — this is a ready-made task taxonomy for the filter rail.

### In flight

Exocentric, 20 h, started 2026-09-05 with 15 operators: 10 h urban walking,
5 h vehicular navigation, 5 h structured indoor. Phone, 1080p30, MP4 with audio,
clips 30 s – 15 min. No annotation in scope for this batch.

---

## 5. What the sources disagree about

### 5.1 "OTS" names two different corpora

- deck: OTS = **stereo**, 1,200 h, *"never a private residence, never a staged studio"*
- xlsx: OTS = **mono phone**, 12,900 episodes, *"household / factory / daily environment"*
- site: 39 records tagged `ots` are in fact **stereo** (DAS Ego V6 33 + Robocap 5 + EgoSense E6 1)

Three meanings for one word, on three surfaces a customer may see together.
Proposal: name them **OTS-Stereo (Commercial)** and **OTS-Mono (Daily)** and
never write bare "OTS" again.

### 5.2 The page sells 0.45 % of the shelf

126 records / 14.4 h against roughly 28,000 episodes / ~1,272 h. Hours per group
is the thing Tam was asked for by customers, and the page states it nowhere.

### 5.3 The top tier may be mislabelled

`tbrain-dashboard.vercel.app` demonstrates a **six-camera** rig — outer ±199 mm,
mid ±129 mm, primary ±60 mm (human interpupillary distance). Every Robocap
record on the samples page says `stereo pair`, i.e. two.

During the R2 extraction pass, Robocap deliveries carried streams named
`primary_left` and `mid_left`, which is consistent with three stereo pairs. If
Robocap **is** the 6-cam rig, then 84 records are being described as the
$80–120/h tier's little sibling. Not confirmable from either repo — the stream
names came from bucket paths, not committed code. **Needs Sơn.**

### 5.4 Teleoperation exists, and its manifest is wrong

The folder holds a **LeRobotDataset v2.1** with a GR00T-compatible
`modality.json`. Read from the dataset, not from its own manifest:

| | |
|---|---|
| Robot | `openarm_gripper_follower` — bimanual |
| State / action | 16-dim: left arm 7 · right arm 7 · left gripper 1 · right gripper 1 |
| Cameras | 3 × 640×480 — `cam_head`, `cam_left`, `cam_right` |
| Episodes | **11** on disk, 37.4 s – 61.6 s each |
| Frames | **14,076** at 30 fps = **7 min 49 s** |
| Videos | **33** files, 1.23 GB |
| Task | one: *"Pick up all the items on the table and put them into the bin on the right."* |

**`meta/info.json` disagrees with the disk on all three counts:** it declares
`total_episodes: 10`, `total_frames: 13465`, `total_videos: 30`, and
`splits: {"train": "0:10"}`. The disk holds 11 parquet files, 11 rows in
`episodes.jsonl` and 33 videos.

Two consequences, both real:

- A LeRobot loader trusts `splits` and iterates `0:10`, so **episode 10 is
  silently dropped** — 1,123 frames, 37 s, and no error.
- `total_frames: 13465` matches neither set: episodes 0–9 sum to 12,953 and all
  eleven sum to 14,076. It is stale from a state the dataset is no longer in, so
  it cannot be repaired by picking one of the two episode counts.

Not fixed here — it is Sơn's data in Sơn's Drive, and this page only reads it.
But it must be corrected before a buyer ingests it, because a wrong episode
count in a manifest is the exact class of defect a data-quality review looks for.


---

## 6. Blocking questions

1. **Is Robocap the 6-camera rig?** Decides whether §5.3 is a relabel or a gap.
2. **Which corpus is which OTS?** Decides §5.1.

Neither requires work — only an answer.

~~Teleops — do we have data?~~ **Answered.** Yes, and it is stronger than the
spreadsheet implied: a bimanual robot dataset in LeRobot v2.1, not a human
wearing a UMI gripper. It is now the fifth modality. What remains is a QC item,
not a question: §5.4's manifest counts are wrong and should be regenerated
before anyone ingests the set.

---

## 7. Proposed structure

### Level 1 — three lines, two buyers

```
Robotics & Physical AI   |   Gaming   |   Coding / STEM
```

### Level 2 — inside Robotics

| Tab | Samples today | Inventory behind it |
|---|---|---|
| **Egocentric** | 118 | 1,200 h + 72 h |
| **Exocentric** | 0 | 20 h in collection; $36–56/h capability |
| **Mocap** | 0 | $720–1,200/h capability |
| **Teleoperation** | 0 published | 11 episodes / 7 m 49 s held, LeRobot v2.1 (§5.4) |

### Level 3 — inside Egocentric

| Tier | Samples today | Price |
|---|---|---|
| Mono | 0 (12,900 episodes on the shelf) | $30–40/h |
| Stereo (2 cam) | 118 | $80–120/h |
| **Advanced Stereo (6 cam)** | ? — see §5.3 | — |
| + Wrist camera | 0 | $120–180/h |

`OTS` / `Custom` become a **badge on a record**, not a tab.

### A tab with no samples still sells

Show the capability, the price band, the ramp time and the monthly ceiling.
That is more honest than hiding the tab, and it is exactly what the spreadsheet
this page replaces already says out loud.

---

## 8. Filters

Ordered by how buyers actually weight them. A 2026 marketplace scorecard puts
**license clarity at 25 %** — heavier than modality (15 %) or embodiment (15 %).

| # | Facet | State |
|---|---|---|
| 1 | **License / rights** | **absent from `samples.json` entirely** — grep finds `license=0 rights=0 exclusive=0`; only `consent` appears, on 118 records |
| 2 | Environment (residential / non-residential, L1–L3) | in data |
| 3 | Task type / skill group | in data |
| 4 | Difficulty | in data |
| 5 | Delivery format (MCAP / LeRobot / HDF5 / RLDS) | in data, not a facet |
| 6 | Rig / embodiment | in data |
| 7 | Modality & streams | in data |

Five of seven are already in the records and merely unexposed. **License is the
one real data gap, and it is the heaviest-weighted filter a buyer applies.**

---

## 9. Competitive read

Grouped, with the numbers that matter for positioning.

**Direct capture.** Scale AI — 150,000+ hours, 100k production hours at its SF
lab, customers include Physical Intelligence and Generalist AI; not beatable on
volume. DexSet — publishes the same taxonomy Tam proposed (egocentric /
exocentric / teleoperation / mono / stereo) and posts prices: raw $15–22/h,
annotated $30–40/h, teleop $28–60/h. Unidata — 38,457 scenarios, 10,255 h, six
synchronised streams per session. DreamVu — frame-synchronised ego + 360° exo.

**Marketplaces.** Truelabel publishes the de facto facet set: 6 modality classes,
22+ embodiments, 8 license categories, 5 delivery formats. HumanoidLayer filters
on task, embodiment, modality, format, license. Robotics Center treats *preview*
and *license-aware* as first-class UI concepts.

**Gaming.** General Intuition raised at $2.3 B mid-2026 on native action labels
out of Medal. Troveo aggregates 8 M licensed hours. NitroGen mines 71,000 h of
public video with on-screen input overlays — free substitute supply, but
gamepad-only.

**Free baseline.** Hugging Face hosts 1,200+ robotics datasets; Ego4D 3,670 h;
Ego-Exo4D ~1,400 h; EgoDex 829 h.

### Three openings

1. **Mocap is nobody's tab.** Truelabel lists mocap shops as *suppliers*;
   Humanoids Data says "motion". No competitor gives it a peer tab. Tam's
   instinct is right and we already price the tier.
2. **Nobody lets you browse.** Truelabel is request-driven — post a brief, wait
   for a match, then see samples. A page that plays a real delivery file with no
   signup is the differentiator, and it is precisely what Scale does not bother
   to build.
3. **Sync rigor is saleable.** Lumine documents 800 ms – 2 s video/input offsets
   causing training leakage. Our records already carry `Clock drift 0 ppm`,
   `Alignment error 0 ms`, `Sync check pass`, `Calibration pass` — buried at row
   20 of a spec table. Move them up.

### Where "teleop" came from — the exact provenance

Three mentions, and they do not agree:

- **Tam's doc, line 21**: `5. Teleops / Simulation: check with Son for such data`
  — a question, not a claim.
- **xlsx sheet 2, title cell**: *"Custom Collection Capabilities · Purpose-Built
  Egocentric **& Teleoperation** Data"* — but no row in sections A–E is a
  teleoperation tier.
- **xlsx sheet 2, capability summary**: *"**Teleoperation**: UMI gripper kit
  (GoPro-based wrist cam, 6-DoF IMU pose tracking)"* — so what we call teleop is
  the **UMI gripper**, already sold as tier D, *Egocentric + Gripper (UMI)*,
  $100–150/h.

Neither the deck nor Ngọc Anh's doc mentions it at all.

**Reading:** the hardware exists and is priced; a teleoperation *dataset* is
unevidenced. So the honest options are (a) fold it under Egocentric as the UMI
tier, or (b) give it its own tab only if Sơn has real episodes. Do not open a
tab on the strength of a spreadsheet subtitle.

---

## 10. Phases

**P0 — answers.** §6. No work, three replies.

**P1 — re-axis.** Move `ots` out of `domain` into a badge. Build the four/five
robotics tabs and the four egocentric tiers. Empty tabs show capability, price
band, ramp, ceiling. *Needs no new data — it is the 126 existing records sorted
onto the right axis.*

**P2 — hours and difficulty per group.** The figure customers asked for. Needs
one source of truth in the repo for the xlsx + deck numbers.

**P3 — license.** Cannot be invented; needs legal/BD to state what each corpus
may be sold as. Highest-weighted filter, currently empty.

**P4 — delivery format facet, hero rewrite, per-tab context copy.**

**P5 — one or two downloadable samples per action type.** Tam's literal request.
Needs R2 wiring and a gate/no-gate decision.

P1 is unblocked today. P2–P5 each wait on someone.
