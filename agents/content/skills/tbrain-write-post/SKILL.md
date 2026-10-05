---
name: tbrain-write-post
description: Write a Tbrain blog post people want to read — pick the post type, build a brief with real information gain from the approved knowledge base, propose an outline for human approval, then write, run reader/critic/fact-check passes, save as a draft, submit for review and prepare LinkedIn/Facebook/X copy. Use for draft jobs and when someone asks for a post.
version: 2.0.0
metadata:
  hermes:
    tags: [content, writing, tbrain]
    category: tbrain
---

# Tbrain: write a blog post

You are writing for a person: a robotics or ML lead, or the person who buys their data. They have ten minutes and no obligation to finish. Every choice below serves that reader, not a search engine.

Read these before you start, every time:
- `references/post-types.md`: the five post types, their skeletons, openings and endings. **The most important file.**
- `references/rubric.md`: the critic scorecard your draft must pass
- `references/brand-voice.md`: how Tbrain sounds, banned phrases and AI tells
- `references/editorial-rules.md`: what we may and may not claim (rule 13: samples and internal detail stay private)
- `references/html-format.md`: allowed HTML and the structure blocks
- `references/tbrain-knowledge.md`: public-safe Tbrain facts and internal link targets
- `references/tbrain-samples.md`: background only, never quoted

Also check memory for reviewer preferences ("Tâm prefers: …") and apply them.

## 1. Research and the brief

Research first: open 4-6 sources, at least 2 primary (paper, official post, dataset card). Then gather Tbrain material:
- `mcp_tbrain_cms_search_knowledge` for approved stories and facts on the topic (try the data line and 2-3 keywords; read promising items in full with `get_knowledge`);
- the requester's `brief.experience` (what they've seen or done first-hand), if any;
- `mcp_tbrain_cms_list_images` for the approved image library.

Write the brief (it goes into the outline):
- **Post type** from `post-types.md`. Use `brief.post_type` if the requester set one. Otherwise pick from the reader's question, and prefer `field_story` when an approved story or the requester's experience fits.
- **Reader, problem, takeaway**: one sentence each.
- **Information gain**: what this post has that the sources don't. Name the knowledge ids or the experience note it comes from, or the original analysis you'll add. If there's none, say so plainly in the outline notes and propose what we'd need (e.g. "a story from the team about X"). Don't pad.
- **The peak**: the most surprising point, and where it lands.
- **CTA**: one, matched to the topic.

## 2. Outline for approval (default)

Unless `brief.skip_outline` is true or `brief.outline_approved` is true, stop after the outline:
1. Call `mcp_tbrain_cms_submit_outline` with the job id and
   `{post_type, title, reader, problem, takeaway, opening, sections:[{h2, point}], closing, cta, images:[{url, why}], knowledge_ids, sources, notes}`.
   - `opening` is the actual first two paragraphs as they will read: the reader judges the post by them.
   - `h2`s are claims (see post-types.md). 4-6 sections.
   - `images`: 3-4 picks from `list_images` with one line each on why that image belongs next to that section.
2. Your final response is the outline report (plain text, Vietnamese, title and headings in English):
```
📝 Dàn ý chờ duyệt: <Title>  (<post type>, yêu cầu bởi <requested_by>)
Người đọc: <1 câu> · Mang về: <1 câu>
Mở bài:
<the two opening paragraphs>
Các phần:
1. <H2>
2. <H2>
…
Kết: <1 câu> · CTA: <…>
Chất riêng: <knowledge used / experience / original analysis, or "chưa có — cần câu chuyện từ team về …">
Trả lời "ok" để viết bài đầy đủ, hoặc "sửa: <ghi chú>". Hoặc duyệt ở:
https://www.tbrain.ai/admin/content/agent?job=<job id>
```
Don't call `complete_request`. The job waits until someone reviews it.

When the job comes back:
- `brief.outline_approved` true: write the full draft from the approved outline (`request.result.outline`), applying `brief.outline_feedback` if any.
- `outline_approved` false but there's `outline_feedback`: produce a new outline with the feedback (back to the start of this step).

## 3. Draft

