"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { useHasPermission } from "@/lib/admin/auth-context";
import { Plus, Shield, Users as UsersIcon, CheckCircle, XCircle } from "lucide-react";

type Row = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  role?: { code: string; name: string } | null;
  groups?: Array<{ id: string; name: string }>;
};

const PAGE_SIZE = 30;

export default function UsersPage() {
  const canManage = useHasPermission("users.manage");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("active");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, state, page],
    queryFn: async () => {
      let q = supabaseAdmin
        .from("admin_users")
        .select("*, role:roles(code, name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      if (state === "active") q = q.eq("is_active", true);
      if (state === "inactive") q = q.eq("is_active", false);
      const { data, count } = await q;
      const rows = (data ?? []) as unknown as Row[];
      // Fetch group memberships
      const enriched = await Promise.all(
        rows.map(async (u) => {
          const { data: gm } = await supabaseAdmin
            .from("group_members")
            .select("group:groups(id, name)")
            .eq("user_id", u.id);
          const groups = ((gm ?? []) as unknown as Array<{ group: { id: string; name: string } | null }>)
            .map((r) => r.group)
            .filter(Boolean) as Array<{ id: string; name: string }>;
          return { ...u, groups };
        })
      );
      return { rows: enriched, total: count ?? 0 };
    },
  });

  const columns: Column<Row>[] = [
    {
      key: "email",
      header: "User",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
          >
            {(r.full_name ?? r.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {r.full_name ?? r.email.split("@")[0]}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {r.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs" style={{ color: r.role?.code === "super_admin" ? "var(--color-brand-500)" : "var(--text-secondary)" }}>
          <Shield className="h-3 w-3" /> {r.role?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "groups",
      header: "Groups",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {(r.groups ?? []).map((g) => (
            <span
              key={g.id}
              className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
            >
              {g.name}
            </span>
          ))}
          {(r.groups ?? []).length === 0 && (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>—</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (r) =>
        r.is_active ? (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#16a34a" }}>
            <CheckCircle className="h-3 w-3" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <XCircle className="h-3 w-3" /> Inactive
          </span>
        ),
    },
    {
      key: "last_login_at",
      header: "Last login",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {r.last_login_at ? new Date(r.last_login_at).toLocaleDateString() : "Never"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Users
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Admin users are anyone with a row here. Permissions come from role (super_admin bypass) plus group membership.
          </p>
        </div>
      </div>

      <DataTable<Row>
        columns={columns}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search users…"
        filters={[
          {
            key: "state",
            label: "State",
            value: state,
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "all", label: "All" },
            ],
          },
        ]}
        actions={
          canManage ? (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Click a row to edit · New users are added via the ADMIN_BOOTSTRAP_EMAILS flow.
            </span>
          ) : null
        }
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onFilterChange={(_, v) => { setState(v); setPage(0); }}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={canManage ? (r) => { window.location.href = `/admin/users/${r.id}`; } : undefined}
      />
      {/* unused Plus import: reserved for future add flow */}
      <span className="hidden">{/* eslint-disable-next-line */}<Plus /><UsersIcon /></span>
    </div>
  );
}
