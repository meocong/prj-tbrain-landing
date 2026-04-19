import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin || !hasPermission(admin, "passcodes.revoke"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { error } = await supabaseAdmin()
    .from("passcodes")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
