import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

const DAY = 86400_000;

export async function getUsersStats() {
  const db = supabaseAdmin();
  const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const { data: roles } = await db.from("user_roles").select("user_id, role");

  const total = users?.users.length ?? 0;
  const roleMap = new Map<string, string>();
  for (const r of roles ?? []) roleMap.set(r.user_id, r.role);
  let superAdmins = 0;
  let admins = 0;
  const sevenDaysAgo = Date.now() - 7 * DAY;
  let recent = 0;
  for (const u of users?.users ?? []) {
    const role = roleMap.get(u.id);
    if (role === "super_admin") superAdmins++;
    else if (role === "admin") admins++;
    if (u.created_at && new Date(u.created_at).getTime() >= sevenDaysAgo) recent++;
  }
  return { total, super_admins: superAdmins, admins, new_7d: recent };
}

export async function getGlobalRequestsStats() {
  const db = supabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY).toISOString();
  const [pending, approved, rejected, last7d] = await Promise.all([
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "approved"),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    db.from("access_requests").select("id", { count: "exact", head: true }).gte("requested_at", sevenDaysAgo),
  ]);
  return {
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    last_7d: last7d.count ?? 0,
  };
}

export async function getGlobalPasscodesStats() {
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const in7d = new Date(Date.now() + 7 * DAY).toISOString();
  const [active, shared, expiring, revoked] = await Promise.all([
    db.from("passcodes").select("id", { count: "exact", head: true }).is("revoked_at", null),
    db.from("passcodes").select("id", { count: "exact", head: true }).is("client_id", null).is("revoked_at", null),
    db.from("passcodes").select("id", { count: "exact", head: true }).is("revoked_at", null).gte("expires_at", now).lte("expires_at", in7d),
    db.from("passcodes").select("id", { count: "exact", head: true }).not("revoked_at", "is", null),
  ]);
  return {
    active: active.count ?? 0,
    shared: shared.count ?? 0,
    expiring_7d: expiring.count ?? 0,
    revoked: revoked.count ?? 0,
  };
}

export async function getAuditStats() {
  const db = supabaseAdmin();
  const today = new Date(Date.now() - 1 * DAY).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * DAY).toISOString();
  const [day, week, month, actors] = await Promise.all([
    db.from("access_events").select("id", { count: "exact", head: true }).gte("occurred_at", today),
    db.from("access_events").select("id", { count: "exact", head: true }).gte("occurred_at", sevenDaysAgo),
    db.from("access_events").select("id", { count: "exact", head: true }).gte("occurred_at", thirtyDaysAgo),
    db.from("access_events").select("client_id").gte("occurred_at", thirtyDaysAgo).not("client_id", "is", null),
  ]);
  const unique = new Set((actors.data ?? []).map((r) => r.client_id)).size;
  return {
    today: day.count ?? 0,
    last_7d: week.count ?? 0,
    last_30d: month.count ?? 0,
    unique_actors_30d: unique,
  };
}

export async function getContentStats() {
  const db = supabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY).toISOString();
  const [total, published, drafts, recent] = await Promise.all([
    db.from("cms_posts").select("id", { count: "exact", head: true }),
    db.from("cms_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    db.from("cms_posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
    db.from("cms_posts").select("id", { count: "exact", head: true }).gte("updated_at", sevenDaysAgo),
  ]);
  return {
    total: total.count ?? 0,
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    updated_7d: recent.count ?? 0,
  };
}

export async function getEmailTemplatesStats() {
  const db = supabaseAdmin();
  const [total, active, products] = await Promise.all([
    db.from("email_templates").select("id", { count: "exact", head: true }),
    db.from("email_templates").select("id", { count: "exact", head: true }).eq("is_active", true),
    db.from("email_templates").select("product_id").not("product_id", "is", null),
  ]);
  const uniqueProducts = new Set((products.data ?? []).map((r) => r.product_id)).size;
  return {
    total: total.count ?? 0,
    active: active.count ?? 0,
    inactive: (total.count ?? 0) - (active.count ?? 0),
    linked_products: uniqueProducts,
  };
}

export async function getProductsStats() {
  const db = supabaseAdmin();
  const [products, activeProducts, batches, samples] = await Promise.all([
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    db.from("batches").select("id", { count: "exact", head: true }),
    db.from("samples").select("id", { count: "exact", head: true }),
  ]);
  return {
    total: products.count ?? 0,
    active: activeProducts.count ?? 0,
    batches: batches.count ?? 0,
    samples: samples.count ?? 0,
  };
}

export async function getBatchesStats(productId: string) {
  const db = supabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY).toISOString();
  const [total, recent, batchRows, sampleRows] = await Promise.all([
    db.from("batches").select("id", { count: "exact", head: true }).eq("product_id", productId),
    db.from("batches").select("id", { count: "exact", head: true }).eq("product_id", productId).gte("created_at", sevenDaysAgo),
    db.from("batches").select("id").eq("product_id", productId),
    db.from("samples").select("id, batches!inner(product_id)", { count: "exact", head: true }).eq("batches.product_id", productId),
  ]);
  const batchCount = batchRows.data?.length ?? 0;
  const sampleCount = sampleRows.count ?? 0;
  return {
    total: total.count ?? 0,
    samples: sampleCount,
    avg_samples: batchCount > 0 ? Math.round(sampleCount / batchCount) : 0,
    new_7d: recent.count ?? 0,
  };
}

export async function getSamplesStats(productId: string) {
  const db = supabaseAdmin();
  const [total, rows] = await Promise.all([
    db.from("samples").select("id, batches!inner(product_id)", { count: "exact", head: true }).eq("batches.product_id", productId),
    db.from("samples").select("difficulty, batches!inner(product_id)").eq("batches.product_id", productId),
  ]);
  const diffMap = new Map<string, number>();
  for (const r of rows.data ?? []) {
    const k = (r as { difficulty: string | null }).difficulty ?? "—";
    diffMap.set(k, (diffMap.get(k) ?? 0) + 1);
  }
  const sorted = [...diffMap.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  return {
    total: total.count ?? 0,
    difficulties: diffMap.size,
    top_difficulty: top ? `${top[0]} (${top[1]})` : "—",
    untagged: diffMap.get("—") ?? 0,
  };
}

export async function getEventsStats(productId: string) {
  const db = supabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY).toISOString();
  const [total7d, rows] = await Promise.all([
    db.from("access_events").select("id, batches!inner(product_id)", { count: "exact", head: true }).eq("batches.product_id", productId).gte("occurred_at", sevenDaysAgo),
    db.from("access_events").select("client_id, event_type, occurred_at, batches!inner(product_id)").eq("batches.product_id", productId).gte("occurred_at", sevenDaysAgo),
  ]);
  const data = (rows.data ?? []) as Array<{ client_id: string | null; event_type: string; occurred_at: string }>;
  const unique = new Set(data.map((r) => r.client_id).filter(Boolean)).size;
  const byDay = new Map<string, number>();
  for (const r of data) {
    const d = r.occurred_at.slice(0, 10);
    byDay.set(d, (byDay.get(d) ?? 0) + 1);
  }
  const peak = [...byDay.values()].reduce((a, b) => Math.max(a, b), 0);
  const downloads = data.filter((r) => r.event_type?.includes("download")).length;
  return {
    last_7d: total7d.count ?? 0,
    unique_actors: unique,
    peak_day: peak,
    downloads_7d: downloads,
  };
}
