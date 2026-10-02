#!/usr/bin/env bash
# Seed Hermes state for the Tbrain content agent, start it, and register the
# weekly cron jobs. Safe to re-run: config/SOUL are refreshed from the repo,
# cron jobs are only created when missing.
set -euo pipefail
cd "$(dirname "$0")"

DATA_DIR="${HERMES_DATA_DIR:-/data/tbrain-content-agent/hermes}"
UID_="${HERMES_UID:-10000}"
GID_="${HERMES_GID:-10000}"

[ -f .env ] || { echo "Missing agents/content/.env (copy .env.example)"; exit 1; }
for v in GLM_API_KEY CONTENT_AGENT_TOKEN TBRAIN_API_BASE; do
  grep -q "^$v=." .env || { echo "Missing $v in .env"; exit 1; }
done

mkdir -p "$DATA_DIR/uploads"
cp hermes/config.yaml "$DATA_DIR/config.yaml"
cp hermes/SOUL.md "$DATA_DIR/SOUL.md"
chown -R "$UID_:$GID_" "$DATA_DIR"
chmod 700 "$DATA_DIR"

docker compose up -d
echo "Waiting for gateway..."
sleep 15

hermes() { docker exec tbrain-content-agent hermes "$@"; }

if ! grep -q "^TELEGRAM_BOT_TOKEN=." .env; then
  echo "TELEGRAM_BOT_TOKEN not set: skipping cron jobs (they deliver to Telegram)."
  exit 0
fi

existing="$(hermes cron list 2>/dev/null || true)"

if ! grep -q "tbrain-weekly-topics" <<<"$existing"; then
  hermes cron create "every monday at 9am" \
    "Run the weekly topic scouting for the Tbrain blog and send the shortlist to chị Tâm." \
    --skill tbrain-topic-scout --name tbrain-weekly-topics --deliver telegram
fi

if ! grep -q "tbrain-review-nudge" <<<"$existing"; then
  hermes cron create "every thursday at 10am" \
    "Check Tbrain blog drafts awaiting review (mcp_tbrain_cms_list_posts status=draft, then get_post for reviews). For drafts rejected with a note, revise them with tbrain-revise-post and resubmit. For drafts pending more than 3 days, send chị Tâm a short Vietnamese reminder with the review links. If nothing is pending and no post went out this week, say so in one line. Never publish." \
    --skill tbrain-revise-post --name tbrain-review-nudge --deliver telegram
fi

hermes cron list
