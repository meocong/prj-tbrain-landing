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

Send the brief to chị Tâm **in Vietnamese** (keep the title and outline headings in English), and ask with clarify: "Duyệt dàn ý" / "Sửa" / "Đổi chủ đề". Wait. If she gives feedback, revise the brief. Skip this gate only if she explicitly says "viết luôn".

## 2. Draft
Write 1,200-2,000 words, in HTML per `references/html-format.md`.
- Open with the reader's problem or a concrete, surprising fact (sourced). No throat-clearing.
- Every section earns its place: a claim, then evidence, then a "so what" for the reader.
- Include at least one concrete artifact: a checklist, decision table, worked example, or numbers from a cited source.
- Cite inline with descriptive anchor links to primary sources (`<a href="…">the π0 paper</a>`). Don't use footnote numbers.
- Add 2-4 internal links where they genuinely help: /data/physical-ai, /data/physical-ai/quality, /samples, /blog/<related-slug> (from `list_posts`), /contact.
- End with a short, specific CTA tied to the post (e.g. "See a sample capture pack at /samples"), not a generic sales pitch.

## 3. Independent critic pass
Use `delegate_task` to have a subagent review the draft **cold**, giving it only the draft, `references/rubric.md`, `references/brand-voice.md` and `references/editorial-rules.md`. Ask for scores (0-5) on each rubric dimension, with the 3-5 most important fixes. If any dimension scores below 4, or the average is below 4.2, revise and re-review. Allow at most 2 revision rounds; after that, keep the best version and record the remaining issues as flags.

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
1. `mcp_tbrain_cms_create_draft` with all fields, plus `agent_meta`: `{topic, angle, target_keyword, sources:[{url,title,publisher,accessed_at}], rubric:{accuracy,insight,structure,voice,seo,cta}, factcheck_flags:[…], model}`. When revising after feedback, use `update_draft` instead.
2. `mcp_tbrain_cms_submit_for_review`, which returns `review_url` and `preview_url`.
3. `mcp_tbrain_cms_save_social_messages`:
   - **linkedin**: 150-250 words in a professional, first-person-plural company voice. Open with a hook line, give 3 short insight bullets, end with a question or a "read more". 0-3 hashtags. Don't paste the link (the system appends it).
   - **facebook**: 60-120 words, a little warmer, and a clear reason to click.
   - **x**: at most 250 characters: one sharp insight. No link (it is appended), at most 1 hashtag.

## 7. Report to chị Tâm (Vietnamese)
```
✍️ Bài mới chờ duyệt: <Title>
• Ý chính: <1 câu>
• Độ dài: <n> từ · <k> nguồn · Tự chấm: <avg>/5
• ⚠️ Cần chị kiểm tra: <flags or "không có">
👉 Xem & duyệt: <review_url>
(Preview: <preview_url>)
Sau khi duyệt, nút Share LinkedIn/Facebook/X trong trang bài viết đã có sẵn nội dung.
```
Never say the post is published. If she replies with edits, use `tbrain-revise-post`.
