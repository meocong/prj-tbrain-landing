import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { getBatchesStats } from "@/lib/admin/server/stats";
import { BatchesClient } from "./batches-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { Database, FileText, BarChart3, CalendarPlus } from "lucide-react";

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
  const [initial, stats] = await Promise.all([
    listAdminResource<{ id: string; slug: string; name: string; description: string | null; created_at: string }>(
      {
        table: "batches",
        permCode: "data.view",
        searchable: ["name", "slug"],
        defaultSort: { key: "created_at", dir: "desc" },
        sortWhitelist: ["created_at", "name", "slug"],
        filters: {
          product_id: (v, q) => q.eq("product_id", v),
        },
      },
      { ...sp, product_id: product.id }
    ),
    getBatchesStats(product.id),
  ]);

  return (
    <>
      <KpiStrip
        items={[
          { label: "Batches", value: stats.total, icon: Database, accent: "primary" },
          { label: "Samples", value: stats.samples, icon: FileText, accent: "info" },
          { label: "Avg / batch", value: stats.avg_samples, icon: BarChart3, accent: "success" },
          { label: "New (7d)", value: stats.new_7d, icon: CalendarPlus, accent: "warning" },
        ]}
      />
      <BatchesClient initial={initial} productSlug={slug} />
    </>
  );
}
