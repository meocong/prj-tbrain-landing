import "server-only";
import { redirect } from "next/navigation";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

// Loose typing — the Supabase fluent API is hard to thread generically here;
// the concrete call sites handle their own select/filter types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

export type ListConfig = {
  table: string;
  permCode: string;
  select?: string;
  searchable?: string[];
  defaultSort?: { key: string; dir: "asc" | "desc" };
  sortWhitelist?: string[];
  filters?: Record<string, (value: string, q: QueryBuilder) => QueryBuilder | undefined>;
};

export type ListResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sort: { key: string; dir: "asc" | "desc" };
  filters: Record<string, string>;
};

/** Server-side admin list fetcher — call from Server Components with awaited searchParams. */
export async function listAdminResource<T>(
  cfg: ListConfig,
  searchParams: Record<string, string | string[] | undefined>
): Promise<ListResult<T>> {
  await requireAdmin(cfg.permCode);

  const page = Math.max(0, Number(firstParam(searchParams.page) ?? 0));
  const pageSize = Math.min(200, Math.max(1, Number(firstParam(searchParams.pageSize) ?? 30)));
  const search = (firstParam(searchParams.search) ?? "").trim();
  const sortKey = firstParam(searchParams.sort) ?? cfg.defaultSort?.key ?? "created_at";
  const sortDir = (firstParam(searchParams.dir) ?? cfg.defaultSort?.dir ?? "desc") === "asc" ? "asc" : "desc";

  const db = supabaseAdmin();
  let q = db
    .from(cfg.table)
    .select(cfg.select ?? "*", { count: "exact" })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  const allowSort = cfg.sortWhitelist ? cfg.sortWhitelist.includes(sortKey) : true;
  if (allowSort) {
    q = q.order(sortKey, { ascending: sortDir === "asc" });
  }

  if (search && cfg.searchable?.length) {
    const escaped = search.replace(/[%,()]/g, "");
    q = q.or(cfg.searchable.map((c) => `${c}.ilike.%${escaped}%`).join(","));
  }

  const activeFilters: Record<string, string> = {};
  for (const [key, transform] of Object.entries(cfg.filters ?? {})) {
    const v = firstParam(searchParams[key]);
    if (v !== undefined && v !== "" && v !== "all") {
      activeFilters[key] = v;
      const next = transform(v, q as QueryBuilder);
      if (next) q = next;
    }
  }

  const { data, count, error } = await q;
  if (error) {
    console.error(`[admin-list/${cfg.table}]`, error.message);
    return {
      rows: [], total: 0, page, pageSize, search,
      sort: { key: sortKey, dir: sortDir }, filters: activeFilters,
    };
  }

  return {
    rows: (data ?? []) as T[],
    total: count ?? 0,
    page,
    pageSize,
    search,
    sort: { key: sortKey, dir: sortDir },
    filters: activeFilters,
  };
}

export async function requireAdmin(permCode?: string) {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) redirect("/admin/login");
  const admin = await getAdminUser(user.email);
  if (!admin) redirect("/admin/login");
  if (permCode && !hasPermission(admin, permCode)) {
    // Not redirecting — let the page render a 403 empty state instead
    throw new Error(`Forbidden: missing ${permCode}`);
  }
  return admin;
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

/** Get single product by slug (server-only). */
export async function getProductBySlug(slug: string) {
  await requireAdmin();
  const db = supabaseAdmin();
  const { data } = await db.from("products").select("*").eq("slug", slug).maybeSingle();
  return data as { id: string; slug: string; name: string; description: string | null; site_url: string | null; sample_type: string | null; is_active: boolean } | null;
}

/** Product stats (server-only, single round-trip). */
export async function getProductStats(productId: string) {
  await requireAdmin();
  const db = supabaseAdmin();
  const thirty = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [batches, samples, passcodes, requests, events] = await Promise.all([
    db.from("batches").select("id", { count: "exact", head: true }).eq("product_id", productId),
    db.from("samples").select("id, batches!inner(product_id)", { count: "exact", head: true }).eq("batches.product_id", productId),
    db.from("passcodes").select("id", { count: "exact", head: true }).eq("product_id", productId).is("revoked_at", null),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("product_id", productId).eq("status", "pending"),
    db.from("access_events").select("id, batches!inner(product_id)", { count: "exact", head: true }).eq("batches.product_id", productId).gte("occurred_at", thirty),
  ]);
  return {
    batches: batches.count ?? 0,
    samples: samples.count ?? 0,
    passcodes: passcodes.count ?? 0,
    requests: requests.count ?? 0,
    events_30d: events.count ?? 0,
  };
}

/** Dashboard stats (server-only). */
export async function getDashboardData() {
  await requireAdmin();
  const db = supabaseAdmin();
  const [
    contacts, passcodes, pendingRequests, publishedPosts, totalEvents, pendingApprovals,
    recentEvents, recentPosts,
  ] = await Promise.all([
    db.from("clients").select("id", { count: "exact", head: true }),
    db.from("passcodes").select("id", { count: "exact", head: true }).is("revoked_at", null),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("cms_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    db.from("access_events").select("id", { count: "exact", head: true }),
    db.from("approval_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("access_events").select("id, event_type, occurred_at, client:clients(email)").order("occurred_at", { ascending: false }).limit(5),
    db.from("cms_posts").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);
  return {
    stats: {
      contacts: contacts.count ?? 0,
      passcodes: passcodes.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      publishedPosts: publishedPosts.count ?? 0,
      totalEvents: totalEvents.count ?? 0,
      pendingApprovals: pendingApprovals.count ?? 0,
    },
    recentEvents: (recentEvents.data ?? []) as unknown as Array<{ id: number; event_type: string; occurred_at: string; client?: { email: string } | null }>,
    recentPosts: (recentPosts.data ?? []) as unknown as Array<{ id: string; title: string; status: string; updated_at: string }>,
  };
}
