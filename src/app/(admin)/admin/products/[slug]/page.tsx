"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { FileText, Inbox, KeyRound, Database, Eye } from "lucide-react";
import type { Product } from "@/lib/admin/types";

const CARDS = [
  { key: "batches", label: "Batches", icon: Database, href: "batches", accent: "primary" as const },
  { key: "samples", label: "Samples", icon: FileText, href: "samples", accent: "info" as const },
  { key: "passcodes", label: "Active Passcodes", icon: KeyRound, href: "passcodes", accent: "success" as const },
  { key: "requests", label: "Pending Requests", icon: Inbox, href: "requests", accent: "warning" as const },
  { key: "events_30d", label: "Events (30d)", icon: Eye, href: "events", accent: "primary" as const },
];

export default function ProductOverviewPage() {
  const params = useParams<{ slug: string }>();

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
  });

  const productId = product?.id;

  const { data: stats } = useQuery({
    queryKey: ["product-stats", productId],
    enabled: !!productId,
    queryFn: async () => {
      const thirty = new Date(Date.now() - 30 * 86400_000).toISOString();
      const [batches, samples, passcodes, requests, events] = await Promise.all([
        supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("product_id", productId),
        supabaseAdmin.from("samples").select("id, batches!inner(product_id)", { count: "exact", head: true }).eq("batches.product_id", productId),
        supabaseAdmin.from("passcodes").select("id", { count: "exact", head: true }).eq("product_id", productId).is("revoked_at", null),
        supabaseAdmin.from("access_requests").select("id", { count: "exact", head: true }).eq("product_id", productId).eq("status", "pending"),
        supabaseAdmin.from("access_events").select("id, batches!inner(product_id)", { count: "exact", head: true }).eq("batches.product_id", productId).gte("occurred_at", thirty),
      ]);
      return {
        batches: batches.count ?? 0,
        samples: samples.count ?? 0,
        passcodes: passcodes.count ?? 0,
        requests: requests.count ?? 0,
        events_30d: events.count ?? 0,
      };
    },
  });

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => {
          const v = (stats as Record<string, number> | undefined)?.[c.key];
          return (
            <a
              key={c.key}
              href={`/admin/products/${params.slug}/${c.href}`}
              className="glass-card-interactive relative overflow-hidden p-5"
            >
              <div className={`kpi-accent-bar kpi-accent-${c.accent}`} />
              <div className="absolute top-4 right-4 opacity-[0.06]">
                <c.icon className="h-12 w-12" style={{ color: "var(--text-primary)" }} />
              </div>
              <div className="relative z-10 pt-1">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {c.label}
                </p>
                <p
                  className="mt-2 text-3xl font-bold"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  {v ?? "—"}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
