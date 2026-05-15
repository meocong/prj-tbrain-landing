import { NextResponse, type NextRequest } from "next/server";
import { verifyApproveToken } from "@/lib/terminal-bench/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { sendEmail } from "@/lib/terminal-bench/email";
import { getAdminReplyTo } from "@/lib/admin/email-recipients";
import { ClientRejection } from "@/emails/ClientRejection";
import React from "react";

export const runtime = "nodejs";

function page(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:Inter,Helvetica,Arial,sans-serif;background:#FAFAF7;color:#0e1b2e;padding:80px 24px}
    .card{max-width:520px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:32px}
    h1{font-size:22px;margin:0 0 12px}p{color:#78818f;font-size:15px}</style></head>
    <body><div class="card">${body}</div></body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  if (!token) return page("Invalid", "<h1>Invalid link</h1>");

  const requestId = await verifyApproveToken(token);
  if (!requestId) return page("Expired", "<h1>Expired link</h1>");

  const db = supabaseAdmin();
  const { data: reqRow } = await db
    .from("access_requests")
    .select("id, email, full_name, status")
    .eq("id", requestId)
    .maybeSingle();
  if (!reqRow) return page("Not found", "<h1>Request not found</h1>");

  if (reqRow.status !== "pending") {
    return page("Already handled", `<h1>Already handled</h1><p>Current status: <b>${reqRow.status}</b>.</p>`);
  }

  await db
    .from("access_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "admin-link",
    })
    .eq("id", requestId);

  try {
    await sendEmail({
      to: reqRow.email,
      subject: "Re: your Terminal Bench access request",
      template: React.createElement(ClientRejection, { fullName: reqRow.full_name ?? "there" }),
      replyTo: getAdminReplyTo(),
    });
  } catch (err) {
    console.error("[terminal-bench] rejection email failed:", err);
  }

  return page("Rejected", `<h1>Rejected</h1><p>We told <b>${reqRow.email}</b> politely.</p>`);
}
