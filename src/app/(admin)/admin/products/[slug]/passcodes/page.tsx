import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { PasscodesClient } from "./passcodes-client";
import type { Passcode } from "@/lib/admin/types";

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
  // Inject product_id into params so the filter helper picks it up
  const spWithProduct = { ...sp, product_id: product.id };

  const initial = await listAdminResource<Passcode>(
    {
      table: "passcodes",
      permCode: "passcodes.view",
      select: "*, client:clients(email, full_name, company), batch:batches(slug, name)",
      searchable: ["passcode_prefix", "label", "note"],
      defaultSort: { key: "issued_at", dir: "desc" },
      sortWhitelist: ["issued_at", "expires_at", "use_count", "passcode_prefix"],
      filters: {
        product_id: (v, q) => q.eq("product_id", v),
        type: (v, q) => (v === "per_client" ? q.not("client_id", "is", null) : q.is("client_id", null)),
        status: (v, q) => {
          const now = new Date().toISOString();
          if (v === "active") return q.is("revoked_at", null).or(`expires_at.is.null,expires_at.gt.${now}`);
          if (v === "expired") return q.is("revoked_at", null).lt("expires_at", now);
          if (v === "revoked") return q.not("revoked_at", "is", null);
          return undefined;
        },
      },
    },
    spWithProduct
  );

  return <PasscodesClient initial={initial} productSlug={slug} productId={product.id} />;
}
