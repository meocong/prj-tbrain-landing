/**
 * Manually issue a passcode.
 *
 * For a specific client (requires client email + batch):
 *   pnpm issue:passcode --email client@acme.com --batch april-2026 --days 30
 *
 * For a shared batch demo code (not tied to a client):
 *   pnpm issue:passcode --batch april-2026 --batch-label demo-tam --days 30
 *
 * For the sample library rather than the terminal-bench showcase:
 *   pnpm issue:passcode --project samples --batch library --batch-label vip-tam
 *
 * `--project` defaults to terminal-bench, which is every invocation this
 * script had before the sample library existed. Batches are namespaced by
 * project, so without the flag `--batch library` looks for a terminal-bench
 * batch called "library", finds nothing and exits "Batch library not found" —
 * which is what made the samples passcode route's own docs wrong about how to
 * issue one.
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

type Project = "terminal-bench" | "samples";

interface Args {
  email?: string;
  project: Project;
  batch: string;
  batchLabel?: string;
  days: number;
  /** Redemption cap for a shared code. `null` means unlimited. */
  uses: number | null;
  /** An explicit passcode instead of a generated one. */
  code?: string;
}

function parseArgs(): Args {
  const out: Partial<Args> = { days: 30, project: "terminal-bench", uses: null };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email") out.email = argv[++i];
    else if (a === "--project") out.project = argv[++i] as Project;
    else if (a === "--batch") out.batch = argv[++i];
    // `--label` is what the runbook has always written; `--batch-label` is what
    // this script has always parsed. Both, rather than breaking either.
    else if (a === "--batch-label" || a === "--label") out.batchLabel = argv[++i];
    else if (a === "--days") out.days = Number(argv[++i]);
    else if (a === "--uses") out.uses = Number(argv[++i]);
    else if (a === "--code") out.code = argv[++i];
  }
  if (out.project !== "terminal-bench" && out.project !== "samples") {
    console.error(`Unknown --project ${out.project}. Use terminal-bench or samples.`);
    process.exit(1);
  }
  if (!out.batch) {
    console.error(
      "Usage: --batch <slug> [--project terminal-bench|samples] [--email <email> | --batch-label <label>] [--days N]"
    );
    process.exit(1);
  }
  if (!out.email && !out.batchLabel) {
    console.error("Provide either --email (per-user grant) or --label (shared code).");
    process.exit(1);
  }
  if (out.uses != null && (!Number.isInteger(out.uses) || out.uses < 1)) {
    console.error("--uses must be a whole number of redemptions, 1 or more.");
    process.exit(1);
  }
  if (out.code != null) {
    /* Normalised before it is judged, because that is what the server will
       compare against: `normalizePasscode` upper-cases and folds I/L to 1 and
       O to 0. So `figure` and `FIGURE` are the same credential, and warning
       about the fold here beats a puzzled customer later. */
    const norm = normalizePasscode(out.code);
    if (norm.length < 3) {
      console.error("--code needs at least 3 characters.");
      process.exit(1);
    }
    if (!/^[A-Z0-9][A-Z0-9-]*$/.test(norm)) {
      console.error(`--code ${out.code} normalises to ${norm}, which the entry form will reject.`);
      console.error("Use letters, digits and dashes only.");
      process.exit(1);
    }
    if (norm !== out.code.trim().toUpperCase()) {
      console.warn(`Note: ${out.code.trim().toUpperCase()} is stored and typed as ${norm} (I/L->1, O->0).`);
    }
    out.code = norm;
  }
  if (out.uses != null && out.email) {
    // A per-client row is already one-per-(client,batch) and is reissued rather
    // than topped up, so a cap on it would only ever lock the client out early.
    console.error("--uses applies to shared codes only; drop --email or drop --uses.");
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

  const passcode = args.code ?? generatePasscode();
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

    /* `passcodes`, not `access_grants`.
       Migration 005 merged access_grants and batch_passcodes into `passcodes`
       and ends with `DROP TABLE IF EXISTS tbrain_landing.access_grants
       CASCADE`, so this branch has been writing to a table that does not
       exist since that migration ran — every `--email` invocation failed.
       Both auth routes read `passcodes` and nothing reads access_grants.

       The column set and conflict target are copied from the request-approval
       route, which is the same write from the admin side and is known to work
       against the live schema. `passcodes_client_batch_unique` from migration
       013 is what makes this onConflict resolvable; `product_id` comes along
       so a per-client row carries the same product as a shared one. */
    const { error: grantErr } = await db
      .from("passcodes")
      .upsert(
        {
          client_id: client.id,
          batch_id: batch.id,
          product_id: batch.product_id,
          passcode_hash: hash,
          passcode_prefix: prefix,
          expires_at: expiresAt,
          max_uses: null,
          use_count: 0,
          revoked_at: null,
          issued_at: new Date().toISOString(),
        },
        { onConflict: "client_id,batch_id" }
      );
    if (grantErr) throw grantErr;

    console.log(`\nPer-user passcode issued.`);
    console.log(`  project: ${args.project}`);
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
      max_uses: args.uses,
    });
    if (bpErr) throw bpErr;

    console.log(`\nShared batch passcode issued.`);
    console.log(`  project: ${args.project}`);
    console.log(`  batch : ${batch.slug} (${batch.name})`);
    console.log(`  label : ${args.batchLabel}`);
    console.log(`  uses  : ${args.uses ?? "unlimited"}`);
    console.log(`  code  : ${passcode}`);
    console.log(`  until : ${expiresAt}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
