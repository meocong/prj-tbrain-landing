"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import type { Product } from "@/lib/admin/types";

const PAGE_SIZE = 20;

type RequestRow = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  status: string;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  batch?: { slug: string; name: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#ca8a04",
  approved: "#16a34a",
  rejected: "#dc2626",
  cancelled: "#6b7280",
};

export default function ProductRequestsPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

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
    queryKey: ["product-requests", productId, search, status, page],
    enabled: !!productId,
    queryFn: async () => {
      let q = supabaseAdmin
        .from("access_requests")
        .select("*, batch:batches(slug, name)", { count: "exact" })
        .eq("product_id", productId!)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company.ilike.%${search}%`);
      if (status !== "all") q = q.eq("status", status);
      const { data, count } = await q;
      return { rows: (data ?? []) as RequestRow[], total: count ?? 0 };
    },
  });

  const columns: Column<RequestRow>[] = [
    {
      key: "email",
      header: "Requester",
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
            {r.full_name || r.email}
          </p>
          <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
            {r.email} {r.company ? `· ${r.company}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {r.batch?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
          style={{ background: "var(--bg-input)", color: STATUS_COLOR[r.status] ?? "var(--text-muted)" }}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Requested",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <DataTable<RequestRow>
      columns={columns}
      rows={data?.rows ?? []}
      total={data?.total ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      loading={isLoading}
      search={search}
      searchPlaceholder="Search requesters…"
      filters={[
        {
          key: "status",
          label: "Status",
          value: status,
          options: [
            { value: "all", label: "All status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
      ]}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(0);
      }}
      onFilterChange={(_, v) => {
        setStatus(v);
        setPage(0);
      }}
      onPageChange={setPage}
      rowKey={(r) => r.id}
      empty="No access requests yet."
    />
  );
}
