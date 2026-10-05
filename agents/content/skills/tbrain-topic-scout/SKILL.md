---
name: tbrain-topic-scout
description: Research what's moving in robotics training data (egocentric, game, teleop, mocap, hand pose, exocentric) and physical AI this week, plus LLM data when there is real news, and propose 3-5 blog topics for Tbrain, each with a defensible Tbrain angle and sources. Use for the weekly Monday run, for /topics, or when asked for blog ideas.
version: 1.0.0
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

3. **Filter through Tbrain's standing.** Read `tbrain-knowledge.md` from the `tbrain-write-post` skill (`skill_view tbrain-write-post references/tbrain-knowledge.md`) — specifically the service-line facts and the "open lanes" list (§12: LLM data/RLHF/SFT, Terminal-Bench & agent evaluation, coding/STEM data, multilingual data, Expert OS) — before judging fit. A topic qualifies only if Tbrain can add something the news can't:
   - hands-on experience: capture packs, factory capture, QC rules, auto-labeling, LeRobot/RLDS delivery, RLHF/eval work, Terminal-Bench;
   - a practical checklist or decision framework buyers can use;
   - a clear explainer of a fast-moving concept for a buyer audience.

   Follow the content priority in `tbrain-knowledge.md` §12: about 80% robotics data. Rotate across the data lines (egocentric, game, teleop, mocap, hand pose, exocentric) so the blog covers all of them, favoring lines with no post yet. Use `robotics-data-trends.md` (this skill's references) for the landscape and open questions, and `tbrain-samples.md` (`skill_view tbrain-write-post references/tbrain-samples.md`) for what Tbrain can show concretely. LLM-data topics only when the week has real news.

   Drop pure news recaps, hype, and anything requiring claims about named customers.

4. **Score each candidate** from 1 to 5 on four things: timeliness, buyer relevance (would a data buyer care?), Tbrain authority, and search/share potential. Keep the top 3-5.

5. **Save the shortlist** with `mcp_tbrain_cms_save_topics`: `topics: [{title, why_now, angle, keyword, audience, data_line, sources:[https urls], score}]` in final order (`data_line` is one of egocentric, game, teleop, mocap, hand pose, exocentric, LLM data). Pass `request_id` when this run is a queued scout job. It returns each topic's number `seq`. **Number the topics in your message with those `#seq` values**, never 1, 2, 3: "viết #12" in chat and the "Write" button in the admin both refer to them. The ideas show up in the admin at /admin/content/agent.

6. **Report in Vietnamese**, using the format below. Keep it scannable. No walls of text.

```
📌 Đề xuất blog tuần <dd/mm>

#<seq> <Working title in English>
   • Vì sao bây giờ: <1 câu, có nguồn>
   • Góc nhìn Tbrain: <1 câu — cái mình nói được mà báo chí không nói được>
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
- Mix it up: at least 3 of the topics should be robotics data, spanning at least 2 different data lines (e.g. one teleop, one game data). At most 1 LLM-data topic, and only with real news.
