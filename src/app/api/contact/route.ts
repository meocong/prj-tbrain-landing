import { NextResponse, type NextRequest } from "next/server";
import { contactSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/terminal-bench/email";
import ContactConfirmation from "@/emails/ContactConfirmation";
import ContactAdminNotification from "@/emails/ContactAdminNotification";
import { createElement } from "react";

export const runtime = "nodejs";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Skip in dev

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contact);
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, fullName, company, role, phone, message, turnstileToken } =
    parsed.data;

  // Verify Turnstile
  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
  }

  const db = supabaseAdmin();

  // Upsert client record
  const { data: client } = await db
    .from("clients")
    .upsert(
      {
        email,
        full_name: fullName,
        company: company || null,
        role: role || null,
        phone: phone || null,
        source: "contact_form",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  // Store contact submission
  await db.from("contact_submissions").insert({
    email,
    full_name: fullName,
    company: company || null,
    role: role || null,
    phone: phone || null,
    message,
    source: "contact_form",
    client_id: client?.id ?? null,
  });

  // Send confirmation email to user
  await sendEmail({
    to: email,
    subject: "We received your message - Tbrain",
    template: createElement(ContactConfirmation, { fullName }),
  });

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL ?? "drake@tbrain.ai";
  await sendEmail({
    to: adminEmail,
    subject: `New contact: ${fullName} (${company || "N/A"})`,
    template: createElement(ContactAdminNotification, {
      email,
      fullName,
      company,
      role,
      phone,
      message,
    }),
    replyTo: email,
  });

  return NextResponse.json({ ok: true });
}
