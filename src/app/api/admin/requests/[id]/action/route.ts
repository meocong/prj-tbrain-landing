import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { resolveTemplate, renderTemplate } from "@/lib/admin/email-templates";
import { sendEmail } from "@/lib/email/send";
import { generatePasscode, passcodePrefix, hashPasscode } from "@/lib/terminal-bench/auth";

export const runtime = "nodejs";

type Body = {
  action: "approve" | "reject";
  reason?: string | null;
  expires_in_days?: number;
  send_email?: boolean;
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supa = await createAdminServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await getAdminUser(user.email);
  if (!admin) return NextResponse.json({ error: "not_admin" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.action) return NextResponse.json({ error: "missing_action" }, { status: 400 });

  const db = supabaseAdmin();

  const { data: reqRow } = await db
    .from("access_requests")
    .select("*, batch:batches(slug, name, product_id), product:products(id, name, slug, site_url)")
    .eq("id", id)
    .maybeSingle();
  if (!reqRow) return NextResponse.json({ error: "request_not_found" }, { status: 404 });

  type Joined = {
    id: string;
    email: string;
    full_name: string | null;
    company: string | null;
    batch_id: string;
    status: string;
    batch: { slug: string; name: string; product_id: string } | null;
    product: { id: string; name: string; slug: string; site_url: string | null } | null;
  };
  const r = reqRow as unknown as Joined;

  if (body.action === "approve") {
    if (!hasPermission(admin, "requests.approve"))
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    // Upsert client
    const { data: client } = await db
      .from("clients")
      .upsert(
        {
          email: r.email.toLowerCase(),
          full_name: r.full_name,
          company: r.company,
          source: "data_request",
        },
        { onConflict: "email" }
      )
      .select("id, email, full_name")
      .single();
    if (!client) return NextResponse.json({ error: "client_upsert_failed" }, { status: 500 });

    // Generate + insert passcode
    const passcode = generatePasscode();
    const hash = await hashPasscode(passcode);
    const prefix = passcodePrefix(passcode);
    const days = body.expires_in_days ?? 30;
    const expiresAt = new Date(Date.now() + days * 86400_000).toISOString();

    const productId = r.product?.id ?? r.batch?.product_id ?? null;

    const { data: grant, error: grantErr } = await db
      .from("passcodes")
      .upsert(
        {
          client_id: client.id,
          batch_id: r.batch_id,
          product_id: productId,
          passcode_hash: hash,
          passcode_prefix: prefix,
          expires_at: expiresAt,
          max_uses: null,
          use_count: 0,
          issued_at: new Date().toISOString(),
          revoked_at: null,
          note: "auto-issued on request approval",
        },
        { onConflict: "client_id,batch_id" }
      )
      .select("id")
      .single();
    if (grantErr || !grant)
      return NextResponse.json({ error: "issue_failed", detail: grantErr?.message }, { status: 500 });

    // Update request status
    await db
      .from("access_requests")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", id);

    // Send email (best-effort)
    let emailResult: { ok: boolean; error?: string } = { ok: false, error: "not_sent" };
    if (body.send_email !== false && r.product) {
      const tpl = await resolveTemplate("request_approved", r.product.id);
      if (tpl) {
        const rendered = renderTemplate(tpl, {
          client_name: client.full_name ?? r.email,
          product_name: r.product.name,
          passcode,
          site_url: r.product.site_url ?? "",
          expires_at: new Date(expiresAt).toLocaleDateString(),
        });
        emailResult = await sendEmail({
          to: r.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        });
      } else {
        emailResult = { ok: false, error: "template_missing" };
      }
    }

    return NextResponse.json({ ok: true, passcode_id: grant.id, passcode_plain: passcode, email: emailResult });
  }

  // action === "reject"
  if (!hasPermission(admin, "requests.reject"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await db
    .from("access_requests")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  let emailResult: { ok: boolean; error?: string } = { ok: false, error: "not_sent" };
  if (body.send_email !== false && r.product) {
    const tpl = await resolveTemplate("request_rejected", r.product.id);
    if (tpl) {
      const rendered = renderTemplate(tpl, {
        client_name: r.full_name ?? r.email,
        product_name: r.product.name,
        reason: body.reason ?? "",
      });
      emailResult = await sendEmail({
        to: r.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });
    }
  }

  return NextResponse.json({ ok: true, email: emailResult });
}
