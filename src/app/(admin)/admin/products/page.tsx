"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Package, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import type { Product } from "@/lib/admin/types";

const PAGE_SIZE = 20;

type ProductRow = Product & { batch_count: number; passcode_count: number };

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search, active, page],
    queryFn: async () => {
      let q = supabaseAdmin
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) q = q.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      if (active !== "all") q = q.eq("is_active", active === "active");

      const { data, count } = await q;
      const products = (data ?? []) as Product[];

      // Fetch counts per product
      const enriched: ProductRow[] = await Promise.all(
        products.map(async (p) => {
          const [batches, passcodes] = await Promise.all([
            supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("product_id", p.id),
            supabaseAdmin.from("passcodes").select("id", { count: "exact", head: true }).eq("product_id", p.id).is("revoked_at", null),
          ]);
          return { ...p, batch_count: batches.count ?? 0, passcode_count: passcodes.count ?? 0 };
        })
      );
      return { rows: enriched, total: count ?? 0 };
    },
  });

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
          >
            <Package className="h-4 w-4" />
          </div>
          <div className="min-w-0">
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
    { key: "batch_count", header: "Batches", align: "right" },
    { key: "passcode_count", header: "Active Passcodes", align: "right" },
    {
      key: "is_active",
      header: "Status",
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
      key: "site_url",
      header: "Site",
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
          "—"
        ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Products
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Each product is a site on the landing with its own batches, passcodes, requests, and events.
        </p>
      </div>

      <DataTable<ProductRow>
        columns={columns}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search products…"
        filters={[
          {
            key: "active",
            label: "Status",
            value: active,
            options: [
              { value: "all", label: "All status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        onFilterChange={(key, v) => {
          if (key === "active") setActive(v);
          setPage(0);
        }}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => {
          window.location.href = `/admin/products/${r.slug}`;
        }}
        empty="No products yet."
      />
    </div>
  );
}
