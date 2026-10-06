---
name: tbrain-write-post
description: Write a Tbrain blog post people want to read — pick the post type, build a brief with real information gain from the approved knowledge base, propose an outline for human approval, then write, run reader/critic/fact-check passes, save as a draft, submit for review and prepare LinkedIn/Facebook/X copy. Use for draft jobs and when someone asks for a post.
version: 2.2.0
metadata:
  hermes:
    tags: [content, writing, tbrain]
    category: tbrain
---

# Tbrain: write a blog post

You are writing for a person: a robotics or ML lead, or the person who buys their data. They have ten minutes and no obligation to finish. Every choice below serves that reader, not a search engine.

Read these before you start, every time:
- `references/post-types.md`: the seven post types, their skeletons, openings and endings. **The most important file.**
- `references/exemplars.md`: how the best technical writers build posts from sources, use figures, open and end
- `references/images.md`: visuals: source figures (licence check), our own charts, the library (one at most)
- `references/rubric.md`: the critic scorecard your draft must pass
- `references/brand-voice.md`: how Tbrain sounds, banned phrases and AI tells
- `references/editorial-rules.md`: what we may and may not claim (rule 13: samples and internal detail stay private)
- `references/html-format.md`: allowed HTML and the structure blocks
- `references/tbrain-knowledge.md`: public-safe Tbrain facts and internal link targets
- `references/tbrain-samples.md`: background only, never quoted

Also check memory for reviewer preferences ("Tâm prefers: …") and apply them.

## 1. Research and the brief

Research first, and go deep. The post is built from what the original references actually contain, not from our landing pages.
- Open 4-8 sources, at least 3 primary (paper, official post, dataset card, release notes). For papers read the body (`https://arxiv.org/html/<id>`), not just the abstract: method, dataset composition, the result tables, the limitations section.
- Web-search for 1-3 thoughtful takes on the same topic (researchers' blogs, lab posts, substacks). Use them for angles, disagreements and counterarguments; cite them; never copy their images.
- Write down as you go: the 5-10 numbers that matter (with their source), the figures worth showing (`source_license` tells you which you may reuse), and what the sources disagree on or leave out.

Then gather Tbrain material, only for the part where it fits:
- `mcp_tbrain_cms_search_knowledge` for approved stories and facts on the topic (try the data line and 2-3 keywords; read promising items in full with `get_knowledge`);
- the requester's `brief.experience` (what they've seen or done first-hand), if any.

Write the brief (it goes into the outline):
- **Post type** from `post-types.md`. Use `brief.post_type` if the requester set one. Otherwise pick from the reader's question: one source worth understanding → `deep_dive`; several sources on one question → `synthesis`; a question public data can answer → `by_the_numbers`; a direction with a prediction → `trend_pov`; an approved story or the requester's experience → `field_story`. Call `list_posts` with `status=all, limit=6`: avoid the `post_type`, data line and lead visual form (`visuals`) of the last two posts.
- **Reader, problem, takeaway**: one sentence each.
- **Information gain**: what this post has that the sources don't: the comparison across sources, the chart nobody drew, the limitation nobody mentions, a knowledge id or the experience note. If there's none, say so plainly in the outline notes. Don't pad.
- **Format device**: 1-2 from `post-types.md` (myth vs reality, annotated walkthrough, decision table, back-of-envelope, …).
- **Visuals plan**: 3-6 visuals in at least 3 forms per `images.md`: the source video and figures (licence checked), which charts in which forms (with the numbers and their source), the cover (source figure or cover card), at most one library photo.
- **Headline workshop**: write 10 candidate titles, score each 1-5 on specific (names a thing or number), surprising (the reader doesn't already believe it) and clear promise (what they'll get); keep the best, put the runners-up in the outline notes. No colons-for-everything, no "The Future of…", no questions the post doesn't answer.
- **The peak**: the most surprising point, and where it lands.
- **CTA**: one, matched to the topic.

## 2. Outline for approval (default)

Unless `brief.skip_outline` is true or `brief.outline_approved` is true, stop after the outline:
1. Call `mcp_tbrain_cms_submit_outline` with the job id and
   `{post_type, title, reader, problem, takeaway, opening, sections:[{h2, point}], closing, cta, images:[{url, why}], knowledge_ids, sources, notes}`.
   - `opening` is the actual first two paragraphs as they will read: the reader judges the post by them.
   - `h2`s are claims (see post-types.md). 4-6 sections.
   - `images`: the visuals plan: `[{url (or "chart: <spec title>" if not rendered yet), why, kind, credit, license}]`, one line each on why it belongs next to that section.
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

