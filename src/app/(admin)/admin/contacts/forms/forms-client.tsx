"use client";

import { useRouter } from "next/navigation";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { ContactSubmission } from "@/lib/admin/types";
import type { ListResult } from "@/lib/admin/server/list";

export function FormsClient({ initial }: { initial: ListResult<ContactSubmission> }) {
  const router = useRouter();
  const columns: Column<ContactSubmission>[] = [
    {
      key: "email",
      header: "Sender",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>{r.full_name || r.email}</p>
          <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
            {r.email}{r.company ? ` · ${r.company}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (r) => (
        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
          {r.source}
        </span>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (r) => (
        <span className="block text-xs truncate max-w-md" style={{ color: "var(--text-secondary)" }} title={r.message}>
          {r.message}
        </span>
      ),
    },
    {
      key: "client_id",
      header: "Linked",
      render: (r) => r.client_id ? <span className="text-xs" style={{ color: "#16a34a" }}>Yes</span> : <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "created_at",
      header: "Received",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.created_at).toLocaleString()}</span>,
    },
  ];

  return (
    <DataTableSSR<ContactSubmission>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search forms…"
      filters={[
        {
          key: "source",
          label: "Source",
          options: [
            { value: "all", label: "All sources" },
            { value: "contact_form", label: "Contact form" },
            { value: "data_request", label: "Data request" },
            { value: "demo", label: "Demo request" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
      onRowClick={(r) => router.push(`/admin/contacts/forms/${r.id}`)}
    />
  );
}
