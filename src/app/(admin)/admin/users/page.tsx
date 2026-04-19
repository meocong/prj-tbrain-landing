"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { useHasPermission } from "@/lib/admin/auth-context";
import { Shield, UserPlus } from "lucide-react";

type MergedRow = {
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

const PAGE_SIZE = 30;

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

export default function UsersPage() {
  const canManage = useHasPermission("users.manage");
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "super_admin" | "admin" | "user">("all");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "role", dir: "asc" });

  const { data, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users/all");
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "failed");
      return (j.rows as MergedRow[]);
    },
  });

  const promote = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/admin/users/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role_code: "admin" }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-users"] }),
  });

  const roleRank = (r: string | null) => (r === "super_admin" ? 0 : r === "admin" ? 1 : 2);

  // Client-side filter + sort + paginate
  const filtered = (data ?? [])
    .filter((r) => {
      if (roleFilter === "all") return true;
      if (roleFilter === "user") return r.role_code == null;
      return r.role_code === roleFilter;
    })
    .filter((r) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return r.email.toLowerCase().includes(s) || (r.full_name ?? "").toLowerCase().includes(s);
    });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sort.key) {
      case "email": cmp = a.email.localeCompare(b.email); break;
      case "role": cmp = roleRank(a.role_code) - roleRank(b.role_code); break;
      case "last_sign_in_at":
        cmp = (new Date(a.last_sign_in_at ?? 0).getTime()) - (new Date(b.last_sign_in_at ?? 0).getTime());
        break;
      case "created_at":
        cmp = (new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime());
        break;
    }
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const columns: Column<MergedRow>[] = [
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
            <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
              {r.full_name ?? r.email.split("@")[0]}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
              {r.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (r) => <RoleBadge role={r.role_code} />,
    },
    {
      key: "groups",
      header: "Groups",
      render: (r) =>
        r.groups.length > 0 ? (
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
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => {
        if (r.admin_id) {
          return canManage ? (
            <a
              href={`/admin/users/${r.admin_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs"
              style={{ color: "var(--color-brand-500)" }}
            >
              Edit
            </a>
          ) : null;
        }
        return canManage ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Promote ${r.email} to Admin? They'll be able to sign in to /admin.`)) {
                promote.mutate(r.email);
              }
            }}
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
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Users
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          All authenticated users on the site. Super Admin &amp; Admin can sign in to <code>/admin</code>;
          plain Users cannot.
        </p>
      </div>

      <DataTable<MergedRow>
        columns={columns}
        rows={paged}
        total={sorted.length}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search by email or name…"
        filters={[
          {
            key: "role",
            label: "Role",
            value: roleFilter,
            options: [
              { value: "all", label: "All roles" },
              { value: "super_admin", label: "Super Admin" },
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ],
          },
        ]}
        sort={sort}
        onSortChange={(key, dir) => setSort({ key, dir })}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onFilterChange={(_, v) => { setRoleFilter(v as typeof roleFilter); setPage(0); }}
        onPageChange={setPage}
        rowKey={(r) => r.auth_id}
      />
    </div>
  );
}
