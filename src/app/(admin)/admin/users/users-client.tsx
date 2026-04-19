"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { useHasPermission } from "@/lib/admin/auth-context";
import { Shield, UserPlus } from "lucide-react";
import type { MergedUserRow } from "@/lib/admin/server/users";

function RoleBadge({ role }: { role: string | null }) {
  if (role === "super_admin")
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
        style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}>
        <Shield className="h-3 w-3" /> Super Admin
      </span>
    );
  if (role === "admin")
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
        style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>
        <Shield className="h-3 w-3" /> Admin
      </span>
    );
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
      style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
      User
    </span>
  );
}

const PAGE_SIZE = 30;

export function UsersClient({
  rows,
  search,
  roleFilter,
  sortKey,
  sortDir,
  page,
}: {
  rows: MergedUserRow[];
  search: string;
  roleFilter: string;
  sortKey: string;
  sortDir: "asc" | "desc";
  page: number;
}) {
  const router = useRouter();
  const canManage = useHasPermission("users.manage");
  const [busy, setBusy] = useState<string | null>(null);

  const promote = async (email: string) => {
    if (!confirm(`Promote ${email} to Admin? They'll be able to sign in to /admin.`)) return;
    setBusy(email);
    const res = await fetch("/api/admin/users/all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role_code: "admin" }),
    });
    setBusy(null);
    if ((await res.json()).ok) router.refresh();
  };

  const roleRank = (r: string | null) => (r === "super_admin" ? 0 : r === "admin" ? 1 : 2);

  const filtered = useMemo(() => {
    let list = rows;
    if (roleFilter !== "all") {
      list = list.filter((r) => (roleFilter === "user" ? r.role_code == null : r.role_code === roleFilter));
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((r) => r.email.toLowerCase().includes(s) || (r.full_name ?? "").toLowerCase().includes(s));
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "role": cmp = roleRank(a.role_code) - roleRank(b.role_code); break;
        case "last_sign_in_at":
          cmp = (new Date(a.last_sign_in_at ?? 0).getTime()) - (new Date(b.last_sign_in_at ?? 0).getTime());
          break;
        case "created_at":
          cmp = (new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime());
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [rows, search, roleFilter, sortKey, sortDir]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const columns: Column<MergedUserRow>[] = [
    {
      key: "email",
      header: "User",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0"
            style={{
              background: r.avatar_url ? undefined : "rgba(108,60,244,0.12)",
              color: "var(--color-brand-500)",
              backgroundImage: r.avatar_url ? `url(${r.avatar_url})` : undefined,
              backgroundSize: "cover",
            }}
          >
            {!r.avatar_url && (r.full_name ?? r.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>{r.full_name ?? r.email.split("@")[0]}</p>
            <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", sortable: true, render: (r) => <RoleBadge role={r.role_code} /> },
    {
      key: "groups", header: "Groups",
      render: (r) => r.groups.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {r.groups.map((g) => (
            <span key={g.id} className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
              {g.name}
            </span>
          ))}
        </div>
      ) : <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "last_sign_in_at",
      header: "Last login",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleDateString() : "Never"}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (r) => {
        if (r.admin_id) {
          return canManage ? (
            <a href={`/admin/users/${r.admin_id}`} onClick={(e) => e.stopPropagation()}
              className="text-xs" style={{ color: "var(--color-brand-500)" }}>Edit</a>
          ) : null;
        }
        return canManage ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); promote(r.email); }}
            disabled={busy === r.email}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
            style={{ color: "#16a34a", background: "rgba(16,185,129,0.08)" }}
          >
            <UserPlus className="h-3 w-3" /> Promote to Admin
          </button>
        ) : null;
      },
    },
  ];

  return (
    <DataTableSSR<MergedUserRow>
      columns={columns}
      rows={paged}
      total={filtered.length}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      sort={{ key: sortKey, dir: sortDir }}
      activeFilters={{ role: roleFilter === "all" ? "" : roleFilter }}
      searchPlaceholder="Search by email or name…"
      filters={[
        {
          key: "role",
          label: "Role",
          options: [
            { value: "all", label: "All roles" },
            { value: "super_admin", label: "Super Admin" },
            { value: "admin", label: "Admin" },
            { value: "user", label: "User" },
          ],
        },
      ]}
      rowKey={(r) => r.auth_id}
    />
  );
}
