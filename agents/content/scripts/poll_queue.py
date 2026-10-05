#!/usr/bin/env python3
"""Hermes cron pre-run gate for admin-queued jobs.

Runs every couple of minutes. Asks tbrain.ai whether anything is waiting in
cms_agent_requests; when nothing is, prints {"wakeAgent": false} so Hermes
skips the run entirely (no LLM call). Otherwise prints a one-line summary that
Hermes injects into the agent's prompt.
"""
import json
import os
import sys
import urllib.request

base = os.environ.get("TBRAIN_API_BASE", "https://www.tbrain.ai").rstrip("/")
token = os.environ.get("CONTENT_AGENT_TOKEN", "")

try:
    req = urllib.request.Request(
        f"{base}/api/agent/requests?peek=1",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=20) as res:
        pending = int(json.load(res).get("pending", 0))
except Exception as exc:  # network blip: stay quiet, try next tick
    print(f"queue check failed: {exc}", file=sys.stderr)
    print(json.dumps({"wakeAgent": False}))
    sys.exit(0)

if pending <= 0:
    print(json.dumps({"wakeAgent": False}))
else:
    print(f"{pending} content job(s) waiting in the tbrain.ai queue (from the admin or Telegram).")
