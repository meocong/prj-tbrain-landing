"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission, useAdminAuth } from "@/lib/admin/auth-context";
import { Plus, Trash2, Shield, Users } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const canManageUsers = useHasPermission("users.manage");
  const canEditSettings = useHasPermission("settings.edit");
  const { adminUser } = useAdminAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Manage roles, permissions, and admin users.
        </p>
      </div>

      {/* Roles */}
      <RolesSection />

      {/* Admin Users */}
      {canManageUsers && <AdminUsersSection />}
    </div>
  );
}

function RolesSection() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("roles")
        .select("*")
        .order("created_at");
      return data ?? [];
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("permissions")
        .select("*")
        .order("resource, action");
      return data ?? [];
    },
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" style={{ color: "var(--color-brand-600)" }} />
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
          Roles & Permissions
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {roles?.map((role: Record<string, unknown>) => (
            <RoleCard key={role.id as string} role={role} allPermissions={permissions ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCard({
  role,
  allPermissions,
}: {
  role: Record<string, unknown>;
  allPermissions: Record<string, unknown>[];
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: rolePerms } = useQuery({
    queryKey: ["admin-role-permissions", role.id],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", role.id as string);
      return new Set((data ?? []).map((rp: { permission_id: string }) => rp.permission_id));
    },
    enabled: expanded,
  });

  const queryClient = useQueryClient();

  const togglePermMutation = useMutation({
    mutationFn: async ({ permId, add }: { permId: string; add: boolean }) => {
      if (add) {
        await supabaseAdmin
          .from("role_permissions")
          .insert({ role_id: role.id as string, permission_id: permId });
      } else {
        await supabaseAdmin
          .from("role_permissions")
          .delete()
          .eq("role_id", role.id as string)
          .eq("permission_id", permId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-role-permissions", role.id] });
    },
  });

  // Group permissions by resource
  const grouped: Record<string, Record<string, unknown>[]> = {};
  for (const p of allPermissions) {
    const resource = p.resource as string;
    if (!grouped[resource]) grouped[resource] = [];
    grouped[resource].push(p);
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {role.name as string}
          </span>
          {role.is_system ? (
            <span className="ml-2 badge badge-info text-[10px]">system</span>
          ) : null}
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {role.description as string}
          </p>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && rolePerms && (
        <div className="mt-4 space-y-3">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                {resource}
              </h4>
              <div className="flex flex-wrap gap-2">
                {perms.map((p) => {
                  const has = rolePerms.has(p.id as string);
                  return (
                    <label
                      key={p.id as string}
                      className="flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 text-xs transition-colors"
                      style={{
                        backgroundColor: has ? "rgba(108,60,244,0.08)" : "transparent",
                        color: has ? "var(--color-brand-600)" : "var(--text-muted)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={has}
                        onChange={() =>
                          togglePermMutation.mutate({
                            permId: p.id as string,
                            add: !has,
                          })
                        }
                        disabled={role.code === "super_admin"}
                        className="h-3 w-3"
                      />
                      {p.action as string}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminUsersSection() {
  const [newEmail, setNewEmail] = useState("");
  const [newRoleId, setNewRoleId] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("admin_users")
        .select("*, role:roles(code, name)")
        .eq("is_active", true)
        .order("created_at");
      return data ?? [];
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("roles").select("id, code, name").order("created_at");
      return data ?? [];
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async () => {
      if (!newEmail || !newRoleId) throw new Error("Email and role required");
      const { error } = await supabaseAdmin.from("admin_users").insert({
        email: newEmail,
        role_id: newRoleId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Admin user added");
      setNewEmail("");
      setNewRoleId("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      await supabaseAdmin
        .from("admin_users")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", userId);
    },
    onSuccess: () => {
      toast.success("User deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" style={{ color: "var(--color-brand-600)" }} />
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
          Admin Users
        </h2>
      </div>

      {/* Add user form */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email@tbrain.ai"
          className="flex-1 min-w-[200px] rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
        />
        <select
          value={newRoleId}
          onChange={(e) => setNewRoleId(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
        >
          <option value="">Select role...</option>
          {roles?.map((r: { id: string; name: string }) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button
          onClick={() => addUserMutation.mutate()}
          disabled={!newEmail || !newRoleId || addUserMutation.isPending}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 w-full" />)
        ) : (
          users?.map((u: Record<string, unknown>) => {
            const role = u.role as { code: string; name: string } | null;
            return (
              <div
                key={u.id as string}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{ backgroundColor: "var(--bg-input)" }}
              >
                <div>
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {(u.full_name as string) || (u.email as string)}
                  </span>
                  {u.full_name ? (
                    <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      {u.email as string}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-info">{role?.name || "Unknown"}</span>
                  {role?.code !== "super_admin" && (
                    <button
                      onClick={() => deactivateMutation.mutate(u.id as string)}
                      className="btn-ghost p-1"
                      title="Deactivate"
                    >
                      <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--color-error)" }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
