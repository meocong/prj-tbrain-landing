#!/usr/bin/env node
/* Update extended_content for the 3 enriched case studies. Backs up current
 * content to scripts/.cs-backup-<ts>.json before writing. Env from .env.local. */
import fs from "node:fs"; import path from "node:path"; import { createClient } from "@supabase/supabase-js";
import { ENRICH } from "./case-study-enrich-content.mjs";
function loadEnv(f){const p=path.resolve(process.cwd(),f);if(!fs.existsSync(p))return;for(const l of fs.readFileSync(p,"utf8").split("\n")){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^"|"$/g,"")}}
loadEnv(".env.local");
const url=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error("missing creds");process.exit(1)}
const db=createClient(url,key,{auth:{persistSession:false},db:{schema:"tbrain_landing"}});
const slugs=Object.keys(ENRICH);
const {data:cur}=await db.from("case_studies").select("slug,extended_content").in("slug",slugs);
const ts=process.env.TS||"manual";
fs.writeFileSync(`scripts/.cs-backup-${ts}.json`,JSON.stringify(cur,null,2));
console.log("backup written · target:",url);
for(const slug of slugs){
  const {error}=await db.from("case_studies").update({extended_content:ENRICH[slug]}).eq("slug",slug);
  console.log(error?`FAIL ${slug}: ${error.message}`:`OK ${slug} -> ${ENRICH[slug].length} chars`);
}
const {data:after}=await db.from("case_studies").select("slug,extended_content").in("slug",slugs);
console.log("verify:",after.map(a=>`${a.slug}:${(a.extended_content||"").length}`).join(" "));
