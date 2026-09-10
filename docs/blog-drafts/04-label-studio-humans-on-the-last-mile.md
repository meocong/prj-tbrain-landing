# Label Studio + humans on the last mile

**Deck:** Auto-label + hard rules do the heavy lift. Only PARTIAL/FAIL captures reach a human — and they arrive pre-populated in Label Studio, with the reason attached.
**Hero image:** `/images/hitl/annotated_sample.jpg`
**Category:** robotics
**Target read time:** 7 min

## Outline

1. **The wrong way to do HITL** — full-blank annotation queue. Wastes annotator time, catches only what a fresh eye can catch.
2. **Our way** — auto-label + hard-rules gate + AI filter. Every capture that reaches Label Studio is pre-populated with model output plus a reason code for why it needed a human.
3. **Layer 1 · Task-level correction** — kpt drift, mask edges, verb-noun override. Every correction is a labeled diff back into the training loop.
4. **Layer 2 · Reviewer sign-off** — a second annotator reviews the correction. Accept · reject · flag.
5. **Layer 3 · Escalation dashboard** — systemic failures (segmenter locked wrong object across 4 caps in a row) escalate to engineering. Root-cause reports feed the next auto-label training window.
6. **The economics** — auto-label + rules keep human touchpoints below 10% of frames. That's what makes ≤48h delivery + 92% ship rate feasible.

## Pull-quote candidates

- "Humans see the last 8% — not the first 100%."
- "Every correction is a labeled diff. Nothing lands on the floor twice."

## CTA

→ QC playbook `/data/physical-ai/quality` · Auto-label pipeline `/data/physical-ai/auto-label`.
