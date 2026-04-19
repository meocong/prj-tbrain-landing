import "server-only";
import { listAdminResource } from "@/lib/admin/server/list";
import { getAuditStats } from "@/lib/admin/server/stats";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { AuditClient } from "./audit-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { Activity, CalendarDays, CalendarRange, UsersRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const productId = Array.isArray(sp.product_id) ? sp.product_id[0] : sp.product_id;
  const selectStr = productId
    ? "id, event_type, occurred_at, ip, user_agent, client:clients(email, full_name), batch:batches!inner(slug, name, product_id)"
    : "id, event_type, occurred_at, ip, user_agent, client:clients(email, full_name), batch:batches(slug, name, product_id)";

  const [initial, products, stats] = await Promise.all([
    listAdminResource(
      {
        table: "access_events",
        permCode: "audit.view",
        select: selectStr,
        searchable: [],
        defaultSort: { key: "occurred_at", dir: "desc" },
        sortWhitelist: ["occurred_at", "event_type"],
        filters: {
          product_id: (v, q) => q.eq("batch.product_id", v),
          event_type: (v, q) => q.eq("event_type", v),
          range: (v, q) => {
            const hours = v === "24h" ? 24 : v === "7d" ? 24 * 7 : v === "30d" ? 24 * 30 : 0;
            if (!hours) return undefined;
            return q.gte("occurred_at", new Date(Date.now() - hours * 3600_000).toISOString());
          },
        },
      },
      sp
    ),
    supabaseAdmin().from("products").select("id, name").order("name"),
    getAuditStats(),
  ]);

  const productOptions = [
    { value: "all", label: "All products" },
    ...((products.data ?? []) as Array<{ id: string; name: string }>).map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Audit Log
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Every access event across all products. Filter by product, event type, or date range.
        </p>
      </div>
      <KpiStrip
        items={[
          { label: "Today", value: stats.today, icon: Activity, accent: "primary" },
          { label: "Last 7d", value: stats.last_7d, icon: CalendarDays, accent: "info" },
          { label: "Last 30d", value: stats.last_30d, icon: CalendarRange, accent: "success" },
          { label: "Unique actors (30d)", value: stats.unique_actors_30d, icon: UsersRound, accent: "warning" },
        ]}
      />
      <AuditClient initial={initial as never} productOptions={productOptions} />
    </div>
  );
}
