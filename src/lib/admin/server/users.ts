import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export type MergedUserRow = {
  auth_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  admin_id: string | null;
  role_code: string | null;
  role_name: string | null;
  is_active: boolean | null;
  groups: Array<{ id: string; name: string }>;
};

export async function listAllUsers(): Promise<MergedUserRow[]> {
  const db = supabaseAdmin();
  const { data: authList } = await db.auth.admin.listUsers({ perPage: 1000 });
  const { data: admins } = await db
    .from("admin_users")
    .select("id, email, role_id, is_active, role:roles(code, name)");

  const adminByEmail = new Map<string, { id: string; is_active: boolean; role: { code: string; name: string } | null }>();
  for (const a of (admins ?? []) as Array<{ id: string; email: string; is_active: boolean; role: unknown }>) {
    const role = Array.isArray(a.role) ? (a.role[0] as { code: string; name: string } | undefined) : (a.role as { code: string; name: string } | null);
    adminByEmail.set(a.email.toLowerCase(), { id: a.id, is_active: a.is_active, role: role ?? null });
  }

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

  const rows: MergedUserRow[] = [];
  for (const au of authList?.users ?? []) {
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
  return rows;
}
