#!/usr/bin/env node
/**
 * Seed the local Supabase `tbrain_landing.cms_posts` table with the four
 * rich Physical-AI foundry blog posts defined in scripts/blog-drafts-content.mjs.
 *
 * Idempotent — upserts on `slug`. Safe to re-run.
 *
 * Usage:
 *   node scripts/seed-blog-drafts.mjs
 *
 * Writes full rows: content_html (rich HTML the render path injects directly),
 * cover_image_url, og_image_url, seo_title, seo_description, tags, category.
 * Local dev DB only — prod tbrain.ai is never written from here.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { BLOG_DRAFTS } from "./blog-drafts-content.mjs";

/* Load env from .env.development.local (dev DB) then fall back to .env.local. */
function loadEnv(file) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (process.env[k] === undefined) process.env[k] = v.replace(/^"|"$/g, "");
  }
}
loadEnv(".env.development.local");
loadEnv(".env.local");

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "tbrain_landing" },
});

// Strip tags → plain text. Stored in content_md so the render path's reading-time
// calc (which counts words in content_md) is accurate. content_html still wins
// for rendering (content_html || content_md).
function toPlainText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

const now = new Date().toISOString();
const rows = BLOG_DRAFTS.map((d, i) => ({
  slug: d.slug,
  title: d.title,
  excerpt: d.excerpt,
  content_html: d.content_html,
  content_md: toPlainText(d.content_html),
  cover_image_url: d.cover_image_url,
  og_image_url: d.og_image_url ?? d.cover_image_url,
  seo_title: d.seo_title ?? d.title,
  seo_description: d.seo_description ?? d.excerpt,
  category: d.category ?? "Physical AI",
  tags: d.tags ?? [],
  author_name: d.author_name ?? "Tbrain Research",
  status: "published",
  word_count: wordCount(toPlainText(d.content_html)),
  // Stagger by one hour each so ordering is deterministic on the index page.
  published_at: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  updated_at: now,
}));

console.log(`Seeding ${rows.length} posts to ${url}/rest/v1/cms_posts …`);
const { data, error } = await db
  .from("cms_posts")
  .upsert(rows, { onConflict: "slug" })
  .select("slug, title, status, word_count");

if (error) {
  console.error("Insert failed:", error);
  process.exit(1);
}
for (const r of data ?? []) {
  console.log(`  ✓ ${r.status.padEnd(9)} ${String(r.word_count).padStart(4)}w  ${r.slug} — ${r.title}`);
}
console.log("Done.");
