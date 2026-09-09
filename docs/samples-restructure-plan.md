# Samples page — restructure plan

Status: **live plan.** P1 and P2 are built; P3 and P4 are the next work and are
not blocked. Two questions remain for Sơn (§6).

Revised 2026-09-09 after reading two competitor catalogues first-hand rather
than from search summaries (§9). That reading added a level to the structure:
between a modality and a clip sits a **dataset**, which is the object a buyer
shops for and the one this page does not have (§7). Written 2026-09-09.

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

Four levels, not three. The plan originally stopped at "a tab per modality",
which is the level the competitors treat as navigation, not as product. Between
a modality and a clip they put a **dataset**, and that is the object a buyer
actually shops for.

```
Level 1   Robotics & Physical AI   |   Gaming   |   Coding / STEM
Level 2   Egocentric · Exocentric · Teleoperation · Mocap
Level 3   DATASET  - named, described, counted, licensed        <- missing today
Level 4   the individual clip, playable
```

### Level 1 - two buyers, kept apart

Tam is explicit that gaming and robotics are *"2 đối tượng mua khác nhau"*.
Claru gives Gaming its own browse entry. Today ours puts 8 game clips in the
same 126-card grid as the robotics ones, behind a chip, which asks a robotics
buyer to filter gaming out and a gaming buyer to filter 118 records out.

### Level 2 - modality

Shipped. Five chips, counts 118 / 0 / 0 / 0 / 8, the three empty ones pressable
and answering with a price sheet.

### Level 3 - the dataset layer, and what it costs

This is the whole gap. Our 118 non-game records already carry `skillGroup`. It
is the raw material for dataset cards, but the grouping needs a decision rather
than a script, because the distribution is top-heavy:

```
14  Pick and Place / Object Handling      7  Food Preparation & Cooking
13  Tool Use & Technical Manipulation     7  Construction & Building
13  Cleaning & Sanitation                 4  Repair & Maintenance
10  Organization & Tidying                4  Retail & Service Operations
 9  Assembly & Installation               2  Dish Handling
 9  Packing & Bagging                     2  Human Interaction & Handoffs
 8  Clothing & Laundry                    1  Inventory & Stock Management
 8  Electronics & Diagnostics
 7  Mechanical / Automotive Work
```

Sixteen groups carry records; the taxonomy defines eighteen, so two are empty.
**Twelve of the sixteen hold fewer than ten.** A card built on "Inventory &
Stock Management, 1 episode" is not a dataset, it is a clip with a heading.

- Candidate: merge to **6 to 8 datasets**, joining adjacent groups - Tool Use
  with Mechanical/Automotive (13+7), Cleaning with Organization and Tidying
  (13+10), the four smallest into one. Counts stay real; only the boundaries
  move.
- Each card states: name, one paragraph of what is in it, episode and hour
  count, the environments it was shot in, the rig, the delivery format, and the
  licence.

**What must not be invented.** Claru's cards end in "Use cases: kitchen
robotics, recipe-following agents". That is a claim about what the data suits,
and writing one per card is the fastest way to put a sentence on a sales page
that nobody at Tbrain has agreed to. Descriptions get written from the records:
counts, skills, environments, rigs, formats. Use-case lines get drafted and left
for someone to approve.

### Level 4 - the clip

Shipped, and it is the thing no competitor offers without a form. It stays free
to play; that is the one place this page already beats them.

### A line with no samples still sells

Shipped. Filtering to Exocentric, Teleoperation or Mocap returns rig, sensors,
lead time, monthly ceiling and price band, plus what is already collected.

### Two Paths, promoted

Off-the-shelf versus collected-to-spec is currently a chip in the rail. On
Claru it is the second section on the page, because it is the first question a
buyer resolves: can I have this next week, or am I commissioning it? It should
be a section, not a facet. The facet can stay for people who want to narrow
within it.

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

A filter is not the only place these belong. Both competitors print **licence,
format and provenance on the card itself**, not only in the rail: HumanoidLayer
gives every dataset a fixed Format / License / Enrichment triplet, and states
"provenance before procurement" as a principle. A buyer scanning ten cards
should not have to open each one to learn which are commercially usable. So each
of those three is two jobs: a facet, and a line on every dataset card.

---

## 9. Competitive read

Two of these were opened and read, not summarised from search results. That
distinction matters: the search summaries described *what* competitors sell, and
the pages themselves showed *how they present it*, which is the part this page
gets wrong.

### 9.1 Claru — the reference Tam sent

Read 2026-09-09 at `claru.ai/data-catalog`. Its page order:

1. Hero.
2. **"TWO PATHS"** - `01 Off-the-Shelf, Tailored` and `02 Bespoke Collection`.
   The buy-it-now versus collect-it-for-me choice is the SECOND thing on the
   page, given a full section. Ours is a chip in a filter rail.
3. **"SAMPLE COVERAGE"** - a plain word list of activities (cooking, walking,
   assembling, pouring, ironing, welding, sewing...) then one line of scale:
   *"14+ countries, 20+ activity domains, thousands of hours"*.
4. **"BROWSE THE CATALOG"** - four featured categories, each with its own
   `Browse ->`: Egocentric, Dashcam & Traffic, Internet Videos, Gaming. Then a
   14-item category filter row.
