import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import type { AuditAction, AuditResource } from "./types";

interface AuditEntry {
  adminUserId?: string | null;
  action: AuditAction;
  resourceType: AuditResource;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Log an admin action to the audit trail.
 * Never throws — catches errors to avoid blocking the main flow.
 */
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    const db = supabaseAdmin();
    await db.from("admin_audit_log").insert({
      admin_user_id: entry.adminUserId ?? null,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      details: entry.details ?? null,
      ip: entry.ip ?? null,
      user_agent: entry.userAgent ?? null,
    });
  } catch (err) {
    console.error("[audit] Failed to log admin action:", err);
  }
}
