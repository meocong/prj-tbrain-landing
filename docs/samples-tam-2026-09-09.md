# Tam's notes, 2026-09-09 — checklist

Straight from the thread. Numbered so a reply can cite one. Where a note
contradicts something already built, the contradiction is stated rather than
resolved silently.

---

## A. Privacy — done, and it was live

> "ngoài ra ngay cả sample data cũng ko đưa địa chỉ business — cái gì có thể
> định vị nó là ai, người nào, ở đâu thì cắt"

**This was a live exposure, not a to-do.** The record layer printed, on a public
page:

| Field | Value |
|---|---|
| `Business` | Motorcycle repair shop 3 (Vinh Quynh) — Vĩnh Quỳnh, Thanh Trì |
| `Geohash` | `w7er06` — a cell of roughly 1.2 km |
| `NAICS` | 811490 — the registered activity code |
| `Site` | Hanoi |
| `Session` | `capture__20260806_155725__785e938d` |

A trading name plus a commune plus a geohash identifies the shop. `redact.mjs`
only ever stripped opaque handles — its own comment said "the business, the
site, the geohash … is published as is" — which is the opposite instruction.

**Fixed.** Dropped: `Business`, `Geohash`, `NAICS`, `Site`, `Session`, and — per
A2 below — `Device` and `Kit`. What survives describes the capture and not the
premises: workplace type, station, operator's trade and age band, and the
technical rows.

> "Rig ko ghi tên"

**A2. Done.** `Device` (`DAS Ego V6 / fw 2.1.18`) and `Kit` (`kit-7cb9f1ee`) are
out of the public record. `CaptureSpec` already states the configuration —
six cameras in three stereo pairs, IMU at 200 Hz — without naming hardware. The
rail's **Rig facet still lists rig names** and has to go with them.

> "ko đưa hết thông tin lên em ơi … cần meta, cần mcap này nọ mình gửi qua passcode"

**A3.** This settles the open R11 question in the other direction: downloads stay
gated. The audit had it listed as a gap because `samples.tbrain.ai` gates
nothing; Tam's instruction wins. Removing it from the open list.

---

## B. Look and feel

| # | Note | State |
|---|---|---|
| B1 | "để đúng theme Tbrain trang chủ hiện tại, màu nó đang hơi off" | **not started.** The samples surface has its own palette (`--sm-*`) rather than the site's. |
| B2 | "để gradient vv giống như trang physical AI … clone style y hệt" | **not started.** `/data/physical-ai` is the reference. |
| B3 | "em có thể dùng các templates có sẵn ở trong landing page, ko cần invent ra cái mới" | **not started,** and it reverses a decision: the samples sections were built new. |
| B4 | "Top menu đang thiếu menu item, ví dụ link đến page physical AI" | **not started.** |

## C. Less text, more video

| # | Note | State |
|---|---|---|
| C1 | "chỗ này hơi nhiều chữ quá, em để luôn video đang chạy, mỗi cái là 1 cái card lớn luôn" | **not started.** One large card per item, video running. |
| C2 | "bố trí cho nó visual + đẹp dễ nhìn, ko quá nhiều chữ" | **not started.** |
| C3 | "gaming … em để video thật, nó to và chạy luôn" | **not started.** Gaming's clips exist and play; Tam is asking for big and autoplaying. |
| C4 | "Mocap em embed video thật nhé, hiện play nó bị giật quá" | **traced, not fixed — see below.** |
| C5 | "cái này ko cần" | **needs pointing at.** Which block. |

### C4 traced — the mocap stutter is not an embed and not a cut

Tam narrowed it herself: *"ko chỉ cái mocap thôi, các video khác ok"*. That is
the whole diagnosis, because the mocap tile is the only one on the site that is
not a video of anything.

`public/samples/clips/mocap-keyframes.mp4`, measured with `ffprobe`:

```
codec_name=h264   width=640   height=360
r_frame_rate=8/1  nb_frames=80   duration=10.000000
```

