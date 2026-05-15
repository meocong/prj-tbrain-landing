import { requireAdmin } from "@/lib/admin/server/list";
import { getUsersStats } from "@/lib/admin/server/stats";
import { listAllUsers } from "@/lib/admin/server/users";
import { UsersClient } from "./users-client";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { Users as UsersIcon, Shield, ShieldCheck, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("users.view");
  const sp = await searchParams;
  const [rows, stats] = await Promise.all([listAllUsers(), getUsersStats()]);

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Users
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          All authenticated users on the site. Super Admin &amp; Admin can sign in to <code>/admin</code>; plain Users cannot.
        </p>
      </div>
      <KpiStrip
        items={[
          { label: "Total users", value: stats.total, icon: UsersIcon, accent: "primary" },
          { label: "Super admins", value: stats.super_admins, icon: ShieldCheck, accent: "success" },
          { label: "Admins", value: stats.admins, icon: Shield, accent: "info" },
          { label: "New (7d)", value: stats.new_7d, icon: UserPlus, accent: "warning" },
        ]}
      />
      <UsersClient
        rows={rows}
        search={first(sp.search)}
        roleFilter={first(sp.role) || "all"}
        sortKey={first(sp.sort) || "role"}
        sortDir={(first(sp.dir) as "asc" | "desc") || "asc"}
        page={Number(first(sp.page) || 0)}
      />
    </div>
  );
}
