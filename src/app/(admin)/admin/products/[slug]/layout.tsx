import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, ExternalLink, ChevronLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/admin/server/list";
import { ProductTabs } from "./product-tabs";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All products
      </Link>

      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
          >
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
                {product.description}
              </p>
            )}
          </div>
        </div>
        {product.site_url && (
          <Link
            href={product.site_url}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium rounded-md px-3 py-1.5"
            style={{ background: "var(--bg-input)", color: "var(--color-brand-500)", border: "1px solid var(--border-default)" }}
          >
            View site <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <ProductTabs slug={slug} />
      <div>{children}</div>
    </div>
  );
}
