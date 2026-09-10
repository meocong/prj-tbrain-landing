# Tam's notes, 2026-09-09 — checklist and plan

Every note from the thread, one numbered item each, each with a plan: what
changes, which files, what "done" means, and what blocks it. Where a note
contradicts something already built, the contradiction is stated rather than
resolved silently.

**Status at a glance** — updated 2026-09-10, after shipping everything that was
not waiting on someone.

| | Item | State | Blocked by |
|---|---|---|---|
| A1 | Cut business address / geohash / locators | **done** | — |
| A2 | Rig names off the page | **done** | — |
| A3 | Meta and MCAP stay behind a passcode | **already true** | — |
| B1 | Match the Tbrain homepage theme | **done** | — |
| B2 | Clone the `/data/physical-ai` gradient style | **done** | — |
| B3 | Reuse existing landing templates | **done, two swaps dropped** | — |
| B4 | Top nav missing Physical AI | **done** | — |
| C1 | One big card each, video running | queued | source video |
| C2 | More visual, less text | **half done** | C1 for the rest |
| C3 | Gaming: real video, big, autoplaying | queued | 1080p sources |
| C4 | Mocap stutters | **traced, not fixed** | the real recording |
| C5 | "cái này ko cần" | **needs pointing at** | Tam |
| D1 | Don't use low-quality video | **not a selection problem** | re-encode |
| D2 | Frames must show the hands | queued | runs after the re-encode |
| D3 | Let Trâm / the team pick the samples | **needs a person** | Tam |
| E1 | Reorganise egocentric by rig type | **blocked** | E2, E3, E4 |
| E2 | Stereo must show 2 cameras or more | **blocked** | left+right files |
| E3 | Six-camera stereo sample | **blocked** | a multi-view sample |
| E4 | Wrist cam | **blocked** | spreadsheet row + files |
| F1 | Front door short and to the point | **done** | — |
| F2 | Move the game block into gaming | **done** | — |

Everything not waiting on an asset or an answer is shipped. What remains is the
numbered asks at the bottom of this file.

## What shipped, measured at 1440

    /samples             8 sections, 11,789px  ->  6 sections, 6,185px
                              1,445 words      ->      1,084 words
    /samples/egocentric       2,641 words      ->      2,654 words
    nav                  7 items + dropdown    ->      8 items, one row
    --sm-base                     #07090F      ->      #020617

Production build green: compiled in 13.4s, 65 static pages, all five category
routes among them. Three CMS fetches fail during the build (`/services`,
`/expert-os`, `/case-studies`) and fall back to cached content — unrelated pages,
and a sandbox with no network rather than a regression.

## Three defects found by reading the rendered page, not the source

1. **The catalogue on `/samples/egocentric` never appeared.** Its scroll-reveal
   wrapper is 7,367px tall and asked for `amount: 0.2` — a fraction of the
   ELEMENT, so 1,473px visible at once, where an 800px viewport can show at most
   0.109 of it. Unreachable threshold, so the wrapper sat at `opacity: 0` for
   the life of the page: 118 records, the main content. Now `"some"`, which has
   no height term. Every other numeric amount in these sections wraps a
   124–300px card and is fine; gaming's tallest wrapper is 2,482px and cleared
   it comfortably.

2. **The front door's primary CTA was invisible in dark mode.** globals.css
   repaints any inline white background for legacy sections —
   `.dark [style*="background:#fff"] { ... !important }` — and the hero pill's
   `background:#ffffff` contains `#fff`. Background forced to a dark scrim,
   colour left at the near-black written beside it, over video. Tokens now.

3. **`/data` was a 404** and the nav dropdown pointed at it. Gone with B4.

## What could NOT be verified here

IntersectionObserver does not function in the Browser pane this was built in: a
hand-rolled observer never received its initial callback, and
`/data/physical-ai`, untouched by this branch, shows the same elements stuck at
`opacity: 0`. **No scroll-reveal behaviour has been observed working or failing,
on any page.** Defect 1 rests on the measured 7,367px and on what an
IntersectionObserver threshold means, not on watching it happen; the fix rests on
`"some"` having no height term. Both want one look in a real browser.

