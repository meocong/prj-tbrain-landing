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

## The eight types

Read only the file for the type you picked: `references/types/<type>.md` has its skeleton, opening pattern, CTA and reference examples.

| Type | Use when |
|---|---|
| `news_hook` | when a release, paper, dataset or industry move changes a decision our readers make, **and** Tbrain has hands-on standing on it. |
| `field_story` | when the knowledge base (`kind: story`) or the requester's `experience` gives a real situation from our capture, labeling, QC or delivery work. |
| `deep_dive` | when one paper, dataset, model release or technical report matters enough to understand properly, and the write-ups so far only repeat the abstract. |
| `synthesis` | when 3-6 papers, datasets or releases answer the same question differently ("how much human video replaces teleop?", "what's in the big open robot datasets?"). |
| `by_the_numbers` | when a question can be answered by counting something public, and nobody has counted it: "What's actually on the Hugging Face Hub for robot learning?", "How long is a typical teleop episode?", "Which robots do open datasets use?", "Is egocentric robotics research growing?". |
| `trend_pov` | when several signals point the same way (papers, releases, funding, buyer questions) and we have a clear, defensible opinion about the next 1-3 years. |
| `buyer_guide` | for evergreen questions buyers search for and ask us on calls: "what is teleoperation data", "how to evaluate a hand-pose dataset", "LeRobot vs RLDS". |
| `proof` | only when an approved knowledge item (`kind: fact` or `doc`) gives publishable results (a pilot outcome, an error analysis, a QC study). |

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
