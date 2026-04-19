"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission } from "@/lib/admin/auth-context";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { KeyRound, Ban, User } from "lucide-react";
import type { Passcode, Product } from "@/lib/admin/types";

const PAGE_SIZE = 20;

export default function ProductPasscodesPage() {
  const params = useParams<{ slug: string }>();
  const qc = useQueryClient();
  const canRevoke = useHasPermission("passcodes.revoke");

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | per_client | shared
  const [statusFilter, setStatusFilter] = useState("active"); // active | expired | revoked | all

  const { data: product } = useQuery({
    queryKey: ["admin-product", params.slug],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("slug", params.slug)
        .maybeSingle();
      return data as Pick<Product, "id"> | null;
    },
  });

  const productId = product?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["product-passcodes", productId, search, typeFilter, statusFilter, page],
    enabled: !!productId,
    queryFn: async () => {
      let q = supabaseAdmin
        .from("passcodes")
        .select(
          "*, client:clients(email, full_name, company), batch:batches(slug, name)",
          { count: "exact" }
        )
        .eq("product_id", productId!)
        .order("issued_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) {
        q = q.ilike("passcode_prefix", `%${search.toUpperCase()}%`);
      }
      if (typeFilter === "per_client") q = q.not("client_id", "is", null);
      if (typeFilter === "shared") q = q.is("client_id", null);
      const now = new Date().toISOString();
      if (statusFilter === "active") q = q.is("revoked_at", null).or(`expires_at.is.null,expires_at.gt.${now}`);
      if (statusFilter === "expired") q = q.is("revoked_at", null).lt("expires_at", now);
      if (statusFilter === "revoked") q = q.not("revoked_at", "is", null);

      const { data, count } = await q;
      return { rows: (data ?? []) as Passcode[], total: count ?? 0 };
    },
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin
        .from("passcodes")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-passcodes"] }),
  });

  const columns: Column<Passcode>[] = [
    {
      key: "code",
      header: "Passcode",
      render: (r) => (
        <div className="flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5" style={{ color: "var(--color-brand-500)" }} />
          <code className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
            TB-{r.passcode_prefix}-••••
          </code>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (r) =>
        r.client_id ? (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--color-brand-500)" }}>
            <User className="h-3 w-3" /> Per-client
          </span>
        ) : (
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
          >
            Shared
          </span>
        ),
    },
    {
      key: "label",
      header: "Label / Client",
      render: (r) =>
        r.client ? (
          <div className="min-w-0">
            <p className="truncate text-sm" style={{ color: "var(--text-primary)" }}>
              {r.client.email}
            </p>
            {r.client.company && (
              <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                {r.client.company}
              </p>
            )}
          </div>
        ) : (
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            {r.label ?? "—"}
          </span>
        ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {r.batch?.name ?? r.batch?.slug ?? "—"}
        </span>
      ),
    },
    {
      key: "uses",
      header: "Uses",
      align: "right",
      render: (r) => (
        <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
          {r.use_count}
          {r.max_uses != null ? `/${r.max_uses}` : ""}
        </span>
      ),
    },
    {
      key: "issued",
      header: "Issued",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.issued_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        if (r.revoked_at)
          return (
            <span className="text-xs" style={{ color: "#dc2626" }}>
              Revoked
            </span>
          );
        if (r.expires_at && new Date(r.expires_at) < new Date())
          return (
            <span className="text-xs" style={{ color: "#ca8a04" }}>
              Expired
            </span>
          );
        return (
          <span className="text-xs" style={{ color: "#16a34a" }}>
            Active
          </span>
        );
      },
    },
    ...(canRevoke
      ? [
          {
            key: "actions",
            header: "",
            align: "right" as const,
            render: (r: Passcode) =>
              r.revoked_at ? null : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Revoke passcode TB-${r.passcode_prefix}-••••?`)) revoke.mutate(r.id);
                  }}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
                  style={{ color: "#dc2626", background: "rgba(239,68,68,0.08)" }}
                >
                  <Ban className="h-3 w-3" /> Revoke
                </button>
              ),
          },
        ]
      : []),
  ];

  return (
    <DataTable<Passcode>
      columns={columns}
      rows={data?.rows ?? []}
      total={data?.total ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      loading={isLoading}
      search={search}
      searchPlaceholder="Search by prefix…"
      filters={[
        {
          key: "type",
          label: "Type",
          value: typeFilter,
          options: [
            { value: "all", label: "All types" },
            { value: "per_client", label: "Per-client" },
            { value: "shared", label: "Shared" },
          ],
        },
        {
          key: "status",
          label: "Status",
          value: statusFilter,
          options: [
            { value: "active", label: "Active only" },
            { value: "expired", label: "Expired" },
            { value: "revoked", label: "Revoked" },
            { value: "all", label: "All status" },
          ],
        },
      ]}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(0);
      }}
      onFilterChange={(k, v) => {
        if (k === "type") setTypeFilter(v);
        if (k === "status") setStatusFilter(v);
        setPage(0);
      }}
      onPageChange={setPage}
      rowKey={(r) => r.id}
      empty="No passcodes for this product yet."
    />
  );
}