## The order for what is left

Wave 1 (C1, C3, D1, then D2) needs source video. Wave 2 (E) needs three sample
types we do not have. Wave 4 (C4) needs one file. Rationale under "The
measurement that reorders everything" below.

---

# A. Privacy — done, and it was live

## A1. Cut anything that locates who or where

> "ngoài ra ngay cả sample data cũng ko đưa địa chỉ business — cái gì có thể
> định vị nó là ai, người nào, ở đâu thì cắt"

**This was an exposure, not a task.** The record modal on `/samples/egocentric`
printed, on the public page:

| Field | Value |
|---|---|
| `Business` | Motorcycle repair shop 3 (Vinh Quynh) — Vĩnh Quỳnh, Thanh Trì |
| `Geohash` | `w7er06` — a cell of roughly 1.2 km |
| `NAICS` | 811490 — the registered activity code |
| `Site` | Hanoi |
| `Session` | `capture__20260806_155725__785e938d` |

A trading name plus a commune plus a geohash identifies the shop. `redact.mjs`
only ever stripped opaque handles — its own comment said the business, the site
and the geohash were "published as is", which is the opposite instruction.

**Five surfaces carried it. Four were invisible to a source grep**, because they
render the same data under different names; they were found by reading the
rendered page instead:

1. the spec table — `Business`, `Geohash`, `NAICS`, `Site`, `Session` dropped
2. a `device` pill on **every card face**, and again in the modal header
3. the **Rig facet** in the rail (see A2)
4. the modal's scene line, which appended `sample.locale` — the city, and on
   four records the commune `Xa Van Giang` — to a line already naming the trade
   and the premises. It read as scene-setting, which is why it survived the
   first pass.
5. the `File` row, which republished the session handle the `Session` row had
   just dropped: **the filename is that handle**, plus a timestamp to the
   second. Now masked to `…__seg_000.mcap`. `SHA-256` is untouched — it is the
   opaque handle a buyer actually quotes back.

Files: `src/lib/samples/redact.mjs`, `src/app/samples/_sections/SampleCatalog.tsx`,
`src/app/samples/_sections/SampleModal.tsx`.

**Verified:** all 126 records through `publicSpec`, and all six rendered routes
fetched and searched — zero occurrences of any dropped value. The only "Hanoi"
left on the site is our own footer, "Florida & Hanoi".

**Follow-up, not yet a leak.** `samples.json` still carries `locale` in the data.
No component reads it now, but it is a commune-level locator one `grep` away
from a future card. Strip it at the generator, not at the render layer.

## A2. Rig names

> "Rig ko ghi tên"

**Done.** `Device` (`Ego Rig B / fw 2.1.18`) and `Kit` (`kit-7cb9f1ee`) dropped
from the spec table; the `device` pill dropped from the card face and the modal
header; `s.rig` removed from the free-text search haystack, because a name
nobody can see that still returns its records when typed is the same disclosure
one step later.

**The Rig facet was removed, not relabelled**, and the reason matters for E1:

> All 118 egocentric records are **one published configuration** — `tier:
> stereo`, `resolution: stereo pair`, first-person, RGB stereo + IMU + VIO,
> previewed as the left eye. Three rig names, one rig.

So there is nothing to rename the chips *to*. A "rig class" facet built from
this data has a single value and narrows nothing. It becomes a real facet again
when the catalogue holds mono, six-camera and wrist-cam captures that differ in
the record — which is exactly what E1 asks for and E2–E4 block.

`CaptureSpec` already states the configuration without naming hardware: six
cameras in three stereo pairs, IMU at 200 Hz.

## A3. Meta and MCAP behind a passcode

> "ko đưa hết thông tin lên em ơi … cần meta, cần mcap này nọ mình gửi qua
> passcode" · "show hàng chứ ko phải lôi hết ruột rà ra show trên web"

