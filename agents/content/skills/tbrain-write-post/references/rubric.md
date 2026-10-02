# Critic rubric (score each 0-5)

Score cold, as a skeptical robotics research lead with 10 minutes to spare. Ship only when every dimension is ≥4 and the average is ≥4.2.

| Dimension | 5 looks like | ≤3 looks like |
|---|---|---|
| **accuracy** | Every factual claim is linked to a primary source that says what the post says, with absolute dates and correct numbers. | Unsourced numbers, a claim stronger than its source, misread papers. |
| **insight** | Says something non-obvious, takes a clear position, and has a real Tbrain field angle. A reader learns something they couldn't get from the abstract. | A news recap or generic explainer, or the "Tbrain angle" is a bolted-on sales line. |
| **structure** | The thesis is clear in the first 2 paragraphs. Each H2 advances the argument, ending with a concrete takeaway or artifact (checklist, table, rule of thumb). | Meandering, repetitive sections, or a listicle without reasoning. |
| **voice** | Matches brand-voice.md: specific, calm, practitioner, no banned phrases, varied sentences. | Hype, AI-tell phrases, filler, bullet soup. |
| **seo** | Keyword in title, H2s and first 100 words naturally. seo_title 50-60 chars, description 120-155. 2-4 relevant internal links with descriptive anchors. | Keyword stuffing or missing keyword, missing metadata, "click here" anchors. |
| **cta** | One specific next step tied to the topic (sample dataset, QC playbook, contact for a pilot). | No CTA, or a generic hard sell. |

Output format for the critic:
```
scores: {accuracy: n, insight: n, structure: n, voice: n, seo: n, cta: n}
average: n.n
top fixes:
1. <specific, actionable — quote the sentence>
2. …
banned phrases found: [...]
```
