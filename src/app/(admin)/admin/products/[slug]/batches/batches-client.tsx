"use client";

import { useRouter } from "next/navigation";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { Database } from "lucide-react";
import type { ListResult } from "@/lib/admin/server/list";

type BatchRow = { id: string; slug: string; name: string; description: string | null; created_at: string };

export function BatchesClient({ initial, productSlug }: { initial: ListResult<BatchRow>; productSlug: string }) {
  const router = useRouter();
  const columns: Column<BatchRow>[] = [
    {
      key: "name",
      header: "Batch",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Database className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{r.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.created_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <DataTableSSR<BatchRow>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search batches…"
      rowKey={(r) => r.id}
      onRowClick={(r) => router.push(`/admin/products/${productSlug}/samples?batch_id=${r.id}`)}
      empty="No batches yet for this product."
    />
  );
}
