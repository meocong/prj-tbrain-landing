"use client";

import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { Client } from "@/lib/admin/types";
import type { ListResult } from "@/lib/admin/server/list";

export function ContactsClient({ initial }: { initial: ListResult<Client> }) {
  const columns: Column<Client>[] = [
    {
      key: "email",
      header: "Contact",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
          >
            {(r.full_name ?? r.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>{r.full_name ?? r.email.split("@")[0]}</p>
            <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.company ?? "—"}</span>,
    },
    {
      key: "source",
      header: "Source",
      render: (r) => (
        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
          {r.source ?? "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Added",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.created_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <DataTableSSR<Client>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search contacts…"
      filters={[
        {
          key: "source",
          label: "Source",
          options: [
            { value: "all", label: "All sources" },
            { value: "contact_form", label: "Contact form" },
            { value: "data_request", label: "Data request" },
            { value: "admin", label: "Manual (admin)" },
            { value: "newsletter", label: "Newsletter" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
    />
  );
}
