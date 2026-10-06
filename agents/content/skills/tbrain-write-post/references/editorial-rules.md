# Editorial rules (non-negotiable)

1. **Sourcing.** Every number, date, benchmark result, model capability or quote links to a source you opened. Prefer primary sources (paper, official blog, dataset card, docs) over news write-ups. Don't cite Reddit, Quora or SEO content farms as evidence.
2. **No fabrication.** Never invent statistics, customer stories, quotes, survey results or "studies show". If you want a number and can't find one, write the argument without it.
3. **Confidentiality.** Never name Tbrain customers, prospects or partners; use "a frontier robotics lab" or "an industrial partner". Never state internal pricing, costs, margins, headcount or volumes beyond what tbrain.ai already says publicly.
4. **Competitors.** You may describe public approaches ("teleop-first vendors", "sim-first pipelines"), but never disparage or make factual claims about a named competitor's quality, pricing or customers.
5. **Claims about Tbrain.** Describe Tbrain at the level of its public pages (/data/physical-ai, /data/physical-ai/quality, /casestudy): what we capture, how we QC, how we deliver. Use `tbrain-knowledge.md`, `brand-voice.md` and **approved** knowledge items (`search_knowledge`) for those facts, retold at the detail the item gives and no further. Write no superlatives ("the best", "the only", "the largest") unless they are verifiable.
6. **Accuracy of tone.** Mark speculation as speculation ("we expect", "early evidence suggests") and separate it from established results.
7. **Copyright.** Quote at most 1-2 short sentences from any source, in quotation marks and linked. Paraphrase everything else in your own words. Third-party figures only when their licence allows reuse (CC BY, CC BY-SA, CC0; check arXiv with `source_license`), cropped, unaltered and credited in the caption. Otherwise redraw the numbers with `render_chart` and credit "Data: …". Official project/lab videos may be embedded from YouTube (never downloaded or re-hosted). Annotated figures say "annotated by Tbrain". Never copy images from blogs, news sites or company pages. See `images.md`.
8. **Dates.** Use absolute dates ("in March 2026"), not "recently" or "this year".
9. **Safety and legal.** Make no medical, legal or financial advice claims. Don't write about people's personal data. Don't recommend scraping that violates site terms.
10. **Originality.** Don't restructure a single source into a post. Each post must synthesize at least 3 sources plus the Tbrain angle.
11. **Disclosure.** Leave `author_name` empty. The human reviewer sets the byline and takes editorial responsibility when they approve.
13. **Samples and internal detail stay private.** `tbrain-samples.md` is background so you understand the data; it is not a source to quote. In a post, never:
   - link to `/samples` or any sample page, file or Drive folder;
   - quote sample-level numbers (clip/episode/frame counts, visibility percentages, hours in one folder, palm sizes, resolutions of a specific set), sample IDs or file names;
   - name internal tools or vendors (annotation tools, rig or hand vendors), count internal models, or describe internal traces ("in one trace 100 → 78 → 92", git SHAs, manifests);
   - describe a customer engagement beyond the anonymized case studies on /casestudy.
   Say what Tbrain does in general terms ("we keep native fisheye and ship the calibration", "every rejected episode carries a reason code") and point readers to /data/physical-ai or /contact.
12. **Game data.** Never name the commercial game titles or publishers whose gameplay Tbrain captured, and never imply a licensing relationship. Describe the data by genre and by signal (frame-aligned inputs, camera pose).
