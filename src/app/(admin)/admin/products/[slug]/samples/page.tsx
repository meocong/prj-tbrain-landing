import "server-only";
import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { SamplesClient } from "./samples-client";
import type { SampleRow } from "@/components/admin/samples/renderers";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const sp = await searchParams;
  const [initial, batches] = await Promise.all([
    listAdminResource<SampleRow>(
      {
        table: "samples",
        permCode: "data.view",
        select:
          "id, batch_id, slug, title, difficulty, category, sample_type, payload, batches!inner(product_id)",
        searchable: ["title", "slug"],
        defaultSort: { key: "slug", dir: "asc" },
        sortWhitelist: ["slug", "title", "difficulty", "category", "sample_type"],
        filters: {
          product_id: (v, q) => q.eq("batches.product_id", v),
          batch_id: (v, q) => q.eq("batch_id", v),
          sample_type: (v, q) => q.eq("sample_type", v),
        },
      },
      { ...sp, product_id: product.id }
    ),
    supabaseAdmin()
      .from("batches")
      .select("id, name")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <SamplesClient
      initial={initial}
      batches={(batches.data ?? []) as Array<{ id: string; name: string }>}
    />
  );
}
