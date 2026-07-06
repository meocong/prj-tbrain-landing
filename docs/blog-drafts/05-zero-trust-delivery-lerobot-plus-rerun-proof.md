# Zero-trust delivery · LeRobot v2 + Rerun proof

**Deck:** Every episode ships as LeRobot v2 parquet + a Rerun `.rrd`. No screenshots, no cherry-picked metrics — the buyer opens the scene themselves.
**Hero image:** LeRobot schema preview from `/data/physical-ai` (or `/videos/deliverables/aloha-4cam.mp4`)
**Category:** robotics
**Target read time:** 6 min

## Outline

1. **The delivery contract** — LeRobot v2 parquet + video + a `.rrd`. RLDS on request. No proprietary schema.
2. **What LeRobot v2 looks like** — schema preview (already lives in `LEROBOT_EXPORT.snippet`). Episode + frame counts + feature dict.
3. **The `.rrd` file** — one paragraph on why a Rerun scene beats a screenshot. Every claim we make in the sales pitch is scrubbable from the same viewer.
4. **What ships in a scene** — 8 tracks: camera/rgb, camera/depth, hand/left+right (21-kpt), body (308-kpt dense), object/mask + track_id, object/pose 6-DoF, camera/trajectory SLAM.
5. **What "zero-trust" means** — buyer can diff any claim against the raw data. No hidden state. Every field ships with the model + version + git SHA that produced it.
6. **What you plug it into** — LeRobot training loop, RLDS pipeline, or your own schema. We ship the source of truth; you decide the flavor.

## Pull-quote candidates

- "Every episode is a scene. Any claim is scrubbable."
- "We ship the source of truth. You choose the flavor."

## CTA

→ Request a sample dataset `/contact` · Auto-label pipeline `/data/physical-ai/auto-label`.
