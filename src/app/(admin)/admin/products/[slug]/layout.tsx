"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { Package, ExternalLink, ChevronLeft } from "lucide-react";
import type { Product } from "@/lib/admin/types";

const TABS = [
  { key: "", label: "Overview" },
  { key: "batches", label: "Batches" },
  { key: "samples", label: "Samples" },
  { key: "passcodes", label: "Passcodes" },
  { key: "requests", label: "Requests" },
  { key: "events", label: "Events" },
  { key: "templates", label: "Templates" },
  { key: "settings", label: "Settings" },
];

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();
  const { data: product } = useQuery({
    queryKey: ["admin-product", params.slug],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("slug", params.slug)
        .maybeSingle();
      return data as Product | null;
    },
    enabled: !!params.slug,
  });

  const basePath = `/admin/products/${params.slug}`;
  const currentTab = pathname === basePath
    ? ""
    : pathname.replace(`${basePath}/`, "").split("/")[0];

  return (
    <div>
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
              {product?.name ?? params.slug}
            </h1>
            {product?.description && (
              <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
                {product.description}
              </p>
            )}
          </div>
        </div>
        {product?.site_url && (
          <Link
            href={product.site_url}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium rounded-md px-3 py-1.5"
            style={{
              background: "var(--bg-input)",
              color: "var(--color-brand-500)",
              border: "1px solid var(--border-default)",
            }}
          >
            View site <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 overflow-x-auto mb-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {TABS.map((t) => {
          const active = t.key === currentTab;
          const href = t.key ? `${basePath}/${t.key}` : basePath;
          return (
            <Link
              key={t.key}
              href={href}
              className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                color: active ? "var(--color-brand-500)" : "var(--text-muted)",
                borderBottom: active ? "2px solid var(--color-brand-500)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
