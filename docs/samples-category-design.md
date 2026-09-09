# Per-category design — one shape each

Supersedes the layout half of `samples-category-copy.md`; the copy plan there
still stands.

Every tab currently runs the same six blocks in the same order. That was the
right call while the pages were being made comparable — a buyer who reads two
learns the shape once — and it is the wrong call now that each category has
different material. Mocap's product is a pose stream. Gaming's is an input
stream. Teleoperation's is a state/action pair. Rendering three different
products through one table makes all three look like the same product.

**The rule that does not bend:** whatever the shape, each page answers three
questions in its first screen and a half.

| | |
|---|---|
| **What is this dataset** | one sentence, exists on all six |
| **What is it for** | the model or task it serves — **missing on all six** |
| **How do we make it** | rig, protocol, who holds the camera |

Everything below that is free.

---

## 1. Egocentric — the scale page

*Material: 118 delivery files, 61 pack clips, 32 trades, 18 industries, 31 site
types, 5 priced configurations.*

The only category where the argument is **range**, so it keeps the grid and the
ranked bars. What it gains:

- **Who wears the camera.** 32 trades is the headline fact and it sits in a bar
  chart four screens down. A line of trades under the title, the way the front
  door already does it.
- **98 at work, 20 at home.** R3, derived, currently only implied by a heading.
- **A clause per configuration.** Five rig rows say what they output and never
  say when you would want one. Mono for volume; RGB-D where geometry matters;
  stereo where the model needs VIO; wrist for the grasp close-up; UMI where you
  want gripper state.

## 2. Exocentric — the collection-in-progress page

*Material: no footage. 20 h in collection since 5 September 2026, 15 operators,
split 10 h urban walking / 5 h vehicular navigation / 5 h structured indoor.
One priced tier, 10,000 h a month ceiling.*

The one category with nothing to play, so it should stop pretending to be a
catalogue page and become a **status page** — the only tab with a date on it.

- **A progress reading, not a hedge.** Three activity splits as three figures
  with what each is for, and the date the count was taken.
- **What the ego rig cannot see,** which is the whole reason to buy this: whole
  body, the second person in frame, the approach before the hands arrive. Say it
  against an egocentric frame we already have — the contrast IS the argument.
- No clip grid, no coverage chart. Both would render as zero.

## 3. Teleoperation — the anatomy page

*Material: 11 episodes, 33 videos, three synced cameras, and `modality.json`
giving the exact layout — state `[0:7]` left arm, `[7:14]` right arm,
`[14:15]` left gripper, `[15:16]` right gripper, action the same. Per-episode
parquet is ~120 KB.*

The product is not footage, it is **one row per frame**. The page should show
that row.

- **A frame, opened up.** Three camera thumbnails on the left, the 16 numbers on
  the right, labelled by the segment they belong to. Nothing else on the site
  looks like this and nothing else needs to.
- **Two products, named.** The page says "robot episodes rather than human ones"
  and sells a tier called *Egocentric + gripper (UMI)*, which is a person
  wearing a gripper. The held set is an `openarm_gripper_follower`. Both are
  teleoperation; the page has to stop conflating them.
- **Pull one parquet** so the numbers are real rather than a schema drawing.
  120 KB, and the alternative is a diagram of data we hold.

## 4. Mocap — the instrument page

*Material: the deployed pose bundle. 160 s, 80 synced keyframes, 4,801 wrist
frames at 30 fps, 21 joints a hand, position and quaternion, 2.1 MB JSON.*

Already the least catalogue-shaped page and it should go further. It is an
instrument, not a shelf.

- **The explorer first,** above the fold rather than below the spec table.
- **Studio only.** A real constraint buried in a tier row: this is
  `Studio (controlled)`, not on site. A buyer planning factory capture needs it
  before the ramp time.
- **240 Hz native, 30 Hz delivered.** In `CaptureSpec` and not in the header,
  where the figure still reads 4,801 with no rate beside it.

## 5. Gaming — the input page

*Material: 8 titles, 41,982 frames, 5 with camera pose, and 480 telemetry rows
a title carrying key, semantic action, mouse delta, world position, yaw, pitch
at roughly 20 ms.*

The footage is the smaller half and the page now says so. What it still lacks is
the input itself.

- **An input track.** `Down|Right → Brake|SteerRight` at 20 ms, for one title,
  as a timeline under the clip. Ten distinct key combinations in BeamNG alone.
  This is R8's "keystrokes" made visible, and the camera paths already handle
  R8's "camera matrices".
- **Genre spread.** Eight titles is thin against "many titles"; naming the
  genres we hold — driving, action-RPG, shooter, survival, open-world — is
  honest about the shape of the eight.
- **ASK** — R18's 100 h off-the-shelf figure. No sheet row prices gaming.

## 6. Coding & STEM — the hand-off card

Routes out to `/data/terminal-bench`. The only chooser card with no figure of
any kind. It needs one number and one sentence about what the tasks are, and
nothing else — a page that exists elsewhere should not be rebuilt here.

---

## Order

| # | Work | Blocked |
|---|---|---|
| 1 | "What it is for" on all six | — |
| 2 | Teleoperation names both products | — |
| 3 | Teleoperation frame anatomy (pull one parquet) | — |
| 4 | Exocentric becomes a status page | — |
| 5 | Gaming input track | — |
| 6 | Mocap: explorer up, studio limit, delivered rate | — |
| 7 | Egocentric: trades line, 98/20 split, clause per tier | — |
| 8 | Coding & STEM figure | — |
| 9 | Exocentric footage · gaming 100 h · which shelf figure | **ASK** |
