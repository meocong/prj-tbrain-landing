# 8 models, one auto-label pipeline

**Deck:** From a raw rgb.mp4 to a schema_v3 labels.json in ≤48h. Which model runs where, what each one emits, and how they combine into a single provenance-traced artifact.
**Hero image:** `/images/descriptions/pick_up_the_cup.jpg` (real Qwen composite)
**Category:** robotics
**Target read time:** 9 min

## Outline

1. **The eight** — quick list: hand tracker (MANO), body dense (Sapiens), object segmenter, object 6-DoF pose, monocular depth, camera SLAM, verb-noun VLM, ontology resolver. Anonymized model names — no HF handles, no vendor brands.
2. **Description first** — why we run the VLM segmenter early. Emits verb-noun action_segments with confidence + noun_id from a canonical 200-entry industrial ontology. Show `/images/descriptions/*.jpg`.
3. **Kpts second** — 21-kpt hand + 308-kpt body + camera trajectory land as three parallel passes. Sapiens body overlays (`/images/body-kpts/*.jpg`) demonstrate.
4. **Masks + depth + pose** — text-prompted video segmenter → mask + tracklet ID → depth+pose. `/videos/masks/*.webm` clips inline.
5. **The rerun scene** — every stage writes to the same .rrd. That's how our engineers debug, and it's what ships with every episode.
6. **Provenance** — the models field in labels.json. Every field records the model + version + git SHA that produced it. Read `PROVENANCE_LOG` on the QC page.

## Pull-quote candidates

- "Eight passes, one artifact, one contract."
- "Every field records the model that produced it — so every claim is diffable."

## CTA

→ Deep-dive `/data/physical-ai/auto-label` · Sample QC report `/contact`.
