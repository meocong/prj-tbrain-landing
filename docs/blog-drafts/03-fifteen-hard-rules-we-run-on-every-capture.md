# 15 hard rules we run on every capture (and the failures they catch)

**Deck:** Every capture crosses a 15-check machine-readable gate before a human ever sees it. Here's what each rule is watching for — and a real capture where it fired.
**Hero image:** Screenshot of hard-rules badge grid from `/data/physical-ai/quality`
**Category:** robotics
**Target read time:** 10 min

## Outline

1. **Why hard rules first** — the cheapest reviewer is a Python assertion. Save the humans for judgment calls.
2. **The 15** — full walk-through. For each rule (from `HARD_RULES` in `physical-ai-qc.ts`):
   - Category badge · Rule label
   - What it's watching · What "OK" looks like (real sample from `summary.json`)
   - Failure it catches · Real example (if we have a `FAIL` cap on disk)
3. **Category taxonomy** — calibration · detection · temporal · spatial · semantic · provenance. Why these six.
4. **What we ship when it fires** — the routing: FAIL → Label Studio task or engineering escalation. Never silent.
5. **The one that pays for itself** — story of `K_consistency` catching a per-cap SLAM divergence on `iron_T01` before it corrupted downstream 3D kpts.

## Pull-quote candidates

- "The cheapest reviewer is an assertion. Save the humans for judgment."
- "Rules don't lie. Every fail is a labeled diff back into the training loop."

## CTA

→ QC playbook `/data/physical-ai/quality` · Ask for a sample QC report `/contact`.
