"use client";

import { useRouter } from "next/navigation";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { Mail, Globe, Package } from "lucide-react";
import type { ListResult } from "@/lib/admin/server/list";

type Row = {
  id: string;
  product_id: string | null;
  key: string;
  name: string;
  subject: string;
  is_active: boolean;
  product?: { slug: string; name: string } | null;
};

export function TemplatesClient({ initial }: { initial: ListResult<Row> }) {
  const router = useRouter();
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Template",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Mail className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{r.name}</p>
            <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>{r.key}</code>
          </div>
        </div>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      render: (r) => r.product_id ? (
        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          <Package className="h-3.5 w-3.5" /> {r.product?.name ?? "—"}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <Globe className="h-3.5 w-3.5" /> Global
        </span>
      ),
    },
    { key: "subject", header: "Subject", sortable: false, render: (r) => <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{r.subject}</span> },
    {
      key: "is_active",
      header: "Status",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: r.is_active ? "#16a34a" : "var(--text-muted)" }}>{r.is_active ? "Active" : "Inactive"}</span>,
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
      searchPlaceholder="Search templates…"
      filters={[
        {
          key: "scope",
          label: "Scope",
          options: [
            { value: "all", label: "All scopes" },
            { value: "global", label: "Global" },
            { value: "scoped", label: "Per-product" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
      onRowClick={(r) => router.push(`/admin/email-templates/${r.id}`)}
    />
  );
}