80 frames over 10 seconds, standing in for a 160-second recording — a **16×
timelapse at 8 fps**. A new frame every 125 ms. It is not cut from a driver
sample and it is not stuttering under load: it is playing exactly as encoded,
and what Tam is seeing is the encoding. Every other clip on the site is a real
30 or 60 fps capture, which is why they are smooth and this one is not.

Where the 80 frames came from: they are base64 JPEGs embedded in
`pose-explorer.html` on the deployed pose bundle. They exist to be *scrubbed*
alongside the pose stream, one per pose keyframe. Stringing them into a video
was mine and it was the wrong instrument.

Separately — and this is the other half of "hình như đang embed từ đâu đó" —
`/samples/mocap` iframes `https://pose-demo-3d.surge.sh/pose-explorer.html`.
That is a genuine third-party embed, on a surge.sh domain, on a page we are
about to show customers. Two things to decide, neither of which is the stutter:

1. **The real recording.** The bundle says 160 s of egocentric video exists
   behind those keyframes. If we can get that file, it replaces the timelapse
   and C4 closes.
2. **The surge.sh iframe.** Host it ourselves or keep the embed. A sales page
   whose centrepiece loads from a free static host is a availability risk and
   looks like one.

## D. Sample selection

| # | Note | State |
|---|---|---|
| D1 | "video đừng lấy cái chất lượng thấp, cái em đang để trong egocentric nó có cái tóc ở đấy" | **not started.** |
| D2 | "chị vào xem thấy cắt tay, ko thấy tay đâu cả" | **not started.** Frames must show the hands. The off-the-shelf posters were re-cut at the busiest second for this reason; the egocentric grid has not been. |
| D3 | "samples em chọn cho chị cái nào ổn hoặc bảo Trâm / team chọn" | **needs a person.** A curated list beats any heuristic I can write. |

## E. Egocentric reorganised by rig type — the big one

> "trang Ego em organize lại theo các thể loại Ego: Mono ego là phần pick a cup
> vv, Stereo là vụ OpenAI vừa rồi, Stereo em phải show 2 cam ít nhất, xong 6 cam
> stereo, rồi Wrist Cam"

**Not started, and it changes the page's spine.** Egocentric is currently
organised by *skill* — skill group, trade, industry, site type. Tam wants it
organised by *rig*:

| Tier | What must be shown | Have it? |
|---|---|---|
| Mono | pick-up-a-cup and the rest of the off-the-shelf pack | **yes** — 61 clips, already on the page as `OtsShelf` |
| Stereo (2 cam) | **at least two cameras side by side** | **no.** 118 records are stereo and every preview is one eye. `samples.tbrain.ai` shows left+right at 888×360; ours does not. |
| Stereo 6 cam | a six-camera sample | **no.** The rig is six; delivery is four; no sample shows more than one view. |
| Wrist cam | the robotics shoot | **not on the site.** Tam: "trong cái spreadsheet có đấy". |

This is the item with real work behind it: two of the four tiers have no sample
that demonstrates what makes them that tier.

## F. Front door

> "trang chủ ngắn gọn súc tích, các ý chính thôi"
> "phần kia nếu nó dành cho Video games thì em để thêm ở phần click vào video games"

**F1.** Shorten `/samples`. **F2.** Move the game-specific block off the front
door into the gaming category.

---

# The plan

## The one finding that reorders everything

Five of Tam's notes — C1, C2, C3, C4, D1 — read as five separate asks. They are
one problem. Measured across all 201 files in `public/samples/clips/`:

| Corpus | Files | Encoded at | Source is |
|---|---|---|---|
| Egocentric deliveries | 109 | **576 × 432** | stereo pair, full res |
| Off-the-shelf pack | 61 | 360 × 640 | 10–30 s phone clips |
| Egocentric (4 newer) + haircut | 30 | 640 × 480 | stereo pair, full res |
| Gaming | 8 | **640 × 480**, from a **1920 × 1080** source | 1080p60 screen capture |
| Mocap | 1 | 640 × 360 **at 8 fps** | 160 s recording |

