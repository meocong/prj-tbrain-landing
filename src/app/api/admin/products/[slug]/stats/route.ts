import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin) return NextResponse.json({ error: "not_admin" }, { status: 403 });

  const db = supabaseAdmin();
  const { data: product } = await db.from("products").select("*").eq("slug", slug).maybeSingle();
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const pid = product.id;
  const thirty = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [batches, samples, passcodes, requests, events] = await Promise.all([
    db.from("batches").select("id", { count: "exact", head: true }).eq("product_id", pid),
    db
      .from("samples")
      .select("id, batches!inner(product_id)", { count: "exact", head: true })
      .eq("batches.product_id", pid),
    db
      .from("passcodes")
      .select("id", { count: "exact", head: true })
      .eq("product_id", pid)
      .is("revoked_at", null),
    db
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .eq("product_id", pid)
      .eq("status", "pending"),
    db
      .from("access_events")
      .select("id, batches!inner(product_id)", { count: "exact", head: true })
      .eq("batches.product_id", pid)
      .gte("occurred_at", thirty),
  ]);

  return NextResponse.json({
    ok: true,
    product,
    stats: {
      batches: batches.count ?? 0,
      samples: samples.count ?? 0,
      passcodes: passcodes.count ?? 0,
      requests: requests.count ?? 0,
      events_30d: events.count ?? 0,
    },
  });
}
