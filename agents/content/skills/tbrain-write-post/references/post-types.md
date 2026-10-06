# Post types

> The example openings below show the **pattern** only. Their facts are illustrative: never reuse them in a post.

Every post is exactly one of these eight types. Pick it in the brief, from the question the reader is asking, and follow its skeleton. A post that tries to be two types reads like neither.

Common to all types:
- **One reader, one problem, one takeaway.** Write each down in one sentence before outlining. If you can't, the topic isn't ready.
- **H2s are claims, not labels.** "Raw hours are the cheap half of the price" not "Background" / "Key considerations" / "Conclusion".
- **Information gain.** Each post carries something the reader can't get from the sources you cite: a first-hand story or fact from the approved knowledge base, the requester's `experience` note, or an original analysis (a worked example, a decision rule, a comparison nobody has laid out). No information gain, no post: say so in the outline instead of padding.
- **One peak in the middle.** Somewhere around the 50-70% mark the reader should hit the most surprising point in the post (a counterintuitive result, a failure, a number that changes the decision). Plan it in the outline.
- **Ending.** A short "what to do with this" (a decision rule, the thing to check on Monday), then a single CTA matched to the topic. Never a recap of the headings, never "challenges remain" / "the future is bright".
- **Built from the sources, not from our landing pages.** The substance of a post is what the original references actually contain: their method, their numbers, their figures, their limitations, what they disagree on. Read the paper body (arXiv HTML), the dataset card, the release notes, and 1-3 thoughtful blog posts about it found by web search. Then remix: compare, connect, take a side. Our own site is never a source for the argument.
- **Tbrain's place.** Tbrain appears where our experience genuinely adds something (one section or a few paragraphs at most in `deep_dive`, `synthesis` and `trend_pov`; more in `field_story` and `proof`) and in the CTA. No product paragraph, no "at Tbrain we…" in every section, at most 2 internal links besides the CTA. A reader who never buys from us should still finish the post glad they read it.
- **Visuals from the sources and our own charts**: see `images.md`. At least one original chart or diagram; source figures when licensed; library photos at most one.

---

## 1. `news_hook`: something new came out; what it means, and how we do it

Use when a release, paper, dataset or industry move changes a decision our readers make, **and** Tbrain has hands-on standing on it. Not for "X raised money" or recaps.

Skeleton:
1. **What happened** in two sentences, with the primary link and date.
2. **Why it matters to you**: the decision it changes for a robotics team or data buyer. This is the thesis.
3. **What the announcement doesn't tell you**: the part we know from doing this work (capture, QC, delivery). This is the information gain and the longest section.
4. **What to do now**: concrete next step or the 3-5 questions to ask.
5. CTA.

Opening pattern: the news and its consequence in the first paragraph. "On 17 September, HIL-UMI showed human-in-the-loop post-training without a robot in the loop. If you were budgeting a teleop cell for post-training next quarter, that line item just became negotiable."

CTA: "Want to sanity-check a spec against this? Talk to us." → /contact

Reference examples: Roboflow, "GPT-6 Astra Is the Best Vision Model We Have Tested" (tested within days of release); Snorkel, "Terminal-Bench 4.0: Why Continuous Benchmarks Require Continuous QA".

## 2. `field_story`: a real problem we hit, and how we solved it

Use when the knowledge base (`kind: story`) or the requester's `experience` gives a real situation from our capture, labeling, QC or delivery work. This is the type readers trust most. Prefer it whenever a story exists.

