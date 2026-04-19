import Link from "next/link";
import { Users, KeyRound, Inbox, FileText, Eye, Activity, TrendingUp } from "lucide-react";
import { getDashboardData } from "@/lib/admin/server/list";

export const dynamic = "force-dynamic";

const KPI_CONFIG = [
  { key: "contacts", label: "Total Contacts", icon: Users, accent: "primary", href: "/admin/contacts" },
  { key: "passcodes", label: "Active Passcodes", icon: KeyRound, accent: "success", href: "/admin/products" },
  { key: "pendingRequests", label: "Pending Requests", icon: Inbox, accent: "warning", href: "/admin/products" },
  { key: "publishedPosts", label: "Published Posts", icon: FileText, accent: "info", href: "/admin/content" },
  { key: "totalEvents", label: "Access Events", icon: Eye, accent: "primary", href: "/admin/audit" },
  { key: "pendingApprovals", label: "Pending Approvals", icon: Activity, accent: "error", href: "/admin/approvals" },
];

export default async function AdminDashboard() {
  const { stats, recentEvents, recentPosts } = await getDashboardData();

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Welcome back. Here&apos;s what&apos;s happening on tbrain.ai.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_CONFIG.map((kpi, i) => (
          <Link
            key={kpi.key}
            href={kpi.href}
            className={`glass-card-interactive relative overflow-hidden p-5 stagger-${Math.min(i + 1, 6)}`}
          >
            <div className={`kpi-accent-bar kpi-accent-${kpi.accent}`} />
            <div className="absolute top-4 right-4 opacity-[0.06]">
              <kpi.icon className="h-12 w-12" style={{ color: "var(--text-primary)" }} />
            </div>
            <div className="relative z-10 pt-1">
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
              <p
                className="mt-2 text-3xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                {(stats as Record<string, number>)[kpi.key]}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              <TrendingUp className="h-4 w-4" style={{ color: "var(--color-brand-500, #6C3CF4)" }} />
              Recent Activity
            </h3>
            <Link href="/admin/audit" className="text-xs font-medium" style={{ color: "var(--color-brand-500)" }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {recentEvents.map((e, i) => (
              <div key={e.id} className={`flex items-center justify-between px-5 py-3 stagger-${Math.min(i + 1, 6)}`}>
                <div>
                  <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: "rgba(108,60,244,0.08)", color: "var(--color-brand-500)" }}>
                    {e.event_type.replace(/_/g, " ")}
                  </span>
                  <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {e.client?.email || "—"}
                  </span>
                </div>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(e.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            {recentEvents.length === 0 && (
              <div className="px-5 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>No recent activity</div>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              <FileText className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} />
              Recent Posts
            </h3>
            <Link href="/admin/content" className="text-xs font-medium" style={{ color: "var(--color-brand-500)" }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {recentPosts.map((p, i) => {
              const statusColor: Record<string, string> = { draft: "#eab308", published: "#22c55e", archived: "#6b7280" };
              return (
                <Link
                  key={p.id}
                  href={`/admin/content/${p.id}`}
                  className={`flex items-center justify-between px-5 py-3 transition-colors hover:bg-[var(--bg-input)] stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusColor[p.status] || "#6b7280" }} />
                    <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{p.title}</span>
                  </div>
                  <span className="text-[10px] shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>
                    {new Date(p.updated_at).toLocaleDateString()}
                  </span>
                </Link>
              );
            })}
            {recentPosts.length === 0 && (
              <div className="px-5 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>No posts yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
