import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { uploadBuffer } from "@/lib/terminal-bench/gcs";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { getDocumentProxy, extractText } from "unpdf";
import mammoth from "mammoth";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_CHARS = 200_000;

type DocExt = "pdf" | "docx" | "md" | "txt";

const CONTENT_TYPE: Record<DocExt, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  md: "text/markdown",
  txt: "text/plain",
};

function safeName(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

/** Decide the doc kind from extension + magic bytes — defeats a renamed upload. */
function detectDocType(filename: string, buf: Buffer): DocExt | null {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") {
    return buf.subarray(0, 4).toString("ascii") === "%PDF" ? "pdf" : null;
  }
  if (ext === "docx") {
    // DOCX is a zip (PK\x03\x04 or the empty-archive PK\x05\x06 variant).
    return buf[0] === 0x50 && buf[1] === 0x4b ? "docx" : null;
  }
  if (ext === "md" || ext === "txt") {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(buf);
      return ext;
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

const MAX_UNZIPPED_BYTES = 60 * 1024 * 1024;
const MAX_PDF_PAGES = 400;
const EXTRACT_TIMEOUT_MS = 25_000;

/**
 * Sum of uncompressed sizes in a zip's central directory, so a DOCX that
 * would inflate to something huge (zip bomb) is refused before parsing.
 */
function zipUncompressedBytes(buf: Buffer): number {
  let total = 0;
  for (let i = 0; i + 46 <= buf.length; i++) {
    if (buf.readUInt32LE(i) !== 0x02014b50) continue;
    total += buf.readUInt32LE(i + 24);
    i += 45;
  }
  return total;
}

function withTimeout<T>(work: Promise<T>): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("extract_timeout")), EXTRACT_TIMEOUT_MS)),
  ]);
}

async function extractDocText(kind: DocExt, buffer: Buffer): Promise<string> {
  if (kind === "pdf") {
    const doc = await withTimeout(getDocumentProxy(new Uint8Array(buffer)));
    if (doc.numPages > MAX_PDF_PAGES) throw new Error("too_many_pages");
    const { text } = await withTimeout(extractText(doc, { mergePages: true }));
    return normalizeText(text);
  }
  if (kind === "docx") {
    if (zipUncompressedBytes(buffer) > MAX_UNZIPPED_BYTES) throw new Error("docx_too_large_unzipped");
    const { value } = await withTimeout(mammoth.extractRawText({ buffer }));
    return normalizeText(value);
  }
  return normalizeText(buffer.toString("utf-8"));
}

/**
 * Upload a reference document for the content agent. The original file is
 * kept private under agent-knowledge/ (never cms/, which /api/asset serves
 * publicly); its text is extracted here so the agent can search/cite it.
 * The row lands as a draft — review is required before the agent can use it.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin("content.edit");
  const limit = checkRateLimit(`knowledge-upload:${admin.id}`, { maxRequests: 10, windowSeconds: 300 });
  if (!limit.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "empty_file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large", maxBytes: MAX_BYTES }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const docType = detectDocType(file.name, buffer);
  if (!docType) {
    return NextResponse.json({ error: "unsupported_or_mismatched_file" }, { status: 400 });
  }

  let fileText: string;
  try {
    fileText = await extractDocText(docType, buffer);
  } catch (err) {
    console.error("[knowledge-upload] extract failed", String(err).slice(0, 300));
    return NextResponse.json({ error: "extract_failed" }, { status: 422 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  // Not under cms/ — /api/asset only serves cms/, so the original stays
  // private; reviewers fetch it through the signed-URL route below.
  const gcsObject = `agent-knowledge/${year}/${month}/${uuid}_${safeName(file.name)}`;
  await uploadBuffer(gcsObject, buffer, CONTENT_TYPE[docType]);

  const titleRaw = (form.get("title") as string | null)?.trim() || file.name;
  const title = (titleRaw.length >= 3 ? titleRaw : `${titleRaw} (uploaded doc)`).slice(0, 200);
  const note = ((form.get("note") as string | null) ?? "").trim().slice(0, 20_000);
  const dataLine = ((form.get("data_line") as string | null) ?? "").trim().slice(0, 60) || null;
  const tags = ((form.get("tags") as string | null) ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("cms_agent_knowledge")
    .insert({
      kind: "doc",
      title,
      body: note,
      file_path: gcsObject,
      file_name: file.name.slice(0, 200),
      file_text: fileText,
      data_line: dataLine,
      tags,
      status: "draft",
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[knowledge-upload] insert failed", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, textChars: fileText.length });
}
