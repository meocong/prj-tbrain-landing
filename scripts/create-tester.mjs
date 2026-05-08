/**
 * Create a tester admin account on the prod Supabase.
 *
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the deployment .env,
 * provisions an auth.users row with a generated password (or one passed via
 * TESTER_PASSWORD), then upserts admin_users with the 'admin' role
 * (= full access except user management — safer than super_admin).
 *
 * Usage:
 *   TESTER_EMAIL=tester@tbrain.ai TESTER_PASSWORD=mypw node scripts/create-tester.mjs
 *   # password optional — script generates one if missing
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { randomBytes } from "crypto";

const ENV_FILE = "/root/tbrain/prj-tbrain-landing-deployment/.env";
const TESTER_EMAIL = process.env.TESTER_EMAIL ?? "tester@tbrain.ai";
const TESTER_ROLE = process.env.TESTER_ROLE ?? "admin";
const TESTER_PASSWORD =
  process.env.TESTER_PASSWORD ?? `Tb${randomBytes(9).toString("base64url")}!`;

const env = Object.fromEntries(
  readFileSync(ENV_FILE, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
    })
);

const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supa = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "tbrain_landing" },
});

// 1. Ensure auth user exists (or create with password)
console.log(`\n▸ Looking up auth.users row for ${TESTER_EMAIL}…`);
const { data: list, error: listErr } = await supa.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listErr) {
  console.error("auth.admin.listUsers failed:", listErr.message);
  process.exit(1);
}
let user = list.users.find((u) => (u.email ?? "").toLowerCase() === TESTER_EMAIL.toLowerCase());

if (user) {
  console.log(`✓ Auth user already exists id=${user.id} — updating password…`);
  const { error: updErr } = await supa.auth.admin.updateUserById(user.id, {
    password: TESTER_PASSWORD,
    email_confirm: true,
  });
  if (updErr) {
    console.error("updateUserById failed:", updErr.message);
    process.exit(1);
  }
} else {
  console.log(`▸ No auth user yet — creating with password…`);
  const { data: created, error: createErr } = await supa.auth.admin.createUser({
    email: TESTER_EMAIL,
    password: TESTER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Tbrain Tester" },
  });
  if (createErr || !created.user) {
    console.error("createUser failed:", createErr?.message);
    process.exit(1);
  }
  user = created.user;
  console.log(`✓ Created auth user id=${user.id}`);
}

// 2. Resolve role id
console.log(`\n▸ Resolving '${TESTER_ROLE}' role id…`);
const { data: role, error: roleErr } = await admin
  .from("roles")
  .select("id")
  .eq("code", TESTER_ROLE)
  .single();
if (roleErr || !role) {
  console.error(`Could not find '${TESTER_ROLE}' role:`, roleErr?.message);
  process.exit(1);
}
console.log(`✓ Role id=${role.id}`);

// 3. Upsert admin_users row
console.log(`\n▸ Upserting admin_users row…`);
const { error: upsertErr } = await admin
  .from("admin_users")
  .upsert(
    {
      user_id: user.id,
      email: user.email,
      role_id: role.id,
      is_active: true,
      full_name: "Tbrain Tester",
      avatar_url: null,
    },
    { onConflict: "user_id" }
  );
if (upsertErr) {
  console.error("Upsert failed:", upsertErr.message);
  process.exit(1);
}
console.log(`✓ Upsert OK`);

// 4. Verify
const { data: verify, error: verifyErr } = await admin
  .from("admin_users")
  .select("email, is_active, full_name, role:roles(code, name)")
  .eq("user_id", user.id)
  .single();
if (verifyErr) {
  console.error("Verify failed:", verifyErr.message);
  process.exit(1);
}

console.log("\n========================================");
console.log("  TESTER ACCOUNT READY");
console.log("========================================");
console.log(`  URL:      https://prj-tbrain-landing.vercel.app/admin/login`);
console.log(`            https://tbrain.ai/admin/login (after prod cutover)`);
console.log(`  Email:    ${TESTER_EMAIL}`);
console.log(`  Password: ${TESTER_PASSWORD}`);
console.log(`  Role:     ${verify.role?.code}  (${verify.role?.name})`);
console.log(`  Active:   ${verify.is_active}`);
console.log("========================================");
console.log("Sign in via 'Email + Password' (NOT Google OAuth).");
