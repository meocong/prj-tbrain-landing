import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { detectImageType } from "@/lib/admin/image-type";
import { uploadBuffer } from "@/lib/terminal-bench/gcs";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

const input = z.object({
  filename: z.string().trim().min(1).max(120),
  data_base64: z.string().min(16).max(Math.ceil((MAX_BYTES * 4) / 3) + 8),
});

/**
 * POST — upload an image (cover or inline) to GCS under cms/ and return the
 * permanent /api/asset/... URL. The bytes come from the agent itself; this
 * route never fetches a remote URL, so there is no SSRF surface.
 */
export async function POST(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const buffer = Buffer.from(parsed.data.data_base64, "base64");
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large", maxBytes: MAX_BYTES }, { status: 413 });
  }
  const detected = detectImageType(buffer);
  if (!detected) return NextResponse.json({ error: "not_an_image" }, { status: 400 });

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const ext = detected.split("/")[1].replace("jpeg", "jpg");
  const name = parsed.data.filename.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
  const gcsObject = `cms/${now.getFullYear()}/${month}/${uuid}_agent_${name}.${ext}`;

  await uploadBuffer(gcsObject, buffer, detected);

  return NextResponse.json(
    { url: `/api/asset/${gcsObject}`, gcsObject, contentType: detected, sizeBytes: buffer.length },
    { status: 201 },
  );
}
