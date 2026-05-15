import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin || !hasPermission(admin, "audit.view"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const page = Math.max(0, Number(url.searchParams.get("page") ?? 0));
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize") ?? 30)));
  const sortKey = url.searchParams.get("sort") ?? "occurred_at";
  const sortDir = (url.searchParams.get("dir") ?? "desc") === "asc" ? "asc" : "desc";
  const eventType = url.searchParams.get("event_type");
  const productId = url.searchParams.get("product_id");
  const range = url.searchParams.get("range");
  const search = (url.searchParams.get("search") ?? "").trim();

  const db = supabaseAdmin();

  const selectStr = productId
    ? "id, event_type, occurred_at, ip, user_agent, client:clients(email, full_name), batch:batches!inner(slug, name, product_id)"
    : "id, event_type, occurred_at, ip, user_agent, client:clients(email, full_name), batch:batches(slug, name, product_id)";

  let q = db
    .from("access_events")
    .select(selectStr, { count: "exact" })
    .order(sortKey, { ascending: sortDir === "asc" })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (eventType && eventType !== "all") q = q.eq("event_type", eventType);
  if (productId && productId !== "all") q = q.eq("batch.product_id", productId);
  if (range && range !== "all") {
    const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : range === "30d" ? 24 * 30 : 0;
    if (hours) q = q.gte("occurred_at", new Date(Date.now() - hours * 3600_000).toISOString());
  }

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data ?? [];
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((r: Record<string, unknown>) => {
      const client = r.client as { email?: string } | null;
      return client?.email?.toLowerCase().includes(s) ?? false;
    });
  }

  return NextResponse.json({ ok: true, rows, total: count ?? 0 });
}
