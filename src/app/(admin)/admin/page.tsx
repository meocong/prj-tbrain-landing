"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { Users, KeyRound, Inbox, FileText, Eye, MessageSquare, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";

const KPI_CONFIG = [
  { key: "contacts", label: "Total Contacts", icon: Users, accent: "primary", href: "/admin/contacts" },
  { key: "passcodes", label: "Active Passcodes", icon: KeyRound, accent: "success", href: "/admin/passcodes" },
  { key: "pendingRequests", label: "Pending Requests", icon: Inbox, accent: "warning", href: "/admin/requests" },
  { key: "publishedPosts", label: "Published Posts", icon: FileText, accent: "info", href: "/admin/content" },
  { key: "totalEvents", label: "Access Events", icon: Eye, accent: "primary", href: "/admin/audit" },
  { key: "pendingApprovals", label: "Pending Approvals", icon: Activity, accent: "error", href: "/admin/approvals" },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const db = supabaseAdmin;
      const [contacts, passcodes, requests, posts, events, approvals] = await Promise.all([
        db.from("clients").select("id", { count: "exact", head: true }),
        db.from("passcodes").select("id", { count: "exact", head: true }).is("revoked_at", null),
        db.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        db.from("cms_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        db.from("access_events").select("id", { count: "exact", head: true }),
        db.from("approval_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return {
        contacts: contacts.count ?? 0,
        passcodes: passcodes.count ?? 0,
        pendingRequests: requests.count ?? 0,
        publishedPosts: posts.count ?? 0,
        totalEvents: events.count ?? 0,
        pendingApprovals: approvals.count ?? 0,
      };
    },
    staleTime: 60_000,
  });

  // Recent activity
  const { data: recentEvents } = useQuery({
    queryKey: ["admin-recent-events"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("access_events")
        .select("id, event_type, occurred_at, client:clients(email)")
        .order("occurred_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    staleTime: 30_000,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ["admin-recent-posts"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("cms_posts")
        .select("id, title, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    staleTime: 30_000,
  });

  return (
    <div>
      {/* Header */}
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

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_CONFIG.map((kpi) => {
          const value = isLoading ? "—" : (stats as Record<string, number>)?.[kpi.key] ?? 0;
          return (
            <Link key={kpi.key} href={kpi.href} className="glass-card-interactive relative overflow-hidden p-5 group">
              {/* Accent bar */}
              <div className={`kpi-accent-bar kpi-accent-${kpi.accent}`} />
              {/* Watermark icon */}
              <div className="absolute top-4 right-4 opacity-[0.06]">
                <kpi.icon className="h-12 w-12" style={{ color: "var(--text-primary)" }} />
              </div>
              <div className="relative z-10 pt-1">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
                <p
                  className="mt-2 text-3xl font-bold"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  {isLoading ? (
                    <span className="skeleton inline-block h-8 w-16" />
                  ) : (
                    value
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Widgets */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="glass-card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              <TrendingUp className="h-4 w-4" style={{ color: "var(--color-brand-500, #6C3CF4)" }} />
              Recent Activity
            </h3>
            <Link href="/admin/audit" className="text-xs font-medium" style={{ color: "var(--color-brand-500, #6C3CF4)" }}>
              View all →
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {recentEvents?.map((e: Record<string, unknown>, i: number) => {
              const client = e.client as { email: string } | null;
              return (
                <div key={e.id as number} className={`flex items-center justify-between px-5 py-3 stagger-${i + 1}`}>
                  <div>
                    <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(108,60,244,0.08)", color: "var(--color-brand-500, #6C3CF4)" }}>
                      {String(e.event_type).replace(/_/g, " ")}
                    </span>
                    <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      {client?.email || "—"}
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(e.occurred_at as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            {(!recentEvents || recentEvents.length === 0) && (
              <div className="px-5 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>No recent activity</div>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="glass-card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              <FileText className="h-4 w-4" style={{ color: "var(--color-brand-500, #6C3CF4)" }} />
              Recent Posts
            </h3>
            <Link href="/admin/content" className="text-xs font-medium" style={{ color: "var(--color-brand-500, #6C3CF4)" }}>
              View all →
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {recentPosts?.map((p: Record<string, unknown>, i: number) => {
              const statusColor: Record<string, string> = { draft: "#eab308", published: "#22c55e", archived: "#6b7280" };
              return (
                <Link
                  key={p.id as string}
                  href={`/admin/content/${p.id}`}
                  className={`flex items-center justify-between px-5 py-3 transition-colors hover:bg-[var(--bg-input)] stagger-${i + 1}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusColor[p.status as string] || "#6b7280" }} />
                    <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {p.title as string}
                    </span>
                  </div>
                  <span className="text-[10px] shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>
                    {new Date(p.updated_at as string).toLocaleDateString()}
                  </span>
                </Link>
              );
            })}
            {(!recentPosts || recentPosts.length === 0) && (
              <div className="px-5 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>No posts yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
