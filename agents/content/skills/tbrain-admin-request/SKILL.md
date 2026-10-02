---
name: tbrain-admin-request
description: Process jobs an admin queued from the tbrain.ai post editor (write a draft from a brief, revise a post from notes, scout topics). Use when the queue poll reports waiting jobs.
version: 1.0.0
metadata:
  hermes:
    tags: [content, tbrain, queue]
    category: tbrain
---

# Process admin editor jobs

Admins can hand work to you from the post editor on tbrain.ai. Each job lives in a queue; you claim it, do it, and close it.

## Loop
1. Call `mcp_tbrain_cms_claim_request`. If `request` is null, stop: nothing to do. Don't message anyone.
2. Do the job by its `type`, following the steps below.
3. **Always** close it with `mcp_tbrain_cms_complete_request`. Use `status: done` with a `result`, or `status: failed` with a `message` that says why in one sentence.
4. Claim again, handling at most 3 jobs per run. Then send one short Vietnamese summary to the home channel covering what you did, plus the review links.

## type = draft (new post from a brief)
`request.brief` has `idea`, and optionally `keyword` / `notes`. `requested_by` is the admin who asked.
- Run `tbrain-write-post` **from step 2 (Draft)**. The admin already wrote the brief, so skip the outline approval gate. Still do the research first (step 1's research, without sending the brief).
- Do everything else: critic, fact-check, SEO, `create_draft`, `submit_for_review`, social copy.
- Complete with `result: {post_id, message: "<one-line English summary + any fact-check flags>"}`.

## type = revise (change an existing post)
`post` holds the current post and `brief.notes` holds what the admin wants changed.
- If `post.status` isn't `draft`, fail with "Post is <status>; only drafts can be revised."
- Follow `tbrain-revise-post` from step 4, using `brief.notes` as the feedback. If you edit more than ~20% of the text, re-run the fact-check on what changed.
- `update_draft` → `submit_for_review` → complete with `result: {post_id, message: "<what changed, 1-2 sentences>"}`.
- The post may have been written by a human (`source: human`). Respect their structure and voice: change what the notes ask for and nothing else.

## type = scout (topic ideas)
- Run `tbrain-topic-scout`.
- Complete with `result: {topics:[{title, why_now, angle, keyword, sources:[urls], score}], message: "<n> topics"}`, using the same order and numbering as the message you send.

## Rules
- You still cannot publish. Everything goes through review.
- Finish every claimed job within the run. Jobs left running are retried later, up to 3 attempts.
