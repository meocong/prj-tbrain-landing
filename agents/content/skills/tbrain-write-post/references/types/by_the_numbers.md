> Example openings show the pattern only; their facts are illustrative.

# `by_the_numbers`: our own analysis of public data

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

Common rules for every type (reader, information gain, peak, ending, Tbrain's place, visuals): `post-types.md`.
