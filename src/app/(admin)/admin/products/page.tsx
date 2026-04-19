import { listAdminResource } from "@/lib/admin/server/list";
import { ProductsClient } from "./products-client";
import type { Product } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = await listAdminResource<Product>(
    {
      table: "products",
      permCode: "data.view",
      searchable: ["name", "slug"],
      defaultSort: { key: "created_at", dir: "desc" },
      sortWhitelist: ["created_at", "name", "slug", "is_active"],
      filters: {
        active: (v, q) => (v === "active" ? q.eq("is_active", true) : q.eq("is_active", false)),
      },
    },
    params
  );

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Products
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Each product is a site with its own batches, passcodes, requests, and events.
        </p>
      </div>

      <ProductsClient initial={initial} />
    </div>
  );
}
