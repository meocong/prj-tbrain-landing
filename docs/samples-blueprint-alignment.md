# Aligning /samples with the blueprint system

Written 2026-09-10, after the branch took master and the palette was aliased to
`blueprint.css`.

Tam: *"clone style y hệt em nhé"*. The colour half of that is done and shipped.
This is the rest, and the rest is most of it: `/samples` and the rest of the
site now share a palette and share nothing else.

---

## Where the gap actually is

Measured, not guessed.

| | `/samples` | `/data/physical-ai`, `/casestudy` |
|---|---|---|
| Palette | `--sm-*` → `--bp-*` **aliased** | `--bp-*` | ✅ done |
| Uses `bp-*` classes | **1 file of 27** (`HeroWash`) | throughout |
| Surfaces | hairlines, no fills — "no card fills" is written into `tokens.ts` | `.bp-card` + `.bp-card-hover` everywhere |
| Background | flat `--sm-base` | `.bp-grid`, a drifting 28px blueprint grid |
| Corner ticks | none | `.bp-frame` registration marks |
| Mono labels | ad-hoc `font-mono text-[10px] uppercase tracking-[0.18em]` in ~20 places | `.bp-mono` / `.bp-fig` |
| Radius | `rounded-full` ×24, `lg` ×7, `xl` ×4 | `rounded-xl` ×8, `2xl` ×5, `3xl` ×3, `full` ×15, `bp-card` = 12px |
| Section rhythm | `py-24`, `pb-16 pt-14`, `py-16 md:py-20`, `pb-24 pt-14` — four rhythms | `py-24` / `py-32`, `paddingTop: 92` on sheets |
| Reveal | `Reveal` → `RevealOnScroll` | `StaggerContainer` + `STAGGER_ITEM` |
| Component library | 27 bespoke sections | 34 in `components/marketing/sections/foundry/` |

The honest summary: the samples surface was designed as its own thing — the
`tokens.ts` docstring says so outright, *"Deliberately narrower than the rest of
the marketing site: a single flat base instead of the navy used elsewhere,
hairlines instead of card fills"* — and that decision is now the thing to undo.

---

## What NOT to do

Stated first because it is the expensive mistake available here.

**Do not rewrite the catalogue on top of `foundry/`.** The 34 foundry components
are marketing sheets: hero, ticker, gallery, pipeline diagram, dataset wall.
None of them is a 118-record grid with a facet rail, a record modal and a
telemetry instrument. Forcing `SampleCatalog` into `CapturePackSheet` would cost
a week and lose the thing that makes the page worth visiting.

The goal is that a reader moving from `/data/physical-ai` to `/samples` does not
feel a seam. That is surface, rhythm and type — not architecture.

---

## Wave A — the seam. Cheap, mechanical, no design decisions

Roughly a day. Nothing here changes a layout.

**A1. `.bp-mono` for every technical label.**
`font-mono text-[10px] uppercase tracking-[0.18em]` appears in about twenty
places, hand-rolled each time, and it is `.bp-mono` with a size. Replace, keep
the size, drop the three utilities. `.bp-fig` where the label is a figure
caption in cyan.

**A2. `.bp-card` for anything that is already a bordered box.**
`RigViews`, `CaptureSpec`, `DeliveryLayers` cards, `Evidence` cards, the licence
table, `AccessPaths`. All currently draw `border: 1px solid ${C.hairline}` by
hand, which is `.bp-card` minus the shadow and radius. `.bp-card-hover` on the
ones that are links.

**A3. One radius scale.**
Today: `rounded-full` ×24, `lg` ×7, `xl` ×4, plus `tokens.ts` declaring "media
is square, buttons are pills, and the only rounded container is the telemetry
instrument". Blueprint's answer is 12px on cards, `rounded-xl` on tiles, pills
on buttons. Adopt it: **cards 12px (`.bp-card`), tiles `rounded-xl`, buttons
`rounded-full`, media square.** The media-square rule survives, so the clip grid
does not change.

**A4. One section rhythm.**
Four rhythms today. Standardise on the site's: `py-24` for a normal section,
`py-32` for a major one. `RigViews` and `DeliveryLayers` were hand-tuned to
`py-16 md:py-20` during the F1 trim and will get slightly taller; that is the
cost of matching, and it is small.

