---
name: tbrain-admin-request
description: Process queued content jobs (from the tbrain.ai admin or from Telegram) — write a draft from a brief or topic idea, revise a post from notes, scout topics. Use when the queue poll reports waiting jobs.
version: 1.0.0
metadata:
  hermes:
    tags: [content, tbrain, queue]
    category: tbrain
---

# Process admin editor jobs

Jobs reach you through one queue: admins queue them from tbrain.ai (the post editor or /admin/content/agent), and you queue them yourself when someone asks in Telegram. `request.via` says which (admin | telegram); `requested_by` is the person's name. You claim a job, do it, close it and report it.

## Loop (one job per run)
1. Call `mcp_tbrain_cms_claim_request`. If `request` is null, reply exactly `[SILENT]` and stop.
2. Do the job by its `type`, following the steps below.
3. **Always** close it with `mcp_tbrain_cms_complete_request`. Use `status: done` with a `result`, or `status: failed` with a `message` that says why in one sentence.
4. Your **final response is the report**: the scheduler delivers it to the Telegram group, so don't call `send_message` for it. Write it in Vietnamese and name who asked (`requested_by`, and "qua Telegram" or "từ admin"). For a draft, use the report from `tbrain-write-post` step 7 with the review, edit and preview links. For a revise, give 1-2 lines on what changed, with the same links. For a scout, send the shortlist message. A failed job gets one line saying why.
5. Don't claim a second job. The next one starts on the next poll, about 2 minutes later.

## type = draft (new post from a brief)
`request.brief` has `idea`, and optionally `keyword`, `audience` (the reader) and `notes` (must-cover points, sources, samples, tone, length, things to avoid: follow them). If `topic` is set, it is the saved idea being written (`#seq`, title, why_now, angle, keyword, sources): use its sources as the starting research. The brief wins where the two differ.
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
- Save the shortlist with `save_topics` and `request_id` set to this job's id (the skill's step 5).
- Complete with `result: {message: "<n> topics: #a–#b"}`.

## Rules
- You still cannot publish. Everything goes through review.
- Finish the claimed job within the run. Jobs left running are retried after 90 minutes, up to 3 attempts.
