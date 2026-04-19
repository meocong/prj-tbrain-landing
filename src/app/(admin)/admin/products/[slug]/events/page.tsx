import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { EventsClient } from "./events-client";

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
  const initial = await listAdminResource(
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
  );

  return <EventsClient initial={initial as never} />;
}
