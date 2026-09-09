# Samples, v2 — a category catalog, not a filtered grid

Supersedes the structure sections of
[`samples-restructure-plan.md`](./samples-restructure-plan.md). The data findings
in that file still stand; the shape it proposed does not.

---

## 0. What I got wrong

Everything built so far is a **band bolted onto one scrolling page**: a line
switch, a diversity strip, a dataset row, a facet rail, a grid. Each was a real
improvement to that page, and the page is still the wrong object.

The competitors do not filter. They **route**.

```
Claru:   /explore  ->  category card  ->  Browse ->  ->  folder of clips
Ours:    /samples  ->  chips and a rail on one page
```

Their `/explore` reads, in full:

> **Browse some examples of data in our catalog.**
> Pick the kind of footage you need, open a folder, and play the clips right
> here. No login, no form.

Then four cards. Each card is a *category* carrying:

- a sentence saying what the category **is** ("First-person video data captured
  in crowded, public environments with diverse human interactions")
- a **portfolio context** line stating the shelf size, hedged out loud
  ("approximately 118k hours ... Approximate, and the figure may overlap across
  sources")
- `Browse ->`

Nothing on that page is a filter. The reader picks a kind of data, and the next
page is about that kind of data.

Three consequences I ignored:

1. **A category needs a description.** Ours has none. A reader who does not
   already know what "egocentric" means learns nothing from a chip reading
   `Egocentric 118`.
2. **A tier needs a description.** Tam's own doc lists mono / stereo 2-cam /
   stereo 6-cam / with-wrist under Egocentric. We store none of that and say none
   of it. "Mô tả được mỗi tier mỗi loại thì có cái gì" is the exact gap.
3. **Gaming is a category, not a chip.** It needs its own page saying what kinds
   of game data exist, because a gaming buyer and a robotics buyer never want
   the same page.

---

## 1. The structure

```
/samples                     the chooser. Two lines, six categories, nothing else.
│
├── /samples/egocentric      what it is · tiers · datasets · clips
├── /samples/exocentric
├── /samples/teleoperation
├── /samples/mocap
└── /samples/gaming          what kinds of game data
```

`/samples` stops being a catalog and becomes a **front door**. The catalog lives
one level down, where a page can afford to explain itself.

### 1.1 `/samples` — the chooser

- Hero: what this is and that it plays without a form. That is the one thing no
  competitor offers and it should be the headline, not a slogan.
- Two line groups, Robotics & Physical AI and Gaming, because they are two
  buyers.
- Six category cards. Each carries: name, one sentence of what it is, the shelf
  figure hedged the way Claru hedges it, what is playable here now, and an
  entry link.
- Nothing else. No rail, no grid, no facets on this page.

### 1.2 `/samples/[category]` — where the work is

Every category page, same skeleton, different content:

| Block | Egocentric example |
|---|---|
| What it is | Head-mounted capture of skilled manual work, recorded on the job in operating businesses. |
| Shelf figure, hedged | ~1,200 hours across ~15,000 episodes on the shelf. 118 episodes playable here. |
| **Tiers** | Mono · Stereo 2-cam · **Stereo 6-cam** · With wrist camera. Each with rig, streams, what it is for, price band, lead time, and how many samples are published. |
| Datasets | The 8 named sets, each with poster, counts and a one-line description. |
| Clips | The grid, filtered to this category. Facets live here, not on the front door. |
| Delivery | Format, provenance, licence. |
| CTA | Request access, or scope a collection. |

The tier block is the piece that does not exist in any form today, in the data or
on the page. It is the answer to "what does each type actually contain".

### 1.3 `/samples/gaming`

Same skeleton, different vocabulary. Not tiers but **what kinds of game data**:
titles captured, session types (solo, two-player coop), what ships per frame
(keystrokes, mouse delta, semantic action, camera-to-world matrix, pinhole
intrinsics), and what a coop session adds (shared clock, cross-agent
visibility). Eight titles playable.

---

## 2. The title

Tam asked for the hero text to change and it still has not, in substance. It has
been a slogan in three different wordings:

```
was    Robotics and game data, frame by frame.
now    Human, robot and game capture, frame by frame.
```

Both describe the footage. Neither says what the page is or what the reader can
do here, which is the only thing worth the largest type on the page: **this is a
data catalog, and every sample plays without a form.** Claru puts exactly that in
its subhead. Ours should carry it in the headline.

Drafting is a copy decision, not an engineering one, so it goes to Tam with two
or three options rather than being picked here.

---

## 3. What has to exist in the data first

The tier block cannot be written from `samples.json` as it stands.

| Needed | Have it? |
|---|---|
| `tier` per record: mono / stereo-2cam / stereo-6cam / wrist | **No.** Every record says `"stereo"`, unqualified, pending the camera-count answer. |
| Camera count per rig | Robocap is six, evidenced twice. DAS Ego V6 unknown. |
| Tier description, price, lead time | In `capability.ts` already. |
| Category description | **No.** Has to be written. |
| Licence | **No.** No data anywhere. |

So the tier block ships in two stages: the descriptions and prices now, the
per-record tier badge once the camera question is answered.

---

## 4. Order of work

1. **`/samples` becomes the chooser.** Strip it to hero plus six category cards.
   The existing grid, rail and dataset band move to `/samples/egocentric`
   unchanged - no work lost, just relocated.
2. **Category page shell**, one route with the skeleton above, driven by data so
   all six share it.
3. **Category and tier copy.** The writing job. Descriptions from records where
   possible, the rest drafted for approval.
4. **`/samples/gaming`** with its own vocabulary.
5. **Tier badges on records**, after the camera answer.
6. **Licence**, after legal.

Steps 1 and 2 are structural and unblocked. Step 3 is where the page stops
sounding like a spreadsheet.

---

## 5. How this gets checked

Not by counting elements. By opening the page next to `claru.ai/explore` and
asking three questions:

- Can a reader who has never heard of egocentric data tell what it is?
- Can they tell what the difference between two tiers is?
- Can they play something within one screen of arriving?

Today the answers are no, no, and no - it is 1,100px and a facet rail before the
first frame. Those three are the acceptance test, not a checklist of fixes.
