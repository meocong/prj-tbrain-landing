# Anatomy of a Physical AI capture pack

**Deck:** What we carry into a factory to record a training-grade episode — the enclosure, the sensors, the hardware clock, and why "offline-first" is non-negotiable.
**Hero image:** `/images/pack/*.jpg` (existing) or Pack schematic SVG
**Category:** robotics
**Target read time:** 6 min

## Outline

1. **Why the pack matters** — teleop and web video are the two obvious data sources, and both hit walls (paragraph explains the wall).
2. **The rig** — component-by-component walk of MK-001 REV A (BOM already lives in `COLLECTION_PACK.bom`). RealSense D455, GoPro head-mount, Raspberry Pi 5, NVMe SSD, power bank, 3D-printed belt.
3. **The hardware clock** — one paragraph on why software timestamps drift and why we sync at the ISR level. This is where SLAM math either works or blows up.
4. **Offline-first** — 8–10h capture shifts, unreliable factory Wi-Fi, 5-minute background upload. Why "always online" would kill our field ops.
5. **From pack to pipeline** — one paragraph teasing the auto-label pipeline (link to `/data/physical-ai/auto-label`).

## Pull-quote candidates

- "Software timestamps drift by 40ms an hour. On a fast fold, that's four frames of lie."
- "We don't ship packs — we ship packs plus the pipeline they run."

## CTA

Link block at end: → See a sample dataset (`/contact`) · See the auto-label pipeline (`/data/physical-ai/auto-label`).
