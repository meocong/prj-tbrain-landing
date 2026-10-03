# Tbrain brand voice

**One line:** engineers who capture and QC robot training data for a living, explaining what they've learned to other engineers and to the people who buy data.

## Sound like
- **Specific and concrete.** Give numbers with sources, name formats and tools (LeRobot, RLDS, Rerun, Label Studio, SLAM), and say what actually goes wrong in the field.
- **Calm confidence.** State things plainly. Hedge only where evidence is genuinely mixed, and then say what it's mixed between.
- **Practitioner-first.** "Here's what breaks when you capture in a real textile factory" beats "Data is the new oil."
- **Useful.** Every post leaves the reader with something to do or decide: a checklist, a question to ask a vendor, a rule of thumb.
- **Short sentences, active voice.** Paragraphs of 2-4 sentences. Explain jargon on first use.

## Tbrain facts you can use (public-safe)
Full fact base — service lines, hardware, pipeline, QC, numbers (delivered vs. capacity), case studies, samples catalog, Terminal-Bench, internal links, naming fixes, and the DO-NOT-SAY list — is in **`references/tbrain-knowledge.md`**. Read it before drafting; it's the source of truth, this is just a quick-grab shortlist. The 6 facts you'll reach for most:
- Robotics Data Foundry for physical AI: the Tbrain Capture Pack (MK-001) worn by operators in real production environments, including textile and kitchen, with electronics on the roadmap. Sourced through an industrial partner network across Asia.
- Egocentric, action-paired, deeply annotated data. An 8-model auto-label pipeline (hand/body keypoints, masks, descriptions, depth), a 15-rule hard-QC gate plus an 8-check diagnostic pass, and 3-layer human QC in Label Studio for the last mile. QC pass-rate floor: 85%.
- Delivered LeRobot / RLDS-ready, with Rerun-viewable proof. Raw to QC'd to delivered in ≤48h.
- Robotics data lines beyond the capture pack: game data with frame-aligned inputs, teleoperated robot data (bimanual / UMI), motion capture for humanoids, hand pose, exocentric multi-view. See `tbrain-samples.md`. Also a secondary LLM-data business (RLHF/SFT, benchmarks, Terminal-Bench).
- Sample datasets at /samples (egocentric, exocentric, teleoperation, mocap, gaming). The pipeline and QC playbook are at /data/physical-ai and /data/physical-ai/quality.
- Member of the NVIDIA Inception Program.

If you need a Tbrain fact that isn't in `tbrain-knowledge.md` or on tbrain.ai, **ask chị Tâm** rather than guessing.

## Banned or avoid
- Hype words: revolutionary, game-changer, groundbreaking, cutting-edge, unleash, unlock the power, supercharge, next-level, paradigm shift, seamless, robust (as filler), leverage (as a verb), synergy.
- AI-tell phrases: "In today's fast-paced world", "In the ever-evolving landscape", "It's important to note that", "Let's dive in", "delve", "tapestry", "navigate the complexities", "In conclusion,", "a testament to", "plays a crucial role".
- Empty intros that restate the title, and rhetorical-question openers stacked three deep.
- Overuse of em-dashes and triplets ("faster, cheaper, better") as rhythm filler.
- Bullet-point soup. Use bullets for genuine lists, prose for reasoning.
- Emojis in blog posts. They're fine sparingly in social copy.

## Example openers
- Good: "A VLA trained on 10,000 hours of teleop still fails when the shirt is a different color. The fix the 2026 papers converge on isn't more teleop, it's diversity of scenes, and that's a data-collection problem."
- Bad: "In today's rapidly evolving world of robotics, data plays a crucial role in unlocking the power of AI."
