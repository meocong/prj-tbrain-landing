import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CaseStudy } from "@/lib/landing/case-studies";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Inline a local image (path starts with `/`) as a data URI so Puppeteer can
 * render it without needing to reach the dev server. External URLs (http/https)
 * pass through unchanged — Puppeteer fetches them at render time.
 */
async function resolveImageSrc(src: string): Promise<string> {
  if (!src) return src;
  if (src.startsWith("data:") || /^https?:\/\//i.test(src)) return src;
  if (!src.startsWith("/")) return src;
  try {
    const filepath = path.join(process.cwd(), "public", src.replace(/^\/+/, ""));
    const buf = await fs.readFile(filepath);
    const ext = (src.split(".").pop() ?? "").toLowerCase();
    const mime =
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
      ext === "png" ? "image/png" :
      ext === "webp" ? "image/webp" :
      ext === "gif" ? "image/gif" :
      ext === "svg" ? "image/svg+xml" :
      "application/octet-stream";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return src; // missing file — fall back to relative URL
  }
}

// Same accent palette as the public detail page so the brochure feels like a
// printed extension of the website, not a separate document.
const METRIC_ACCENTS = [
  { border: "#059669", text: "#059669", tint: "#ecfdf5" }, // emerald
  { border: "#2563eb", text: "#2563eb", tint: "#eff6ff" }, // blue
  { border: "#9333ea", text: "#9333ea", tint: "#faf5ff" }, // purple
  { border: "#db2777", text: "#db2777", tint: "#fdf2f8" }, // pink
];

/**
 * Render a self-contained HTML document for the printable case study brochure.
 * Fed straight into Puppeteer's page.setContent() — no external fetches, no
 * client JS, all styles inline. Visual language mirrors `.case-study-body` on
 * the public page (vertical bar before h2, list-as-cards, cycling colors).
 */
export async function renderCaseStudyPrintHtml(study: CaseStudy): Promise<string> {
  const heroSrc = study.image ? await resolveImageSrc(study.image) : null;
  const generated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const metaCells = [
    study.clientName && { dt: "Client", dd: study.clientName },
    study.industry && { dt: "Industry", dd: study.industry },
    study.engagementLength && { dt: "Engagement", dd: study.engagementLength },
  ].filter(Boolean) as Array<{ dt: string; dd: string }>;

  const metricsHtml = study.metrics.length
    ? `<div class="metrics">${study.metrics
        .slice(0, 4)
        .map((m, i) => {
          const a = METRIC_ACCENTS[i % METRIC_ACCENTS.length];
          return `<div class="metric" style="border-top-color:${a.border};background:${a.tint}"><div class="metric-value" style="color:${a.text}">${escape(m.value)}</div><div class="metric-label">${escape(m.label)}</div></div>`;
        })
        .join("")}</div>`
    : "";

  const metaHtml = metaCells.length
    ? `<dl class="meta" style="grid-template-columns:repeat(${metaCells.length},1fr)">${metaCells
        .map((c) => `<div><dt>${escape(c.dt)}</dt><dd>${escape(c.dd)}</dd></div>`)
        .join("")}</dl>`
    : "";

  const bodyHtml = study.extendedContent
    ? study.extendedContent
    : `<h2>Project snapshot</h2>
       <ul>
         <li>Outcome-driven delivery with clear success metrics.</li>
         <li>Expert review workflow designed for auditability.</li>
         <li>Reusable operating model for follow-on data programs.</li>
       </ul>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escape(study.title)} — Tbrain Case Study</title>
<style>
  @page { size: A4; margin: 16mm 14mm 18mm 14mm; }
  @page :first { margin: 0; }
  html, body {
    margin: 0; padding: 0; background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: #1f2937; font-size: 11pt; line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h1, h2, h3 { color: #111827; font-weight: 700; letter-spacing: -0.01em; }
  p { margin: 0 0 9pt; }
  a { color: #6C3CF4; text-decoration: none; }

  /* ── Cover ────────────────────────────────────────────────────────── */
  .cover {
    background: linear-gradient(135deg, #6C3CF4 0%, #8b5cf6 50%, #10b981 100%);
    color: #fff;
    padding: 32mm 16mm 22mm;
    page-break-after: always;
    min-height: 245mm;
    display: flex; flex-direction: column; justify-content: space-between;
    box-sizing: border-box;
  }
  .brand { font-size: 11pt; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.85; margin-bottom: 6pt; }
  .cover h1 { color: #fff; font-size: 36pt; line-height: 1.1; margin: 0 0 12pt; max-width: 165mm; font-weight: 700; }
  .cover .tagline { font-size: 14pt; color: rgba(255,255,255,0.92); max-width: 160mm; font-style: italic; }
  .cover .meta { display: grid; gap: 12pt; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 14pt; margin: 0; }
  .cover .meta dt { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.16em; opacity: 0.75; margin-bottom: 4pt; }
  .cover .meta dd { font-size: 12pt; font-weight: 600; margin: 0; }
  .cover .footer-row { font-size: 9pt; opacity: 0.85; display: flex; justify-content: space-between; margin-top: 14pt; }

  /* ── Hero image (after cover, before summary) ─────────────────────── */
  .hero-image {
    margin: 0 0 18pt;
    border-radius: 10pt;
    overflow: hidden;
    box-shadow: 0 2pt 8pt rgba(0,0,0,0.08);
    page-break-inside: avoid;
  }
  .hero-image img { display: block; width: 100%; height: auto; max-height: 90mm; object-fit: cover; }

  /* ── Body intro ───────────────────────────────────────────────────── */
  .summary {
    background: linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%);
    border: 1px solid #e0e7ff;
    border-radius: 10pt;
    padding: 14pt 16pt;
    margin: 14pt 0 22pt;
    page-break-inside: avoid;
  }
  .summary p { margin: 0; font-size: 12pt; color: #1f2937; }

  /* ── Metric banner ────────────────────────────────────────────────── */
  .metrics {
    display: grid;
    gap: 8pt;
    margin: 16pt 0 24pt;
    page-break-inside: avoid;
  }
  ${(() => {
    const cols = Math.min(study.metrics.length || 1, 4);
    return `.metrics { grid-template-columns: repeat(${cols}, 1fr); }`;
  })()}
  .metric {
    text-align: center;
    background: #f8fafc;
    border-top: 4pt solid #6C3CF4;
    border-radius: 8pt;
    padding: 14pt 6pt;
    box-shadow: 0 1pt 3pt rgba(0,0,0,0.06);
  }
  .metric-value { font-size: 26pt; font-weight: 800; line-height: 1.05; }
  .metric-label { font-size: 9pt; color: #6b7280; margin-top: 5pt; font-weight: 500; }

  /* ── Body content (mirrors .case-study-body on the public page) ───── */
  .body {
    padding: 4mm 0 0;
  }

  .body h2 {
    font-size: 17pt;
    font-weight: 700;
    color: #111827;
    margin: 22pt 0 10pt;
    padding-left: 14pt;
    position: relative;
    page-break-after: avoid;
    page-break-inside: avoid;
    line-height: 1.2;
  }
  .body h2::before {
    content: "";
    position: absolute;
    left: 0; top: 4pt;
    width: 5pt;
    height: 16pt;
    border-radius: 4pt;
    background: #2563eb;
  }
  .body h2:nth-of-type(2)::before { background: #4f46e5; }
  .body h2:nth-of-type(3)::before { background: #dc2626; }
  .body h2:nth-of-type(4)::before { background: #4f46e5; }
  .body h2:nth-of-type(5)::before { background: #2563eb; }
  .body h2:nth-of-type(6)::before { background: #16a34a; }
  .body h2:nth-of-type(7)::before { background: #9333ea; }
  .body h2:nth-of-type(8)::before { background: #db2777; }
  .body h2:nth-of-type(9)::before { background: #f59e0b; }

  .body h3 {
    font-size: 12pt;
    font-weight: 600;
    color: #1f2937;
    margin: 14pt 0 6pt;
    page-break-after: avoid;
  }

  .body p { margin: 6pt 0 8pt; color: #1f2937; }
  .body strong { color: #2563eb; font-weight: 700; }
  .body em { color: #6b7280; font-style: italic; }

  /* List items rendered as colored sub-cards, like the public page */
  .body ul, .body ol {
    list-style: none;
    padding: 0;
    margin: 8pt 0 14pt;
  }
  .body ul li, .body ol li {
    background: #f9fafb;
    border-left: 3pt solid #2563eb;
    border-radius: 5pt;
    padding: 7pt 11pt;
    margin: 4pt 0;
    page-break-inside: avoid;
    font-size: 10.5pt;
  }
  .body ul li:nth-child(2n) { border-left-color: #4f46e5; }
  .body ul li:nth-child(3n) { border-left-color: #dc2626; }
  .body ul li:nth-child(4n) { border-left-color: #16a34a; }
  .body ul li:nth-child(5n) { border-left-color: #9333ea; }
  .body ol li:nth-child(2n) { border-left-color: #4f46e5; }
  .body ol li:nth-child(3n) { border-left-color: #16a34a; }

  .body blockquote {
    background: #faf5ff;
    border-left: 3pt solid #6C3CF4;
    border-radius: 5pt;
    padding: 8pt 12pt;
    margin: 12pt 0;
    color: #4b5563;
    font-style: italic;
    page-break-inside: avoid;
  }

  .body code { background: #f3f4f6; padding: 1pt 4pt; border-radius: 3pt; font-size: 9.5pt; }
  .body pre { background: #111827; color: #e5e7eb; padding: 10pt; border-radius: 5pt; font-size: 9pt; page-break-inside: avoid; }
  .body img { max-width: 100%; height: auto; border-radius: 5pt; margin: 10pt 0; page-break-inside: avoid; }

  /* ── CTA ──────────────────────────────────────────────────────────── */
  .cta {
    margin-top: 24pt;
    padding: 16pt 18pt;
    background: linear-gradient(120deg, #6C3CF4, #8b5cf6);
    color: #fff;
    border-radius: 8pt;
    page-break-inside: avoid;
  }
  .cta h3 { color: #fff; margin: 0 0 4pt; font-size: 14pt; font-weight: 700; }
  .cta p { margin: 0; opacity: 0.95; font-size: 11pt; }
</style>
</head>
<body>
  <section class="cover">
    <div>
      <div class="brand">TBrain · Case Study</div>
      <h1>${escape(study.title)}</h1>
      ${study.shortDescription ? `<p class="tagline">${escape(study.shortDescription)}</p>` : ""}
    </div>
    <div>
      ${metaHtml}
      <div class="footer-row">
        <span>tbrain.ai</span>
        <span>${escape(generated)}</span>
      </div>
    </div>
  </section>

  <section class="body">
    ${heroSrc ? `<div class="hero-image"><img src="${heroSrc}" alt="${escape(study.title)}" /></div>` : ""}
    ${study.description ? `<div class="summary"><p>${escape(study.description)}</p></div>` : ""}
    ${metricsHtml}
    ${bodyHtml}
    <div class="cta">
      <h3>Want a similar program?</h3>
      <p>Talk to our team at tbrain.ai/contact — we'll scope a pilot in days, not months.</p>
    </div>
  </section>
</body>
</html>`;
}