So: *"video đừng lấy cái chất lượng thấp"* cannot be answered by choosing a
different clip, because **there is no higher-quality clip to choose** — the whole
preview corpus was encoded small. And *"nó to và chạy luôn"* makes that worse
rather than better: a 576-pixel-wide file blown up to a full-width card is the
same footage with the flaws enlarged. Gaming is the sharpest case, 640 × 480
standing in for 1920 × 1080 — a third of the width, and 4:3 out of a 16:9
source, so it is cropped or squashed on top.

**Therefore the first move is a re-encode pass, and everything visual queues
behind it.** Doing the layout work first means doing it twice.

---

## Wave 0 — done this turn (privacy, shipped ahead of the rest)

Not queued behind anything: it was live.

| Was published | Now |
|---|---|
| `Business: Motorcycle repair shop 3 (Vinh Quynh) — Vĩnh Quỳnh, Thanh Trì` | dropped |
| `Geohash: w7er06`, `NAICS: 811490`, `Site: Hanoi`, `Session: capture__…` | dropped |
| `Device: DAS Ego V6 / fw 2.1.18`, `Kit: kit-7cb9f1ee` | dropped |
| A `device` pill on **every card face** reading `DAS Ego V6` | dropped |
| A **Rig facet** offering `Robocap` · `DAS Ego V6` · `EgoSense E6` · `GameDataCollector` | group removed |
| Free-text search matching on `s.rig` | removed from the haystack |

The Rig facet was removed rather than relabelled, and the reason matters for
item E below: **all 118 egocentric records are one published configuration** —
`tier: stereo`, `resolution: stereo pair`, first-person, RGB stereo + IMU + VIO,
previewed as the left eye. Three rig names, one configuration. Renaming the
chips to a rig class would produce a facet with a single value.

Files: `src/lib/samples/redact.mjs`, `src/app/samples/_sections/SampleCatalog.tsx`.
`tsc` clean, 0 leaked labels across all 126 records.

**Still to check (not a leak yet):** `samples.json` carries `locale` —
`Hanoi`, `Xa Van Giang`, `Hung Yen`, `Thai Nguyen`. No component reads it today,
so nothing is exposed, but it is a commune-level locator sitting one `grep` away
from a future card. Strip it at the generator.

---

## Wave 1 — the re-encode pass (blocks C1, C2, C3, D1)

**Nothing here can start without the source files.** This is the ask for the team.

### 1a. Gaming — the cheapest and most visible win

Eight titles, source is 1080p60, preview is 640 × 480. Re-encode to **1280 × 720
at 30 fps, 16:9, no crop**, H.264 High, `-movflags +faststart` so the first frame
paints before the file lands. Budget ~2–4 MB each; eight files is under 30 MB
total, which a full-width autoplaying card can carry.

