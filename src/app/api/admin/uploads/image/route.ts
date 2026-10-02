import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { uploadBuffer, signDownloadUrl } from "@/lib/terminal-bench/gcs";
import { detectImageType } from "@/lib/admin/image-type";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

function safeName(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export async function POST(req: NextRequest) {
  await requireAdmin("content.edit");

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large", maxBytes: MAX_BYTES }, { status: 413 });
  }
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "unsupported_mime", got: file.type }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected) {
    return NextResponse.json({ error: "magic_byte_mismatch" }, { status: 400 });
  }

  // Stable GCS path under cms/ — partitioned by year-month so we can prune
  // orphan uploads later if needed.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const ext = detected.split("/")[1].replace("jpeg", "jpg");
  const gcsObject = `cms/${year}/${month}/${uuid}_${safeName(file.name)}.${ext}`;

  await uploadBuffer(gcsObject, buffer, detected);

  // 7-day signed URL — Puppeteer fetches it at PDF-gen time; once embedded in
  // the PDF the URL stops mattering. Web pages re-render via ISR (300s) and
  // would need a fresh signature if the URL expires; for that case we should
  // proxy through `/api/asset/<obj>` later. Good enough for v1.
  const url = await signDownloadUrl(gcsObject, 7 * 24 * 3600);

  return NextResponse.json({
    ok: true,
    url,
    gcsObject,
    contentType: detected,
    sizeBytes: buffer.length,
  });
}
