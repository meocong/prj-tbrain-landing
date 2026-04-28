import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { uploadCmsAsset } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin("content.edit");
  const { id } = await params;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "only PDF files are accepted" }, { status: 400 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "file too large (max 25MB)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Magic byte check — defeat MIME/extension spoofing. Real PDFs start with %PDF.
  const magic = buffer.subarray(0, 4).toString("ascii");
  if (magic !== "%PDF") {
    return NextResponse.json(
      { error: "file is not a valid PDF (magic byte mismatch)" },
      { status: 400 }
    );
  }

  const { gcsObject } = await uploadCmsAsset(file.name, buffer, "application/pdf");

  const db = supabaseAdmin();
  const { error } = await db
    .from("case_studies")
    .update({
      pdf_gcs_object: gcsObject,
      pdf_filename: file.name,
    })
    .eq("id", id);
  if (error) {
    console.error("[case-study/pdf] DB update failed", error);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, gcsObject, filename: file.name });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin("content.edit");
  const { id } = await params;
  const db = supabaseAdmin();
  const { error } = await db
    .from("case_studies")
    .update({ pdf_gcs_object: null, pdf_filename: null })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
