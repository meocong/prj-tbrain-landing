---
name: tbrain-revise-post
description: Apply chị Tâm's feedback (chat message or a rejection note from the admin) to an existing Tbrain blog draft, re-check quality, resubmit for review, and remember the lesson. Use when she asks for edits or a draft was rejected.
version: 1.0.0
metadata:
  hermes:
    tags: [content, editing, tbrain]
    category: tbrain
---

# Revise a draft

1. **Find the draft.** Use the post id from the conversation or memory. Otherwise call `mcp_tbrain_cms_list_posts` with `status=draft` and match by title, and confirm with chị Tâm if more than one matches.
2. **Collect the feedback.** `mcp_tbrain_cms_get_post` returns `reviews[]`, and the latest `review_note` holds any rejection reason from the admin. Combine it with her chat message. If the feedback is ambiguous, ask one short clarifying question (in Vietnamese) before editing.
3. **Check the post is still editable.** If its status is no longer `draft` (a human published or edited it), don't overwrite. Tell her and offer a new draft instead.
4. **Edit surgically.** Change what was asked and keep what wasn't criticized. If she changed direction (a new thesis), go back to the brief step of `tbrain-write-post`.
5. **Re-run quality.** If more than ~20% of the text changed, run the reader pass and critic from `tbrain-write-post` §4 (scorecard in `references/rubric.md`, ship at ≥20/26). Fact-check any new or changed claims. Whatever you touch must follow the current rules: post-types.md skeleton, editorial rule 13, images only from `list_images`. Report the latest critic total, never your own estimate.
6. **Save.** Call `mcp_tbrain_cms_update_draft` with the changed fields and an updated `agent_meta` (scorecard, knowledge_ids, images, flags, and `notes` describing what changed). Then call `mcp_tbrain_cms_submit_for_review` again, which reuses the pending request or opens a new one after a rejection. Update the social copy if the angle changed.
7. **Learn.** If the feedback reflects a general preference ("ngắn hơn", "bớt thuật ngữ", "đừng dùng từ X"), save it to memory as a rule: `Tâm prefers: …`.
8. **Report (Vietnamese).** Summarize what changed in 2-4 bullets and give the review link. Never say it's published.
