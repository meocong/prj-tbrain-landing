# Tbrain brand voice

**One line:** engineers who capture and QC robot training data for a living, explaining what they've learned to other engineers and to the people who buy data.

## Sound like
- **Specific and concrete.** Give numbers with sources, name open formats and standards (LeRobot, RLDS, Rerun, SLAM, MANO), and say what actually goes wrong in the field. Don't name our internal tools or vendors.
- **Calm confidence.** State things plainly. Hedge only where evidence is genuinely mixed, and then say what it's mixed between.
- **Practitioner-first.** "Here's what breaks when you capture in a real textile factory" beats "Data is the new oil."
- **Useful.** Every post leaves the reader with something to do or decide: a checklist, a question to ask a vendor, a rule of thumb.
- **Short sentences, active voice.** Paragraphs of 2-4 sentences. Explain jargon on first use.
- **Written for a person.** Read it aloud: if a sentence sounds like a report or a press release, rewrite it the way you'd say it to an engineer over coffee. Take a position, say "we" when Tbrain did something, and admit what we don't know.

## Tbrain facts you can use (public-safe)
Full fact base — service lines, hardware, pipeline, QC, numbers (delivered vs. capacity), case studies, samples catalog, Terminal-Bench, internal links, naming fixes, and the DO-NOT-SAY list — is in **`references/tbrain-knowledge.md`**. Read it before drafting; it's the source of truth, this is just a quick-grab shortlist. The 6 facts you'll reach for most:
- Robotics Data Foundry for physical AI: the Tbrain Capture Pack (MK-001) worn by operators in real production environments, including textile and kitchen, with electronics on the roadmap. Sourced through an industrial partner network across Asia.
- Egocentric, action-paired, deeply annotated data. An auto-label pipeline (hand/body keypoints, masks, descriptions, depth), hard-rule QC gates and human review for the last mile. QC pass-rate floor: 85%. (In posts, keep it at this level: no tool names, model counts or internal traces.)
- Delivered LeRobot / RLDS-ready, with Rerun-viewable proof. Raw to QC'd to delivered in ≤48h.
- Robotics data lines beyond the capture pack: game data with frame-aligned inputs, teleoperated robot data (bimanual / UMI), motion capture for humanoids, hand pose, exocentric multi-view. See `tbrain-samples.md`. Also a secondary LLM-data business (RLHF/SFT, benchmarks, Terminal-Bench).
- The pipeline and QC playbook are at /data/physical-ai and /data/physical-ai/quality. Sample datasets exist but are shared privately with buyers: never link /samples from a post.
- Member of the NVIDIA Inception Program.

If you need a Tbrain fact that isn't in `tbrain-knowledge.md` or on tbrain.ai, **ask chị Tâm** rather than guessing.

## Banned or avoid
- Hype words: revolutionary, game-changer, groundbreaking, cutting-edge, unleash, unlock the power, supercharge, next-level, paradigm shift, seamless, robust (as filler), leverage (as a verb), synergy.
- AI-tell phrases: "In today's fast-paced world", "In the ever-evolving landscape", "It's important to note that", "Let's dive in", "delve", "tapestry", "navigate the complexities", "In conclusion,", "a testament to", "plays a crucial role".
- Empty intros that restate the title, and rhetorical-question openers stacked three deep.
- Overuse of em-dashes and triplets ("faster, cheaper, better") as rhythm filler.
- Bullet-point soup. Use bullets for genuine lists, prose for reasoning.
- Emojis in blog posts. They're fine sparingly in social copy.

## AI tells (the critic fails clusters of these)
From Wikipedia's "Signs of AI writing" and editor experience. One is a slip; several mean rewrite.
- Inflated significance: pivotal, crucial, vital, testament, landscape, realm, "broader implications", "underscores the importance".
- Trailing "-ing" commentary: "…, highlighting the need for…", "…, underscoring…", "…, paving the way for…".
- Vocabulary clusters: delve, intricate, enhance, showcase, foster, harness, bolster, nuanced, multifaceted, "Additionally,", "Moreover,", "Furthermore,".
- "Serves as" / "stands as" / "functions as" where "is" works.
- Negative parallelism: "It's not just X, it's Y", "not X, but Y" (once per post at most).
- Reflexive triplets: three adjectives or three parallel clauses as rhythm.
- Vague attribution: "experts say", "studies show", "industry reports suggest".
- Formula endings: "challenges remain", "the future looks bright", "only time will tell", a closing paragraph that restates the headings.
- Formatting tells: many bold phrases, bullets with bold lead-ins everywhere, title-case headings, em dashes in every paragraph.

Fixes: replace the abstraction with the concrete thing; cut the trailing clause; use "is"; give the source or drop the claim; end on the decision rule.

## Example openers
- Good (pattern only; the facts are illustrative): "Your VLA hits 90% in the lab and 40% on the customer's line, and the shirts are a different color. More teleop hours won't fix that. Scene diversity will, and that's a data-collection decision you make before the first capture."
- Bad: "In today's rapidly evolving world of robotics, data plays a crucial role in unlocking the power of AI."
