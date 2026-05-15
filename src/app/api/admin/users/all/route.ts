import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

type MergedRow = {
  auth_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  admin_id: string | null;
  role_code: string | null;          // 'super_admin' | 'admin' | null
  role_name: string | null;
  is_active: boolean | null;
  groups: Array<{ id: string; name: string }>;
};

export async function GET() {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin) return NextResponse.json({ error: "not_admin" }, { status: 403 });
  if (!hasPermission(admin, "users.view"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const db = supabaseAdmin();

  // Auth users (via admin auth API — no RLS on auth schema)
  const { data: authList, error: authErr } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) return NextResponse.json({ error: "auth_list_failed", detail: authErr.message }, { status: 500 });

  // Admin users with role
  const { data: admins } = await db
    .from("admin_users")
    .select("id, email, role_id, is_active, role:roles(code, name)");

  const adminByEmail = new Map<string, {
    id: string;
    email: string;
    is_active: boolean;
    role: { code: string; name: string } | null;
  }>();
  for (const a of (admins ?? []) as Array<{ id: string; email: string; is_active: boolean; role: unknown }>) {
    const role = Array.isArray(a.role) ? (a.role[0] as { code: string; name: string } | undefined) : (a.role as { code: string; name: string } | null);
    adminByEmail.set(a.email.toLowerCase(), {
      id: a.id,
      email: a.email,
      is_active: a.is_active,
      role: role ?? null,
    });
  }

  // Group memberships per admin_user
  const adminIds = Array.from(adminByEmail.values()).map((a) => a.id);
  const groupsByAdminId = new Map<string, Array<{ id: string; name: string }>>();
  if (adminIds.length > 0) {
    const { data: gm } = await db
      .from("group_members")
      .select("user_id, group:groups(id, name)")
      .in("user_id", adminIds);
    for (const row of (gm ?? []) as Array<{ user_id: string; group: unknown }>) {
      const group = Array.isArray(row.group) ? (row.group[0] as { id: string; name: string } | undefined) : (row.group as { id: string; name: string } | null);
      if (!group) continue;
      const arr = groupsByAdminId.get(row.user_id) ?? [];
      arr.push(group);
      groupsByAdminId.set(row.user_id, arr);
    }
  }

  const rows: MergedRow[] = [];
  for (const au of authList.users) {
    if (!au.email) continue;
    const am = adminByEmail.get(au.email.toLowerCase());
    rows.push({
      auth_id: au.id,
      email: au.email,
      full_name: ((au.user_metadata?.full_name ?? au.user_metadata?.name) as string) ?? null,
      avatar_url: ((au.user_metadata?.avatar_url ?? au.user_metadata?.picture) as string) ?? null,
      last_sign_in_at: au.last_sign_in_at ?? null,
      created_at: au.created_at,
      admin_id: am?.id ?? null,
      role_code: am?.role?.code ?? null,
      role_name: am?.role?.name ?? null,
      is_active: am?.is_active ?? null,
      groups: am ? groupsByAdminId.get(am.id) ?? [] : [],
    });
  }

  rows.sort((a, b) => {
    // Super admins first, then admins, then users; alphabetical within group
    const rank = (r: MergedRow) => (r.role_code === "super_admin" ? 0 : r.role_code === "admin" ? 1 : 2);
    const d = rank(a) - rank(b);
    return d !== 0 ? d : a.email.localeCompare(b.email);
  });

  return NextResponse.json({ ok: true, rows });
}

/** Promote an auth user to admin by email (super_admin role default unless specified) */
export async function POST(req: Request) {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin || !hasPermission(admin, "users.manage"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as
    | { email: string; role_code?: "admin" | "super_admin" }
    | null;
  if (!body?.email) return NextResponse.json({ error: "missing_email" }, { status: 400 });

  const db = supabaseAdmin();
  const roleCode = body.role_code ?? "admin";
  const { data: role } = await db.from("roles").select("id").eq("code", roleCode).maybeSingle();
  if (!role) return NextResponse.json({ error: "role_missing" }, { status: 500 });

  const { error } = await db
    .from("admin_users")
    .upsert(
      {
        email: body.email.toLowerCase(),
        role_id: role.id,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
  if (error) return NextResponse.json({ error: "upsert_failed", detail: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
