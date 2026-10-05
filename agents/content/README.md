# Tbrain content agent (Hermes)

An AI editor that researches what's moving in physical AI and LLM training data, proposes blog topics to chị Tâm on Telegram, and writes researched drafts. It submits them for **human review in the admin**. It can't publish. A human approving in `/admin/approvals` (or pressing Publish in the editor) is the only way a post goes live, and the database enforces this (`cms_posts_review_guard`, migration 023).

```
Telegram (chị Tâm, Viet) ⇄ Hermes gateway (Docker, this server)
                             ├ model: Z.ai GLM (Coding Plan) — GLM_API_KEY (+_2 failover)
                             ├ skills/: tbrain-topic-scout · tbrain-write-post (+ tbrain-knowledge.md) · tbrain-revise-post · tbrain-admin-request
                             ├ memory: brand preferences learned from feedback
                             ├ cron: Mon 09:00 topics · Thu 10:00 review nudge · every 2m admin queue (Asia/Ho_Chi_Minh)
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

Chat controls (mention the bot in the group, or DM it): "viết #12 …", `/draft <idea>` or "viết bài về …", "sửa bài <title>: …", `/ideas`, `/jobs`, `/scout`. Avoid `/status`, `/pause`, `/resume`, `/topic`, `/queue`: those are Hermes built-ins.

## From the admin editor
The post editor (`/admin/content/new` and `/admin/content/<id>`) has an **AI panel** with two tabs:
- **AI assist** (instant, GLM through `src/lib/ai/provider.ts`): select a passage, then Rewrite / Shorten / Expand / Fix grammar, preview it, and Replace. "Generate SEO" fills in the SEO title, description, excerpt, tags and slug.
- **Content agent** (asynchronous): "Ask agent to write a draft" on a new post, or "Ask agent to revise" on a draft. This queues a job in `cms_agent_requests`.
  - The `tbrain-admin-queue` cron polls every 2 minutes through `scripts/poll_queue.py`. That script costs no LLM call when the queue is empty.
  - The agent claims the job, works it with the `tbrain-admin-request` skill, and the panel shows queued → running → done, with a link to the draft.
  - Results still go through Approvals.
  - The agent may revise a human-written draft **only** while an admin's revise job for that post is running.

## Setup
1. **Telegram bot**: create it with @BotFather and copy the token. Get each person's numeric user ID, e.g. by messaging @userinfobot.
2. **Shared secret**: `openssl rand -hex 32`. Put it in both
   - the Vercel project env as `CONTENT_AGENT_TOKEN` (Production), then redeploy, and
   - `agents/content/.env` as `CONTENT_AGENT_TOKEN`.
3. **Fill in `.env`** from `.env.example`:
   - GLM keys and the Telegram token;
   - `TELEGRAM_ALLOWED_USERS=<tâm_id>,<viet_id>` for DMs;
   - for a team group: `TELEGRAM_GROUP_ALLOWED_CHATS=<group id>` and `TELEGRAM_HOME_CHANNEL=<group id>`. Group ids are negative. Message the group, then read them with `getUpdates`.

   With BotFather privacy mode on (the default), the bot in a group only sees `/commands`, @mentions and replies to its own messages. Turn it off with `/setprivacy` → Disable, then re-add the bot to the group, if people should be able to talk to it freely.
4. **Database**: apply `supabase/migrations/023_content_agent.sql` and `024_agent_requests.sql` to production **before** deploying the web changes. The admin pages write the new columns and the queue table.
5. **Start it**: `./setup.sh`. This seeds `config.yaml` and `SOUL.md` into `/data/tbrain-content-agent/hermes`, starts the container, and registers the three cron jobs (weekly topics, review nudge, admin queue).
6. **Check it**: `docker exec tbrain-content-agent hermes mcp test tbrain_cms` should show 13 tools. Then DM the bot `/jobs`.

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
  - It can create and edit **its own drafts**, queue them for review, store social copy, upload images, and claim and finish admin jobs.
  - It can edit a human's draft only while an admin's revise job for that post is running. It can never edit a published post.
  - It has no publish route and no Supabase key. HTML is sanitized server-side.
- Terminal, file, image-gen and TTS toolsets are disabled. The agent works only through web research and the CMS tools.
- Only the allowlisted Telegram user IDs, and the allowlisted group, can talk to it.
- Publishing needs `content.publish` or `approvals.approve`. The database enforces this for every admin, since migration 024.
- To rotate the token, change it in Vercel and `.env`, redeploy, then `docker compose up -d`.

## Later
- **Auto-posting to social**: the `cms_post_social` rows are ready for Buffer's API (LinkedIn Page / Facebook Page / X) or the native APIs (LinkedIn Community Management needs app review; Meta Graph needs `pages_manage_posts`).
- **Cloudflare**: move the agent to a Cloudflare Container, or port the pipeline to the Agents SDK. The landing API doesn't change.
