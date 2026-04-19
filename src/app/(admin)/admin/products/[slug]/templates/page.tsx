"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Mail, Globe } from "lucide-react";
import type { Product } from "@/lib/admin/types";

type Row = {
  id: string;
  product_id: string | null;
  key: string;
  name: string;
  subject: string;
  is_active: boolean;
};

export default function ProductTemplatesPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState(0);

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
    queryKey: ["product-templates", productId],
    enabled: !!productId,
    queryFn: async () => {
      // Show product-scoped + global (product_id IS NULL). Prefer scoped per key in the UI.
      const { data } = await supabaseAdmin
        .from("email_templates")
        .select("*")
        .or(`product_id.eq.${productId},product_id.is.null`)
        .order("key");
      return { rows: ((data ?? []) as Row[]) };
    },
  });

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Template",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} />
          <div>
            <Link
              href={`/admin/email-templates/${r.id}`}
              className="font-medium hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {r.name}
            </Link>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {r.key}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      render: (r) =>
        r.product_id ? (
          <span className="text-xs" style={{ color: "var(--color-brand-500)" }}>
            Product override
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Globe className="h-3.5 w-3.5" /> Global (fallback)
          </span>
        ),
    },
    { key: "subject", header: "Subject" },
    {
      key: "is_active",
      header: "Status",
      render: (r) => (
        <span className="text-xs" style={{ color: r.is_active ? "#16a34a" : "var(--text-muted)" }}>
          {r.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Row>
      columns={columns}
      rows={data?.rows ?? []}
      total={data?.rows.length ?? 0}
      page={page}
      pageSize={100}
      loading={isLoading}
      onPageChange={setPage}
      rowKey={(r) => r.id}
      onRowClick={(r) => { window.location.href = `/admin/email-templates/${r.id}`; }}
      empty="No templates. Globals seed with migration 006."
    />
  );
}
