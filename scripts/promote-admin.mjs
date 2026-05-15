import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const ENV_FILE = "/root/tbrain/prj-tbrain-landing-deployment/.env";
const TARGET_EMAIL = "vietanh951325@gmail.com";
const TARGET_ROLE = "super_admin";

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

console.log(`\n▸ Looking up auth.users row for ${TARGET_EMAIL}…`);
const { data: list, error: listErr } = await supa.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listErr) {
  console.error("auth.admin.listUsers failed:", listErr.message);
  process.exit(1);
}
const user = list.users.find((u) => (u.email ?? "").toLowerCase() === TARGET_EMAIL.toLowerCase());
if (!user) {
  console.log(`✗ ${TARGET_EMAIL} has NEVER signed in (no row in auth.users).`);
  console.log(`  → Ask them to open https://tbrain.ai/admin/login and click "Sign in with Google" first.`);
  console.log(`  → Then re-run this script.`);
  process.exit(0);
}
console.log(`✓ Found auth user id=${user.id}`);

console.log(`\n▸ Resolving '${TARGET_ROLE}' role id…`);
const { data: role, error: roleErr } = await admin
  .from("roles")
  .select("id")
  .eq("code", TARGET_ROLE)
  .single();
if (roleErr || !role) {
  console.error("Could not find super_admin role:", roleErr?.message);
  process.exit(1);
}
console.log(`✓ Role id=${role.id}`);

console.log(`\n▸ Upserting admin_users row…`);
const { error: upsertErr } = await admin
  .from("admin_users")
  .upsert(
    {
      user_id: user.id,
      email: user.email,
      role_id: role.id,
      is_active: true,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: "user_id" }
  );
if (upsertErr) {
  console.error("Upsert failed:", upsertErr.message);
  process.exit(1);
}
console.log(`✓ Upsert OK`);

console.log(`\n▸ Verifying…`);
const { data: verify, error: verifyErr } = await admin
  .from("admin_users")
  .select("email, is_active, role:roles(code, name)")
  .eq("user_id", user.id)
  .single();
if (verifyErr) {
  console.error("Verify failed:", verifyErr.message);
  process.exit(1);
}
console.log("\n=== RESULT ===");
console.log(JSON.stringify(verify, null, 2));
console.log(`\n✓ ${TARGET_EMAIL} is now ${verify.role?.code}. They can log in at /admin.`);
