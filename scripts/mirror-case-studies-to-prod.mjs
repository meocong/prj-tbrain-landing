#!/usr/bin/env node
/**
 * Mirror the LOCAL case-study set onto PROD so the /casestudy listing matches
 * local. Reads the 4 refreshed rows from the LOCAL dev DB, attaches the enriched
 * extended_content from case-study-thin-content.mjs, upserts them into PROD, then
 * deactivates the superseded legacy rows. robotics-mocap already lives on prod.
 *
 * - PROD after run (is_active=true): terminal-bench, robotics-mocap,
 *   multimodal-annotation, enterprise-ai-agents, video-game-pipeline (mirrors local).
 * - Deactivated (is_active=false, kept for rollback): agent-evaluation,
 *   manufacturing, scalable-multimodal.
 *
 * Backs up full PROD case_studies to scripts/.cs-prod-backup-<ts>.json first.
 * Env: LOCAL from .env.development.local, PROD from .env.local.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { ENRICH_THIN } from "./case-study-thin-content.mjs";

function readEnv(file) {
  const p = path.resolve(process.cwd(), file);
  const out = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const local = readEnv(".env.development.local");
const prod = readEnv(".env.local");

const localUrl = local.SUPABASE_URL || local.NEXT_PUBLIC_SUPABASE_URL;
const prodUrl = prod.SUPABASE_URL || prod.NEXT_PUBLIC_SUPABASE_URL;
if (!/127\.0\.0\.1|localhost/.test(localUrl)) { console.error("LOCAL url not local:", localUrl); process.exit(1); }
if (/127\.0\.0\.1|localhost/.test(prodUrl)) { console.error("PROD url looks local:", prodUrl); process.exit(1); }

const localDb = createClient(localUrl, local.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, db: { schema: "tbrain_landing" } });
const prodDb = createClient(prodUrl, prod.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, db: { schema: "tbrain_landing" } });

const MIRROR_SLUGS = ["terminal-bench", "multimodal-annotation", "enterprise-ai-agents", "video-game-pipeline"];
const DEACTIVATE = ["agent-evaluation", "manufacturing", "scalable-multimodal"];
const ROBOTICS_ORDER = 20; // match local ordering

// 1 · backup prod
const { data: prodBefore } = await prodDb.from("case_studies").select("*");
const ts = process.env.TS || "manual";
fs.writeFileSync(`scripts/.cs-prod-backup-${ts}.json`, JSON.stringify(prodBefore, null, 2));
console.log(`backup: ${prodBefore.length} prod rows -> scripts/.cs-prod-backup-${ts}.json`);
console.log("PROD:", prodUrl);

// 2 · pull the 4 refreshed rows from local, attach enriched content, upsert to prod
const cols = "slug,title,short_description,description,image_url,industry,metrics,display_order";
const { data: localRows, error: le } = await localDb.from("case_studies").select(cols).in("slug", MIRROR_SLUGS);
if (le) { console.error("local read failed:", le.message); process.exit(1); }

for (const row of localRows) {
  const payload = { ...row, extended_content: ENRICH_THIN[row.slug], is_active: true };
  const { error } = await prodDb.from("case_studies").upsert(payload, { onConflict: "slug" });
  console.log(error ? `FAIL ${row.slug}: ${error.message}` : `upsert OK  ${row.slug} · order=${row.display_order} · ${ENRICH_THIN[row.slug].length} chars`);
}

// 3 · reorder robotics-mocap to match local
{
  const { error } = await prodDb.from("case_studies").update({ display_order: ROBOTICS_ORDER, is_active: true }).eq("slug", "robotics-mocap");
  console.log(error ? `FAIL robotics-mocap order: ${error.message}` : `robotics-mocap -> order=${ROBOTICS_ORDER}`);
}

// 4 · deactivate legacy duplicates
{
  const { error } = await prodDb.from("case_studies").update({ is_active: false }).in("slug", DEACTIVATE);
  console.log(error ? `FAIL deactivate: ${error.message}` : `deactivated: ${DEACTIVATE.join(", ")}`);
}

// 5 · verify active listing
const { data: active } = await prodDb.from("case_studies").select("slug,display_order,is_active").eq("is_active", true).order("display_order");
console.log("\nPROD active listing now:");
for (const c of active) console.log(`  order=${c.display_order}  ${c.slug}`);
