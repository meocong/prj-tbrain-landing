import { NextResponse, type NextRequest } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import {
  generatePasscode,
  hashPasscode,
  passcodePrefix,
} from "@/lib/terminal-bench/auth";
import { sendEmail } from "@/lib/terminal-bench/email";
import { logAdminAction } from "@/lib/admin/audit";
import { passcodeCreateSchema } from "@/lib/validation";
import { createElement } from "react";
import ClientPasscodeDelivery from "@/emails/ClientPasscodeDelivery";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = await getAdminUser(user.email);
  if (!admin || !hasPermission(admin, "passcodes.create")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Validate input
  const body = await req.json();
  const parsed = passcodeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { clientEmail, batchId, expiresInDays, maxUses, note, sendEmail: shouldSendEmail } =
    parsed.data;

  const db = supabaseAdmin();

  // Upsert client
  const { data: client } = await db
    .from("clients")
    .upsert(
      {
        email: clientEmail,
        source: "admin",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (!client) {
    return NextResponse.json({ error: "client_upsert_failed" }, { status: 500 });
  }

  // Generate passcode
  const passcode = generatePasscode();
  const hash = await hashPasscode(passcode);
  const prefix = passcodePrefix(passcode);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // Insert grant
  const { data: grant, error } = await db
    .from("passcodes")
    .upsert(
      {
        client_id: client.id,
        batch_id: batchId,
        passcode_hash: hash,
        passcode_prefix: prefix,
        expires_at: expiresAt.toISOString(),
        max_uses: maxUses ?? null,
        note: note ?? null,
      },
      { onConflict: "client_id,batch_id" }
    )
    .select("id")
    .single();

  if (error || !grant) {
    return NextResponse.json({ error: "grant_insert_failed" }, { status: 500 });
  }

  // Send email if requested
  if (shouldSendEmail) {
    const { data: batch } = await db
      .from("batches")
      .select("name, slug")
      .eq("id", batchId)
      .single();

    const baseUrl = process.env.PUBLIC_BASE_URL ?? "https://tbrain.ai";
    await sendEmail({
      to: clientEmail,
      subject: `Your access passcode for ${batch?.name || "Tbrain Data"}`,
      template: createElement(ClientPasscodeDelivery, {
        fullName: clientEmail.split("@")[0],
        passcode,
        batchName: batch?.name || "Data",
        enterUrl: `${baseUrl}/data/terminal-bench/enter`,
      }),
    });
  }

  // Audit log
  await logAdminAction({
    adminUserId: admin.id,
    action: "create",
    resourceType: "passcode",
    resourceId: grant.id,
    details: { clientEmail, batchId, expiresInDays, sentEmail: shouldSendEmail },
    ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
    userAgent: req.headers.get("user-agent") ?? null,
  });

  return NextResponse.json({
    ok: true,
    grantId: grant.id,
    passcode: shouldSendEmail ? undefined : passcode, // Only return if not emailed
  });
}
