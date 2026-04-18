/**
 * Manually issue a passcode.
 *
 * For a specific client (requires client email + batch):
 *   yarn issue:passcode --email client@acme.com --batch april-2026 --days 30
 *
 * For a shared batch demo code (not tied to a client):
 *   yarn issue:passcode --batch april-2026 --batch-label demo-tam --days 30
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import {
  generatePasscode,
  hashPasscode,
  passcodePrefix,
} from "../src/lib/terminal-bench/auth";
import { supabaseAdmin } from "../src/lib/terminal-bench/supabase/admin";

interface Args {
  email?: string;
  batch: string;
  batchLabel?: string;
  days: number;
}

function parseArgs(): Args {
  const out: Partial<Args> = { days: 30 };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email") out.email = argv[++i];
    else if (a === "--batch") out.batch = argv[++i];
    else if (a === "--batch-label") out.batchLabel = argv[++i];
    else if (a === "--days") out.days = Number(argv[++i]);
  }
  if (!out.batch) {
    console.error("Usage: --batch <slug> [--email <email> | --batch-label <label>] [--days N]");
    process.exit(1);
  }
  if (!out.email && !out.batchLabel) {
    console.error("Provide either --email (per-user grant) or --batch-label (shared code).");
    process.exit(1);
  }
  return out as Args;
}

async function main() {
  const args = parseArgs();
  const db = supabaseAdmin();

  const { data: batch } = await db
    .from("batches")
    .select("id, slug, name")
    .eq("project", "terminal-bench")
    .eq("slug", args.batch)
    .single();
  if (!batch) throw new Error(`Batch ${args.batch} not found`);

  const passcode = generatePasscode();
  const prefix = passcodePrefix(passcode);
  const hash = await hashPasscode(passcode);
  const expiresAt = new Date(Date.now() + args.days * 24 * 60 * 60 * 1000).toISOString();

  if (args.email) {
    const { data: client, error } = await db
      .from("clients")
      .upsert({ email: args.email.toLowerCase() }, { onConflict: "email" })
      .select("id")
      .single();
    if (error || !client) throw error ?? new Error("client upsert failed");

    const { error: grantErr } = await db
      .from("access_grants")
      .upsert(
        {
          client_id: client.id,
          batch_id: batch.id,
          passcode_hash: hash,
          passcode_prefix: prefix,
          expires_at: expiresAt,
          use_count: 0,
          revoked_at: null,
          issued_at: new Date().toISOString(),
        },
        { onConflict: "client_id,batch_id" }
      );
    if (grantErr) throw grantErr;

    console.log(`\nPer-user passcode issued.`);
    console.log(`  batch : ${batch.slug} (${batch.name})`);
    console.log(`  email : ${args.email}`);
    console.log(`  code  : ${passcode}`);
    console.log(`  until : ${expiresAt}`);
  } else {
    const { error: bpErr } = await db.from("batch_passcodes").insert({
      batch_id: batch.id,
      label: args.batchLabel,
      passcode_hash: hash,
      passcode_prefix: prefix,
      expires_at: expiresAt,
    });
    if (bpErr) throw bpErr;

    console.log(`\nShared batch passcode issued.`);
    console.log(`  batch : ${batch.slug} (${batch.name})`);
    console.log(`  label : ${args.batchLabel}`);
    console.log(`  code  : ${passcode}`);
    console.log(`  until : ${expiresAt}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
