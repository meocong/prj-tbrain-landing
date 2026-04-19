import { listAdminResource } from "@/lib/admin/server/list";
import { getEmailTemplatesStats } from "@/lib/admin/server/stats";
import { TemplatesClient } from "./templates-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { Mail, MailCheck, MailX, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [initial, stats] = await Promise.all([listAdminResource(
    {
      table: "email_templates",
      permCode: "content.view",
      select: "*, product:products(slug, name)",
      searchable: ["name", "key", "subject"],
      defaultSort: { key: "key", dir: "asc" },
      sortWhitelist: ["key", "name", "updated_at", "is_active"],
      filters: {
        scope: (v, q) => (v === "global" ? q.is("product_id", null) : q.not("product_id", "is", null)),
      },
    },
    sp
  ), getEmailTemplatesStats()]);

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Email Templates
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Global defaults + per-product overrides. Variables use <code className="px-1" style={{ background: "var(--bg-input)" }}>{"{{name}}"}</code> syntax.
        </p>
      </div>
      <KpiStrip
        items={[
          { label: "Total", value: stats.total, icon: Mail, accent: "primary" },
          { label: "Active", value: stats.active, icon: MailCheck, accent: "success" },
          { label: "Inactive", value: stats.inactive, icon: MailX, accent: "error" },
          { label: "Linked products", value: stats.linked_products, icon: Package, accent: "info" },
        ]}
      />
      <TemplatesClient initial={initial as never} />
    </div>
  );
}
