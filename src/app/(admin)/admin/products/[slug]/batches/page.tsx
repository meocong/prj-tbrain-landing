"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Database } from "lucide-react";
import type { Product } from "@/lib/admin/types";

const PAGE_SIZE = 20;

type BatchRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  sample_count?: number;
};

export default function ProductBatchesPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data: product } = useQuery({
    queryKey: ["admin-product", params.slug],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("slug", params.slug)
        .maybeSingle();
      return data as Pick<Product, "id"> | null;
    },
  });
  const productId = product?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["product-batches", productId, search, page],
    enabled: !!productId,
    queryFn: async () => {
      let q = supabaseAdmin
        .from("batches")
        .select("*", { count: "exact" })
        .eq("product_id", productId!)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      const { data, count } = await q;
      const rows = ((data ?? []) as BatchRow[]);
      // Fetch sample count per batch
      const enriched = await Promise.all(
        rows.map(async (b) => {
          const { count } = await supabaseAdmin
            .from("samples")
            .select("id", { count: "exact", head: true })
            .eq("batch_id", b.id);
          return { ...b, sample_count: count ?? 0 };
        })
      );
      return { rows: enriched, total: count ?? 0 };
    },
  });

  const columns: Column<BatchRow>[] = [
    {
      key: "name",
      header: "Batch",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Database className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {r.name}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {r.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "sample_count",
      header: "Samples",
      align: "right",
    },
    {
      key: "created_at",
      header: "Created",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <DataTable<BatchRow>
      columns={columns}
      rows={data?.rows ?? []}
      total={data?.total ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      loading={isLoading}
      search={search}
      searchPlaceholder="Search batches…"
      onSearchChange={(v) => {
        setSearch(v);
        setPage(0);
      }}
      onPageChange={setPage}
      rowKey={(r) => r.id}
      empty="No batches yet for this product."
      onRowClick={(r) => {
        window.location.href = `/admin/products/${params.slug}/samples?batch_id=${r.id}`;
      }}
    />
  );
}