**Already true, and it settles an open question in the other direction.** The
earlier audit listed ungated downloads as a gap, on the grounds that
`samples.tbrain.ai` gates nothing and two of our own pages therefore disagreed.
Tam's instruction wins: every route to a file stays `passcode` or
`Request access`. Closing that item, no code change.

---

# B. Look and feel

## B1. The colours, measured

> "để đúng theme Tbrain trang chủ hiện tại, màu nó đang hơi off"

It is off, and here is the exact delta:

| | `/data/physical-ai` | `/samples` |
|---|---|---|
| Base | `#020617` | `#07090F` dark / `#FBFBFD` light |
| Accent | `#6C3CF4` → `#A78BFA` | **same — already matches** |
| Secondary | `#10B981` emerald | **none** |
| Headline | gradient text `120deg #A78BFA → #6C3CF4 → #10B981` | flat |
| Background | two radial washes + grid overlay under a radial mask | flat |
| Theme | dark only (`ForceDarkScope`) | follows the site toggle |

The accent already matches. What reads as "off" is a *different near-black*, a
missing emerald, and the total absence of gradient.

**Plan**

1. `src/app/globals.css`, the `.samples-scope` block (~lines 1045–1095): set
   `--sm-base` to `#020617` and `--sm-base-rgb` to `2, 6, 23`.
2. `src/app/samples/_sections/tokens.ts`: add `accentAlt` → a new
   `--sm-accent-alt: #10B981`, so the emerald is a token rather than a literal
   sprinkled through six components.
3. Re-check contrast after the base moves. `--sm-text-mid` and `--sm-text-dim`
   are tuned against `#07090F`; `#020617` is bluer and slightly darker, so the
   dim tier needs re-measuring against WCAG AA (4.5:1 body) rather than assuming
   it survives.

**Done when:** a screenshot of `/samples` and one of `/data/physical-ai` sit side
by side without the base reading as two different blacks, and no text token
falls under AA.

**Decision needed (B1.4):** the samples pages deliberately support light mode —
`.samples-scope` declares a full second palette and `layout.tsx` documents the
choice. The rest of the marketing site forces dark. Cloning physical-ai *y hệt*
means deleting a working palette. **Confirm before I do that.**

## B2. The gradient treatment

> "để gradient vv giống như trang physical AI … clone style y hệt em nhé"

**Plan.** Lift three treatments out of `HeroPhysical.tsx` and into the samples
heroes. They are self-contained inline styles, so this is a copy, not a refactor:

- the two radial washes (`HeroPhysical.tsx:31–32`)
- the grid overlay with its radial mask (`:42–45`)
- the gradient headline (`:75–79`) and the gradient primary button (`:101–103`)

Applied to `HeroSamples.tsx` (front door) and `CategoryHeader.tsx` (the six
category pages). **Not** to the catalogue grid — a facet rail over a gradient
wash is the thing that makes a data surface hard to read, and Tam's own next
note asks for *"dễ nhìn"*.

**Done when:** hero of `/samples` and hero of `/data/physical-ai` are the same
visual family; the catalogue below the fold stays flat.

## B3. Reuse existing templates

> "em có thể dùng các templates có sẵn ở trong landing page, ko cần invent ra
> cái mới"

Fair, and it reverses a decision I made: the samples sections were built new.
What already exists and is reusable as-is:

`RevealOnScroll`, `TiltCard`, `MagneticButton`, `PlasmaBackground`,
`VideoBackground`, `KineticText`, `CountUp`, `CapabilitiesMarquee`,
`ContactCTA`, `StatsSection`.

**Plan — two concrete swaps, plus one honest exception**

1. `src/app/samples/_sections/Reveal.tsx` (mine) → `RevealOnScroll` (existing).
   Delete `Reveal.tsx`, update the ~14 call sites. Check the timing first: mine
   is `y 22 → 0` over 0.55 s with `viewport amount 0.2`; if `RevealOnScroll`
   differs, take the existing one's timing rather than porting mine into it,
   otherwise the swap achieves nothing.
