# Critic scorecard

Read the draft cold, as a skeptical head of robotics data at a VLA startup with ten minutes and no obligation to finish. Score each item 0, 1 or 2.

**Ship only at ≥ 20/26, with no 0 on items 1, 4, 6 or 10.** Otherwise list the fixes.

| # | Item | 2 = | 0 = |
|---|---|---|---|
| 1 | **One reader, one problem, one takeaway** | You can state each in one sentence after reading. | Unclear who it's for or what to do with it. |
| 2 | **Type fit** | Clearly one type from post-types.md and follows its skeleton. | A paper summary, a listicle, or two types mashed together. |
| 3 | **Opening** | The first 2-3 sentences put the reader in a situation or answer the question, and the thesis is in paragraph 1-2. You want to keep reading. | Opens with background, a generic trend, a definition nobody asked for, or a paper's statistic with no stakes. |
| 4 | **Information gain and depth** | Goes beyond the abstracts: real detail from inside the sources (method, numbers, limitations, figures explained) **plus** something they don't have: a comparison across sources nobody has laid out, an original chart, an approved Tbrain story/fact, the requester's first-hand note, or a decision rule. | A rewrite of abstracts or of our own landing pages; everything could be rebuilt from the linked pages in five minutes. |
| 5 | **Claims backed** | Every number, date and capability links to a primary source; no "studies show" / "experts say". | Unlinked or vague claims. |
| 6 | **Accurate and safe** | Claims match their sources. No `/samples` link, sample-level numbers, internal tools, model counts, traces, customer names or prices (editorial rule 13). | Any misread source, invented number or rule-13 violation. |
| 7 | **Headings are claims** | Each H2 says something ("Raw hours are the cheap half of the price"). | "Background", "Key considerations", "Conclusion", "-ing" headings. |
| 8 | **Prose over bullets** | Reasoning is in paragraphs; lists only for real lists or steps; bold used rarely. | Bullet soup, bold inline headers everywhere. |
| 9 | **Sounds human** | None of the AI tells in brand-voice.md; varied sentence rhythm; a clear stance; admits a limit. | Several AI tells, symmetrical triplets, filler transitions. |
| 10 | **Visuals that carry information** | 3-5 visuals, at least one original `render_chart` chart/diagram built from cited numbers, licensed source figures cropped and credited, at most one library photo. Each sits next to the paragraph it supports with a caption saying what to notice. | Fewer than 2 visuals, decorative or stock-looking photos, more than one library image, a third-party figure without a reusable licence or credit, or a caption that doesn't match the image. |
| 11 | **A peak** | At least one genuinely surprising point around the middle. | Even-toned from start to end. |
| 12 | **Ending** | A memorable one-line takeaway plus a concrete next step. | A recap of the headings, "challenges remain", or "the future is bright". |
| 13 | **Restraint and CTA** | Tbrain shows up only where it adds (see post-types.md "Tbrain's place"), ≤2 internal links besides the CTA, and one specific, low-pressure CTA matched to the topic. A non-buyer would still enjoy the post. | Reads like a product page: pitch paragraphs, "at Tbrain we…" in several sections, links to our pages in every section, or several competing CTAs. |

Also run a **reader pass**: mark every sentence that made you want to keep reading. Name the longest stretch with no marks; that stretch must be cut or rewritten.

SEO is a light check, not a score: the keyword appears naturally in the title or an H2 and in the first 100 words; seo_title ≤ 60 chars and description ≤ 155; 1-3 internal links (CTA included) with descriptive anchors.

Output format:
```
scores: {1: n, 2: n, 3: n, 4: n, 5: n, 6: n, 7: n, 8: n, 9: n, 10: n, 11: n, 12: n, 13: n}
total: n/26
ship: yes|no
dull stretch: "<first words …>" (section)
top fixes:
1. <specific and actionable, quoting the sentence>
2. …
ai tells found: [...]
seo: ok | <what's missing>
```
