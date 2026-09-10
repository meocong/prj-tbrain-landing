#!/usr/bin/env node
/**
 * Mirror published blog posts (`tbrain_landing.cms_posts` where status='published')
 * from the PROD Supabase project to the LOCAL Supabase dev DB.
 *
 * Read-only against prod (SELECT), write to local (UPSERT on slug).
 *
 * Usage:
 *   node scripts/mirror-prod-blog.mjs
 *
 * Env layout:
 *   .env.local                 → PROD Supabase creds (source, read-only)
 *   .env.development.local     → LOCAL Supabase creds (target, write)
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function parseEnvFile(file) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const prod = parseEnvFile(".env.local");
const local = parseEnvFile(".env.development.local");

const prodUrl = prod.SUPABASE_URL ?? prod.NEXT_PUBLIC_SUPABASE_URL;
const prodKey = prod.SUPABASE_SERVICE_ROLE_KEY;
const localUrl = local.SUPABASE_URL ?? local.NEXT_PUBLIC_SUPABASE_URL;
const localKey = local.SUPABASE_SERVICE_ROLE_KEY;

if (!prodUrl || !prodKey) { console.error("Missing prod creds in .env.local"); process.exit(1); }
if (!localUrl || !localKey) { console.error("Missing local creds in .env.development.local"); process.exit(1); }
if (prodUrl === localUrl) { console.error("Refusing: prod URL == local URL."); process.exit(1); }

const src = createClient(prodUrl, prodKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "tbrain_landing" },
});
const dst = createClient(localUrl, localKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "tbrain_landing" },
});

console.log(`Fetching published posts from ${prodUrl} …`);
const { data: rows, error: readErr } = await src
  .from("cms_posts")
  .select("*")
  .eq("status", "published")
  .order("published_at", { ascending: false })
  .limit(200);

if (readErr) { console.error("Prod read failed:", readErr); process.exit(1); }
console.log(`Fetched ${rows?.length ?? 0} posts.`);

if (!rows?.length) { console.log("Nothing to mirror."); process.exit(0); }

// Drop `id` + `author_id` so local doesn't need matching admin_users rows.
const clean = rows.map(({ id, author_id, ...rest }) => rest);
const { data: wrote, error: writeErr } = await dst
  .from("cms_posts")
  .upsert(clean, { onConflict: "slug" })
  .select("slug, title, status");

if (writeErr) { console.error("Local write failed:", writeErr); process.exit(1); }
for (const r of wrote ?? []) console.log(`  ✓ ${r.status.padEnd(9)} ${r.slug} — ${r.title}`);
console.log(`Mirrored ${wrote?.length ?? 0} posts to local DB.`);