2. The samples CTA → `ContactCTA`.
3. `StatsSection` for the `Coverage` figures, if its shape fits the six-axis
   layout — verify before committing to it.

**Exception, stated rather than hidden:** the catalogue itself stays bespoke.
There is no existing template on this site for a 118-record grid with a facet
rail, a record modal and a telemetry panel, and inventing a resemblance to one
would cost more than it saves.

**Done when:** `Reveal.tsx` is deleted and no samples section defines an
animation or a CTA that a `components/marketing/` file already defines.

## B4. The top nav

> "Top menu đang thiếu menu item, ví dụ link đến page physical AI"

**Correct the premise first: Physical AI is already in the nav.**
`src/components/common/Header.tsx:13`, inside the "Data" dropdown, next to
Terminal Bench. Tam did not find it — *that* is the finding. It is buried one
hover deep.

**Options**

| | Change | Cost |
|---|---|---|
| a | Promote Physical AI to a top-level item **(recommended)** | one array entry; nav gets one item wider |
| b | Open the Data dropdown on click, children visible | more code, still a hover away on desktop |
| c | Flatten the dropdown entirely — both children top-level | nav gets two items wider, may wrap on laptop widths |

Recommend (a). The dropdown holds two items and earns its complexity poorly.

**Done when:** Physical AI is reachable from `/samples` in one click, and the
nav does not wrap at 1280 px.

---

# C. Less text, more video

## The measurement that reorders everything

C1, C2, C3 and D1 read as four separate asks. They are one problem. Measured
across all 201 files in `public/samples/clips/`:

| Corpus | Files | Encoded at | Source is |
|---|---|---|---|
| Egocentric deliveries | 109 | **576 × 432** | stereo pair, full res |
| Off-the-shelf pack | 61 | 360 × 640 | 10–30 s phone clips |
| Egocentric (newer) + haircut | 30 | 640 × 480 | stereo pair, full res |
| Gaming | 8 | **640 × 480**, from **1920 × 1080** | 1080p60 screen capture |
| Mocap | 1 | 640 × 360 **at 8 fps** | a 160 s recording |

Two consequences:

- *"video đừng lấy cái chất lượng thấp"* **cannot be answered by choosing a
  different clip** — the entire preview corpus was encoded small. There is no
  sharper clip to switch to.
- *"nó to và chạy luôn"* makes it **worse**: a 576-pixel-wide file across a
  full-width card is the same footage with its flaws enlarged. Gaming is the
  sharpest case — 640 × 480 standing in for 1920 × 1080, a third of the width,
  and 4:3 out of a 16:9 source, so it is cropped or squashed on top.

**So the re-encode comes first and the layout work queues behind it.** Building
the big cards first means building them twice.

And the text/media balance today, per rendered page:

| Route | Words | `<video>` | `<img>` |
|---|---|---|---|
| `/samples` | 1,445 | 9 | 53 |
| `/samples/egocentric` | **2,641** | 87 | 3 |
| `/samples/gaming` | 1,430 | 10 | 11 |
| `/samples/teleoperation` | 1,131 | 16 | 3 |
| `/samples/mocap` | 699 | 2 | 3 |
| `/samples/exocentric` | **654** | **0** | 3 |

Egocentric at 2,641 words is the page Tam is reacting to. Exocentric is the
opposite failure — 654 words and no footage at all.

## C1. One big card each, video running

> "chỗ này hơi nhiều chữ quá, em để luôn video đang chạy, mỗi cái là 1 cái card
> lớn luôn"

**Queued behind the re-encode (Wave 1).** Plan once the files can carry it:

1. One card per sample at full container width, video full-bleed, `autoPlay
   muted loop playsInline`.
2. The paragraph under each card becomes three or four facts overlaid on a
   scrim — task, duration, streams, difficulty. Facts on the card, prose gone.
3. **Do not mount every video.** `preload="none"` plus an `IntersectionObserver`
   that arms playback on entry and pauses on exit. The arm-on-hover pattern in
   `CategoryChooser.tsx`'s `FaceBand` is the one to copy; egocentric already
   renders 87 `<video>` elements and full-width autoplay without gating would
   make that page unusable on a laptop.

