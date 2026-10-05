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
3. **Close it**: with `mcp_tbrain_cms_complete_request` (`status: done` with a `result`, or `status: failed` with a one-sentence `message`), **or**, for a draft in its outline phase, with `mcp_tbrain_cms_submit_outline`, which parks the job for approval. Every claimed job ends one of these two ways.
4. Your **final response is the report**: the scheduler delivers it to the Telegram group, so don't call `send_message` for it. Write it in Vietnamese and name who asked (`requested_by`, and "qua Telegram" or "từ admin"). For a draft outline, use the outline report from `tbrain-write-post` step 2. For a finished draft, use the report from step 7. For a revise, give 1-2 lines on what changed, with the same links. For a scout, send the shortlist message. A failed job gets one line saying why.
5. Don't claim a second job. The next one starts on the next poll, about 2 minutes later.

## type = draft (new post from a brief)
`request.brief` holds:
- `idea`, optionally `keyword`, `audience` (the reader) and `notes` (must-cover points, sources, tone, length, things to avoid: follow them);
- `experience`: the requester's first-hand note, your best information gain; use it, at the detail they gave;
- `post_type`, if they chose one;
- `skip_outline`, `outline_approved`, `outline_feedback`, `outline_reviewed_by` (the outline gate).

If `topic` is set, it's the saved idea being written (`#seq`, title, why_now, angle, keyword, post_type, sources): start your research from its sources. The brief wins where the two differ. `request.result.outline` holds the last proposed outline, if any.

Run `tbrain-write-post`:
- **No outline yet, or `outline_feedback` without approval** (and `skip_outline` not set): steps 1-2. Research, build the brief, call `submit_outline`, report the outline. Stop there: no `complete_request`.
- **`outline_approved` true, or `skip_outline` true**: steps 3-7 from the approved outline (applying `outline_feedback`), then complete with `result: {post_id, message: "<one-line English summary, post type, critic total, any flags>"}`.

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
