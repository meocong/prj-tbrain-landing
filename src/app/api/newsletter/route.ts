import { NextResponse, type NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { sendEmail } from "@/lib/terminal-bench/email";
import NewsletterWelcome from "@/emails/NewsletterWelcome";
import { createElement } from "react";

export const runtime = "nodejs";

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    }
  );
  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, fullName, turnstileToken } = parsed.data;

  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
  }

  const db = supabaseAdmin();

  // Upsert subscriber
  const { error } = await db.from("newsletter_subscribers").upsert(
    {
      email,
      full_name: fullName || null,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
      source: "website",
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Send welcome email
  await sendEmail({
    to: email,
    subject: "Welcome to the Tbrain Newsletter",
    template: createElement(NewsletterWelcome, { fullName }),
  });

  return NextResponse.json({ ok: true });
}
