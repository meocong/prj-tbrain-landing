"use client";

import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { Download } from "lucide-react";
import type { ListResult } from "@/lib/admin/server/list";

type Row = {
  id: number;
  event_type: string;
  occurred_at: string;
  ip: string | null;
  client?: { email: string; full_name: string | null } | null;
  batch?: { slug: string; name: string } | null;
};

const EVENT_COLOR: Record<string, string> = {
  enter_success: "#16a34a",
  enter_fail: "#dc2626",
  view_sample: "var(--color-brand-500)",
  download_sample_zip: "#3B82F6",
  download_batch_zip: "#3B82F6",
};

export function AuditClient({
  initial,
  productOptions,
}: {
  initial: ListResult<Row>;
  productOptions: Array<{ value: string; label: string }>;
}) {
  const exportCsv = () => {
    const header = ["occurred_at", "event_type", "client_email", "batch", "ip"];
    const lines = [header.join(",")];
    for (const r of initial.rows) {
      lines.push(
        [r.occurred_at, r.event_type, r.client?.email ?? "", r.batch?.slug ?? "", r.ip ?? ""]
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
      sortable: true,
      render: (r) => (
        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "var(--bg-input)", color: EVENT_COLOR[r.event_type] ?? "var(--text-secondary)" }}>
          {r.event_type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (r) => r.client ? (
        <div className="min-w-0">
          <p className="truncate text-sm" style={{ color: "var(--text-primary)" }}>{r.client.full_name ?? r.client.email}</p>
          {r.client.full_name && <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{r.client.email}</p>}
        </div>
      ) : <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>,
    },
    { key: "batch", header: "Batch", render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.batch?.name ?? "—"}</span> },
    { key: "ip", header: "IP", render: (r) => <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>{r.ip ?? "—"}</code> },
    {
      key: "occurred_at",
      header: "When",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.occurred_at).toLocaleString()}</span>,
    },
  ];

  return (
    <DataTableSSR<Row>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search…"
      filters={[
        {
          key: "event_type", label: "Event",
          options: [
            { value: "all", label: "All events" },
            { value: "enter_success", label: "Enter success" },
            { value: "enter_fail", label: "Enter fail" },
            { value: "download_sample_zip", label: "Download sample" },
            { value: "download_batch_zip", label: "Download batch" },
          ],
        },
        { key: "product_id", label: "Product", options: productOptions },
        {
          key: "range", label: "Range",
          options: [
            { value: "all", label: "All time" },
            { value: "24h", label: "Last 24h" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
          ],
        },
      ]}
      rowKey={(r) => String(r.id)}
      actions={
        <button type="button" onClick={exportCsv} className="btn-secondary text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      }
    />
  );
}
