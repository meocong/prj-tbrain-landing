import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { renderTemplate, type TemplateRow } from "@/lib/admin/email-templates";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { template_id?: string; key?: string; product_id?: string | null; vars?: Record<string, string | number | null | undefined> }
    | null;
  if (!body) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const db = supabaseAdmin();
  let tpl: TemplateRow | null = null;
  if (body.template_id) {
    const { data } = await db.from("email_templates").select("*").eq("id", body.template_id).maybeSingle();
    tpl = (data as TemplateRow | null) ?? null;
  }
  if (!tpl) return NextResponse.json({ error: "template_not_found" }, { status: 404 });

  const rendered = renderTemplate(tpl, body.vars ?? {});
  return NextResponse.json({ ok: true, rendered });
}
