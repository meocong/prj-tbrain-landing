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

Re-checked on the rendered pages 2026-09-09, after the category work. **15
done, 4 partial, 3 not done.**

### Done

R2 both routes per category · R3 residential and non-residential, task type and
difficulty · R4 MCAP / LeRobot and the per-tier file lists · R7 mocap section ·
R8 gaming states its titles, keystrokes and camera matrices · R9 teleoperation
section · R10 findable through menus · R13 three top-level lines · R14
environment, difficulty and task-type filters · R15 robotics leads · R16 gaming
in its own vocabulary · R17 egocentric states its variety · R19 hero rewritten ·
R20 a section naming what kinds of data we hold · R21 robotics is not only
egocentric · R22 highlighted rather than reported.

### Partial

| # | What is missing |
|---|---|
| R1 | **"Advanced Stereo (6 cam)" is not a named tier.** The capability sheet prices five configurations and none of them is that; the head-rig row on the published records says six cameras in three stereo pairs, which is the same hardware described from the other side. Either the sheet is missing a row or the name is ours to retire. |
| R6 | Exocentric has a route, a spec and a tier, and **no section of its own** — 2,053 words against teleoperation's 6,958, and the only page with no footage, no coverage chart and no set. |
| R12 | Hours per **skill group** are on the page; hours per **task** are not. 106 distinct tasks, each with a duration, and the chart stops at the group. |
| R18 | Gaming has no priced tier at all, so its "what we run" block does not render — `CAPABILITY` has no gaming row and inventing one would be worse than the gap. |

### Not done

| # | Why it is still open |
|---|---|
| R5 | **Advanced annotation, head-movement tracking, "like tbrain-dashboard".** Nothing on any page links or shows it. The records carry `Task annotation` and `Environment annotation` per frame and the page says so in one row of `CaptureSpec`; the demo Tam pointed at is not referenced anywhere. |
| R11 | **Downloadable samples per action type.** Measured: zero download links on a category page. `.mcap` appears only in the "Ships as" row, and every route to a file is `passcode` or `Request access`. Our own `samples.tbrain.ai` puts `.mcap` and `.metadata.json` on every card with no gate, so two of our pages disagree. |
| R18 | Gaming's 100 h off-the-shelf figure. No sheet row prices gaming; the Odyssey document in Drive is a **customer's** requirement spec and must not be published. |

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
