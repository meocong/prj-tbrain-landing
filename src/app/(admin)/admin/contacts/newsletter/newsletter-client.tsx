"use client";

import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { NewsletterSubscriber } from "@/lib/admin/types";
import type { ListResult } from "@/lib/admin/server/list";

export function NewsletterClient({ initial }: { initial: ListResult<NewsletterSubscriber> }) {
  const columns: Column<NewsletterSubscriber>[] = [
    {
      key: "email",
      header: "Subscriber",
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>{r.full_name || r.email}</p>
          {r.full_name && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.email}</p>}
        </div>
      ),
    },
    { key: "source", header: "Source", render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.source ?? "—"}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => r.unsubscribed_at
        ? <span className="text-xs" style={{ color: "#dc2626" }}>Unsubscribed</span>
        : <span className="text-xs" style={{ color: "#16a34a" }}>Subscribed</span>,
    },
    {
      key: "subscribed_at",
      header: "Since",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.subscribed_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <DataTableSSR<NewsletterSubscriber>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search by email…"
      filters={[
        {
          key: "state",
          label: "State",
          options: [
            { value: "all", label: "All" },
            { value: "subscribed", label: "Subscribed" },
            { value: "unsubscribed", label: "Unsubscribed" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
    />
  );
}
