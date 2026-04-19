import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { full_name?: string | null; avatar_url?: string | null }
    | null;
  if (!body) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db
    .from("admin_users")
    .update({
      full_name: body.full_name ?? null,
      avatar_url: body.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", user.email.toLowerCase());

  if (error) {
    return NextResponse.json({ error: "update_failed", detail: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
