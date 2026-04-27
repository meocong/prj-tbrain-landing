"use client";

import Link from "next/link";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { ListResult } from "@/lib/admin/server/list";
import type { ServiceRow } from "./page";

export function ServicesClient({ initial }: { initial: ListResult<ServiceRow> }) {
  const columns: Column<ServiceRow>[] = [
    {
      key: "display_order",
      header: "Order",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {r.display_order}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/services/${r.id}`}
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {r.title}
          </Link>
          {r.description && (
            <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
              {r.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "icon",
      header: "Icon",
      render: (r) => (
        <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {r.icon}
        </code>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      sortable: true,
      render: (r) => (
        <span className={r.is_active ? "badge-success" : "badge-muted"}>
          {r.is_active ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      sortable: true,
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.updated_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <DataTableSSR<ServiceRow>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search services…"
      filters={[
        {
          key: "is_active",
          label: "Status",
          options: [
            { value: "all", label: "All" },
            { value: "true", label: "Active" },
            { value: "false", label: "Hidden" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
    />
  );
}
