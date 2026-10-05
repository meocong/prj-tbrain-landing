#!/usr/bin/env python3
"""Emit SQL that loads seed/image-library.json into tbrain_landing.cms_agent_knowledge.

quality good -> approved, ok -> draft (a reviewer decides), avoid -> archived
(kept so the reason is visible). Idempotent: skips image_urls already present.
Run as service role:  python3 seed-image-library.py | psql ...
"""
import json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
items = json.load(open(os.path.join(here, "image-library.json")))
status = {"good": "approved", "ok": "draft", "avoid": "archived"}

def q(s):
    return "$q$" + str(s).replace("$q$", "") + "$q$"

print("BEGIN;")
for it in items:
    note = it.get("notes") or ""
    body = f"Seeded image. Notes: {note}" if note else "Seeded image."
    tags = "ARRAY[" + ",".join(q(t) for t in it.get("tags", [])) + "]::text[]"
    print(
        "INSERT INTO tbrain_landing.cms_agent_knowledge (kind, title, body, image_url, image_description, data_line, tags, status) "
        f"SELECT 'image', {q(it['title'][:200])}, {q(body)}, {q(it['image_url'])}, {q(it['image_description'][:1000])}, "
        f"{q(it.get('data_line') or 'general')}, {tags}, {q(status.get(it.get('quality'), 'draft'))} "
        f"WHERE NOT EXISTS (SELECT 1 FROM tbrain_landing.cms_agent_knowledge WHERE kind = 'image' AND image_url = {q(it['image_url'])});"
    )
print("COMMIT;")
