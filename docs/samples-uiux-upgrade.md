# Samples page — UI/UX upgrade

Audit and plan. Companion to [`samples-restructure-plan.md`](./samples-restructure-plan.md),
which covers *what data goes on the page*. This one covers *how it looks and behaves*.

Written 2026-09-09, against commit `9ab0d80`, measured in a real browser at
1440x900 rather than read off the source.

---

## 0. Design read

**Redesign, preserve.** The brand, the token set and the information architecture
all work; the visual debt is local, not structural. So this is targeted
evolution, not an overhaul, and none of the page's routes, anchor ids or
analytics event names move.

> Reading this as: a B2B data-catalog page for frontier-lab procurement buyers,
> with a technical-editorial language, on the existing samples token system
> (hairlines instead of cards, mono microtype, one violet accent) plus Base UI
> primitives.

### Scope boundary, stated up front

Half this page is a **faceted catalog with a spec table** — dense product UI, not
a landing page. Landing-page rules about card counts, hero drama and section
rhythm apply to the seven page sections. They do not apply to the rail, the grid
or the record modal, which are judged as product UI: scan speed, state clarity,
keyboard reach. Applying marketing rules to a filter rail is how good catalogs
get ruined.

### Dials

Read off the current build, then adjusted one notch for a preserve-mode redesign:

| Dial | Current | Target | Why |
|---|---|---|---|
| `DESIGN_VARIANCE` | 5 | **6** | Rail plus grid is inherently orderly. One deliberate asymmetry in the section band is enough. |
| `MOTION_INTENSITY` | 6 | **5** | Motion is already everywhere and some of it is unmotivated. Down, not up. |
| `VISUAL_DENSITY` | 7 | **7** | Buyers came for numbers. Density stays; at 7 the rule is no generic card containers and mono for every figure, which the page mostly honours. |

---

## 1. Audit — what is measured, not guessed

At 1440x900:

```
7 sections · page height 8,679 px · hero exactly 900 px (one viewport)
h1: 72px, 3 authored lines
19 instances of the eyebrow signature (uppercase + tracking)
31 spec rows per record, each drawing its own hairline
2 window scroll listeners driving React state
```

### 1.1 What is working and must survive

- **Hero fills exactly one viewport** at every height tested, with the CTA above
  the fold. That was fixed deliberately and is easy to break again.
- **The token system.** `--sm-*` variables, one violet accent, hairlines instead
  of card fills, mono for every number. Both themes resolve, including through
  the portal the new dropdowns render into.
- **Counts on every facet**, computed with that facet lifted, so a chip showing a
  number can never lead to an empty grid.
- **The Base UI dropdowns** shipped today: real listbox semantics, typeahead,
  focus return, flipping when the viewport runs out.
- **The capability panel.** Filtering to a line with no samples returns a price
  sheet rather than "nothing matches". That is the page's actual job.

### 1.2 Defects, ordered by how much they cost

