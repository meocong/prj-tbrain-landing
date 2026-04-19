"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import type { Product } from "@/lib/admin/types";

const PAGE_SIZE = 30;

type EventRow = {
  id: number;
  event_type: string;
  occurred_at: string;
  ip: string | null;
  client?: { email: string } | null;
  batch?: { slug: string; name: string } | null;
};

export default function ProductEventsPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");

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
    queryKey: ["product-events", productId, typeFilter, page],
    enabled: !!productId,
    queryFn: async () => {
      let q = supabaseAdmin
        .from("access_events")
        .select("id, event_type, occurred_at, ip, client:clients(email), batch:batches!inner(slug, name, product_id)", { count: "exact" })
        .eq("batch.product_id", productId!)
        .order("occurred_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (typeFilter !== "all") q = q.eq("event_type", typeFilter);
      const { data, count } = await q;
      return { rows: (data ?? []) as unknown as EventRow[], total: count ?? 0 };
    },
  });

  const columns: Column<EventRow>[] = [
    {
      key: "event_type",
      header: "Event",
      render: (r) => (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "rgba(108,60,244,0.08)", color: "var(--color-brand-500)" }}
        >
          {r.event_type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {r.client?.email ?? "—"}
        </span>
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
      key: "ip",
      header: "IP",
      render: (r) => (
        <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {r.ip ?? "—"}
        </code>
      ),
    },
    {
      key: "occurred_at",
      header: "When",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.occurred_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <DataTable<EventRow>
      columns={columns}
      rows={data?.rows ?? []}
      total={data?.total ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      loading={isLoading}
      filters={[
        {
          key: "type",
          label: "Type",
          value: typeFilter,
          options: [
            { value: "all", label: "All events" },
            { value: "enter_success", label: "Enter success" },
            { value: "enter_fail", label: "Enter fail" },
            { value: "download", label: "Download" },
            { value: "view", label: "View" },
          ],
        },
      ]}
      onFilterChange={(_, v) => {
        setTypeFilter(v);
        setPage(0);
      }}
      onPageChange={setPage}
      rowKey={(r) => String(r.id)}
      empty="No events for this product yet."
    />
  );
}
