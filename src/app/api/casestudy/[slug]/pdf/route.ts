import { NextResponse, type NextRequest } from "next/server";
import { getCaseStudyBySlug } from "@/lib/landing/case-studies";
import { renderUrlToPdf } from "@/lib/casestudy/render-pdf";
import { downloadBuffer, signDownloadUrl } from "@/lib/terminal-bench/gcs";
import { publicBaseUrl } from "@/lib/terminal-bench/email";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMAIL_RX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const FREE_EMAIL_DOMAINS = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me", "protonmail.com"]);

type PostBody = {
  email?: string;
  full_name?: string | null;
  company?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
};

function pdfFilename(slug: string): string {
  return `tbrain-casestudy-${slug}.pdf`;
}

// Admin preview path: /api/casestudy/[slug]/pdf?preview=1 — bypasses lead gate
// but requires an authenticated admin session cookie. Always serves the cached
// PDF when available, otherwise falls back to an on-demand render so admins
// can iterate without remembering to click "Generate" first.
async function handlePreview(slug: string) {
  const { requireAdmin } = await import("@/lib/admin/server/list");
  await requireAdmin("content.view");
  const study = await getCaseStudyBySlug(slug);
  if (!study) return NextResponse.json({ error: "case study not found" }, { status: 404 });

  let pdf: Buffer;
  if (study.pdfGcsObject) {
    pdf = await downloadBuffer(study.pdfGcsObject);
  } else {
    const url = `${publicBaseUrl()}/casestudy/${slug}?pdf=1`;
    pdf = await renderUrlToPdf(url);
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${pdfFilename(slug)}"`,
      "cache-control": "private, no-store",
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);
  if (url.searchParams.get("preview") === "1") {
    try {
      return await handlePreview(slug);
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 401;
      return NextResponse.json({ error: "unauthorized" }, { status });
    }
  }
  return NextResponse.json({ error: "POST required for gated download" }, { status: 405 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ip = getClientIp(req.headers);

  const rl = checkRateLimit(`casestudy-pdf:${ip}`, RATE_LIMITS.api);
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RX.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const study = await getCaseStudyBySlug(slug);
  if (!study) {
    return NextResponse.json({ error: "case_study_not_found" }, { status: 404 });
  }

  // Admin must pre-generate the PDF (or upload one). We refuse to render on-
  // demand for the public — keeps the user-facing flow instant and avoids
  // burning Puppeteer compute on every download.
  if (!study.pdfGcsObject) {
    return NextResponse.json(
      {
        error: "brochure_not_ready",
        detail: "This case study does not have a downloadable brochure yet.",
      },
      { status: 409 }
    );
  }

  // Best-effort lead capture — never block download on DB failure.
  try {
    const db = supabaseAdmin();
    const domain = email.split("@")[1] ?? null;
    const isFreeEmail = domain ? FREE_EMAIL_DOMAINS.has(domain) : false;

    await db.from("case_study_downloads").insert({
      case_study_id: study.id ?? null,
      email,
      full_name: body.full_name ?? null,
      company: body.company ?? null,
      ip,
      user_agent: req.headers.get("user-agent"),
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_term: body.utm_term ?? null,
      utm_content: body.utm_content ?? null,
      referrer: body.referrer ?? null,
    });

    await db.from("newsletter_subscribers").upsert(
      {
        email,
        full_name: body.full_name ?? null,
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
        source: `casestudy:${slug}`,
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        utm_term: body.utm_term ?? null,
        utm_content: body.utm_content ?? null,
        referrer: body.referrer ?? null,
      },
      { onConflict: "email" }
    );

    if (!isFreeEmail) {
      console.info("[casestudy/pdf] business email lead", { email, slug, company: body.company });
    }
  } catch (err) {
    console.error("[casestudy/pdf] lead capture failed (download proceeded)", err);
  }

  // Hand the browser a short-lived signed URL so the file streams directly
  // from GCS — keeps the API response tiny and offloads bandwidth.
  const signedUrl = await signDownloadUrl(study.pdfGcsObject, 300);
  return NextResponse.json({
    ok: true,
    url: signedUrl,
    filename: study.pdfFilename ?? pdfFilename(slug),
    expiresIn: 300,
  });
}
