# Sample library — operations runbook

`/samples` is the sales surface and is public. `/samples/s` is the download
vault and needs a passcode. This is how the gated half is operated.

## Issue a passcode

Run migration `019_samples_batch.sql` once, then:

```bash
# One customer, tied to their email, 30 days
pnpm issue:passcode --project samples --batch library --email vip@acme.com --days 30

# A shared code to hand out before a call, capped at 5 redemptions
pnpm issue:passcode --project samples --batch library --label vip-tam --days 30 --uses 5
```

The command prints the code and the page to type it on. Codes are stored as
bcrypt hashes; the plaintext is only ever on that terminal, so copy it before
closing the window.

`--project` defaults to `terminal-bench`, so existing terminal-bench runbooks
are unchanged.

## Stage the downloadable assets

```bash
pnpm samples:stage
```

Builds a preview pack per sample (clip, poster, metadata sidecar, telemetry
track), a metadata sidecar on its own, and one archive of the whole library;
uploads all of it under `gs://$GCS_BUCKET_NAME/samples/library/`; and rewrites
`src/lib/samples/downloads.json` with the real byte sizes.

Re-run it after changing `samples.json` or adding a telemetry track, and commit
the regenerated manifest. `--dry` builds without uploading.

## Stage a full delivery file

Preview packs are staged automatically. The real deliveries — a 486 MB MCAP, a
1.8 GB Robocap segment, a game session — are not, because they should go through
the face-blur pass first and because keeping 25 GB hot serves nobody. The vault
prints these as *on request* until an object exists.

To turn one on:

1. Upload to the path the manifest names, e.g.
   `gs://$GCS_BUCKET_NAME/samples/library/full/robocap-street-segment.zip`
2. Set that path as `full.object` for the slug in `src/lib/samples/downloads.json`
3. Deploy

The download route signs a five-minute V4 URL per click and logs to
`access_events`, so links cannot be forwarded and every fetch is attributable.

## Add a telemetry track for a Robocap sample

The `Shown` row of a record says which offset the preview was cut from. Pull the
two IMU files for that segment and extract the same window:

```bash
rclone copy "drive2nf:Tbrain - Robotics/Raw data/máy 19/20260817_021559_session1/robocap_segment1_imu_left.db"  /tmp/rc19/ --drive-shared-with-me
rclone copy "drive2nf:Tbrain - Robotics/Raw data/máy 19/20260817_021559_session1/robocap_segment1_imu_right.db" /tmp/rc19/ --drive-shared-with-me

node scripts/samples/extract-robocap-telemetry.mjs \
  --slug robocap-street --dir /tmp/rc19 --prefix robocap_segment1 --offset 300
```

Then set `"telemetry": true` for that slug in `samples.json` and re-run
`pnpm samples:stage`.

The offset must match the clip. A track extracted from the wrong window looks
right and reads wrong, which is worse than no track at all.

## Analytics

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the deployment environment. Nothing is
sent until it is set — `GoogleAnalytics` renders null and `track()` no-ops — so
an unset ID fails silently rather than loudly.

Funnel events, in order: `view_samples_hub` → `filter_*` → `play_preview` →
`expand_record` → `scrub_telemetry` → `open_request_access` / `open_passcode` →
`unlock_success` → `download_asset` / `download_full_set`.

Only this marketing app is tagged. The platform app is a separate deployment and
is deliberately untagged.

## Known gaps

- **Off-the-shelf telemetry.** Ten OTS records show their stream list instead of
  a live readout. Their IMU is inside the 486 MB MCAP files, which are not in
  Drive under `Tbrain - Robotics` — `das ego sample/` is empty. Point the
  extractor at wherever those MCAPs live to close this.
- **Mocap and phone video.** Neither line has a folder under
  `Tbrain - Robotics`. `Sample mangement/` holds GoPro, RealSense, Teleop and
  gripper sets, which are a different question.
- **`.rrd` files.** 2.8 GB across seven games, no host decided, so there is no
  "open in Rerun" link yet.
- **Face blur.** Raw Robocap footage has not been through a blur pass. Nothing
  raw should be staged as a `full.object` until it has.
Fixed since the first draft of this runbook: migration 013 used
`ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS`, which is not valid Postgres, so
it aborted on every database that reached it. It now asserts the partial index
005 already creates, and all 27 migrations parse against the real Postgres
grammar.
