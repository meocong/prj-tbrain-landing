# Hand pose samples: data and media pipeline

Builds everything the `/samples/hand-pose` page shows for the 16 hand-pose samples, from the data
team's delivery (SUMMARY sheet, per-sample `handpose.json`, `hands.npz`). The output never carries
mesh, or anything that says who or where. Camera pixels appear only in the `video` tier's preview,
after `render-overlay.py` has blurred faces and bystanders (and, for the samples in its
`FOCUS_SAMPLES`, everything away from the hands); every output of it is looked at before it ships.

## Scripts

| File | What it does |
|---|---|
| `curation.json` | The reviewed mapping: title, skill group and publish tier (`video` / `poster` / `lane`) per sample, and which samples get a gated pack. The only source of those values. |
| `hp_common.py` | Shared loading: paths (`HANDPOSE_CACHE`), curation and SUMMARY rows (by row order), the exclusive state arrays, run-length, strips, one-decimal rounding, slug helpers, mp4 probing. |
| `hp_render.py` | Skeleton renderer: virtual camera, per-sample fit, `draw()`, `best_frame()`, palette check, ffmpeg writer. |
| `render-skeleton.py` | CLI. Renders every media file, writes `render-plan.json`, probes the media. `--check-palette`, `--only NN`, `--no-video`, `--verify`. |
| `render-overlay.py` | CLI. The `video` tier's media from the head camera (mid_left, private cache): faces (YuNet) and bystanders (YOLOX) blurred, `FOCUS_SAMPLES` blurred away from the hands, `SCREEN_SPANS` blurred between the hands, the 2D hand pose drawn over it. Overwrites the skeleton media of those samples, merges its entry into `render-plan.json`, writes review sheets outside the repo. `--only NN`. Slow: about 20 min a sample. |
| `export-joints.py` | The 3D view's joints for the `video` tier: 15 fps, 2 mm, int16 `.bin` plus a `.json` layout. |
| `build-handpose-data.py` | Metrics JSON, lanes, CSV, private slug map, and every consistency assert. `--longest-gap gate` publishes the pipeline's own gap figure instead of the lane's (see States). |
| `pack-handpose-assets.py` | The gated packs, outside the repo, with their checks and `manifest.json`. |
| `render-plan.json` | Poster frame and loop window per sample (output of the renderer, read by the build). |

## Run order

    python3 render-skeleton.py          # media + render-plan.json   (about 40 s)
    python3 render-overlay.py           # camera video for the video tier (slow; review every output)
    python3 export-joints.py            # 3D view joints for the video tier
    python3 build-handpose-data.py      # data files, asserts, privacy scan
    python3 pack-handpose-assets.py     # packs for the samples marked "pack" in curation.json

Needs python3 with numpy, opencv, openpyxl and rerun-sdk 0.38.1, and `ffmpeg`, `ffprobe` and `rerun` on
PATH. Inputs live in `$HANDPOSE_CACHE` (default `~/.cache/tbrain-samples/handpose-v2`): `SUMMARY.xlsx`,
`<sample folder>/handpose.json`, `<sample folder>/calibration.json` (renderer only, see below) and
`research/npz/<sample folder>/hands.npz`. To change a tier or title edit `curation.json`, then re-run
all three. Re-running overwrites its own outputs only and reproduces the media byte for byte (the packs
differ only in Rerun's internal ids). Moving a sample to the `lane` tier does not delete its old media: remove
the files by hand; `render-skeleton.py --verify` and the build fail while they exist.

## Outputs

| Path | From |
|---|---|
| `src/lib/samples/handpose-metrics.json` | build |
| `public/samples/hand-pose/lanes/hand-pose-NN.json` (16), `public/samples/hand-pose/hand-pose-metrics.csv` | build |
| `public/samples/hand-pose/video/hand-pose-NN.mp4` (540x540, full length), `public/samples/clips/hand-pose-NN.mp4` (640x480 loop) | render, `video` tier |
| `public/samples/posters/hand-pose-NN.jpg` (800x600), `public/samples/hand-pose/stills/hand-pose-NN.jpg` (720x720) | render, `video` and `poster` tiers |
| `public/samples/hand-pose/joints/hand-pose-NN.bin` and `.json` | export-joints, `video` tier |
| `public/samples/hand-pose/hero.jpg`, `og.jpg`, `hero-13.mp4`, `hero-13.jpg` | render, sample 13 only |
| `<cache>/slug-map.private.json` (slug to sample folder) | build; never in the repo |
| `<cache>/packs/hand-pose-NN-pack.zip`, `manifest.json` | pack; never in the repo |

`lane` tier samples get no media at all.

## What is drawn

Hue says which hand (left `#56B4E9`, right `#E69F00`; `--check-palette` asserts a CIELAB deltaE76 of at least
40 under Machado 2009 deuteranopia and protanopia). Pattern says how the frame was obtained: solid bones and
filled joints (measured), dashed and hollow rings (guessed), dotted and small rings (bridged), nothing (no 3D
pose). A faint palm polygon, a 30-frame wrist trail and an L / R ring at each wrist; no legend, no other text.

The camera looks along the mean optical axis of the stereo pair, pitched down per sample, one metre from the
hands with the depth clamped, so near-camera perspective cannot stretch the fingers. Focal length and centre are
fitted per sample so everything drawn stays inside the frame on at least 96% of the drawn frames (printed per
sample). Stills of a single frame are framed on that frame. Loops dissolve the last 0.5 s into the first frames
so the last frame flows into the first. All mp4s are libx264 High, yuv420p, 30 fps, GOP 30, `+faststart`,
without audio, container tags, creation time or encoder settings.

## States

One exclusive state per frame and hand (0 none, 1 measured, 2 guessed, 3 bridged; measured wins over guessed
over bridged). The page, CSV, lanes and packs all derive from it. Joints that carry no state flag are treated as
no 3D pose and are never published; their count is logged per sample.

The longest gap is read off the same array (`longestNoPoseFrames`, CSV `*_longest_no_pose_frames`): the longest
run with no 3D pose, so it agrees with the lane drawn beside it. The pipeline's own `longest_gap_frames` differs
from that on most hands, so it is not published unless you ask for it with `--longest-gap gate`
(`longestGapFrames`, `*_longest_gap_frames`).

## Privacy rules the scripts enforce

- SUMMARY.xlsx is read by header name and only the ten columns in `hp_common.SUMMARY_COLS` are kept; every other
  column (place, environment, links, activity, hand size) is never read. The sample folder name is used for
  lookup only.
- `handpose.json` is cut down to a whitelist right after loading. `hands.npz` is opened without pickle and only
  the named arrays are read. The rig calibration file is read only inside the renderer, for a direction.
- Every log line and error names samples by slug (`hand-pose-NN`). The slug map goes outside the repo.
- Pack arrays are an explicit whitelist; the `.rrd` is generated fresh from `joints.npz` with no recording start
  time, no wall-clock timeline, no camera entity and no transform. Zip and npz entries carry no build date.
- The build scans every file it publishes (and the pack script every pack file) for sample folder names and
  tokens, capture and date stamps, segment ids, links, device and business fields.

## Known limits

- The Rerun SDK derives row and chunk ids from the clock, so a `.rrd` still carries the build time inside those
  opaque ids; there is no option to remove it.
- Missed percentages are published as the pipeline reports them; their definition is being confirmed.
