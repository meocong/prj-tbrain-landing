import { NextResponse, type NextRequest } from "next/server";
import {
  generatePasscode,
  hashPasscode,
  passcodePrefix,
  verifyApproveToken,
} from "@/lib/terminal-bench/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { sendEmail, publicBaseUrl } from "@/lib/terminal-bench/email";
import { ClientPasscodeDelivery } from "@/emails/ClientPasscodeDelivery";
import React from "react";

export const runtime = "nodejs";

function htmlPage(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: Inter, Helvetica, Arial, sans-serif; background:#FAFAF7; color:#0e1b2e; padding: 80px 24px; }
      .card { max-width: 520px; margin: 0 auto; background:#fff; border:1px solid #E5E7EB; border-radius:16px; padding:32px; box-shadow:0 10px 30px rgba(16,16,56,0.05); }
      h1 { font-size: 22px; margin: 0 0 12px; }
      p { color:#78818f; font-size:15px; line-height:1.6; }
      .accent { height:4px; border-radius: 2px; background: linear-gradient(90deg,#d865ff,#0151ff); margin-bottom: 24px; }
    </style></head><body>
    <div class="card"><div class="accent"></div>${body}</div>
    </body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  if (!token) return htmlPage("Invalid", "<h1>Invalid link</h1><p>Missing token.</p>");

  const requestId = await verifyApproveToken(token);
  if (!requestId) return htmlPage("Expired", "<h1>Link expired or invalid</h1><p>Ask the client to resubmit the form.</p>");

  const db = supabaseAdmin();

  const { data: reqRow, error } = await db
    .from("access_requests")
    .select("id, email, full_name, company, role, team_size, use_case, target_use, batch_id, status")
    .eq("id", requestId)
    .maybeSingle();
  if (error || !reqRow) return htmlPage("Not found", "<h1>Request not found</h1>");

  if (reqRow.status !== "pending") {
    return htmlPage(
      "Already handled",
      `<h1>Already handled</h1><p>This request was already <b>${reqRow.status}</b>. If you need to resend the passcode, use the Supabase Studio manual override.</p>`
    );
  }

  if (!reqRow.batch_id) {
    return htmlPage("No batch", "<h1>No batch attached</h1><p>This request has no associated batch; attach one manually first.</p>");
  }

  // Upsert the client.
  const { data: client, error: clientErr } = await db
    .from("clients")
    .upsert(
      {
        email: reqRow.email,
        full_name: reqRow.full_name,
        company: reqRow.company,
        role: reqRow.role,
        team_size: reqRow.team_size,
        use_case: reqRow.use_case,
        target_use: reqRow.target_use,
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (clientErr || !client) {
    console.error("[terminal-bench] client upsert failed:", clientErr);
    return htmlPage("Error", "<h1>Server error</h1><p>Could not create client.</p>");
  }

  const { data: batch } = await db
    .from("batches")
    .select("id, slug, name")
    .eq("id", reqRow.batch_id)
    .single();

  const passcode = generatePasscode();
  const prefix = passcodePrefix(passcode);
  const hash = await hashPasscode(passcode);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: grant, error: grantErr } = await db
    .from("passcodes")
    .upsert(
      {
        client_id: client.id,
        batch_id: reqRow.batch_id,
        passcode_hash: hash,
        passcode_prefix: prefix,
        expires_at: expiresAt,
        max_uses: null,
        use_count: 0,
        revoked_at: null,
        issued_at: new Date().toISOString(),
      },
      { onConflict: "client_id,batch_id" }
    )
    .select("id")
    .single();

  if (grantErr || !grant) {
    console.error("[terminal-bench] grant upsert failed:", grantErr);
    return htmlPage("Error", "<h1>Server error</h1><p>Could not create grant.</p>");
  }

  await db
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "admin-link",
      issued_passcode_last4: passcode.slice(-4),
    })
    .eq("id", requestId);

  const base = publicBaseUrl();
  const enterUrl = `${base}/data/terminal-bench/enter?b=${encodeURIComponent(batch?.slug ?? "")}`;

  try {
    await sendEmail({
      to: reqRow.email,
      subject: "Your Terminal Bench access is ready",
      template: React.createElement(ClientPasscodeDelivery, {
        fullName: reqRow.full_name ?? "there",
        passcode,
        batchName: batch?.name ?? "Terminal Bench showcase",
        enterUrl,
      }),
      replyTo: process.env.ADMIN_EMAIL ?? undefined,
    });
  } catch (err) {
    console.error("[terminal-bench] passcode email failed:", err);
    return htmlPage(
      "Email failed",
      `<h1>Grant created, but the email failed</h1><p>Passcode: <code>${passcode}</code>. Copy it and send manually.</p>`
    );
  }

  return htmlPage(
    "Approved",
    `<h1>Approved</h1><p>Passcode emailed to <b>${reqRow.email}</b>.</p><p>They can enter at <a href="${enterUrl}">${enterUrl}</a>.</p>`
  );
}