**Done when:** `grep -c "bp-mono\|bp-card" src/app/samples` is not 1, and no
samples file hand-rolls the mono-label utility triplet.

---

## Wave B — the atmosphere. This is what makes it read as one site

Half a day, and the highest ratio of "looks aligned" to effort.

**B1. `.bp-grid` behind the sections that are currently flat.**
The drifting 28px blueprint grid is the single strongest signature of the new
design language — it is on every physical-ai section — and `/samples` has it
nowhere except inside two heroes. Apply to `CategoryChooser`, `Coverage`,
`TwoRoutes`, `AccessPaths`. Not behind the catalogue grid: a moving background
under 118 thumbnails is noise, and blueprint's own rule is that text sits on a
card and never on bare grid.

**B2. `.bp-frame` corner ticks on the major sections.**
Two 14px registration marks per section. Cheap, and it is half of why the
physical-ai page reads as a technical drawing.

**B3. `.bp-aurora` behind the front-door hero.**
Already what `HeroWash` approximates by hand with two radial washes. Swap to the
real class and delete the approximation — it drifts, it is reduced-motion aware,
and it will follow if the site retunes it.

**B4. `ScrollProgress`.** One import, top of both samples pages; physical-ai and
terminal-bench both have it and `/samples` does not.

**Done when:** a screenshot of `/samples` mid-page and one of
`/data/physical-ai` mid-page show the same background treatment.

---

## Wave C — motion. Replaces work this branch already did once

**C1. `StaggerContainer` + `STAGGER_ITEM` where a section reveals a list.**
`CategoryChooser`, `DeliveryLayers`, `Evidence` and `OtsShelf` all hand-roll a
`motion.div` with `initial/whileInView` and a `delay: i * 0.06`, which is
`StaggerContainer` with `stagger={0.08}`. Six call sites.

**C2. Keep `Reveal`.** It is already an adapter over `RevealOnScroll` and it
carries the `amount: "some"` fix — a numeric amount is a fraction OF THE
ELEMENT, and the catalogue wrapper is 7,367px tall, so any fraction is
unreachable in an 800px viewport. Do not "simplify" it back to a bare
`RevealOnScroll`; that reintroduces a catalogue that never fades in.

---

## Wave D — the two real reuse opportunities

Everything above is styling. These two are components that already exist and do
what a samples section is trying to do.

**D1. `ScrubVideo` for the hero reel.** Mouse-x scrubs the video on desktop,
autoplays on mobile, holds the poster under reduced motion. `HeroMosaic` and
`HeroReel` currently autoplay a loop. Worth trying on `CategoryHeader`; it is
the same asset shape (`webm`/`mp4`/`poster`) we already produce.

**D2. `GlanceStats` for the category header figures.** `CategoryHeader` prints
eight stats in a hand-built `dl`. Check the shape fits before committing —
`StatsSection` looked like a stats component last time and turned out to be four
hardcoded pillars with icons.

---

## Order, and why

    Wave B  →  Wave A  →  Wave C  →  Wave D
    atmosphere  seam      motion     reuse

B first, against the instinct to do the cheap mechanical pass first. The grid,
the frame ticks and the aurora are what a person sees in the first second, and
they are four classes on eight sections. A1–A4 are more edits for less visible
change, and doing them first means judging the type and surface work against a
background that is about to change anyway.

D last because both items need verifying against the real component before they
are promised — the `StatsSection` lesson from B3.

---

## One decision needed before Wave A

`tokens.ts` currently declares the samples surface's own design rules —
hairlines instead of fills, one radius, a narrower palette. Aligning contradicts
that file's stated intent.

**Recommendation: rewrite the docstring rather than keep both.** A file that
documents "deliberately narrower than the rest of the site" beside code that is
no longer narrower is worse than either state on its own. The right note is what
`--sm-*` now IS: a thin per-page alias layer over blueprint, holding only the
handful of tokens blueprint has no name for — `--sm-playhead`, `--sm-base-rgb`,
the pill colours.

## The one thing that does NOT align, and should not

The record modal, the facet rail and the telemetry instrument have no
counterpart anywhere on the site. They keep their own layout. Alignment here
means they are painted in blueprint's colours, sit on `.bp-card`, and label with
`.bp-mono` — not that they become sheets.
