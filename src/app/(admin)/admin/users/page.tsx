import { requireAdmin } from "@/lib/admin/server/list";
import { listAllUsers } from "@/lib/admin/server/users";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("users.view");
  const sp = await searchParams;
  const rows = await listAllUsers();

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
