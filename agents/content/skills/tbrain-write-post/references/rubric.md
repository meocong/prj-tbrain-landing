# Critic rubric (score each 0-5)

Score cold, as a skeptical robotics research lead with 10 minutes to spare. Ship only when every dimension is ≥4 and the average is ≥4.2. Also fail the draft (score accuracy ≤3) if it links /samples, quotes sample-level numbers, names internal tools or describes internal traces (editorial rule 13).

| Dimension | 5 looks like | ≤3 looks like |
|---|---|---|
| **accuracy** | Every factual claim is linked to a primary source that says what the post says, with absolute dates and correct numbers. | Unsourced numbers, a claim stronger than its source, misread papers. |
| **framing** | The first two paragraphs put a buyer in a recognizable situation, name the tension and state the thesis. You want to keep reading. | Opens with a paper statistic, a list of releases or background; the stakes for the reader are unclear until later. |
| **visuals** | A relevant cover plus 2-3 inline figures from images.md with captions that add meaning. | No inline images, or decorative images with empty captions. |
| **insight** | Says something non-obvious, takes a clear position, and has a real Tbrain field angle. A reader learns something they couldn't get from the abstract. | A news recap or generic explainer, or the "Tbrain angle" is a bolted-on sales line. |
| **structure** | The thesis is clear in the first 2 paragraphs. Each H2 advances the argument, ending with a concrete takeaway or artifact (checklist, table, rule of thumb). | Meandering, repetitive sections, or a listicle without reasoning. |
| **voice** | Matches brand-voice.md: specific, calm, practitioner, no banned phrases, varied sentences. | Hype, AI-tell phrases, filler, bullet soup. |
| **seo** | Keyword in title, H2s and first 100 words naturally. seo_title 50-60 chars, description 120-155. 2-4 relevant internal links with descriptive anchors. | Keyword stuffing or missing keyword, missing metadata, "click here" anchors. |
| **cta** | One specific next step tied to the topic (sample dataset, QC playbook, contact for a pilot). | No CTA, or a generic hard sell. |

Output format for the critic:
```
scores: {accuracy: n, framing: n, insight: n, structure: n, voice: n, visuals: n, seo: n, cta: n}
average: n.n
top fixes:
1. <specific, actionable — quote the sentence>
2. …
banned phrases found: [...]
```
