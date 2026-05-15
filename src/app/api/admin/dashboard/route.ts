import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin) return NextResponse.json({ error: "not_admin" }, { status: 403 });

  const db = supabaseAdmin();
  const [
    contacts,
    passcodes,
    pendingRequests,
    publishedPosts,
    totalEvents,
    pendingApprovals,
    recentEvents,
    recentPosts,
  ] = await Promise.all([
    db.from("clients").select("id", { count: "exact", head: true }),
    db.from("passcodes").select("id", { count: "exact", head: true }).is("revoked_at", null),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("cms_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    db.from("access_events").select("id", { count: "exact", head: true }),
    db.from("approval_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db
      .from("access_events")
      .select("id, event_type, occurred_at, client:clients(email)")
      .order("occurred_at", { ascending: false })
      .limit(5),
    db
      .from("cms_posts")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    ok: true,
    stats: {
      contacts: contacts.count ?? 0,
      passcodes: passcodes.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      publishedPosts: publishedPosts.count ?? 0,
      totalEvents: totalEvents.count ?? 0,
      pendingApprovals: pendingApprovals.count ?? 0,
    },
    recentEvents: recentEvents.data ?? [],
    recentPosts: recentPosts.data ?? [],
  });
}
