"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission } from "@/lib/admin/auth-context";
import { ChevronLeft, Save, Loader2 } from "lucide-react";

type Role = { id: string; code: string; name: string };
type Group = { id: string; name: string };
type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role_id: string;
  role?: Role | null;
};

export default function UserEditPage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const canManage = useHasPermission("users.manage");

  const { data } = useQuery({
    queryKey: ["admin-user", params.id],
    queryFn: async () => {
      const [{ data: u }, { data: roles }, { data: groups }, { data: gm }] = await Promise.all([
        supabaseAdmin.from("admin_users").select("*, role:roles(id, code, name)").eq("id", params.id).maybeSingle(),
        supabaseAdmin.from("roles").select("id, code, name").order("code"),
        supabaseAdmin.from("groups").select("id, name").order("name"),
        supabaseAdmin.from("group_members").select("group_id").eq("user_id", params.id),
      ]);
      return {
        user: u as AdminUser | null,
        roles: (roles ?? []) as Role[],
        groups: (groups ?? []) as Group[],
        memberOf: new Set(((gm ?? []) as Array<{ group_id: string }>).map((r) => r.group_id)),
      };
    },
  });

  const [roleId, setRoleId] = useState("");
  const [active, setActive] = useState(true);
  const [memberOf, setMemberOf] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data?.user) {
      setRoleId(data.user.role_id);
      setActive(data.user.is_active);
      setMemberOf(data.memberOf);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.user) return;
      const { error: uErr } = await supabaseAdmin
        .from("admin_users")
        .update({ role_id: roleId, is_active: active, updated_at: new Date().toISOString() })
        .eq("id", params.id);
      if (uErr) throw uErr;

      // Diff group membership
      const currentIds = data.memberOf;
      const toAdd = Array.from(memberOf).filter((id) => !currentIds.has(id));
      const toRemove = Array.from(currentIds).filter((id) => !memberOf.has(id));
      if (toAdd.length > 0) {
        await supabaseAdmin
          .from("group_members")
          .insert(toAdd.map((gid) => ({ group_id: gid, user_id: params.id })));
      }
      if (toRemove.length > 0) {
        await supabaseAdmin
          .from("group_members")
          .delete()
          .eq("user_id", params.id)
          .in("group_id", toRemove);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-user", params.id] }),
  });

  if (!data?.user) return null;

  const toggleGroup = (id: string) => {
    setMemberOf((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        <ChevronLeft className="h-3.5 w-3.5" /> All users
      </Link>

      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold"
          style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
        >
          {(data.user.full_name ?? data.user.email)[0].toUpperCase()}
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            {data.user.full_name ?? data.user.email.split("@")[0]}
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {data.user.email}
          </p>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Role
          </label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={!canManage}
            className="input-field"
          >
            {data.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            super_admin bypasses all permission checks. admin needs explicit group permissions.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              checked={active}
              disabled={!canManage}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active (can sign in to /admin)
          </label>
        </div>

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Groups
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {data.groups.map((g) => (
              <label
                key={g.id}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm cursor-pointer"
                style={{ background: memberOf.has(g.id) ? "var(--sidebar-active-bg)" : "var(--bg-input)", border: "1px solid var(--border-default)" }}
              >
                <input
                  type="checkbox"
                  checked={memberOf.has(g.id)}
                  disabled={!canManage}
                  onChange={() => toggleGroup(g.id)}
                />
                {g.name}
              </label>
            ))}
            {data.groups.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No groups defined yet.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={!canManage || save.isPending}
            className="btn-primary text-xs"
          >
            {save.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{" "}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
