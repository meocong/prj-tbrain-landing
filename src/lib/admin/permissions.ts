import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import type { AdminUserWithPermissions, Permission } from "./types";

/**
 * Fetch an admin user by email, with role permissions + group permissions.
 * User permissions = Role permissions ∪ Group1 permissions ∪ Group2 permissions ∪ ...
 */
export async function getAdminUser(
  email: string
): Promise<AdminUserWithPermissions | null> {
  const db = supabaseAdmin();

  // 1. Fetch admin user with role
  const { data: user } = await db
    .from("admin_users")
    .select("*, role:roles(*)")
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();

  if (!user || !user.role) return null;

  // 2. Fetch role permissions
  const { data: rps } = await db
    .from("role_permissions")
    .select("permission:permissions(*)")
    .eq("role_id", user.role.id);

  const rolePermissions = (rps ?? [])
    .map((rp: { permission: unknown }) => rp.permission as Permission)
    .filter(Boolean);

  // 3. Fetch group memberships → group permissions
  const { data: memberships } = await db
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  let groupPermissions: Permission[] = [];
  if (memberships && memberships.length > 0) {
    const groupIds = memberships.map((m: { group_id: string }) => m.group_id);
    const { data: gps } = await db
      .from("group_permissions")
      .select("permission:permissions(*)")
      .in("group_id", groupIds);

    groupPermissions = (gps ?? [])
      .map((gp: { permission: unknown }) => gp.permission as Permission)
      .filter(Boolean);
  }

  // 4. Union: deduplicate by permission code
  const allPermsMap = new Map<string, Permission>();
  for (const p of [...rolePermissions, ...groupPermissions]) {
    allPermsMap.set(p.code, p);
  }
  const allPermissions = Array.from(allPermsMap.values());

  return {
    ...user,
    role: {
      ...user.role,
      permissions: allPermissions,
    },
  } as AdminUserWithPermissions;
}

/**
 * Check if an admin user has a specific permission.
 */
export function hasPermission(
  user: AdminUserWithPermissions,
  permissionCode: string
): boolean {
  if (user.role.code === "super_admin") return true;
  return user.role.permissions.some((p) => p.code === permissionCode);
}

/**
 * Check if an admin user has ANY of the given permissions.
 */
export function hasAnyPermission(
  user: AdminUserWithPermissions,
  permissionCodes: string[]
): boolean {
  if (user.role.code === "super_admin") return true;
  return permissionCodes.some((code) =>
    user.role.permissions.some((p) => p.code === code)
  );
}

/**
 * Get all permission codes for a user (for sending to client).
 */
export function getPermissionCodes(
  user: AdminUserWithPermissions
): string[] {
  if (user.role.code === "super_admin") return ["*"];
  return user.role.permissions.map((p) => p.code);
}
