# Per-category copy — what each tab has to say

Every category page currently carries **one sentence**, `whatItIs`, and only
egocentric adds a second. Measured 2026-09-09:

| Category | Sentences | Records | Tiers | Capture rows |
|---|---|---|---|---|
| Egocentric | 2 | 118 | 5 | 9 |
| Exocentric | 1 | 0 | 1 | 5 |
| Teleoperation | 1 | 0 | 1 | 6 |
| Mocap | 1 | 0 | 1 | 5 |
| Gaming | 1 | 8 | 0 | 6 |
| Coding & STEM | 1 | — | — | — |

One sentence says what a thing *is*. **None of the six says what it is FOR**,
which is R15 — *"robotics must lead the customer, not just list"*. A buyer who
knows they are training a manipulation policy has to work out for themselves
whether they want exocentric or mocap, and the page does not help.

---

## The shape every tab gets

Three blocks, in this order, before anything else on the page:

1. **What it is** — one sentence. *(exists)*
2. **What it is for** — one sentence naming the model or task it serves.
   *(missing on all six)*
3. **What is in it right now** — counts, hours and the honest state.
   *(egocentric only)*

Then the page continues as it does now: how this is captured → what we run →
the set → the clips.

Nothing below is invented. Each line cites the sheet, the deck, the records or
`IN_FLIGHT`; where there is no source it is marked **ASK** and not written.

---

## 1. Egocentric

**Is** *(keep)* — first-person capture from a head-mounted rig: skilled trades
at work in operating businesses, and everyday manipulation at home.

**For** — *"Behaviour cloning and VLA training where the model has to see what
the hands see: grasp, tool use, and the order a task is actually done in."*

**Now** *(keep the shelf line, add)* — 118 delivery files playable here, 14.2 h;
61 more from the off-the-shelf pack; 5 rig configurations priced.

**Still missing**

- **R1 in reader terms.** The tier table lists five configurations and never
  says *when you would want which*. One clause each: mono for volume, RGB-D
  where geometry matters, stereo where you need VIO, wrist for the grasp
  close-up, UMI where you want the gripper state.
- **R3 residential split.** It exists as a heading on the off-the-shelf block
  and nowhere as a figure. 98 of the 118 are in an operating business; the
  other 20 are backyards, homes and hotel rooms. Derivable, not yet shown.
- **ASK** — which shelf figure is right (deck: ~15,000 episodes / 1,200 h;
  OTS sheet: 12,900+ / ~72 h). They are two corpora and the card states one.

## 2. Exocentric

**Is** *(keep)* — the same work seen from outside the body.

**For** — *"Whole-body pose, scene context and anything with more than one
person in frame — the half an egocentric rig cannot see because it is on the
head doing the work."*

**Now** — from `IN_FLIGHT`, which the page already holds and shows only as a
paragraph: **20 h in collection since 5 September 2026, 15 operators — 10 h
urban walking, 5 h vehicular navigation, 5 h structured indoor.** That is a
content breakdown and should be three figures, not a sentence.

**Still missing**

- **Footage. ASK** — the only category with nothing on disk, and the only one
  still showing a drawing.
- **ASK** — are the `Sample tại xưởng` GoPro sessions exocentric? Single wired
  GoPro, 1080p60, audio, KIT-JETSON, garment factory. The metadata does not say
  head-mounted or tripod, and that decides the category.

## 3. Teleoperation

**Is** *(rewrite)* — the current sentence says "robot episodes rather than human
ones", and the page then sells a tier called **Egocentric + gripper (UMI)**,
which is a *human* wearing a gripper. Two different products under one heading.

- The held dataset is a real robot: `openarm_gripper_follower`, bimanual, 16-dim
  state and action, three synced cameras.
- The priced tier is a person with a UMI wrist rig: `head.mp4 + wrist.mp4 +
  imu.csv + gripper_state.json`.

Both are teleoperation data and they are not the same thing. The page has to
name both.

**For** — *"Action-conditioned policy training: every frame carries the state
the arm was in and the action taken, which is the pair a policy learns."*

**Now** — 11 episodes, 14,076 frames, 33 videos, counted off the files. Already
said once, in a footnote under the set.

## 4. Mocap

**Is** *(keep)*.

**For** — *"Retargeting to a humanoid, and dexterous work where the finger
matters: 21 joints a hand, not a bounding box round it."*

**Now** — the bundle is real and the page already embeds it: 160 s recording, 80
synced keyframes, 4,801 wrist frames at 30 fps. Belongs in the header, not only
in the demo block.

**Still missing**

- **The studio constraint,** which is a real limit and currently only appears
  inside the tier row: mocap is `Studio (controlled)`, not on site. A buyer
  planning factory-floor capture needs that before they read the ramp.
- **240 Hz native, 30 Hz delivered** is in `CaptureSpec` and not in the header
  figure, which still reads 4,801.

## 5. Gaming

**Is** *(keep)*.

**For** — *"World models and agents that act through a UI: the frame, the input
that produced the next frame, and where the camera was when it did."*

**Now** — 8 titles, 41,982 frames, 5 of 8 with camera pose. On the page as of the
`GamingSet` block.

**Still missing**

- **R18: 100 h off the shelf + custom collection. ASK** — no sheet row prices
  gaming, and the figure is nowhere on the page.
- **R16 diversity** — 8 titles is thin against "many titles". Genres are
  derivable from the titles we hold (driving, action-RPG, shooter, survival) and
  are not stated.

## 6. Coding & STEM

**Is** *(keep)*.

**For** — *"Agent evaluation and SFT on tasks that either pass or fail, with no
judge in the loop."*

**Now** — the card says "See the catalogue" and routes out. It is the only card
with no figure of any kind. `/data/terminal-bench` holds the counts; the chooser
should carry one of them.

---

## Order of work

| # | Change | Source | Needs |
|---|---|---|---|
| 1 | `forWhom` line on all six | written above | — |
| 2 | Teleoperation names both products | records + sheet | — |
| 3 | Exocentric's 20 h split as three figures | `IN_FLIGHT` | — |
| 4 | Mocap header carries the bundle and the studio limit | demo + sheet row C | — |
| 5 | Residential / non-residential figure on egocentric | records | — |
| 6 | One clause per tier: when you would want it | sheet + judgement | — |
| 7 | Coding & STEM figure on the chooser card | `/data/terminal-bench` | — |
| 8 | Gaming 100 h | — | **ASK** |
| 9 | Exocentric footage | — | **ASK** |
| 10 | Which egocentric shelf figure | — | **ASK** |
