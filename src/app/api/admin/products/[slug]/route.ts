import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin || !hasPermission(admin, "data.manage"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as {
    name?: string;
    description?: string | null;
    site_url?: string | null;
    is_active?: boolean;
  } | null;
  if (!body) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const { error } = await supabaseAdmin()
    .from("products")
    .update({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.site_url !== undefined ? { site_url: body.site_url } : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
