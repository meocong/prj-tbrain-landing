import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { RequestsClient } from "./requests-client";

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
      defaultSort: { key: "created_at", dir: "desc" },
      sortWhitelist: ["created_at", "reviewed_at", "email", "status"],
      filters: {
        product_id: (v, q) => q.eq("product_id", v),
        status: (v, q) => q.eq("status", v),
      },
    },
    { ...sp, product_id: product.id }
  );

  return <RequestsClient initial={initial as never} />;
}
