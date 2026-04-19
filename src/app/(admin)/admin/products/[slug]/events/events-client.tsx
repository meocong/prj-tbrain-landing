"use client";

import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { ListResult } from "@/lib/admin/server/list";

type EventRow = {
  id: number;
  event_type: string;
  occurred_at: string;
  ip: string | null;
  client?: { email: string } | null;
  batch?: { slug: string; name: string } | null;
};

export function EventsClient({ initial }: { initial: ListResult<EventRow> }) {
  const columns: Column<EventRow>[] = [
    {
      key: "event_type",
      header: "Event",
      sortable: true,
      render: (r) => (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "rgba(108,60,244,0.08)", color: "var(--color-brand-500)" }}
        >
          {r.event_type.replace(/_/g, " ")}
        </span>
      ),
    },
    { key: "client", header: "Client", render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.client?.email ?? "—"}</span> },
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
    <DataTableSSR<EventRow>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search by client email…"
      filters={[
        {
          key: "event_type",
          label: "Type",
          options: [
            { value: "all", label: "All events" },
            { value: "enter_success", label: "Enter success" },
            { value: "enter_fail", label: "Enter fail" },
            { value: "download_sample_zip", label: "Download sample" },
            { value: "download_batch_zip", label: "Download batch" },
          ],
        },
      ]}
      rowKey={(r) => String(r.id)}
      empty="No events for this product yet."
    />
  );
}
