import { listAdminResource } from "@/lib/admin/server/list";
import { TemplatesClient } from "./templates-client";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = await listAdminResource(
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
  );

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
      <TemplatesClient initial={initial as never} />
    </div>
  );
}
