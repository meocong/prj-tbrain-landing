# /samples against the partners, read 2026-09-09

First-hand, not from search summaries. Every quote below was pulled off the live
page on the date above.

| Page | Read |
|---|---|
| `claru.ai` | home, `/data-catalog`, `/explore`, `/explore/egocentric` |
| `humanoidlayer.dev` | home |
| `datarade.ai` | home |
| `encord.com` | home |
| `scale.com` | home |
| `samples.tbrain.ai` | ours, the precedent Tam named |

---

## 1. What we are ahead on

Worth stating first, because three of the four gaps below are copy problems and
it would be easy to conclude the page is behind. It is not.

- **Media.** `claru.ai/explore` returns **0 `<img>` and 0 `<video>`**, and so
  does `/explore/egocentric`. Their chooser and their category page are both
  text. Ours now leads every category card with four frames from four skill
  groups, and hovering plays one.
- **Depth of a category page.** Claru's `/explore/egocentric` is a title, one
  sentence, two sub-collections and *Book a Call* — five lines. Ours carries the
  pack summary, the clips with facets, the tier table, the diversity axes and the
  licence.
- **Provenance.** Every Claru figure is followed by *"Approximate, and the figure
  may overlap across sources."* They broker; the hours may be counted twice. Our
  records are first-hand with a full spec per record.

## 2. What is wrong, in the order it should be fixed

### 2.1 "No form" is not a differentiator, and we shipped it as one

`claru.ai/explore` says, verbatim:

> Pick the kind of footage you need, open a folder, and play the clips right
> here. No login, no form.

And `/data-catalog` says *"Browse every category and play approved samples, no
form required."*

Our hero's second line is `Every sample opens without a form` — was, until this
was found — and the comment justifying it called it *"the one no competitor's
catalogue can make"*. That is false. It is table stakes in this market, not an
edge.

**Fix.** The claim comes down from headline size. What is actually ours is one
level more specific: the clip plays **with its telemetry beside it** and the
`.mcap` downloadable from the same card. Claru plays a clip; nobody else shows
the signal. State that instead.

### 2.2 The chooser reads as a copy of `claru.ai/explore`

| Claru `/explore` | Ours |
|---|---|
| "Pick the kind of footage you need" | "Pick the kind of data you need." |
| "No login, no form" | "with no form" (now moved) |
| "approximately 118k hours … Approximate, and the figure may overlap across sources" | "Around 1,200 hours … Figures are approximate." |

Three constructions in a row. This was not deliberate - the hedge was arrived at
independently - but a reader who has both tabs open sees a clone, and Tam sent
Claru as the reference, so somebody will have both tabs open.

**Fix.** Rewrite the chooser heading and the shelf hedge in our own
construction. The hedge itself stays; hedging a portfolio figure is correct.

### 2.3 The two purchase routes get one clause; Claru gives them a section

`claru.ai/data-catalog` has a numbered block titled **"Two ways to get the data
you need"**:

> **01 Off-the-Shelf, Tailored** — Licensed datasets from our catalog, curated
> and formatted to your model's exact specifications. Browse samples, evaluate
> quality, and license what you need.
>
> **02 Bespoke Collection** — Can't find what you need? We design the capture,
> build the pipeline, deploy our global network, and deliver training-ready data
> from scratch.

Ours exists as six words in the hero subhead, `Off the shelf, or collected to
your spec`, and nowhere else on the page. This is **R2** (both routes offered,
per category), and it is the second most important thing the page has to say.

**Fix.** A two-column block on `/samples` under the chooser, and a per-category
version on the category page where the numbers differ (OTS has 118 egocentric
records; bespoke has the tier table and the ramp times).

### 2.4 No coverage block, on a page whose whole argument is coverage

Claru prints 24 activity words as a block - *cooking, walking, assembling,
pouring, ironing, driving, barista, climbing, folding, skiing, typing, sewing,
washing, surfing, picking up, welding, packing, sweeping, painting, cycling,
lifting, knitting, browsing, entering* - then: *"Spanning 14+ countries, 20+
activity domains, and thousands of hours of curated footage."*

We hold, derived from `samples.json` rather than claimed: **16 skill groups, 32
jobs, 18 industries**, plus 70+ operating businesses from the deck. None of it
appears on `/samples`. The diversity block exists but is on the category page,
below the clips.

**Fix.** A coverage section on the front door, built from the real job titles -
*motorcycle mechanic, barber, appliance repair technician, sign maker, tailor* -
which are stronger than Claru's gerunds because they name a trade rather than a
verb. Covers **R3**, **R17**, **R20**.

### 2.5 Cards do not print format and licence; HumanoidLayer's do

Every dataset card on `humanoidlayer.dev` prints three fields under the name:

> DROID — Format `RLDS` · License `CC-BY 4.0` · Enrichment `ready`
> ALOHA — Format `LeRobot` · License `Apache 2.0` · Enrichment `ready`

Ours prints the licence once per category page and the format inside the record
layer. A buyer scanning cards cannot see either.

**Fix.** Format and licence onto the dataset card. We have both per record;
`INTEROP` already holds the delivery formats.

### 2.6 Facets are invisible until you are inside a category

`humanoidlayer.dev` prints its facet *values* on the home page as content -
Modality `RGB-D / actions / language`, Robot type `humanoid / bimanual / arm`,
Task `tool use / grasping / household`, License, Environment. It doubles as a
statement of coverage.

Ours are behind a rail one route down. **R10** asks for sortable, findable
samples through menus; **R14** for environment, difficulty and task type filters.

**Fix.** Print the facet values on the category page above the grid, not only as
a control.

### 2.7 A question for Tam, not a fix

Claru's catalogue is cut by **use case** as well as modality: *Video Evaluation,
Computer Vision, Image Generation, Safety & Moderation, Video Understanding,
Large-Scale Pretraining, Identity Verification*, beside *Egocentric, Dashcam &
Traffic, Gaming, E-commerce*. A buyer who knows what they are training for, but
not which modality serves it, finds their door on that list and not on ours.

Ours is modality-only. Adding a use-case axis is a merchandising decision with a
content cost, and it is Tam's call, not a bug.

---

## 3. Order of work

| # | Change | Req | Size |
|---|---|---|---|
| 1 | Hero second line stops claiming "no form" is unique; says telemetry beside the clip | - | S |
| 2 | Chooser heading and shelf hedge rewritten out of Claru's construction | - | S |
| 3 | "Two ways to buy" block, front door and per category | R2 | M |
| 4 | Coverage section from real job titles and derived counts | R3 R17 R20 | M |
| 5 | Format and licence on the dataset card | R4 | S |
| 6 | Facet values printed as content on the category page | R10 R14 | M |
| 7 | Use-case axis | - | ask Tam |
