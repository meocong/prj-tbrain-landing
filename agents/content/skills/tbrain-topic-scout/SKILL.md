---
name: tbrain-topic-scout
description: Research what's moving in physical AI / robotics data / LLM training data this week and propose 3-5 blog topics for Tbrain, each with a defensible Tbrain angle and sources. Use for the weekly Monday run, for /topics, or when asked for blog ideas.
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

3. **Filter through Tbrain's standing.** A topic qualifies only if Tbrain can add something the news can't:
   - hands-on experience: capture packs, factory capture, QC rules, auto-labeling, LeRobot/RLDS delivery, RLHF/eval work, Terminal-Bench;
   - a practical checklist or decision framework buyers can use;
   - a clear explainer of a fast-moving concept for a buyer audience.

   Drop pure news recaps, hype, and anything requiring claims about named customers.

4. **Score each candidate** from 1 to 5 on four things: timeliness, buyer relevance (would a data buyer care?), Tbrain authority, and search/share potential. Keep the top 3-5.

5. **Save the shortlist to memory** as one entry: `Topic shortlist <YYYY-MM-DD>: 1) … 2) …`, with short titles and their key source URLs. That lets chị Tâm reply "viết số 2" later in chat. **Use exactly the same numbering and order as the message you send.** Finalize the order first, then save, then send. Replace any older shortlist entry rather than piling them up.

6. **Report in Vietnamese**, using the format below. Keep it scannable. No walls of text.

```
📌 Đề xuất blog tuần <dd/mm>

1) <Working title in English>
   • Vì sao bây giờ: <1 câu, có nguồn>
   • Góc nhìn Tbrain: <1 câu — cái mình nói được mà báo chí không nói được>
   • Người đọc / từ khoá: <persona> · "<keyword>"
   • Nguồn: <url1>, <url2>
   • Điểm: <tổng>/20

2) …

Chị chọn số nào để em viết (hoặc gửi ý tưởng khác nhé). Em sẽ gửi dàn ý trước khi viết bài đầy đủ.
```

**Stop here.** Don't use clarify, and don't start writing in this run: scheduled runs have nobody to answer, and the topic is chị Tâm's call. When she replies later ("viết số 2", or her own idea), look up the shortlist in memory and start `tbrain-write-post` at the brief step.

## Quality bar
- "Vì sao bây giờ" must rest on a primary source (paper, official announcement, benchmark site). Aggregator or SEO blogs may supplement it but never carry it alone.
- Write clean Vietnamese with normal spaces: no `snake_case` words, no stray words from other languages or scripts. Proofread the message once before sending.
- Each topic needs at least 2 real, opened sources, and at least one should be primary (a paper, official blog or dataset card).
- Titles must be specific. Prefer "How many teleop hours does a VLA actually need? What 2026 papers show" over "The Future of Robot Learning".
- Mix it up: ideally at least one physical-AI/robotics-data topic and one practical/how-to topic, and an LLM-data (RLHF/eval/coding) topic when there is real news.
