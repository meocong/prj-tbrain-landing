import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { RequestsClient } from "./requests-client";
import { Inbox, CheckCircle, XCircle, Clock } from "lucide-react";

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
      table: "access_requests",
      permCode: "requests.view",
      select: "*, batch:batches(slug, name)",
      searchable: ["email", "full_name", "company"],
      defaultSort: { key: "requested_at", dir: "desc" },
      sortWhitelist: ["requested_at", "reviewed_at", "email", "status"],
      filters: {
        product_id: (v, q) => q.eq("product_id", v),
        status: (v, q) => q.eq("status", v),
      },
    },
    { ...sp, product_id: product.id }
  );

  const db = supabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const [pending, approved, rejected, last7d] = await Promise.all([
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("product_id", product.id).eq("status", "pending"),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("product_id", product.id).eq("status", "approved"),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("product_id", product.id).eq("status", "rejected"),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("product_id", product.id).gte("requested_at", sevenDaysAgo),
  ]);

  return (
    <>
      <KpiStrip
        items={[
          { label: "Pending", value: pending.count ?? 0, icon: Inbox, accent: "warning" },
          { label: "Approved", value: approved.count ?? 0, icon: CheckCircle, accent: "success" },
          { label: "Rejected", value: rejected.count ?? 0, icon: XCircle, accent: "error" },
          { label: "Last 7 days", value: last7d.count ?? 0, icon: Clock, accent: "primary" },
        ]}
      />
      <RequestsClient initial={initial as never} />
    </>
  );
}
