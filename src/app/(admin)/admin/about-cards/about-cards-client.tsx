"use client";

import Link from "next/link";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { ListResult } from "@/lib/admin/server/list";
import type { AboutCardRow } from "./page";

const GROUP_LABELS: Record<string, string> = {
  company: "Company",
  value: "Value",
  sample_projects: "Sample projects",
  expertise: "Technical expertise",
  team: "Team",
  experts: "Expert network",
};

export function AboutCardsClient({ initial }: { initial: ListResult<AboutCardRow> }) {
  const columns: Column<AboutCardRow>[] = [
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
      key: "group_key",
      header: "Group",
      sortable: true,
      render: (r) => (
        <span className="badge-muted">
          {GROUP_LABELS[r.group_key] ?? r.group_key}
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
            href={`/admin/about-cards/${r.id}`}
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {r.title}
          </Link>
          <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
            {r.description || r.label || r.slug}
          </p>
        </div>
      ),
    },
    {
      key: "icon",
      header: "Icon",
      render: (r) => (
        <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {r.icon || "image/text"}
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
    <DataTableSSR<AboutCardRow>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search about cards..."
      filters={[
        {
          key: "group_key",
          label: "Group",
          options: [
            { value: "all", label: "All" },
            { value: "company", label: "Company" },
            { value: "value", label: "Value" },
            { value: "sample_projects", label: "Sample projects" },
            { value: "expertise", label: "Technical expertise" },
            { value: "team", label: "Team" },
            { value: "experts", label: "Expert network" },
          ],
        },
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
