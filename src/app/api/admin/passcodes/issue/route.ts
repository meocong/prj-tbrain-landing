import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { resolveTemplate, renderTemplate } from "@/lib/admin/email-templates";
import { sendEmail } from "@/lib/email/send";
import { generatePasscode, passcodePrefix, hashPasscode } from "@/lib/terminal-bench/auth";

export const runtime = "nodejs";

type IssueBody = {
  product_slug: string;
  batch_id: string;
  client_email: string;
  client_name?: string | null;
  company?: string | null;
  note?: string | null;
  expires_in_days?: number;
  max_uses?: number | null;
  send_email?: boolean;
};

export async function POST(req: Request) {
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = await getAdminUser(user.email);
  if (!admin) return NextResponse.json({ error: "not_admin" }, { status: 403 });
  if (!hasPermission(admin, "passcodes.create"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as IssueBody | null;
  if (!body?.product_slug || !body?.batch_id || !body?.client_email)
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  const db = supabaseAdmin();

  // 1. Resolve product
  const { data: product } = await db
    .from("products")
    .select("id, name, slug, site_url")
    .eq("slug", body.product_slug)
    .maybeSingle();
  if (!product) return NextResponse.json({ error: "product_not_found" }, { status: 404 });

  // 2. Upsert client (CRM)
  const email = body.client_email.trim().toLowerCase();
  const { data: client } = await db
    .from("clients")
    .upsert(
      {
        email,
        full_name: body.client_name ?? null,
        company: body.company ?? null,
        source: "admin",
      },
      { onConflict: "email" }
    )
    .select("id, email, full_name")
    .single();
  if (!client) return NextResponse.json({ error: "client_upsert_failed" }, { status: 500 });

  // 3. Generate + hash passcode
  const passcode = generatePasscode();
  const hash = await hashPasscode(passcode);
  const prefix = passcodePrefix(passcode);
  const days = body.expires_in_days ?? 30;
  const expiresAt = new Date(Date.now() + days * 86400_000).toISOString();

  // 4. Insert passcode row
  const { data: grant, error: grantErr } = await db
    .from("passcodes")
    .upsert(
      {
        client_id: client.id,
        batch_id: body.batch_id,
        product_id: product.id,
        passcode_hash: hash,
        passcode_prefix: prefix,
        expires_at: expiresAt,
        max_uses: body.max_uses ?? null,
        use_count: 0,
        revoked_at: null,
        note: body.note ?? null,
        issued_at: new Date().toISOString(),
      },
      { onConflict: "client_id,batch_id" }
    )
    .select("id")
    .single();
  if (grantErr || !grant) {
    return NextResponse.json({ error: "issue_failed", detail: grantErr?.message }, { status: 500 });
  }

  // 5. Send email (best-effort)
  let emailResult: { ok: boolean; id?: string; error?: string } = { ok: false, error: "not_sent" };
  if (body.send_email !== false) {
    const tpl = await resolveTemplate("passcode_granted", product.id);
    if (tpl) {
      const rendered = renderTemplate(tpl, {
        client_name: client.full_name ?? email,
        product_name: product.name,
        passcode,
        site_url: product.site_url ?? "",
        expires_at: new Date(expiresAt).toLocaleDateString(),
      });
      emailResult = await sendEmail({
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });
    } else {
      emailResult = { ok: false, error: "template_missing" };
    }
  }

  return NextResponse.json({
    ok: true,
    passcode_id: grant.id,
    passcode_plain: passcode,       // return once for admin preview; not logged
    passcode_prefix: prefix,
    email: emailResult,
  });
}