5. **Dataset cards.** This is the structural difference. Every card is a
   *dataset*, not a clip:

   > **EGOCENTRIC**
   > **Egocentric - Cooking & Food Prep**
   > First-person clips of food preparation and consumption: slicing, chopping,
   > peeling, pouring, mixing, eating with utensils, drinking. Cross-source
   > curation from EAC Food & Drink + cooking-tagged clips from Household Tasks
   > (Asia + USA). **Use cases: kitchen robotics, recipe-following agents.**
   > `Request Access ->`

   Scale sits inside the prose where it is worth stating: *"Heavy emphasis on
   door interactions (~40K clips) - gold for home-robotics manipulation
   policies."*
6. **"GLOBAL REACH"** - diversity as four named axes: GEO (14+ countries), DEM
   (age, gender, ethnicity), ENV (indoor, outdoor, urban, rural, workplace,
   domestic), DEV (GoPro, smartphone, cinema cameras, game capture).
7. Case studies, then one CTA.

### 9.2 HumanoidLayer - the robotics-specific one

Read 2026-09-09 at `humanoidlayer.dev`. It prints its own **search facets on the
marketing page as a selling point**: Modality, Robot type, Task, License,
Environment.

Every dataset card carries three fixed fields: **Format** (RLDS, LeRobot),
**License** (Apache 2.0, CC-BY 4.0, Mixed) and **Enrichment** status. Its two
stated principles are *"provenance before procurement"* and *"license clarity by
default"*.

### 9.3 The rest, from published summaries

Scale AI runs 150,000+ hours of physical AI capture with a 100k-hour SF lab and
is not beatable on volume. DexSet publishes the same modality taxonomy Tam
proposed and posts prices. Unidata reports 38,457 scenarios across 10,255 hours
with six synchronised streams per session. DreamVu captures frame-synchronised
ego plus 360-degree exo. Truelabel publishes the de-facto facet set: 6 modality
classes, 22+ embodiments, 8 license categories, 5 delivery formats. General
Intuition raised at $2.3B on native gameplay action labels. Hugging Face hosts
1,200+ open robotics datasets, which is the free floor under all of this.

### 9.4 What ours does differently, and wrong

| | Claru / HumanoidLayer | This page |
|---|---|---|
| What one card is | **a dataset**, named, with a paragraph and use cases | **one 8-second clip** with a title |
| Gaming | its own browse entry | 8 clips inside the same 126-card grid, behind a chip |
| "What is this line for" | a paragraph per dataset | nothing |
| License | on every card | **absent from the data entirely** |
| Delivery format | on every card | in the data, never shown |
| Off-the-shelf vs bespoke | a top-of-page section | a filter chip |
| Diversity | four named axes with figures | implied by the facet counts |

The summary is that we sell **126 loose pieces** where they sell **nine named
packages**. A lab does not go looking for one haircut clip. It looks for
"egocentric tool use, thousands of hours, commercially licensable", and this page
has no object that answers that sentence.

### Three openings

1. **Mocap is nobody's tab.** Truelabel lists mocap shops as *suppliers*;
   Humanoids Data says "motion". No competitor gives it a peer category, and we
   already price the tier.
2. **Nobody lets you play anything without asking.** Claru says "no form
   required" but every card ends in `Request Access ->`. Truelabel is
   request-driven: post a brief, wait for a match, then see samples. A page that
   plays a real delivery file with no signup is the differentiator, and it is
   what we already have.
3. **Sync rigor is saleable.** Lumine documents 800ms-2s video/input offsets
   causing training leakage. Our records already carry `Clock drift 0 ppm`,
   `Alignment error 0 ms`, `Sync check pass`, `Calibration pass`, buried at row
   20 of a spec table.

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

Renumbered after reading the competitor pages, which moved the dataset layer
from "nice later" to the centre.

**P0 - answers.** §6. Two questions for Sơn, no work.

**P1 - re-axis.** *Done.* `domain` split into `modality`, `provenance` and
`tier`; five modality chips; empty lines answer with a price sheet; the
downloads page regrouped; hero, title and corpus lines all on the new axis.

**P2 - hours on the shelf.** *Done.* Five corpus lines, each with its figure and
an honest state.

**P3 - split the two buyers.** Gaming stops sharing a grid with robotics.
Unblocked, and the smallest change with the largest effect on how the page
reads.

**P4 - the dataset layer.** The main build. Group the 126 records into 6 to 8
named datasets per modality, write each description from the records, and give
every card its counts, environments, rig and format. Use-case lines drafted, not
shipped, until approved.

**P5 - licence.** Cannot be invented; needs legal or BD to state what each
corpus may be sold as. It is the heaviest-weighted filter a buyer applies and
the only one with no data behind it. Blocks the dataset cards from being
complete, though not from shipping.

**P6 - Two Paths as a section.** Off-the-shelf versus collected-to-spec,
promoted out of the rail.

**P7 - diversity as named axes.** Claru's GEO / DEM / ENV / DEV. We hold most of
it: 70+ sites, 35 location types, 100+ operator professions, ~3,000 tasks,
17 skill groups, five rig families. Currently spread across body copy.

**P8 - a downloadable sample per dataset.** Tam's literal request. Needs R2
wiring and a gate-or-not decision.

### Sequencing

| | Phases | Blocked by |
|---|---|---|
| Done | P1, P2 | - |
| Now | P3, P4, P7 | nothing |
| Waiting | P5, P8 | legal / BD, and an R2 decision |
| Now, unranked | P6 | nothing |
| Blocked | the six-camera relabel | Sơn, on what the delivered MCAP carries |

P3 is hours. P4 is the week. Everything else is smaller than it looks once the
dataset object exists, because licence, format, provenance and the download all
hang off it.
