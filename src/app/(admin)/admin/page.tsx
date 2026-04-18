"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { Users, KeyRound, Inbox, FileText, Eye, MessageSquare } from "lucide-react";

function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          <p
            className="mt-1 text-2xl font-semibold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            {value}
          </p>
          {trend && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-success)" }}>
              {trend}
            </p>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--color-brand-50)" }}
        >
          <Icon className="h-5 w-5" style={{ color: "var(--color-brand-600)" }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const db = supabaseAdmin;
      const [contacts, passcodes, requests, posts, events] = await Promise.all([
        db.from("clients").select("id", { count: "exact", head: true }),
        db.from("access_grants").select("id", { count: "exact", head: true }),
        db
          .from("access_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        db
          .from("cms_posts")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        db.from("access_events").select("id", { count: "exact", head: true }),
      ]);

      return {
        contacts: contacts.count ?? 0,
        passcodes: passcodes.count ?? 0,
        pendingRequests: requests.count ?? 0,
        publishedPosts: posts.count ?? 0,
        totalEvents: events.count ?? 0,
      };
    },
    staleTime: 60_000,
  });

  return (
    <div>
      <h1
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        Dashboard
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Overview of your landing platform
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Total Contacts" value={stats?.contacts ?? "—"} icon={Users} />
        <KpiCard label="Active Passcodes" value={stats?.passcodes ?? "—"} icon={KeyRound} />
        <KpiCard
          label="Pending Requests"
          value={stats?.pendingRequests ?? "—"}
          icon={Inbox}
        />
        <KpiCard
          label="Published Posts"
          value={stats?.publishedPosts ?? "—"}
          icon={FileText}
        />
        <KpiCard label="Total Events" value={stats?.totalEvents ?? "—"} icon={Eye} />
        <KpiCard label="Chat Sessions" value="—" icon={MessageSquare} />
      </div>
    </div>
  );
}
