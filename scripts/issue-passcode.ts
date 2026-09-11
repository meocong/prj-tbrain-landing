/**
 * Manually issue a passcode.
 *
 * For a specific client (requires client email + batch):
 *   yarn issue:passcode --email client@acme.com --batch april-2026 --days 30
 *
 * For a shared batch demo code (not tied to a client):
 *   yarn issue:passcode --batch april-2026 --batch-label demo-tam --days 30
 *
 * For the sample library, whose batches live under a different project:
 *   yarn issue:passcode --project samples --batch library \
 *     --batch-label centific --code CENTIFIC --days 14 --max-uses 50
 *
 * `--project` exists because the batch lookup was pinned to `terminal-bench`,
 * so there was no way to issue a code for `/samples` at all — the route reads
 * `project = 'samples'` and nothing could write a row it would match.
 *
 * `--code` sets the passcode instead of generating one. Sales hand out words
 * customers can hear over a call. Read the warning it prints before using it:
 * a chosen word is not a generated one, and the security argument in `auth.ts`
 * is about generated ones.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import {
  generatePasscode,
  hashPasscode,
  normalizePasscode,
  passcodePrefix,
} from "../src/lib/terminal-bench/auth";
import { supabaseAdmin } from "../src/lib/terminal-bench/supabase/admin";

interface Args {
  email?: string;
  batch: string;
  batchLabel?: string;
  days: number;
  project: string;
  code?: string;
  maxUses?: number;
}

function parseArgs(): Args {
  const out: Partial<Args> = { days: 30, project: "terminal-bench" };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email") out.email = argv[++i];
    else if (a === "--batch") out.batch = argv[++i];
    else if (a === "--batch-label") out.batchLabel = argv[++i];
    else if (a === "--days") out.days = Number(argv[++i]);
    else if (a === "--project") out.project = argv[++i];
    else if (a === "--code") out.code = argv[++i];
    else if (a === "--max-uses") out.maxUses = Number(argv[++i]);
  }
  if (!out.batch) {
    console.error(
      "Usage: --batch <slug> [--email <email> | --batch-label <label>] " +
        "[--project <slug>] [--code <CODE>] [--days N] [--max-uses N]",
    );
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
    .select("id, slug, name, product_id")
    .eq("project", args.project)
    .eq("slug", args.batch)
    .single();
  if (!batch) throw new Error(`Batch ${args.batch} not found in project ${args.project}`);

  /* A chosen code, or a generated one.
     `auth.ts` justifies the scheme with "~40 bits of entropy; combined with
     bcrypt(12) and Cloudflare rate-limit this is not brute-forceable." That
     argument covers `generatePasscode()`. It does not cover a dictionary word:
     a guesser does not enumerate the keyspace, they try the ten words anybody
     would pick. So the warning is loud, and `--max-uses` and a short `--days`
     are the controls that actually bound the damage. */
  const passcode = args.code ? normalizePasscode(args.code) : generatePasscode();
  if (args.code) {
    console.warn(
      `\n  WARNING  "${passcode}" is a chosen code, not a generated one.\n` +
        `           It is guessable in a way TB-XXXX-XXXX is not.\n` +
        `           Set --max-uses and a short --days, and revoke it after the deal.\n`,
    );
  }
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
    const { error: bpErr } = await db.from("passcodes").insert({
      batch_id: batch.id,
      product_id: batch.product_id,
      label: args.batchLabel,
      passcode_hash: hash,
      passcode_prefix: prefix,
      expires_at: expiresAt,
      ...(args.maxUses != null ? { max_uses: args.maxUses } : {}),
    });
    if (bpErr) throw bpErr;

    console.log(`\nShared batch passcode issued.`);
    console.log(`  project: ${args.project}`);
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
