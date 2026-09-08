/**
 * Manually issue a passcode.
 *
 * Per-client code (tied to an email, one live code per batch):
 *   pnpm issue:passcode --project samples --batch library --email vip@acme.com --days 30
 *
 * Shared code (hand the same string to a room, or to Tam before a call):
 *   pnpm issue:passcode --project samples --batch library --label vip-tam --days 30 --uses 5
 *
 * Terminal-bench is still the default project, so existing invocations work:
 *   pnpm issue:passcode --batch april-2026 --email client@acme.com
 *
 * Note on tables: migration 005 dropped `access_grants` and renamed
 * `batch_passcodes` to `passcodes`. Both kinds of code are rows in that one
 * table now — a per-client code simply has `client_id` set. This script wrote
 * to the two pre-005 tables until the sample library needed it, which meant it
 * had been failing against any migrated database.
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
  project: string;
  batch: string;
  email?: string;
  label?: string;
  days: number;
  uses?: number;
}

/** Where a holder of this code is meant to type it. */
const ENTER_PATH: Record<string, string> = {
  samples: "/samples/enter",
  "terminal-bench": "/data/terminal-bench/enter",
};

function parseArgs(): Args {
  const out: Partial<Args> = { days: 30, project: "terminal-bench" };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email") out.email = argv[++i];
    else if (a === "--project") out.project = argv[++i];
    else if (a === "--batch") out.batch = argv[++i];
    // --batch-label kept as an alias so older runbooks still work.
    else if (a === "--label" || a === "--batch-label") out.label = argv[++i];
    else if (a === "--days") out.days = Number(argv[++i]);
    else if (a === "--uses") out.uses = Number(argv[++i]);
  }
  if (!out.batch) {
    console.error(
      "Usage: --batch <slug> [--project <slug>] [--email <email> | --label <label>] [--days N] [--uses N]"
    );
    process.exit(1);
  }
  if (!out.email && !out.label) {
    console.error("Provide either --email (per-client code) or --label (shared code).");
    process.exit(1);
  }
  if (out.email && out.label) {
    console.error("Provide --email or --label, not both.");
    process.exit(1);
  }
  return out as Args;
}

async function main() {
  const args = parseArgs();
  const db = supabaseAdmin();

  const { data: batch, error: batchErr } = await db
    .from("batches")
    .select("id, slug, name, project")
    .eq("project", args.project)
    .eq("slug", args.batch)
    .maybeSingle();
  if (batchErr) throw batchErr;
  if (!batch) {
    throw new Error(
      `No batch ${args.project}/${args.batch}. For the sample library run migration 019 first.`
    );
  }

  const passcode = generatePasscode();
  const row = {
    batch_id: batch.id,
    passcode_hash: await hashPasscode(passcode),
    passcode_prefix: passcodePrefix(passcode),
    expires_at: new Date(Date.now() + args.days * 24 * 60 * 60 * 1000).toISOString(),
    max_uses: args.uses ?? null,
    use_count: 0,
    revoked_at: null,
    issued_at: new Date().toISOString(),
  };

  let clientId: string | null = null;
  if (args.email) {
    const { data: client, error } = await db
      .from("clients")
      .upsert({ email: args.email.toLowerCase() }, { onConflict: "email" })
      .select("id")
      .single();
    if (error || !client) throw error ?? new Error("client upsert failed");
    clientId = client.id;
  }

  // One live code per (client, batch). The uniqueness in the database is a
  // *partial* index (client_id IS NOT NULL), which PostgREST's onConflict
  // cannot express — so replace explicitly rather than upsert.
  if (clientId) {
    const { data: existing, error: findErr } = await db
      .from("passcodes")
      .select("id")
      .eq("client_id", clientId)
      .eq("batch_id", batch.id)
      .maybeSingle();
    if (findErr) throw findErr;

    if (existing) {
      const { error } = await db.from("passcodes").update(row).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await db.from("passcodes").insert({ ...row, client_id: clientId });
      if (error) throw error;
    }
  } else {
    const { error } = await db.from("passcodes").insert({ ...row, label: args.label });
    if (error) throw error;
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tbrain.ai";
  const enter = ENTER_PATH[batch.project] ?? "/";

  console.log(`\n${clientId ? "Per-client" : "Shared"} passcode issued.`);
  console.log(`  project : ${batch.project}`);
  console.log(`  batch   : ${batch.slug} (${batch.name})`);
  if (args.email) console.log(`  email   : ${args.email}`);
  if (args.label) console.log(`  label   : ${args.label}`);
  console.log(`  code    : ${passcode}`);
  console.log(`  uses    : ${args.uses ?? "unlimited"}`);
  console.log(`  until   : ${row.expires_at}`);
  console.log(`  enter   : ${base}${enter}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