| # | Defect | Where | Cost |
|---|---|---|---|
| 1 | **h1 is 3 lines** at 72px | `HeroSamples.tsx` | Guideline is 2. Three lines of display type is a font-scale error, and the third line is the one carrying the metaphor. |
| 2 | **Hero copy names the old axis** | `HeroSamples.tsx` | "Robotics and game data" was written when `domain` had three values. The rail now says Egocentric / Exocentric / Teleoperation / Mocap / Gaming. Headline and filters disagree. |
| 3 | **Scroll cue** | `HeroMosaic.tsx` | A reader looking at a hero knows what scrolling is. It is also the second eyebrow in the first viewport. |
| 4 | **2 `window.addEventListener("scroll")` driving `setState`** | `HeroMosaic.tsx`, `Header.tsx` | Fires every scroll frame and re-renders React each time. `useScroll` or IntersectionObserver do the same job off the render path. |
| 5 | **31 spec rows, one hairline each** | `SampleCatalog.tsx` `SpecRow` | The single most-flagged dense-list pattern. 31 evenly-ruled rows is a wall; nothing is findable without reading every label. |
| 6 | ~~19 eyebrows~~ **WITHDRAWN** | across sections | The mechanical count the checklist prescribes gives 19, but only ONE of them is a section eyebrow (the hero's). The other 18 are functional micro-labels: telemetry field keys, stat labels beside figures, status badges. Deleting them would break working UI to satisfy a grep. Budget 3, actual 1. |
| 7 | **18 en/em dashes in visible copy** | `capability.ts`, `SampleCatalog.tsx` | All introduced today. `5–10 business days`, `$30–40 / h`, `200–400 Hz` should be hyphens; the two prose em-dashes should be full stops. |
| 8 | **No hours, anywhere** | whole page | The literal thing customers asked for. Toolbar says "126 of 126 samples / 864.4 minutes", which is a filter readout, not a shelf statement. |
| 9 | **`Streams: 4` / `stereo pair` on Robocap** | `samples.json` | Robocap is a six-camera rig. 84 records read a tier below what they are. Blocked on the delivery check, not on design. |
| 10 | **Modal is the only way into a record** | `SampleModal.tsx` | No deep link, so a buyer cannot send a colleague one sample. For a page whose job is to replace an emailed spreadsheet, that is the wrong default. |

### 1.3 Explicitly checked and clean

No fake screenshots built from divs. No hand-rolled decorative SVG. No AI-purple
gradient. No `h-screen`. No decorative status dots. No locale or weather strip.
No version footer. No section-number eyebrows. No three-equal-cards feature row.
No generic names or invented brands. Motion honours `prefers-reduced-motion`.
Both themes are implemented and tested.

---

## 2. Plan

Ordered so each step is shippable alone and none blocks the next.

### Step 1 — Hero, retyped and rewritten

Three lines to two, and the copy moved onto the new axis.

- Drop to two authored lines. Font scale planned with the line count rather than
  after it: `text-5xl md:text-6xl xl:text-7xl` stays only if the headline is
  short enough to hold two lines at `xl`.
- Rewrite to name modalities, not the retired `domain` values. The headline is
  the page's one chance to say what is on the shelf.
- Delete the scroll cue. It costs an eyebrow and says nothing.
- Keep: one eyebrow, one subtext under 20 words, one primary plus one secondary
  CTA. Four elements, which is the cap.

### Step 2 — Hours on the shelf

The customer question, answered where a customer looks.

- A band directly under the hero: hours, episodes, sites, task types, difficulty
  mix, per modality. Numbers in mono, no card containers, hairlines only.
- Sourced from one file, not retyped per surface. `capability.ts` already holds
  the collection side; the shelf side needs the same treatment for the deck and
  spreadsheet figures.
- This is the section that replaces the emailed spreadsheet's summary rows.

### Step 3 — Spec table, regrouped

31 evenly-ruled rows becomes clusters with sparse rules.

- Group by the sections `spec-sections.ts` already defines. One rule above each
  group, none between rows inside it.
- Lead each record with 4 to 6 display figures (source length, capture, frame
  rate, delivered size) as large mono values, then the rest below.
- Keep every field. The problem is rhythm, not volume; a buyer scanning for
  `Alignment error` should find it by group, not by reading 31 labels.

### Step 4 — Eyebrow cull

From 19 to at most 3 across 7 sections.

- Keep: hero, and the two section headers that genuinely need categorising.
- Drop everywhere else. A section's position on the page already says what it is.
- Rail group titles (`Modality`, `Industry`, `Rig`) are **not** in scope. They
  are functional labels on a filter control, not section eyebrows.

### Step 5 — Copy pass

- Every `–` in a range becomes `-`. Every prose `—` becomes a full stop or a
  comma. 18 instances, all introduced today.
- Re-read every visible string end to end. The last three commits added copy
  fast and it has not had a full read.

### Step 6 — Scroll listeners retired

- `HeroMosaic` loses its listener with the scroll cue in Step 1.
- `Header` moves to `useScroll` from `motion/react` or an IntersectionObserver
  sentinel. Same behaviour, off the render path.
- Site-wide file, so it ships on its own and gets checked on more than `/samples`.

### Step 7 — Deep-linkable records

- `/samples?record=<slug>` opens the modal on load and updates on open and close.
- Makes a single sample sendable, which is the whole premise of replacing an
  attachment.
- Existing analytics events keep their names.

### Step 8 — Modality sections

Only after the restructure data lands. Each modality gets a real section with its
own context paragraph, its hours, and its downloadable sample. This is where the
page stops being one grid with filters and becomes the catalog Tam described.

---

## 3. Sequencing

| | Steps | Blocked by |
|---|---|---|
| Now | 1, 4, 5, 6 | nothing |
| Next | 3, 7 | nothing, but larger |
| After data | 2, 8 | shelf figures in the repo |
| Blocked | defect 9 | the Robocap delivery check |

Steps 1, 4, 5 and 6 are one afternoon and remove six of the ten defects.

---

## 4. Pre-flight, current state

Run against the page as it stands, so the next pass has a baseline.

| Check | State |
|---|---|
| Zero em-dashes in visible copy | **FAIL** - 18 |
| Hero headline max 2 lines | **FAIL** - 3 |
| Eyebrow count <= ceil(sections/3) | PASS - 1 section eyebrow against a budget of 3. The raw grep says 19; 18 of those are data labels, not eyebrows. |
| No scroll cues | **FAIL** - one, added today |
| No `window.addEventListener("scroll")` | **FAIL** - 2 |
| No `border-t` on every row of a long list | **FAIL** - 31 rows |
| One theme per page, no mid-page inversion | PASS |
| One accent, used identically throughout | PASS |
| One radius system | PASS |
| Button contrast WCAG AA | PASS |
| No CTA label wraps at desktop | PASS |
| Hero fits the viewport, CTA above the fold | PASS |
| Hero stack max 4 text elements | PASS - exactly 4 |
| Reduced motion honoured | PASS |
| Dark mode implemented and tested | PASS |
| `min-h`/`h-svh`, never `h-screen` | PASS |
| Real media, no div-based fake screenshots | PASS |
| Empty, loading and error states | PASS - empty state returns a price sheet |
| No AI-purple, no three-equal-cards, no invented brands | PASS |

Six failures, five of them cheap. Four were introduced in the last three commits,
which is the useful part of running this audit now rather than at the end.

### Resolved 2026-09-09

| Was | Now |
|---|---|
| 18 dashes in visible copy | 0 |
| Hero headline 3 lines | 2 |
| Hero named the retired axis | names the five modalities |
| Scroll cue | removed |
| 2 `window.addEventListener("scroll")` | 0 in `src/` |
| 31 spec rows each drawing a rule | 30 rows, 0 rules, 6 group headings |
| No hours anywhere | five lines, each with its own figure and state |
| Records unaddressable | `/samples?record=<slug>` |
| 19 eyebrows | withdrawn, the count was wrong |

Still open: the Robocap six-camera relabel, which is blocked on the delivery
check, and per-modality sections with downloadable samples, which are blocked on
the restructure data.
