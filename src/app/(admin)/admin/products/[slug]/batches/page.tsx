import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { BatchesClient } from "./batches-client";

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
  const initial = await listAdminResource<{ id: string; slug: string; name: string; description: string | null; created_at: string }>(
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
  );

  return <BatchesClient initial={initial} productSlug={slug} />;
}