Files: `SampleCatalog.tsx` (the `Card` component), `OtsShelf.tsx`.

**Done when:** a category page shows one column of large cards, each playing,
with no more than one paragraph of prose above the grid — and the network panel
shows videos fetching as you scroll, not all at once.

## C2. More visual, less text

> "bố trí cho nó visual + đẹp dễ nhìn, ko quá nhiều chữ"

**Partly doable now, partly behind C1.** Split it:

- **Now:** cut prose. Egocentric's 2,641 words is the target; every explanatory
  paragraph that repeats what a table below it already states goes. Concretely:
  the preview caveat, the licence preamble and the two-routes intro each say in
  a paragraph what the block under them says in a table.
- **After C1:** the remaining reduction comes from moving facts onto cards.

**Done when:** no category page exceeds ~1,200 rendered words, and no page has a
paragraph whose content is repeated verbatim by an adjacent table.

## C3. Gaming — real video, big, autoplaying

> "gaming … em để video thật, nó to và chạy luôn nhé"

**The cheapest and most visible win on the whole list, once we have the
sources.** Eight titles only.

**Plan**

1. Re-encode from the 1080p60 sources to **1280 × 720 at 30 fps, 16:9, no
   crop**, H.264 High, `-movflags +faststart` so the first frame paints before
   the file finishes landing. Budget 2–4 MB each — eight files under 30 MB
   total, which a full-width autoplaying card can carry.
2. Layout: one card per title, full-bleed video, the title and three telemetry
   facts (frames, keystroke channels, camera matrices) overlaid on a scrim
   instead of set below in a paragraph.
3. Same `IntersectionObserver` gating as C1.

Files: `GamingSet.tsx`, `src/lib/samples/gaming.ts` (the `preview` string is
hardcoded as `640 x 480` and must follow).

**Done when:** `/samples/gaming` shows eight full-width 720p cards playing, and
the `preview` caption matches the file actually served.

**Blocked by:** the eight 1080p60 source captures.

## C4. Mocap stutters — traced, not an embed and not a bad cut

> "Mocap em embed video thật nhé, hiện play nó bị giật quá"
> "ko chỉ cái mocap thôi, các video khác ok"

Tam's second message is the whole diagnosis: the mocap tile is the only one on
the site that is **not a video of anything**.

`public/samples/clips/mocap-keyframes.mp4`, via `ffprobe`:

```
codec_name=h264   width=640   height=360
r_frame_rate=8/1  nb_frames=80   duration=10.000000
```

80 frames over 10 seconds, standing in for a 160-second recording — a **16×
timelapse at 8 fps**, a new frame every 125 ms. It is not cut from a driver
sample and it is not stuttering under load. It plays exactly as encoded, and
what Tam is seeing *is* the encoding. Every other clip is a real 30 or 60 fps
capture, which is why only this one stutters.

Where the frames came from: base64 JPEGs embedded in `pose-explorer.html` on the
deployed pose bundle. They exist to be **scrubbed** against the pose stream, one
per keyframe. Stringing them into a video was mine and it was the wrong
instrument.

**Separately — the other half of "hình như đang embed từ đâu đó".**
`MocapDemo.tsx:26` iframes `https://pose-demo-3d.surge.sh/pose-explorer.html`.
That is a genuine third-party embed, on a free static host, and it is the
centrepiece of a page we are about to show customers.

**Plan**

1. Get the real 160 s recording, encode it like C3 (720p, faststart), and delete
   `mocap-keyframes.mp4`. Update `categories.ts:205`, whose `reel` title still
   says "80 keyframes from a 160 s mocap capture".
2. Decide the iframe: host the explorer under `public/` ourselves, or keep the
   surge.sh embed. Recommend hosting it — a sales page whose centrepiece loads
   from a free static host is an availability risk and looks like one.

**Done when:** the mocap tile plays at 30 fps and nothing on the page loads from
a domain we do not control.

**Blocked by:** the real recording.

