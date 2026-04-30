import { NextResponse, type NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { sendEmail } from "@/lib/terminal-bench/email";
import NewsletterWelcome from "@/emails/NewsletterWelcome";
import { createElement } from "react";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

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
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`newsletter:${ip}`, RATE_LIMITS.newsletter);
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    email,
    fullName,
    turnstileToken,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    referrer,
  } = parsed.data;
  const utm = { utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer };

  // Only verify Turnstile if a token was sent (footer omits it; rate limit
  // above provides spam protection for low-friction newsletter signup).
  if (turnstileToken) {
    const turnstileOk = await verifyTurnstile(turnstileToken);
    if (!turnstileOk) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 403 });
    }
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
      ...utm,
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Send welcome email — never let a Resend hiccup turn a successful subscribe
  // (DB row already written above) into a 500 for the user.
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to the Tbrain Newsletter",
      template: createElement(NewsletterWelcome, { fullName }),
    });
  } catch (err) {
    console.error("[newsletter] welcome email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