Skeleton:
1. **The scene**: a concrete moment. What we were capturing, what went wrong, what it would have cost. 2-4 sentences, specific.
2. **Why the obvious fix doesn't work**: what most teams would do and why it fails.
3. **What we tried**: including what didn't work. Honest dead ends are the most credible part.
4. **What worked, and the result**: in the terms the story allows (no numbers the knowledge item doesn't give).
5. **The rule you can take away**: how the reader applies it to their own data or vendor.
6. CTA.

Opening pattern: start in the scene. "The first week of capture in a garment factory, a third of our hand tracks were useless, and it wasn't the model's fault. The workers' hands sat at the very edge of a fisheye lens."

CTA: "See how our QC pipeline works" → /data/physical-ai/quality, or /contact.

Reference examples: PostHog engineering posts (hook → context → journey → resolution); Surge, "We Trained a Model on Office Work. It Also Got Better at Coding."

## 3. `deep_dive`: one source, taken apart

Use when one paper, dataset, model release or technical report matters enough to understand properly, and the write-ups so far only repeat the abstract. The reader gets the thing explained better than the original, plus what it means for their data.

Skeleton:
1. **The one-sentence verdict** and why the reader should care, with the primary link and date.
2. **How it works**: the method or pipeline in plain words, with the source's own figure (if licensed) or our redrawn `flow` diagram. Explain the figure in the text.
3. **The numbers that matter**: 2-3 results, charted with `render_chart` when there's a comparison. Say what they're compared against.
4. **What the paper doesn't say**: limitations, what's missing from the data, what would break in production. Our field experience belongs here, if it's real.
5. **What it means for your data decision** (and the CTA).

Opening pattern: the finding that surprised you, then why it matters. "EgoDex has 829 hours of video and not a single robot in it. It's also the most useful manipulation dataset Apple has released."

Reference style: Lilian Weng and Sebastian Raschka on single papers; Hugging Face LeRobot release posts.

## 4. `synthesis`: several sources, one question

Use when 3-6 papers, datasets or releases answer the same question differently ("how much human video replaces teleop?", "what's in the big open robot datasets?"). The reader gets the map: who found what, where they agree, where they don't, and our read.

Skeleton:
1. **The question** and the short answer, in the first paragraph.
2. **The landscape**: a comparison (one `bar` chart, a `quadrant`, or the post's one table) of the sources on the dimensions that matter.
3. **2-3 H2s, each a pattern across sources** ("Every dataset that transfers well shares one thing: …"), not one H2 per paper.
4. **Where they disagree, and why** (different embodiments, metrics, scale).
5. **Our read and what to do**, then the CTA.

Opening pattern: the question as the reader would ask it, then the answer. "Can you train a robot on people? Five datasets released since 2024 say yes, with a catch none of them puts in the abstract."

Never write one section per paper. Group by idea.

Reference style: Lilian Weng's surveys, Chip Huyen's long posts, Nathan Lambert's state-of-the-field posts.

## 5. `by_the_numbers`: our own analysis of public data

Use when a question can be answered by counting something public, and nobody has counted it: "What's actually on the Hugging Face Hub for robot learning?", "How long is a typical teleop episode?", "Which robots do open datasets use?", "Is egocentric robotics research growing?". This is the strongest information gain we can make without a customer: the numbers exist only because we computed them.

Tools: `mcp_tbrain_cms_hf_hub_query` (datasets by tag/search with licence, author, month aggregates; `lerobot_info:true` adds robot type, fps, episodes, hours and cameras per dataset, with totals and medians) and `mcp_tbrain_cms_arxiv_count` (papers per year for a query). Run 2-4 queries; keep each result's `query` and `accessed_at`.

Skeleton:
1. **The headline number** in sentence one, then a `stat` card with 3-4 numbers right after the opening.
2. **3-4 findings, each an H2 claim with its own chart** in different forms (share for licences, bar for robot types, scatter for size vs downloads, line for growth).
3. **The surprise**: the number that contradicts what people assume.
4. **What the numbers can't tell you**: sampling limits (top-N by downloads, only datasets with meta/info.json, tags are self-reported), what you'd need to know more.
5. **What it means for someone buying or building a dataset.**
6. **How we counted**: a short final section with each query, the date, n, and what was excluded. Readers trust numbers they could reproduce.
7. CTA.

Rules: never extrapolate beyond the sample ("of the 40 most-downloaded LeRobot datasets", not "most robot datasets"); round honestly; say when a field was missing. Record `agent_meta.analysis: {queries:[…], n, accessed_at, notes}`.

Opening pattern: the number and why it's odd. "The 40 most-downloaded robot-learning datasets on Hugging Face add up to about 7,900 hours. Half of them are shorter than a working week."

## 6. `trend_pov`: where the field is going, and our position

Use when several signals point the same way (papers, releases, funding, buyer questions) and we have a clear, defensible opinion about the next 1-3 years. Take a side and make it checkable: a prediction someone could prove wrong by a date.

Skeleton:
1. **The claim** in paragraph one, stated plainly. "Teleoperation isn't going away; undefended teleoperation is."
2. **3-4 H2s, each a claim with its evidence**: the signals (papers, releases, numbers, a `timeline` or `line` chart of how we got here), plus what we see in the field.
3. **The prediction**: what you expect to see by when, and what would change your mind.
4. **The strongest counterargument**, stated fairly, and why we still hold the position (or where it's right).
5. **What this means for your next data decision.**
6. CTA.

Opening pattern: the claim, then the tension. Avoid generic trend openers ("Robotics is entering a phase of rapid change…").

CTA: a related deeper post or /contact.

Reference examples: Eric Jang's and Nathan Lambert's essays; Skild, "The Hidden Pillar of Robotics"; Scale, "In an agentic world where automation gets cheap, which work is worth routing to a human?"

## 7. `buyer_guide`: explain a topic so a buyer can decide

Use for evergreen questions buyers search for and ask us on calls: "what is teleoperation data", "how to evaluate a hand-pose dataset", "LeRobot vs RLDS". This is the search-traffic type. It must still have a point of view.

Skeleton:
1. **The answer in the first two sentences** (definition plus why it matters for their model).
2. **How it's produced**: what good looks like, briefly, with one image of real data.
3. **Where it goes wrong**: the 3-5 failure modes buyers don't see until training. The core section.
4. **How to evaluate it**: a checklist or decision table (the one table in the post).
5. **Short FAQ** (3-4 questions, 1-3 sentences each), only if real questions exist.
6. CTA.

Opening pattern: answer-first. "Teleoperation data is a robot's own record of a task: joint positions, camera views and actions captured while a person drives the robot. It's the most expensive robotics data per hour, and the hardest to replace."

CTA: "Send us your spec and we'll mark what's missing" → /contact.

Reference examples: Encord, "What Is Teleoperation Data Collection, and Why Do Robots Need It?"; Kognic's guides (Key Takeaways box, comparison table, "Choose X if…").

## 8. `proof`: numbers we're allowed to publish, and what they show

Use only when an approved knowledge item (`kind: fact` or `doc`) gives publishable results (a pilot outcome, an error analysis, a QC study). Never invent or extrapolate numbers. Never use sample-level numbers (editorial rule 13).

Skeleton:
1. **Headline result** in the first sentence, then a 3-bullet TL;DR.
2. **The baseline and why it fell short.**
3. **What we changed** (data, labeling, QC).
4. **Results**, one image or table per claim.
5. **Limits**: what this doesn't show.
6. **What to do with it.**
7. CTA.

Reference examples: Surge, "Hill-Climbing a SWE Agent: What 1,700 Coding Tasks Taught Kimi K2.7"; Toloka, "HomER v2".

---

## Format devices (pick 1-2 per post)

A post is more memorable when it has one structural device on top of its type. Pick one in the brief and plan it in the outline; don't stack more than two.
- **Myth vs reality**: 3-5 beliefs the reader holds, each answered with evidence. Good for `synthesis` and `buyer_guide`.
- **Annotated walkthrough**: go through one figure or video step by step ("At 0:12 the gripper…", "Panel b shows…"). Good for `deep_dive`.
- **"What would change our mind"**: the specific results that would make us drop the position. Good for `trend_pov`.
- **The decision table**: options as rows, the decision's criteria as columns, a verdict per row. Good for `synthesis`, `buyer_guide`.
- **Three questions to ask your vendor / your team**, each with what a good and a bad answer sound like.
- **Back-of-envelope**: one worked calculation with real inputs ("at 15 fps and 14 s per episode, 100 hours is ~25,000 episodes"), shown step by step.
- **Before / after**: the same task, sample or number under two approaches, side by side.
- **Glossary box**: 3-5 terms the reader may half-know, defined in one line each, in a blockquote. Only for `buyer_guide` and `deep_dive`.

## Openings that work

- **A scene** the reader recognizes: a decision, a budget, a failed run.
- **Answer first**: the thesis or definition in sentence one.
- **A paradox with a number**: "trained on no code, got better at code".
- **The news and its consequence**, in one paragraph.

Don't open with: the history of the field, a generic trend sentence, a definition nobody asked for, a list of papers, or "In today's…".

## Endings that work

- A one-line maxim the reader remembers ("Buy the pipeline, not the hours"), then:
- **one** specific next step tied to the post, then the CTA. The site adds a standard contact block under every post, so the CTA in the text should be specific to this topic, not generic.

## Topic mix (scout and planning)

Over a month, aim for roughly: 30% source-driven (`deep_dive`, `synthesis`), 15% `by_the_numbers`, 20% `trend_pov`, 15% `field_story` / `proof`, 15% `buyer_guide`, 5% `news_hook`. Never two posts in a row of the same type or the same data line, never the same lead visual form twice in a row (check `list_posts status=all`: each post lists its `post_type` and `visuals`), and never a week where every post is about our own work.
