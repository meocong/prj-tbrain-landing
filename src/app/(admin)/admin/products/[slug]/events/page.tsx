import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { getEventsStats } from "@/lib/admin/server/stats";
import { EventsClient } from "./events-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { Activity, UsersRound, TrendingUp, Download } from "lucide-react";

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
    listAdminResource(
      {
        table: "access_events",
        permCode: "audit.view",
        select:
          "id, event_type, occurred_at, ip, user_agent, client:clients(email), batch:batches!inner(slug, name, product_id)",
        searchable: [],
        defaultSort: { key: "occurred_at", dir: "desc" },
        sortWhitelist: ["occurred_at", "event_type"],
        filters: {
          product_id: (v, q) => q.eq("batch.product_id", v),
          event_type: (v, q) => q.eq("event_type", v),
        },
      },
      { ...sp, product_id: product.id }
    ),
    getEventsStats(product.id),
  ]);

  return (
    <>
      <KpiStrip
        items={[
          { label: "Events (7d)", value: stats.last_7d, icon: Activity, accent: "primary" },
          { label: "Unique actors", value: stats.unique_actors, icon: UsersRound, accent: "info" },
          { label: "Peak day", value: stats.peak_day, icon: TrendingUp, accent: "success" },
          { label: "Downloads (7d)", value: stats.downloads_7d, icon: Download, accent: "warning" },
        ]}
      />
      <EventsClient initial={initial as never} />
    </>
  );
}
