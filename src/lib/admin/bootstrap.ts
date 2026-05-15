import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

function parseAllowlist(): Set<string> {
  const raw = process.env.ADMIN_BOOTSTRAP_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function ensureBootstrapAdmin(
  email: string | null | undefined,
  fullName?: string | null,
  avatarUrl?: string | null
): Promise<{ ok: boolean; reason?: string }> {
  if (!email) return { ok: false, reason: "no_email" };

  const normalized = email.toLowerCase();
  const allow = parseAllowlist();
  if (!allow.has(normalized)) return { ok: false, reason: "not_allowlisted" };

  try {
    const db = supabaseAdmin();

    const { data: role, error: roleErr } = await db
      .from("roles")
      .select("id")
      .eq("code", "super_admin")
      .maybeSingle();

    if (roleErr || !role) {
      console.error("[bootstrap] super_admin role not found:", roleErr?.message);
      return { ok: false, reason: "role_missing" };
    }

    const nowIso = new Date().toISOString();
    const { error: upsertErr } = await db.from("admin_users").upsert(
      {
        email: normalized,
        full_name: fullName ?? null,
        avatar_url: avatarUrl ?? null,
        role_id: role.id,
        is_active: true,
        last_login_at: nowIso,
        updated_at: nowIso,
      },
      { onConflict: "email" }
    );

    if (upsertErr) {
      console.error("[bootstrap] upsert failed:", upsertErr.message);
      return { ok: false, reason: "upsert_failed" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[bootstrap] unexpected:", err);
    return { ok: false, reason: "exception" };
  }
}
