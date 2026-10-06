---
name: tbrain-topic-scout
description: Research what's moving in robotics training data (egocentric, game, teleop, mocap, hand pose, exocentric) and physical AI this week, plus LLM data when there is real news, and propose 3-5 blog topics for Tbrain, each with a defensible Tbrain angle and sources. Use for the weekly Monday run, for /topics, or when asked for blog ideas.
version: 1.1.0
metadata:
  hermes:
    tags: [content, research, tbrain]
    category: tbrain
---

# Tbrain topic scout

Goal: propose blog topics that a robotics or ML lead would actually click on, which Tbrain has the standing to write about, and which aren't already on tbrain.ai.

## Steps

1. **Know what's already published.** Call `mcp_tbrain_cms_list_posts` with `status=all` and `limit=300`. Keep the titles and tags in mind; don't propose anything that substantially repeats an existing post. A fresh angle on an old theme is fine if you say why it's different.

2. **Scan the sources** in `references/sources.md`. Cover the last ~14 days and look for:
   - papers, releases or datasets that change how teams collect, label or evaluate data;
   - numbers people are arguing about (data scaling, cost per hour of demos, sim vs real);
   - recurring questions practitioners ask (on Reddit, HN, or X threads quoted in articles).

   Open the primary source, not just the news write-up. Note the URL, title, publisher and date.

3. **Filter for the reader, not for us.** A topic qualifies if a robotics or ML data lead would click it and finish it: a paper or dataset worth understanding, a question several sources answer differently, a direction the field is taking, a problem buyers hit. Tbrain doesn't need to be the subject. Our standing matters for `field_story`, `proof`, `news_hook` and `buyer_guide`; for `deep_dive`, `synthesis` and `trend_pov` it's enough that the topic touches the data our readers buy (egocentric, game, teleop, mocap, hand pose, exocentric, and LLM data when there's real news).
   Read `tbrain-knowledge.md` §12 (`skill_view tbrain-write-post references/tbrain-knowledge.md`) for priorities: about 80% robotics data, rotate across the data lines, favour lines with no post yet. Use `robotics-data-trends.md` (this skill's references) for the landscape and open questions.
   Drop pure news recaps, funding news, hype, and anything requiring claims about named customers.

4. **Give each candidate a post type and funnel stage** from `post-types.md` (`skill_view tbrain-write-post references/post-types.md`): `deep_dive` (one source worth taking apart), `synthesis` (several sources, one question), `by_the_numbers` (a question public data on the Hugging Face Hub or arXiv can answer: try a quick `mcp_tbrain_cms_hf_hub_query` to see the numbers are there), `trend_pov` (where it's heading, with a prediction), `field_story`, `buyer_guide`, `proof` or `news_hook`; funnel `top` (awareness), `middle` (evaluating approaches) or `bottom` (choosing a vendor/spec). Check `mcp_tbrain_cms_search_knowledge` (kind story/fact): an approved story that hasn't been used yet is a strong `field_story`.
   Keep the shortlist mixed: at least two source-driven topics (`deep_dive` / `synthesis`), at most one `news_hook`, and at most one topic centred on our own work. Check `list_posts`: don't propose the type and data line of the last two posts again.
   Each week include at least one `by_the_numbers` topic or a `deep_dive` with an official demo video or a reusable (CC BY) figure.
   For each topic note the **wow asset** (the visual or number that will make people forward it: a demo video, a licensed figure, a count nobody has done) and the 2-4 primary sources it would be built from and, for papers, whether their figures are reusable (`mcp_tbrain_cms_source_license`).
   **Score** each from 1 to 5 on timeliness, reader value, depth available in the sources, and search/share potential. Keep the top 3-5.

5. **Save the shortlist** with `mcp_tbrain_cms_save_topics`: `topics: [{title, why_now, angle, keyword, audience, data_line, post_type, funnel, sources:[https urls], score}]` in final order (`data_line` is one of egocentric, game, teleop, mocap, hand pose, exocentric, LLM data). Pass `request_id` when this run is a queued scout job. It returns each topic's number `seq`. **Number the topics in your message with those `#seq` values**, never 1, 2, 3: "viết #12" in chat and the "Write" button in the admin both refer to them. The ideas show up in the admin at /admin/content/agent.

6. **Report in Vietnamese**, using the format below. Keep it scannable. No walls of text.

```
📌 Đề xuất blog tuần <dd/mm>

#<seq> <Working title in English>
   • Kiểu bài: <Deep dive / Tổng hợp / Số liệu tự phân tích / Xu hướng / Field story / Buyer guide / Proof / News>
   • Vì sao bây giờ: <1 câu, có nguồn>
   • Góc nhìn riêng: <so sánh/biểu đồ/hạn chế mà các nguồn chưa nói, hoặc câu chuyện của team>
   • Điểm wow: <video demo / figure CC BY / con số tự đếm …>
   • Người đọc / từ khoá: <persona> · "<keyword>"
   • Nguồn: <url1>, <url2>
   • Điểm: <tổng>/20

#<seq> …

Chị chọn bài nào thì nhắn "viết #<seq>" (thêm ghi chú nếu muốn), hoặc bấm "Write this" ở https://www.tbrain.ai/admin/content/agent. Em viết ở chế độ nền và gửi link duyệt khi xong.
```

**Stop here.** Don't use clarify, and don't start writing in this run: scheduled runs have nobody to answer, and the topic is chị Tâm's call. When she replies later ("viết #12", or her own idea), queue it with `mcp_tbrain_cms_queue_request` as the SOUL describes.

## Quality bar
- "Vì sao bây giờ" must rest on a primary source (paper, official announcement, benchmark site). Aggregator or SEO blogs may supplement it but never carry it alone.
- Write clean Vietnamese with normal spaces: no `snake_case` words, no stray words from other languages or scripts. Proofread the message once before sending.
- Each topic needs at least 2 real, opened sources, and at least one should be primary (a paper, official blog or dataset card).
- Titles must be specific. Prefer "How many teleop hours does a VLA actually need? What 2026 papers show" over "The Future of Robot Learning".
- Mix it up: at least 3 of the topics should be robotics data, spanning at least 2 different data lines (e.g. one teleop, one game data). At most 1 LLM-data topic, and only with real news. At least 2 source-driven topics, at most 1 about our own work.
