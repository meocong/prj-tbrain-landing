# Writing exemplars

Real posts that build from the substance of their sources — method, numbers, figures, limits — not from a landing page, and carry a point of view. Use this when drafting `deep_dive`, `synthesis` or `trend_pov`, and for opening/ending/visual technique on any type.

## 1. Three ways to build a post from sources

### Synthesis — several sources, one question
Use when: 3-6 papers, datasets or releases answer the same question differently, and nobody has laid out the comparison.

Recipe: (1) state the question as the reader would ask it; (2) pull the one fact each source contributes; (3) group by **idea**, never by paper — one H2 per paper is a bibliography; (4) chart the landscape with one `bar` or `quadrant`; (5) say where sources agree, where they clash and why, then your read.

Reader gets: the map, not six summaries they'd have made themselves.

- Lilian Weng, ["LLM Powered Autonomous Agents"](https://lilianweng.github.io/posts/2023-06-23-agent/) — copy how ~20 papers become three components (planning, memory, tool use) instead of twenty sections.
- Eugene Yan, ["Patterns for Building LLM-based Systems & Products"](https://eugeneyan.com/writing/llm-patterns/) — copy the "how to apply" line under every pattern: each synthesized idea ends in an action, not just a summary.

### Deep dive — one source, taken apart
Use when: one paper, model or release matters enough that existing write-ups just restate the abstract.

Recipe: (1) read the method and limitations, not just the abstract; (2) open with the one-sentence verdict, not a recap of what the thing is; (3) explain the method next to its own figure (if licensed) or a redrawn `flow` diagram, explained in the text; (4) chart the 2-3 numbers that matter against what they're compared to; (5) add what the source doesn't say, then what it means for the reader's decision.

Reader gets: the source explained better than the original, plus the catch nobody else points out.

- Chip Huyen, ["RLHF: Reinforcement Learning from Human Feedback"](https://huyenchip.com/2023/05/02/rlhf.html) — copy how she assumes zero prior knowledge and builds her own 3-phase diagram before quoting a single paper number.
- Hugging Face, ["π0 and π0-FAST: Vision-Language-Action Models for General Robot Control"](https://huggingface.co/blog/pi0) — copy the order: verdict first ("we've ported the first robotics foundation models…"), then the architecture figure, then benchmark numbers, then a runnable command.

### Trend/future essay — where the field is going
Use when: several signals point the same way and you have a position worth defending, checkable by a date.

Recipe: (1) state the claim in sentence one, no throat-clearing; (2) back it with 3-4 pieces of evidence — papers, releases, a `timeline`/`line` chart, field experience; (3) make a falsifiable prediction: what, by when; (4) state the strongest counterargument fairly, then why you still hold the position; (5) end on what this changes for the reader's next decision.

Reader gets: a position to agree or argue with, not "the future of robotics is bright."

- Eric Jang, ["Robots Must Be Ephemeralized"](https://blog.evjang.com/2021/09/ephemeralization.html) — copy the move of admitting his own prior belief (anti-simulation) was wrong before making the new argument.
- Nathan Lambert, ["An Unexpected RL Renaissance"](https://www.interconnects.ai/p/an-unexpected-rl-renaissance) — copy the opening: the claim stated as a plain description of the era, no hedge, before any evidence follows.

## 2. Using source figures

The licensing reality: arXiv's help page says the overwhelming majority of papers carry "the arXiv perpetual non-exclusive license, which does not grant further reuse permissions directly" — it lets arXiv host the paper, not you reuse its figures ([info.arxiv.org/help/license/reuse.html](https://info.arxiv.org/help/license/reuse.html); [info.arxiv.org/help/license](https://info.arxiv.org/help/license)). Reuse only works when the *author* chose a permissive license for that specific paper (a CC logo on the abstract page) — check every paper individually. **CC BY 4.0** requires you "give appropriate credit, provide a link to the license, and indicate if changes were made" ([creativecommons.org/licenses/by/4.0](https://creativecommons.org/licenses/by/4.0/)); **CC BY-SA** adds that your derivative must carry the same license; **CC0** waives attribution legally but crediting is still good practice. Company blog posts, news sites and marketing images are copyrighted by default unless stated otherwise.

Weng and Raschka reproduce paper figures constantly (12-17 per post) as scholarly commentary, crediting lightly — "(Image source: Yao et al. 2023)" — without stating a license, a norm their field tolerates but a company blog shouldn't rely on. Hugging Face's π0 post reproduces exactly two figures, each cropped to the point discussed and explained in the surrounding text.

For a company blog, state the license explicitly: `Figure: Khazatsky et al., 2024 (DROID), CC BY 4.0.` Place it beside the paragraph it illustrates, crop to the panel you're actually explaining (a five-panel figure where you discuss one panel is noise), and never alter the content. When the license isn't reusable — arXiv's default, NC/ND terms, any blog or marketing image — redraw the *numbers* as your own chart instead, credited `Data: Hoque et al., 2025 (EgoDex)`: facts aren't copyrighted, the drawing is. Jay Alammar does this for a different reason in ["The Illustrated Transformer"](https://jalammar.github.io/illustrated-transformer/): he never reproduces the paper's diagram, he draws ~25-30 of his own, because his own diagram teaches the concept better.

## 3. Original visuals that carry the argument

Match the paragraph's claim to a chart form, not the reverse:

- **Bar** (ranking, "X is 5× bigger than Y"): Eugene Yan's retrieval-vs-no-retrieval accuracy comparison (65.2% vs 42.9%) is exactly this shape — one highlighted bar, the gap is the point.
- **Line** (grew or fell over time): DeepSeek-R1-distilled model scores across sizes, a comparison Sebastian Raschka reproduces as a static table — as a line, the trend reads in one glance.
- **Timeline** (how we got here, releases in order): Nathan Lambert's "state of post-training" essays carry an implicit timeline (SFT → RLHF → preference-tuning → RL-finetuning); drawn with the turning point highlighted, it would carry half the essay.
- **Quadrant** (a trade-off, positioning options): Eugene Yan's own 2×2 of LLM patterns ("data-to-user" × "defensive-to-offensive") is his own synthesis, not borrowed from a paper.
- **Flow** (a pipeline, where it breaks): Chip Huyen's three-phase RLHF diagram and Lilian Weng's agent diagram (planning / memory / tool use) both replace a paragraph of prose with a picture.
- **Table-as-figure** (a decision): a `buyer_guide` comparison table ("choose X if…") does the same job as a quadrant for a reader who just wants the answer.

One idea per chart; two charts saying the same thing means cut one. Vary the form across a post — three bar charts in a row reads like a slide deck.

## 4. Openings and endings that worked

**Openings**
1. "Building agents with LLM (large language model) as its core controller is a cool concept. Several proof-of-concepts demos, such as AutoGPT, GPT-Engineer and BabyAGI, serve as inspiring examples." — Lilian Weng, [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/). *Technique:* a plain claim, then named concrete examples in sentence two — no definition first.
2. "Sometimes, you need to raise a round for your robotics startup and the training run just didn't go so well. Or maybe the CoRL deadline is a week away and the results just aren't there." — Chris Paxton, [How to Fake A Robotics Result](https://itcanthink.substack.com/p/how-to-fake-a-robotics-result). *Technique:* a scene the reader recognizes, told with dry irony, before any thesis.
3. "We have ported the first robotics foundation models to Hugging Face LeRobot! Both π0 and π0-FAST, developed by Physical Intelligence, are now available in the LeRobot repository." — Hugging Face, [π0 and π0-FAST](https://huggingface.co/blog/pi0). *Technique:* the news as a direct accomplishment ("we"), primary source credited in sentence one.

**Endings**
4. "We're still so early on the journey… Are there any other key patterns or resources? … I'd love to hear your experience." — Eugene Yan, [LLM Patterns](https://eugeneyan.com/writing/llm-patterns/). *Technique:* ends on a direct question instead of a recap.
5. "I hope that this post helped you understand better how LLMs are trained under the hood, which can hopefully help you with choosing the best LLM for your need!" — Chip Huyen, [RLHF](https://huyenchip.com/2023/05/02/rlhf.html). *Technique:* ties the whole piece back to the reader's practical decision.
6. "In the end, robotics benchmarking will be solved by having lots and lots of robots, and models that actually work across most of them." — Chris Paxton, [How to Fake A Robotics Result](https://itcanthink.substack.com/p/how-to-fake-a-robotics-result). *Technique:* a one-line maxim that reframes a satirical piece as a real argument.

## 5. What makes it not boring

1. **Open in the pressure the reader already feels, not a definition.** Paxton: "raise a round… training run didn't go so well."
2. **State a claim in sentence one that could turn out wrong.** Lambert: "the era we are living through… is one characterized by complete faith that reasoning and RL will work" — a position, not a hedge.
3. **Name the real number, not a magnitude word.** Jang cites the $12M GPT-3 training cost and a 5,000-trial requirement instead of "very expensive."
4. **Admit your own prior belief was wrong, then argue the new one.** Jang reverses his own anti-simulation stance in "Robots Must Be Ephemeralized" before making his case.
5. **Group synthesis by idea, never one section per source.** Weng's agent post is three components, not twenty paper summaries.
6. **End on a question or a falsifiable prediction, not a recap.** Yan: "Are there any other key patterns?" Lambert: "I'll cover more… soon."
7. **Show the dead end honestly.** The most credible section in a deep dive is "what we tried that didn't work."
8. **One visual per idea, explained, never decorative.** HF's π0 post uses two figures total, each discussed in the text around it.
9. **Use one piece of dry humor, not a running bit.** Huyen's single credited "Shoggoth with a smiley face" meme, used once.
10. **Close on a maxim the reader could repeat to someone else.** Paxton: "robotics benchmarking will be solved by having lots and lots of robots."

## 6. Anti-patterns (what our drafts did, and the fix)

- **Paper-by-paper summaries** ("Paper A found X. Paper B found Y.") read like a bibliography. Fix: group by idea — `synthesis` is "2-3 H2s, each a pattern across sources," never one H2 per paper (`post-types.md`).
- **Company-pitch paragraphs** in every section ("At Tbrain, we believe…"). Fix: Tbrain appears only where experience adds something real — one section or a few paragraphs at most in `deep_dive`/`synthesis`/`trend_pov`, plus the CTA. A reader who never buys from us should still finish glad they read it.
- **Stock/marketing photos as decoration.** Fix: licensed source figures first, one original `render_chart` chart/diagram minimum, a library photo at most one and only beside a paragraph about our own capture work matching its description. Decoration is worse than none.
- **Every section ending with a product link.** Fix: at most 2 internal links besides the CTA, one soft in-text CTA only where it matches the reader's pain, one specific CTA at the end — never a funnel.
- **Restructuring an abstract into a post.** Fix: even a `deep_dive` goes inside the source (method, numbers, limitations, figures explained) and places it against 2+ other sources; nothing a reader could get from the abstract in two minutes counts as content.