Follow the skeleton of the post type. 1,200-1,600 words (`deep_dive` and `synthesis` up to 2,200), HTML per `html-format.md`.
- **Opening**: the approved opening, polished. Answer-first or a scene; thesis in paragraph 1-2.
- **Key takeaways box** right after the opening: `<blockquote><ul><li>…</li></ul></blockquote>` with 3 one-line takeaways (the site styles it as a box).
- **H2s are claims.** Each section: the claim, the evidence (source link or approved Tbrain story/fact), and what it means for the reader.
- **Write prose.** Lists only for real lists or steps. At most one table, and only for a decision.
- **Tbrain material**: retell approved stories and facts accurately, at the level of detail the item gives, and never beyond it. Record their ids in `agent_meta.knowledge_ids`. Nothing about Tbrain that isn't in the knowledge base, `tbrain-knowledge.md` or the requester's note.
- **Depth**: name the method, the dataset size, the embodiment, the metric, the baseline. "The policy improves" is not a finding; "success on unseen kitchens went from 31% to 58% when they added 20% human video" is.
- **Visuals**: 3-6 in at least 3 forms per `images.md`: the official demo video if there is one; licensed source figures fetched, cropped (and annotated only with the vision tool) and credited; `render_chart` charts in different forms built from cited numbers; at most one library photo, only next to a paragraph about our own work. Each followed by an `<em>` caption that says what to notice (and the credit for source visuals). If you can't find a good visual for a section, leave it without one rather than decorating.
- **By the numbers**: for `by_the_numbers`, run the `hf_hub_query` / `arxiv_count` queries in the research step, compute only what the results support, and end with a "How we counted" section.
- **Tbrain's place**: per `post-types.md`. Our experience goes where it adds; the rest of the post is about the field. No product paragraph.
- **Links**: inline descriptive anchors to primary sources and the takes you used. At most 2 internal links besides the CTA (a related /blog post from `list_posts`, or /data/physical-ai/quality when QC is the topic). Never /samples.
- **CTA**: one soft in-text CTA right after the section that describes the reader's pain, if natural, and a specific one at the end. The site appends a standard contact block under every post, so don't write a generic "contact us" paragraph.
- **Ending**: one memorable line plus a concrete next step. No recap.

## 4. Reader pass, critic, fact-check

Use three separate `delegate_task` subagents. Each reviews **cold**: give it only the draft and the files named below.
1. **Reader pass**: "You are a head of robotics data at a VLA startup. Read this as you would a vendor blog. Mark every sentence that made you want to keep reading, name the longest dull stretch, say where you would have stopped, say what you'd remember tomorrow, and name the one sentence or visual you'd forward to a colleague (or say there is none)." Rewrite the dull stretch and anything before the stop point. If nothing is forward-worthy, the post has no peak yet: fix that before the critic.
2. **Critic**: `rubric.md`, `brand-voice.md`, `editorial-rules.md`, `post-types.md`, `images.md`, plus the visuals list (kind, credit, licence, library description) of the images used. Ship at ≥20/26 with no 0 on items 1, 4, 6 or 10. Otherwise fix and **re-run a fresh critic**. Two rounds at most, then keep the best version and flag the rest. The score you save and report is the latest critic's total, never your own estimate.
3. **Fact-check**: open every linked URL; check each factual sentence and every number in each chart spec against its source; check each source figure's licence and credit; check every Tbrain claim against the knowledge items cited; check rule 13. Unresolved issues go into `factcheck_flags` ("Para 3: 'half of frames' — IronMind says 51% effective; reworded, please confirm").

## 5. Metadata
- `seo_title` ≤ 60 chars, `seo_description` 120-155 chars promising a concrete takeaway, `excerpt` 1-2 sentences, short keyword `slug`.
- `category`: one of Physical AI, Robotics Data, Data Quality, RLHF & Evaluation, Benchmarks, Engineering. `tags`: 3-6, lowercase.
- `cover_image_url`: a PNG/JPEG (see `images.md`, Cover): a licensed source figure, else a `render_chart` cover card's `png_url`; a library photo only for posts about our own work. `author_name`: leave empty (the site shows "Tbrain Team").

## 6. Save and submit
1. `mcp_tbrain_cms_create_draft` (or `update_draft` for an existing draft) with all fields and `agent_meta`: `{post_type, topic, reader, takeaway, target_keyword, knowledge_ids:[…], images:[{url, why, kind, credit, license, source_url}], sources:[{url,title,publisher,accessed_at}], scorecard:{total, items:{1..13}}, reader_pass:"<one line>", factcheck_flags:[…], model}`.
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
• <n> từ · <k> nguồn · Visual: <v> video · <f> hình gốc · <c> biểu đồ (<các dạng>) · <l> ảnh thư viện · Critic: <total>/26
• Chất riêng: <knowledge/experience used>
• ⚠️ Cần kiểm tra: <flags or "không có">
👀 Xem trước: <preview_url>
✅ Duyệt: <review_url>
Muốn sửa: nhắn "sửa bài <tiêu đề>: <ghi chú>" hoặc bấm "Request changes" ở /admin/content/agent.
```
Never say the post is published.
