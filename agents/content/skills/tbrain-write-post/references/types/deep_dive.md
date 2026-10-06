> Example openings show the pattern only; their facts are illustrative.

# `deep_dive`: one source, taken apart

Use when one paper, dataset, model release or technical report matters enough to understand properly, and the write-ups so far only repeat the abstract. The reader gets the thing explained better than the original, plus what it means for their data.

Skeleton:
1. **The one-sentence verdict** and why the reader should care, with the primary link and date.
2. **How it works**: the method or pipeline in plain words, with the source's own figure (if licensed) or our redrawn `flow` diagram. Explain the figure in the text.
3. **The numbers that matter**: 2-3 results, charted with `render_chart` when there's a comparison. Say what they're compared against.
4. **What the paper doesn't say**: limitations, what's missing from the data, what would break in production. Our field experience belongs here, if it's real.
5. **What it means for your data decision** (and the CTA).

Opening pattern: the finding that surprised you, then why it matters. "EgoDex has 829 hours of video and not a single robot in it. It's also the most useful manipulation dataset Apple has released."

Reference style: Lilian Weng and Sebastian Raschka on single papers; Hugging Face LeRobot release posts.

Common rules for every type (reader, information gain, peak, ending, Tbrain's place, visuals): `post-types.md`.
