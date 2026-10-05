---
name: tbrain-write-post
description: Write a high-quality Tbrain blog post end to end — brief and outline for approval, researched draft, independent critic and fact-check passes, then save as a draft, submit for human review, and prepare LinkedIn/Facebook/X copy. Use when chị Tâm picks a topic or asks for a post.
version: 1.0.0
metadata:
  hermes:
    tags: [content, writing, tbrain]
    category: tbrain
---

# Tbrain: write a blog post

Read these before you start, every time:
- `references/tbrain-knowledge.md`: the Tbrain fact base — service lines, Physical AI hardware/pipeline/QC, delivered-vs-capacity numbers, case studies, samples catalog, Terminal-Bench, internal links, canonical naming, and what you must never say
- `references/tbrain-samples.md`: what is actually inside each Tbrain sample line (egocentric, game, teleop, mocap, hand pose, exocentric, GoPro), with formats, tasks and concrete angles. Use it to make robotics posts specific.
- `references/brand-voice.md`: how Tbrain sounds, plus banned phrases
- `references/editorial-rules.md`: what we may and may not claim
- `references/rubric.md`: how the critic scores the draft
- `references/html-format.md`: allowed HTML and the post structure
- `references/images.md`: cover images you can use

Also check memory for chị Tâm's saved preferences and apply them.

## 1. Brief and outline (approval gate)
Research the topic properly before outlining: open at least 4-6 sources, at least 2 of them primary. Then write the brief:
- **Working title** (English) and 1-sentence **thesis**: the one thing the reader should walk away believing.
- **Reader**: persona, what they're trying to decide, search intent, and the target keyword plus 2-3 related terms.
- **Tbrain angle**: what we can say from hands-on experience that others can't.
- **Outline**: H2s with a one-line point each (5-7 sections), and where internal links and the CTA go.
- **Key sources** (URLs).

**Outline gate (only when asked).** By default drafting runs as a background job (see the SOUL and `tbrain-admin-request`) and goes straight on to step 2: the brief the requester wrote is the approval. If someone asks in chat to see the outline first ("gửi dàn ý trước"), write the brief in the chat session, send it **in Vietnamese** (title and outline headings in English) and wait for "ok". Then queue the draft with `queue_request`, putting the approved outline in `brief.notes`.

## 2. Draft
Write 1,200-1,700 words, in HTML per `references/html-format.md`. Write an argument for a buyer, not a summary of papers.
- **Frame the problem first.** The first two paragraphs put the reader in a situation they recognize (a purchase, a failed training run, a budget, a vendor claim), name the tension, and state the thesis in one sentence. Don't open with a paper's statistic or a list of releases; bring the research in as evidence once the problem is clear. Test: could a VP of robotics read only the first two paragraphs and know what is at stake for them?
- Papers are evidence, not structure. Don't walk through sources one by one or build the post around a comparison table of papers. At most one table, and only if it helps a decision.
- Every section earns its place: a claim, then evidence, then a "so what" for the reader. Prefer one strong worked example over many facts.
- Every section earns its place: a claim, then evidence, then a "so what" for the reader.
- Include at least one concrete artifact: a checklist, decision table, worked example, or numbers from a cited source.
- Cite inline with descriptive anchor links to primary sources (`<a href="…">the π0 paper</a>`). Don't use footnote numbers.
- Add 2-4 internal links where they genuinely help: /data/physical-ai, /data/physical-ai/quality, /casestudy/<slug>, /blog/<related-slug> (from `list_posts`), /contact. **Never link /samples** (editorial rule 13).
- **Images:** a cover plus 2-3 inline images (`<img>` + an `<em>` caption paragraph, see html-format.md) from `references/images.md`, each with a caption saying what to notice, placed where it supports the text (e.g. a QC image next to the QC section). Don't reuse the cover inline.
- End with a short, specific CTA tied to the post (e.g. "Walk through our QC rules with us at /contact", "See how capture works at /data/physical-ai"), not a generic sales pitch.

## 3. Independent critic pass
Use `delegate_task` to have a subagent review the draft **cold**, giving it only the draft, `references/rubric.md`, `references/brand-voice.md` and `references/editorial-rules.md`. Ask for scores (0-5) on each rubric dimension, with the 3-5 most important fixes. If any dimension scores below 4, or the average is below 4.2, revise and **re-run the critic on the revised draft** (a fresh subagent). Allow at most 2 revision rounds; after that, keep the best version and record the remaining issues as flags. The score you save in `agent_meta.rubric` and report is the **latest critic's score**, never your own estimate.

## 4. Fact-check pass
Use a second `delegate_task` subagent, **always as a separate subagent** (never inline): an independent check is the point. If delegation fails, say so in `factcheck_flags`. Give it the draft and ask it to open **every** linked URL and check:
- that each factual sentence (numbers, dates, names, capabilities) is supported by the linked source or one listed in the brief;
- that no link is dead, paywalled-only or irrelevant;
- that nothing violates `references/editorial-rules.md` (customer names, invented stats, competitor claims).

Fix what you can. Anything unresolved becomes a short `factcheck_flags` entry, e.g. "Para 3: '40% cheaper' — source only says 'significantly'; reworded, please confirm".

## 5. SEO and metadata
- `seo_title`: 50-60 chars, with the keyword near the front.
- `seo_description`: 120-155 chars that promise a concrete takeaway.
- `excerpt`: 1-2 sentences for the blog index.
- `slug`: short, keyword-based, no dates.
- `category`: one of Physical AI, Robotics Data, Data Quality, RLHF & Evaluation, Benchmarks, Engineering.
- `tags`: 3-6, lowercase.
- `cover_image_url`: pick from `references/images.md` (on-topic and Tbrain-owned first). Never use images from other sites.
- `author_name`: leave empty. The reviewer sets the byline.

## 6. Save and submit
1. `mcp_tbrain_cms_create_draft` with all fields, plus `agent_meta`: `{topic, angle, target_keyword, sources:[{url,title,publisher,accessed_at}], rubric:{accuracy,framing,insight,structure,voice,visuals,seo,cta}, factcheck_flags:[…], model}`. When revising after feedback, use `update_draft` instead.
2. `mcp_tbrain_cms_submit_for_review`, which returns `review_url` and `preview_url`.
3. `mcp_tbrain_cms_save_social_messages`:
   - **linkedin**: 150-250 words in a professional, first-person-plural company voice. Open with a hook line, give 3 short insight bullets, end with a question or a "read more". 0-3 hashtags. Don't paste the link (the system appends it).
   - **facebook**: 60-120 words, a little warmer, and a clear reason to click.
   - **x**: at most 250 characters: one sharp insight. No link (it is appended), at most 1 hashtag.

## 7. Report (Vietnamese)
Send it as **plain text**: no `**bold**`, no Markdown, no backslash escapes. Telegram shows them as raw characters. Put each URL on its own line.
```
✍️ Bài mới chờ duyệt: <Title>  (yêu cầu bởi <requested_by>)
• Ý chính: <1 câu>
• Độ dài: <n> từ · <k> nguồn · Tự chấm: <avg>/5
• ⚠️ Cần chị kiểm tra: <flags or "không có">
👀 Xem trước: <preview_url>
✅ Duyệt: <review_url>
Muốn agent sửa: nhắn "sửa bài <tiêu đề/slug>: <ghi chú>" hoặc bấm "Request changes" ở /admin/content/agent.
Sau khi duyệt, nút Share LinkedIn/Facebook/X trong trang bài viết đã có sẵn nội dung.
```
Never say the post is published. If she replies with edits, use `tbrain-revise-post`.
