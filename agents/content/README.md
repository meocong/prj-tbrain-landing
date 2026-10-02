# Tbrain content agent (Hermes)

An AI editor that researches what's moving in physical AI and LLM training data, proposes blog topics to chị Tâm on Telegram, and writes researched drafts. It submits them for **human review in the admin**. It can't publish. A human approving in `/admin/approvals` (or pressing Publish in the editor) is the only way a post goes live, and the database enforces this (`cms_posts_review_guard`, migration 023).

```
Telegram (chị Tâm, Viet) ⇄ Hermes gateway (Docker, this server)
                             ├ model: Z.ai GLM (Coding Plan) — GLM_API_KEY (+_2 failover)
                             ├ skills/: tbrain-topic-scout · tbrain-write-post · tbrain-revise-post
                             ├ memory: brand preferences learned from feedback
                             ├ cron: Mon 09:00 topics · Thu 10:00 review nudge (Asia/Ho_Chi_Minh)
                             └ MCP tbrain_cms (mcp/tbrain-cms.mjs) ──HTTPS + bearer──▶ tbrain.ai /api/agent/*
                                                                                  drafts · review queue · social copy · images
Admin (tbrain.ai/admin)
  /admin/approvals?id=…        approve = publish (records reviewer) → blog revalidates immediately
  /admin/content/<id>          edit · Preview · Share panel (LinkedIn / Facebook / X, copy pre-written)
```

## Weekly loop
1. **Monday 09:00**: the agent scans papers, official blogs and news, checks what's already on the blog, and sends 3-5 scored topic ideas.
2. Chị Tâm replies, e.g. "viết số 2" or her own idea. The agent sends a **brief and outline** to approve first.
3. The agent researches, writes 1,200-2,000 words, has a **critic subagent** score it against `references/rubric.md` (rewriting if it scores under 4), and has a **fact-check subagent** open every link. It then saves the draft, submits it for review, and pre-writes the social copy.
4. Telegram gets a summary with any fact-check flags and the review link. Chị Tâm previews it, edits if needed, and approves.
5. After publishing, the Share panel on the post has LinkedIn / Facebook / X buttons with the copy ready.
6. **Thursday 10:00**: rejected drafts (with a note) get revised, and anything stale gets a reminder.

Chat controls: `/topics`, `/draft <idea>` or "viết bài về …", `/pause`, `/resume`, `/status`.

## Setup
1. **Telegram bot**: create it with @BotFather and copy the token. Get each person's numeric user ID, e.g. by messaging @userinfobot.
2. **Shared secret**: `openssl rand -hex 32`. Put it in both
   - the Vercel project env as `CONTENT_AGENT_TOKEN` (Production), then redeploy, and
   - `agents/content/.env` as `CONTENT_AGENT_TOKEN`.
3. **Fill in `.env`** from `.env.example`: GLM keys, the Telegram token, `TELEGRAM_ALLOWED_USERS=<tâm_id>,<viet_id>`, and `TELEGRAM_HOME_CHANNEL=<tâm_id>`.
4. **Database**: apply `supabase/migrations/023_content_agent.sql` to production **before** deploying the web changes. The admin pages write the new columns.
5. **Start it**: `./setup.sh`. This seeds `config.yaml` and `SOUL.md` into `/data/tbrain-content-agent/hermes`, starts the container, and registers both cron jobs.
6. **Check it**: `docker exec tbrain-content-agent hermes mcp test tbrain_cms` should show 7 tools. Then DM the bot `/status`.

## Operating
| Task | Command |
|---|---|
| Logs | `docker logs -f tbrain-content-agent` |
| Cron jobs | `docker exec tbrain-content-agent hermes cron list` (`pause` / `resume` / `run <id>`) |
| Edit voice / rules / rubric | edit `skills/tbrain-write-post/references/*.md`. They're mounted read-only and live immediately. |
| Change model / config | edit `hermes/config.yaml`, then `./setup.sh` (it re-copies and restarts) |
| Add a reviewer | add their ID to `TELEGRAM_ALLOWED_USERS`, then `docker compose up -d` |
| What it has learned | `/data/tbrain-content-agent/hermes/memories/` (MEMORY.md, USER.md) |
| Stop everything | `docker compose down`. Drafts stay in the CMS. |
| Upgrade Hermes | bump the pinned tag in `docker-compose.yml`, `docker compose pull && docker compose up -d`, then re-run the MCP check |

## Security
- The agent's only write access to the site is `CONTENT_AGENT_TOKEN`, scoped to `/api/agent/*`:
  - It can create and edit **its own drafts** (never human posts, never published posts), queue them for review, store social copy, and upload images.
  - It has no publish route and no Supabase key. HTML is sanitized server-side.
- Terminal, file, image-gen and TTS toolsets are disabled. The agent works only through web research and the CMS tools.
- Only the allowlisted Telegram user IDs can talk to it.
- To rotate the token, change it in Vercel and `.env`, redeploy, then `docker compose up -d`.

## Later
- **Auto-posting to social**: the `cms_post_social` rows are ready for Buffer's API (LinkedIn Page / Facebook Page / X) or the native APIs (LinkedIn Community Management needs app review; Meta Graph needs `pages_manage_posts`).
- **Cloudflare**: move the agent to a Cloudflare Container, or port the pipeline to the Agents SDK. The landing API doesn't change.
