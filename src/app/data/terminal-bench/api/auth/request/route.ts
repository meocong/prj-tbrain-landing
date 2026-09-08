import { NextResponse, type NextRequest } from "next/server";
import { signApproveToken, verifyTurnstile } from "@/lib/terminal-bench/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { sendEmail, publicBaseUrl } from "@/lib/terminal-bench/email";
import { getAdminRecipients } from "@/lib/admin/email-recipients";
import { AdminRequestNotification } from "@/emails/AdminRequestNotification";
import React from "react";

export const runtime = "nodejs";

interface RequestBody {
  email?: string;
  fullName?: string;
  company?: string;
  role?: string;
  teamSize?: string;
  useCase?: string;
  targetUse?: string[];
  batchSlug?: string;
  turnstileToken?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const fullName = body.fullName?.trim();
  const company = body.company?.trim();
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!fullName) return NextResponse.json({ error: "missing_full_name" }, { status: 400 });
  if (!company) return NextResponse.json({ error: "missing_company" }, { status: 400 });

  const ok = await verifyTurnstile(body.turnstileToken, clientIp(req));
  if (!ok) return NextResponse.json({ error: "turnstile_failed" }, { status: 400 });

  const db = supabaseAdmin();

  // Resolve the batch (optional — a request may refer to a specific batch).
  let batchId: string | null = null;
  let batchName: string | null = null;
  let productId: string | null = null;
  if (body.batchSlug) {
    const { data: batch } = await db
      .from("batches")
      .select("id, name, product_id")
      .eq("project", "terminal-bench")
      .eq("slug", body.batchSlug)
      .maybeSingle();
    batchId = batch?.id ?? null;
    batchName = batch?.name ?? null;
    productId = batch?.product_id ?? null;
  }

  // Fallback: derive product_id from the terminal-bench product when no batch
  // was supplied (or batch had no product link). Keeps /admin/products/.../requests
  // surfaces working even if the requester didn't pick a specific batch.
  if (!productId) {
    const { data: tbProduct } = await db
      .from("products")
      .select("id")
      .eq("slug", "terminal-bench")
      .maybeSingle();
    productId = tbProduct?.id ?? null;
  }

  const { data: inserted, error } = await db
    .from("access_requests")
    .insert({
      email,
      full_name: fullName,
      company,
      role: body.role ?? null,
      team_size: body.teamSize ?? null,
      use_case: body.useCase ?? null,
      target_use: body.targetUse ?? null,
      batch_id: batchId,
      product_id: productId,
      status: "pending",
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_term: body.utm_term ?? null,
      utm_content: body.utm_content ?? null,
      referrer: body.referrer ?? null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[terminal-bench] request insert failed:", error);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  const token = await signApproveToken(inserted.id);
  await db.from("access_requests").update({ approve_token: token }).eq("id", inserted.id);

  const base = publicBaseUrl();
  const approveUrl = `${base}/data/terminal-bench/api/auth/approve?t=${encodeURIComponent(token)}`;
  const rejectUrl = `${base}/data/terminal-bench/api/auth/reject?t=${encodeURIComponent(token)}`;

  try {
    await sendEmail({
      to: getAdminRecipients(),
      subject: `New Terminal Bench request — ${company}`,
      template: React.createElement(AdminRequestNotification, {
        fullName,
        email,
        company,
        role: body.role,
        teamSize: body.teamSize,
        useCase: body.useCase,
        targetUse: body.targetUse,
        batchName: batchName ?? body.batchSlug ?? "",
        approveUrl,
        rejectUrl,
      }),
    });
  } catch (err) {
    console.error("[terminal-bench] admin notification failed:", err);
  }

  return NextResponse.json({ ok: true });
}
