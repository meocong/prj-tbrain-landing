import { notFound } from "next/navigation";
import { listAdminResource, getProductBySlug } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { PasscodesClient } from "./passcodes-client";
import type { Passcode } from "@/lib/admin/types";
import { KeyRound, User, Ban, Clock } from "lucide-react";

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

  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const [active, shared, revoked, expiringSoon] = await Promise.all([
    db.from("passcodes").select("id", { count: "exact", head: true }).eq("product_id", product.id).is("revoked_at", null),
    db.from("passcodes").select("id", { count: "exact", head: true }).eq("product_id", product.id).is("client_id", null).is("revoked_at", null),
    db.from("passcodes").select("id", { count: "exact", head: true }).eq("product_id", product.id).not("revoked_at", "is", null),
    db.from("passcodes").select("id", { count: "exact", head: true }).eq("product_id", product.id).is("revoked_at", null).gte("expires_at", now).lte("expires_at", new Date(Date.now() + 7 * 86400_000).toISOString()),
  ]);

  return (
    <>
      <KpiStrip
        items={[
          { label: "Active", value: active.count ?? 0, icon: KeyRound, accent: "success" },
          { label: "Shared codes", value: shared.count ?? 0, icon: User, accent: "primary" },
          { label: "Expiring ≤ 7d", value: expiringSoon.count ?? 0, icon: Clock, accent: "warning" },
          { label: "Revoked", value: revoked.count ?? 0, icon: Ban, accent: "error" },
        ]}
      />
      <PasscodesClient initial={initial} productSlug={slug} productId={product.id} />
    </>
  );
}
