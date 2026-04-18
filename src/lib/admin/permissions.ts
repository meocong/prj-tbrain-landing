import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import type { AdminUserWithPermissions } from "./types";

/**
 * Fetch an admin user by email, with role and permissions eagerly loaded.
 * Returns null if the user doesn't exist or is inactive.
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

  // 2. Fetch permissions for the role
  const { data: rps } = await db
    .from("role_permissions")
    .select("permission:permissions(*)")
    .eq("role_id", user.role.id);

  const permissions = (rps ?? [])
    .map((rp: { permission: unknown }) => rp.permission)
    .filter(Boolean);

  return {
    ...user,
    role: {
      ...user.role,
      permissions,
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
  // Super admin bypass: check role code
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
