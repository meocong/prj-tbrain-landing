"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import {
  SAMPLE_TYPE_META,
  SamplePreviewCell,
  SampleDetailRenderer,
  type SampleRow,
  type SampleType,
} from "@/components/admin/samples/renderers";
import type { Product } from "@/lib/admin/types";
import { X } from "lucide-react";

const PAGE_SIZE = 30;

export default function ProductSamplesPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SampleType | "all">("all");
  const [batchFilter, setBatchFilter] = useState<string>(searchParams.get("batch_id") ?? "all");
  const [detail, setDetail] = useState<SampleRow | null>(null);

  // Sync from URL on mount / navigation
  useEffect(() => {
    const b = searchParams.get("batch_id");
    if (b) setBatchFilter(b);
  }, [searchParams]);

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

  const { data: batches } = useQuery({
    queryKey: ["product-batches-filter", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("batches")
        .select("id, name, slug")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });
      return (data ?? []) as Array<{ id: string; name: string; slug: string }>;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["product-samples", productId, search, typeFilter, batchFilter, page],
    enabled: !!productId,
    queryFn: async () => {
      let q = supabaseAdmin
        .from("samples")
        .select("id, batch_id, slug, title, difficulty, category, sample_type, payload, batches!inner(product_id)", { count: "exact" })
        .eq("batches.product_id", productId!)
        .order("slug")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
      if (typeFilter !== "all") q = q.eq("sample_type", typeFilter);
      if (batchFilter !== "all") q = q.eq("batch_id", batchFilter);
      const { data, count } = await q;
      return { rows: (data ?? []) as unknown as SampleRow[], total: count ?? 0 };
    },
  });

  const columns: Column<SampleRow>[] = [
    {
      key: "title",
      header: "Sample",
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
            {r.title}
          </p>
          <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {r.slug}
          </code>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (r) => <SamplePreviewCell row={r} /> },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (r) =>
        r.difficulty ? (
          <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
            {r.difficulty}
          </span>
        ) : <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.category ?? "—"}</span>,
    },
  ];

  const sampleTypeOptions = [
    { value: "all", label: "All types" },
    ...Object.entries(SAMPLE_TYPE_META).map(([value, meta]) => ({ value, label: meta.label })),
  ];

  const batchOptions = [
    { value: "all", label: "All batches" },
    ...((batches ?? []).map((b) => ({ value: b.id, label: b.name }))),
  ];

  return (
    <>
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setDetail(null)}
        >
          <div
            className="glass-card w-full max-w-3xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
            >
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {detail.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <SamplePreviewCell row={detail} />
                  <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>{detail.slug}</code>
                </div>
              </div>
              <button onClick={() => setDetail(null)} aria-label="Close">
                <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="p-5">
              <SampleDetailRenderer row={detail} />
            </div>
          </div>
        </div>
      )}
      <DataTable<SampleRow>
        columns={columns}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search samples…"
        filters={[
          { key: "type", label: "Type", value: typeFilter, options: sampleTypeOptions },
          { key: "batch", label: "Batch", value: batchFilter, options: batchOptions },
        ]}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onFilterChange={(key, v) => {
          if (key === "type") setTypeFilter(v as SampleType | "all");
          if (key === "batch") setBatchFilter(v);
          setPage(0);
        }}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => setDetail(r)}
        empty="No samples for this product yet."
      />
    </>
  );
}