Then C3's layout: one card per title, full-bleed video, `autoPlay muted loop
playsInline`, title and the three telemetry facts overlaid on a scrim rather than
set below in a paragraph. `preload="none"` with an `IntersectionObserver` so
eight 1080-ish videos do not all fetch at once — the existing `FaceBand` in
`CategoryChooser.tsx` already has the arm-on-hover pattern to copy.

### 1b. Egocentric — re-encode from the delivery MCAPs

109 files at 576 × 432 is the bulk of the corpus and the reason the grid looks
soft. Target **960 × 720** (the stereo pair's own 4:3, doubled) from the left
eye. If the source resolution will not carry 960, say so and we cap the card
width to match rather than upscaling.

### 1c. Then, and only then, C1 / C2 — big cards

Once the files can carry it: one large card per sample, video running, the text
that is currently a paragraph moved onto the card as three or four facts. The
`Reveal` component and the `OtsShelf` grid already exist; this is a width and a
hierarchy change, not a new mechanism.

### 1d. D1 / D2 — selection, after quality

`haircut-neckline.mp4` (640 × 480) is the clip Tam flagged. Two separate faults
in her two messages: *quality* (the encode — 1b fixes it) and *framing* (**"ko
thấy tay đâu cả"** — the poster is cut where the hands are out of shot).

The 61 off-the-shelf posters were already re-cut at the ffmpeg scene-score peak
for exactly this reason. **The 118 delivery posters were not.** Run the same pass
over them. That is mechanical and I can do it without new assets — it is listed
here rather than in Wave 3 only because re-cutting posters before re-encoding
video means cutting them twice.

D3 stands: Tam asked for **Trâm or the team to pick** the showcase samples. A
scene-score peak finds motion, not a good sales clip. Give me a list.

---

## Wave 2 — the egocentric reorganisation (E)

> *"Mono ego là phần pick a cup vv, Stereo là vụ OpenAI, Stereo em phải show 2
> cam ít nhất, xong 6 cam stereo, rồi Wrist Cam"*

**Blocked, and the blocker is real.** Four tiers requested; the catalogue can
demonstrate one.

| Tier | Have the data? | Have a preview that SHOWS it? |
|---|---|---|
| Mono | yes — 61 off-the-shelf clips | yes |
| Stereo (≥2 cam) | 118 records | **no — every preview is the left eye only** |
| Stereo 6 cam | rig is 6, delivery is 4 | **no — no sample shows more than one view** |
| Wrist cam | Tam: *"trong cái spreadsheet có đấy"* | **not on the site at all** |

The page cannot be reorganised by rig until three of the four tiers have
something to put in them. Concretely, to unblock:

1. **Stereo:** re-encode a handful of samples as a side-by-side left+right pair.
   `samples.tbrain.ai` already does this at 888 × 360, so the pipeline exists —
   point me at it. This is the single most persuasive asset on the list: it is
   the one frame that proves the word "stereo".
2. **6 cam:** a 2×3 or 3×2 mosaic of one moment, or six short synchronised
   tiles. Needs the un-dropped streams; delivery is 4 of 6.
3. **Wrist cam:** which spreadsheet row, and where do the files live.

Once those exist the page restructure is straightforward: `SampleCatalog`'s
`SPEC_FACETS` already takes a per-category axis list, and the tier becomes a
`RigTier` section header rather than a facet — four bands down the page, each
with its own explanation and its own footage, replacing today's skill-group
ordering.

**Recommendation:** do not half-build this. A page reorganised into four rig
bands where three bands show the same left-eye 576 × 432 frame is worse than
today's page, because it promises a distinction and then shows none.

---

## Wave 3 — theme and structure (B, F) — unblocked, can run in parallel

### B1 / B2 — the colours, measured

Tam: *"màu nó đang hơi off"*. It is, and here is the delta.

| | `/data/physical-ai` | `/samples` |
|---|---|---|
| Base | `#020617` fixed | `#07090F` dark / `#FBFBFD` light |
| Accent | `#6C3CF4` → `#A78BFA` | **same** |
| Secondary | `#10B981` emerald | **none** |
| Headline | gradient text, `120deg #A78BFA → #6C3CF4 → #10B981` | flat |
| Background | two radial washes + masked grid overlay | flat |
| Theme | dark only (`ForceDarkScope`) | follows the site toggle |

The accent already matches — what reads as "off" is the near-black being a
different near-black, the missing emerald, and the total absence of gradient.

Plan: align `--sm-base` to `#020617`, add the emerald as a secondary token, and
lift `HeroPhysical`'s radial-wash + masked-grid treatment into `HeroSamples` and
`CategoryHeader`. Files: `globals.css` (the `.samples-scope` block, ~lines
1045–1095), `tokens.ts`, `HeroSamples.tsx`, `CategoryHeader.tsx`.

**One decision needed:** the samples pages deliberately support light mode; the
rest of the marketing site forces dark. Cloning physical-ai *y hệt* means
dropping light mode. Confirm before I delete a working palette.

