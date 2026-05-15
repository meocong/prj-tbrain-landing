"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { Package, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import type { Product } from "@/lib/admin/types";
import type { ListResult } from "@/lib/admin/server/list";

export function ProductsClient({ initial }: { initial: ListResult<Product> }) {
  const router = useRouter();
  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
          >
            <Package className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{r.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sample_type",
      header: "Type",
      render: (r) => (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
        >
          {r.sample_type ?? "—"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      sortable: true,
      render: (r) =>
        r.is_active ? (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#16a34a" }}>
            <CheckCircle className="h-3.5 w-3.5" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <XCircle className="h-3.5 w-3.5" /> Disabled
          </span>
        ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "site_url",
      header: "Site",
      align: "right",
      render: (r) =>
        r.site_url ? (
          <Link
            href={r.site_url}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "var(--color-brand-500)" }}
            onClick={(e) => e.stopPropagation()}
          >
            Open <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>—</span>
        ),
    },
  ];

  return (
    <DataTableSSR<Product>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      filters={[
        {
          key: "active",
          label: "Status",
          options: [
            { value: "all", label: "All status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
      onRowClick={(r) => router.push(`/admin/products/${r.slug}`)}
      searchPlaceholder="Search products…"
      empty="No products yet."
    />
  );
}
