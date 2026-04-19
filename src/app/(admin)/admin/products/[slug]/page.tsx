import { notFound } from "next/navigation";
import { FileText, Inbox, KeyRound, Database, Eye } from "lucide-react";
import Link from "next/link";
import { getProductBySlug, getProductStats } from "@/lib/admin/server/list";

export const dynamic = "force-dynamic";

const CARDS = [
  { key: "batches", label: "Batches", icon: Database, href: "batches", accent: "primary" as const },
  { key: "samples", label: "Samples", icon: FileText, href: "samples", accent: "info" as const },
  { key: "passcodes", label: "Active Passcodes", icon: KeyRound, href: "passcodes", accent: "success" as const },
  { key: "requests", label: "Pending Requests", icon: Inbox, href: "requests", accent: "warning" as const },
  { key: "events_30d", label: "Events (30d)", icon: Eye, href: "events", accent: "primary" as const },
];

export default async function ProductOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const stats = await getProductStats(product.id);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map((c, i) => (
        <Link
          key={c.key}
          href={`/admin/products/${slug}/${c.href}`}
          className={`glass-card-interactive relative overflow-hidden p-5 stagger-${Math.min(i + 1, 6)}`}
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
              {(stats as Record<string, number>)[c.key]}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