### B3 — reuse existing templates

Tam is right that we invented rather than reused. What already exists and is
reusable as-is: `RevealOnScroll`, `TiltCard`, `MagneticButton`,
`PlasmaBackground`, `VideoBackground`, `KineticText`, `CountUp`,
`CapabilitiesMarquee`, `ContactCTA`, `StatsSection`.

Two concrete swaps: `Reveal.tsx` (mine) → `RevealOnScroll` (existing), and the
samples CTA → `ContactCTA`. The catalogue itself has no equivalent on the site
and stays bespoke — there is no existing template for a 118-record facet rail.

### B4 — the nav

Worth correcting the premise before acting: **Physical AI is already in the
nav** — `Header.tsx:13`, inside the "Data" dropdown alongside Terminal Bench.
Tam did not find it, which is the actual finding: it is buried one hover deep.
Options are to promote it to a top-level item, or to make the Data dropdown open
on click with the two children visible. Recommend promoting it; the dropdown
currently holds two items and earns its complexity poorly.

### F1 / F2 — the front door

Today `/samples` runs eight sections: `HeroSamples`, `CategoryChooser`,
`TwoRoutes`, `Coverage`, `DeliveryLayers`, `TelemetryStrip`, `Evidence`,
`AccessPaths`. Tam wants *"ngắn gọn súc tích, các ý chính thôi"*.

Cut to four: `HeroSamples`, `CategoryChooser`, `TwoRoutes`, `AccessPaths`.
`Coverage`, `DeliveryLayers`, `TelemetryStrip` and `Evidence` all move down into
the category pages, where the same content answers a question the reader has
actually asked by then. `TelemetryStrip` in particular is game-specific — that
is F2, *"phần kia nếu nó dành cho Video games thì em để thêm ở phần click vào
video games"* — and belongs on `/samples/gaming`.

---

## Wave 4 — mocap (C4)

Covered in full under **C4 traced** above. Two decisions, neither of them a
layout change:

1. Get the real 160 s recording and drop the 8 fps timelapse.
2. Decide whether the `pose-demo-3d.surge.sh` iframe stays or gets hosted by us.

---

## Sequencing, short version

| Wave | Depends on | Can I start? |
|---|---|---|
| 0 — privacy | nothing | **done** |
| 3 — theme, nav, front-door trim | one decision (light mode) | **yes, today** |
| 1 — re-encode, then big cards | source video files | **no — need assets** |
| 2 — egocentric by rig | stereo/6-cam/wrist samples | **no — need assets** |
| 4 — mocap | the real recording | **no — need the file** |

Wave 3 is the whole of Tam's look-and-feel complaint and needs nothing from
anyone. Suggest starting there while the footage is being gathered.

---

## What I need from you and Tam

**Assets — these block Waves 1, 2 and 4:**

1. Gaming: the eight 1080p60 source captures.
2. Egocentric: source for a re-encode above 576 × 432 — or confirmation that
   576 × 432 is all there is, in which case cards stay small and we say so.
3. Stereo: how `samples.tbrain.ai` builds its 888 × 360 side-by-side, or the
   left+right files.
4. Six-camera: any sample with more than one view.
5. Wrist cam: the spreadsheet row and the files.
6. Mocap: the real 160 s recording.
7. Trâm's / the team's pick of showcase samples (D3).

**Decisions:**

8. **C5** — *"cái này ko cần"* — which block?
9. Light mode: keep it, or clone physical-ai exactly and go dark-only?
10. Full video or a few seconds — you had already asked Tam this and I do not
    have her answer.
11. Does dropping the city from every record conflict with the "4 cities"
    diversity claim? The aggregate stays true; the per-record value is gone.
12. Tier specs name commercial hardware — `RealSense D455`, `Pico 4 Ultra`,
    `Helmet GoPro`. Those are configurations a customer could buy, not our
    internal rig names, so I read them as outside *"Rig ko ghi tên"* and left
    them. Confirm.