Follow the skeleton of the post type. 1,200-1,600 words, HTML per `html-format.md`.
- **Opening**: the approved opening, polished. Answer-first or a scene; thesis in paragraph 1-2.
- **Key takeaways box** right after the opening: `<blockquote><ul><li>…</li></ul></blockquote>` with 3 one-line takeaways (the site styles it as a box).
- **H2s are claims.** Each section: the claim, the evidence (source link or approved Tbrain story/fact), and what it means for the reader.
- **Write prose.** Lists only for real lists or steps. At most one table, and only for a decision.
- **Tbrain material**: retell approved stories and facts accurately, at the level of detail the item gives, and never beyond it. Record their ids in `agent_meta.knowledge_ids`. Nothing about Tbrain that isn't in the knowledge base, `tbrain-knowledge.md` or the requester's note.
- **Images**: 3-4 inline images from `list_images` only, each placed next to the paragraph its description matches, each followed by an `<em>` caption that says what to notice (see html-format.md). The cover is a different library image. If the library has nothing that fits a section, use fewer images and flag it for the reviewer. Never use an image whose description doesn't match.
- **Links**: inline descriptive anchors to primary sources. 2-4 internal links: /data/physical-ai, /data/physical-ai/quality, /casestudy/<slug>, /blog/<related-slug> (from `list_posts`), /contact. Never /samples.
- **CTA**: one soft in-text CTA right after the section that describes the reader's pain, if natural, and a specific one at the end. The site appends a standard contact block under every post, so don't write a generic "contact us" paragraph.
- **Ending**: one memorable line plus a concrete next step. No recap.

## 4. Reader pass, critic, fact-check

Use three separate `delegate_task` subagents. Each reviews **cold**: give it only the draft and the files named below.
1. **Reader pass**: "You are a head of robotics data at a VLA startup. Read this as you would a vendor blog. Mark every sentence that made you want to keep reading, name the longest dull stretch, say where you would have stopped, and say what you'd remember tomorrow." Rewrite the dull stretch and anything before the stop point.
2. **Critic**: `rubric.md`, `brand-voice.md`, `editorial-rules.md`, `post-types.md`, plus the image library descriptions of the images used. Ship at ≥20/26 with no 0 on items 1, 4, 6 or 10. Otherwise fix and **re-run a fresh critic**. Two rounds at most, then keep the best version and flag the rest. The score you save and report is the latest critic's total, never your own estimate.
3. **Fact-check**: open every linked URL; check each factual sentence against its source; check every Tbrain claim against the knowledge items cited; check rule 13. Unresolved issues go into `factcheck_flags` ("Para 3: 'half of frames' — IronMind says 51% effective; reworded, please confirm").

## 5. Metadata
- `seo_title` ≤ 60 chars, `seo_description` 120-155 chars promising a concrete takeaway, `excerpt` 1-2 sentences, short keyword `slug`.
- `category`: one of Physical AI, Robotics Data, Data Quality, RLHF & Evaluation, Benchmarks, Engineering. `tags`: 3-6, lowercase.
- `cover_image_url`: from `list_images`. `author_name`: leave empty (the site shows "Tbrain Team").

## 6. Save and submit
1. `mcp_tbrain_cms_create_draft` (or `update_draft` for an existing draft) with all fields and `agent_meta`: `{post_type, topic, reader, takeaway, target_keyword, knowledge_ids:[…], images:[{url, why}], sources:[{url,title,publisher,accessed_at}], scorecard:{total, items:{1..13}}, reader_pass:"<one line>", factcheck_flags:[…], model}`.
2. `mcp_tbrain_cms_submit_for_review` returns `review_url` and `preview_url`.
3. `mcp_tbrain_cms_save_social_messages`:
   - **linkedin**: 150-250 words, first-person plural. Open with the post's sharpest line, then 3 short insights and a question. 0-3 hashtags, no link (it's appended).
   - **facebook**: 60-120 words, warmer, with a clear reason to click.
   - **x**: ≤ 250 chars, one sharp insight, ≤ 1 hashtag, no link.

## 7. Report (Vietnamese, plain text)
No Markdown, bold or backslash escapes. One URL per line.
```
✍️ Bài mới chờ duyệt: <Title>  (<post type>, yêu cầu bởi <requested_by>)
• Ý chính: <1 câu>
• <n> từ · <k> nguồn · <m> ảnh · Critic: <total>/26
• Chất riêng: <knowledge/experience used>
• ⚠️ Cần kiểm tra: <flags or "không có">
👀 Xem trước: <preview_url>
✅ Duyệt: <review_url>
Muốn sửa: nhắn "sửa bài <tiêu đề>: <ghi chú>" hoặc bấm "Request changes" ở /admin/content/agent.
```
Never say the post is published.
