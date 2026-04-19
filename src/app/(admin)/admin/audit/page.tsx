"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Download } from "lucide-react";

type Row = {
  id: number;
  event_type: string;
  occurred_at: string;
  ip: string | null;
  user_agent: string | null;
  client?: { email: string; full_name: string | null } | null;
  batch?: { slug: string; name: string; product_id: string | null } | null;
};

const PAGE_SIZE = 50;

const EVENT_OPTIONS = [
  { value: "all", label: "All events" },
  { value: "enter_success", label: "Enter success" },
  { value: "enter_fail", label: "Enter fail" },
  { value: "view_sample", label: "View sample" },
  { value: "view_file", label: "View file" },
  { value: "view_tests", label: "View tests" },
  { value: "view_solution", label: "View solution" },
  { value: "download_sample_zip", label: "Download sample" },
  { value: "download_batch_zip", label: "Download batch" },
];

const RANGE_OPTIONS = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

const EVENT_COLOR: Record<string, string> = {
  enter_success: "#16a34a",
  enter_fail: "#dc2626",
  view_sample: "var(--color-brand-500)",
  view_file: "var(--color-brand-500)",
  view_tests: "var(--color-brand-500)",
  view_solution: "var(--color-brand-500)",
  download_sample_zip: "#3B82F6",
  download_batch_zip: "#3B82F6",
};

export default function AuditPage() {
  const [eventType, setEventType] = useState("all");
  const [range, setRange] = useState("30d");
  const [productSlug, setProductSlug] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "occurred_at", dir: "desc" });
  const [page, setPage] = useState(0);

  const { data: products } = useQuery({
    queryKey: ["audit-products-filter"],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("products").select("id, slug, name").order("name");
      return (data ?? []) as Array<{ id: string; slug: string; name: string }>;
    },
  });

  const productOptions = [
    { value: "all", label: "All products" },
    ...((products ?? []).map((p) => ({ value: p.slug, label: p.name }))),
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit", eventType, range, productSlug, search, sort.key, sort.dir, page],
    queryFn: async () => {
      let q = supabaseAdmin
        .from("access_events")
        .select(
          "id, event_type, occurred_at, ip, user_agent, client:clients(email, full_name), batch:batches(slug, name, product_id)",
          { count: "exact" }
        )
        .order(sort.key as "occurred_at", { ascending: sort.dir === "asc" })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (eventType !== "all") q = q.eq("event_type", eventType);

      if (range !== "all") {
        const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
        const cutoff = new Date(Date.now() - hours * 3600_000).toISOString();
        q = q.gte("occurred_at", cutoff);
      }

      if (productSlug !== "all") {
        const pid = products?.find((p) => p.slug === productSlug)?.id;
        if (pid) {
          // Use inner join via batches
          q = supabaseAdmin
            .from("access_events")
            .select(
              "id, event_type, occurred_at, ip, user_agent, client:clients(email, full_name), batch:batches!inner(slug, name, product_id)",
              { count: "exact" }
            )
            .eq("batch.product_id", pid)
            .order(sort.key as "occurred_at", { ascending: sort.dir === "asc" })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
          if (eventType !== "all") q = q.eq("event_type", eventType);
          if (range !== "all") {
            const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
            const cutoff = new Date(Date.now() - hours * 3600_000).toISOString();
            q = q.gte("occurred_at", cutoff);
          }
        }
      }

      const { data, count } = await q;
      let rows = (data ?? []) as unknown as Row[];
      if (search) {
        const s = search.toLowerCase();
        rows = rows.filter((r) => r.client?.email?.toLowerCase().includes(s) ?? false);
      }
      return { rows, total: count ?? 0 };
    },
  });

  const exportCsv = () => {
    const rows = data?.rows ?? [];
    const header = ["occurred_at", "event_type", "client_email", "batch", "ip"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.occurred_at,
          r.event_type,
          r.client?.email ?? "",
          r.batch?.slug ?? "",
          r.ip ?? "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Row>[] = [
    {
      key: "event_type",
      header: "Event",
      render: (r) => (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: "var(--bg-input)",
            color: EVENT_COLOR[r.event_type] ?? "var(--text-secondary)",
          }}
        >
          {r.event_type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (r) =>
        r.client ? (
          <div className="min-w-0">
            <p className="truncate text-sm" style={{ color: "var(--text-primary)" }}>
              {r.client.full_name ?? r.client.email}
            </p>
            {r.client.full_name && (
              <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                {r.client.email}
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
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
      sortable: true,
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.occurred_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Audit Log
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Every access event across all products. Filter by product, event type, or date range.
        </p>
      </div>

      <DataTable<Row>
        columns={columns}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search by client email…"
        filters={[
          { key: "event", label: "Event", value: eventType, options: EVENT_OPTIONS },
          { key: "product", label: "Product", value: productSlug, options: productOptions },
          { key: "range", label: "Range", value: range, options: RANGE_OPTIONS },
        ]}
        sort={sort}
        onSortChange={(key, dir) => setSort({ key, dir })}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onFilterChange={(key, v) => {
          if (key === "event") setEventType(v);
          if (key === "product") setProductSlug(v);
          if (key === "range") setRange(v);
          setPage(0);
        }}
        onPageChange={setPage}
        rowKey={(r) => String(r.id)}
        actions={
          <button type="button" onClick={exportCsv} className="btn-secondary text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }
      />
    </div>
  );
}