## C5. "cái này ko cần"

**Needs pointing at.** Which block. No plan possible until then — this is
question 1 in the list at the bottom.

---

# D. Sample selection

## D1. Don't use low-quality video

> "video đừng lấy cái chất lượng thấp, cái em đang để trong egocentric nó có
> cái tóc ở đấy"

The clip is `haircut-neckline.mp4`, 640 × 480. **This is not a selection
problem** — see the measurement above. Fixed by the C-wave re-encode (target
960 × 720 for egocentric, the stereo pair's own 4:3 doubled).

**One thing to confirm before encoding:** if the source will not carry 960, say
so and we cap card width to the real resolution rather than upscaling. Upscaled
576 in a large card is worse than an honestly-sized small card.

## D2. Frames must show the hands

> "chị vào xem thấy cắt tay, ko thấy tay đâu cả"

A **separate fault from D1** — this is the poster frame, not the encode. The
poster is cut at a moment when the hands are out of shot.

The 61 off-the-shelf posters were already re-cut at the ffmpeg scene-score peak
over the middle of each clip, for exactly this reason. **The 118 delivery
posters were not.** Run the same pass over them.

**Plan**

1. Write the pass as a committed script — `scripts/samples/cut-posters.mjs`.
   It was done ad hoc last time and is therefore not reproducible, which is why
   the delivery posters were missed.
2. Method: `ffmpeg -vf "select=gt(scene\,0.1),metadata=print"` over the middle
   60% of each clip, take the highest-scoring frame, write `posters/<slug>.jpg`.
3. Scene score finds **motion**, which correlates with hands in frame but does
   not guarantee it. So: after the pass, sample 20 posters by eye and report the
   hit rate rather than declaring it fixed.

**Sequencing:** run this *after* the re-encode. Cutting posters from clips that
are about to be replaced means cutting them twice.

**Done when:** the script is committed, all 118 delivery posters regenerated,
and a 20-poster spot check reports its hit rate honestly.

## D3. Let Trâm / the team pick

> "samples em chọn cho chị cái nào ổn hoặc bảo Trâm / team chọn"

**Needs a person, and that is the right call.** A scene-score peak finds motion,
not a good sales clip — it cannot tell a well-lit clear demonstration from a
busy blurry one. D2 raises the floor across 118 posters; it does not choose the
handful that go at the top of the page.

**Ask:** a list of ~10 slugs to feature. Once it exists, they get a `featured`
flag in `samples.json` and lead each category page above the grid.

---

# E. Egocentric reorganised by rig type — the big one

> "trang Ego em organize lại theo các thể loại Ego: Mono ego là phần pick a cup
> vv, Stereo là vụ OpenAI vừa rồi, Stereo em phải show 2 cam ít nhất, xong 6 cam
> stereo, rồi Wrist Cam"

**This changes the page's spine, and it is blocked.** Egocentric is organised
today by *skill* — skill group, trade, industry, site type. Tam wants it by
*rig*. Four tiers requested; the catalogue can demonstrate one.

| | Tier | Data? | A preview that SHOWS it? |
|---|---|---|---|
| E1 | Mono | yes — 61 off-the-shelf clips | **yes** |
| E2 | Stereo (≥2 cam) | 118 records | **no — every preview is the left eye** |
| E3 | Stereo 6 cam | rig is 6, delivery is 4 | **no — no sample shows >1 view** |
| E4 | Wrist cam | Tam: *"trong cái spreadsheet có đấy"* | **not on the site at all** |

## E1. The restructure itself

**Plan, once E2–E4 have content.** Four bands down the page, each with its own
heading, its own one-paragraph explanation and its own footage, replacing the
skill-group ordering. The rig tier becomes a **section header, not a facet** —
`SampleCatalog`'s `SPEC_FACETS` already takes a per-category axis list, so the
skill/industry/site facets survive inside each band.

**Recommendation, stated plainly: do not half-build this.** A page split into
four rig bands where three of them show the same left-eye 576 × 432 frame is
*worse* than today's page, because it promises a distinction and then shows
none. Better to ship Wave 3 and wait for the samples.

## E2. Stereo — show at least two cameras

**The single most persuasive asset on this whole list**: one frame that proves
the word "stereo". Every preview we publish is one eye, so the page currently
asserts stereo and shows mono.

`samples.tbrain.ai` already renders left+right side by side at 888 × 360, so the
pipeline exists somewhere.

**Ask:** point me at how that page builds its pair, or give me left+right files
for a handful of samples. Then it is an ffmpeg `hstack` and a caption.

## E3. Six-camera stereo

**Ask:** any sample carrying more than one view. Note the tension to resolve
first — the rig is six cameras, the delivery is four streams. A "6 cam" tier on
the page has to be honest about which number it is naming.

**Plan once available:** a 2×3 mosaic of one synchronised moment, or six short
tiles sharing a scrub bar.

## E4. Wrist cam

**Ask:** which spreadsheet row, and where the files live. Nothing on the site
today.

---

# F. Front door

## F1. Short and to the point

> "trang chủ ngắn gọn súc tích, các ý chính thôi"

`/samples` runs eight sections and 1,445 words.

**Plan — cut to four.**

| Keep | Move to |
|---|---|
| `HeroSamples` | — |
| `CategoryChooser` | — |
| `TwoRoutes` | — |
| `AccessPaths` | — |
| `Coverage` | the category pages (`CoverageChart` is already there) |
| `DeliveryLayers` | the category pages, beside `CaptureSpec` |
| `TelemetryStrip` | `/samples/gaming` — see F2 |
| `Evidence` | the category pages |

The moved sections are not deleted. Each answers a question the reader has
actually asked by the time they are one level down; on the front door they
answer questions nobody has asked yet.

File: `src/app/samples/page.tsx`.

**Done when:** `/samples` is under ~700 rendered words and every moved section
appears exactly once somewhere else.

## F2. Move the game block into the gaming category

> "phần kia nếu nó dành cho Video games thì em để thêm ở phần click vào video
> games"

`TelemetryStrip` is game-specific — keystrokes, semantic actions, mouse delta,
camera-to-world matrices — and sits on the front door where five of six
categories have no use for it. Move it to `/samples/gaming`, above `GamingSet`.

Files: `src/app/samples/page.tsx`, `src/app/samples/[category]/page.tsx`.

**Done when:** nothing game-specific renders on `/samples` and
`/samples/gaming` explains its telemetry before showing it.

---

# What I need from you and Tam

**Assets — these block C1, C2, C3, D1, E and C4:**

1. Gaming: the eight 1080p60 source captures. *(C3 — cheapest win on the list)*
2. Egocentric: sources that re-encode above 576 × 432 — or confirmation that
   576 × 432 is all there is, in which case cards stay small and we say so. *(D1)*
3. Stereo: how `samples.tbrain.ai` builds its 888 × 360 side-by-side, or the
   left+right files for a few samples. *(E2)*
4. Six-camera: any sample with more than one view. *(E3)*
5. Wrist cam: the spreadsheet row and the files. *(E4)*
6. Mocap: the real 160 s recording. *(C4)*
7. Trâm's / the team's pick of ~10 showcase samples. *(D3)*

**Decisions:**

8. **C5** — *"cái này ko cần"* — which block?
9. **B1.4** — keep light mode, or clone physical-ai exactly and go dark-only?
   Cloning means deleting a working second palette.
10. Full video or a few seconds — you had already asked Tam this and her answer
    has not come back.
11. Does dropping the city from every record conflict with the "4 cities"
    diversity claim? The aggregate stays true; the per-record value is gone.
12. Tier specs name commercial hardware — `RealSense D455`, `Pico 4 Ultra`,
    `Helmet GoPro`. I read those as configurations a customer could buy, not
    our internal rig names, so they are outside *"Rig ko ghi tên"* and I left
    them. Confirm.
13. **E3** — when we say "6 cam", do we mean the rig (six) or the delivery
    (four)? The page has to name one.
