import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { uploadBuffer } from "@/lib/terminal-bench/gcs";
import { renderCaseStudyPrintHtml } from "@/lib/casestudy/print-html";
import { renderHtmlToPdf } from "@/lib/casestudy/render-pdf";
import type { CaseStudy } from "@/lib/landing/case-studies";

export const runtime = "nodejs";
export const maxDuration = 60;

type Row = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  metrics: Array<{ value: string; label: string }> | null;
  display_order: number;
  is_active: boolean;
  extended_content: string | null;
  client_name: string | null;
  industry: string | null;
  engagement_length: string | null;
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin("content.edit");
  const { id } = await params;

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("case_studies")
    .select(
      "id, slug, title, short_description, description, image_url, metrics, display_order, is_active, extended_content, client_name, industry, engagement_length"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "case_study_not_found" }, { status: 404 });
  }

  const r = data as Row;
  const study: CaseStudy = {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description ?? "",
    description: r.description ?? "",
    image: r.image_url || "/images/code-screen.jpg",
    metrics: Array.isArray(r.metrics) ? r.metrics : [],
    extendedContent: r.extended_content,
    clientName: r.client_name,
    industry: r.industry,
    engagementLength: r.engagement_length,
  };

  let pdf: Buffer;
  try {
    const html = await renderCaseStudyPrintHtml(study);
    pdf = await renderHtmlToPdf(html);
  } catch (err) {
    console.error("[regenerate-pdf] render failed", err);
    return NextResponse.json({ error: "pdf_render_failed" }, { status: 500 });
  }

  // Stable path keyed on slug — re-uploads overwrite the previous version so
  // we don't accumulate orphan PDFs in GCS.
  const filename = `tbrain-casestudy-${study.slug}.pdf`;
  const gcsObject = `cms/casestudy/${study.slug}.pdf`;
  try {
    await uploadBuffer(gcsObject, pdf, "application/pdf");
  } catch (err) {
    console.error("[regenerate-pdf] GCS upload failed", err);
    return NextResponse.json({ error: "gcs_upload_failed" }, { status: 500 });
  }

  const { error: updErr } = await db
    .from("case_studies")
    .update({
      pdf_gcs_object: gcsObject,
      pdf_filename: filename,
    })
    .eq("id", id);
  if (updErr) {
    console.error("[regenerate-pdf] DB update failed", updErr);
    return NextResponse.json({ error: "db_update_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    filename,
    gcsObject,
    sizeBytes: pdf.length,
    generatedAt: new Date().toISOString(),
  });
}
