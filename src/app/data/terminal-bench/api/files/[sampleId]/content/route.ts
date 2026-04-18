import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/terminal-bench/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { downloadBuffer } from "@/lib/terminal-bench/gcs";
import { highlightToHtml, langForPath } from "@/lib/terminal-bench/highlight";
import { logEvent } from "@/lib/terminal-bench/events";

export const runtime = "nodejs";

const MAX_BYTES = 512 * 1024; // 512 KB — refuse to highlight enormous files inline.

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ sampleId: string }> }) {
  const { sampleId } = await params;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionJwt(token) : null;
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const path = req.nextUrl.searchParams.get("path");
  if (!path) return NextResponse.json({ error: "missing_path" }, { status: 400 });

  const db = supabaseAdmin();

  const { data: sample } = await db
    .from("samples")
    .select("id, batch_id")
    .eq("id", sampleId)
    .maybeSingle();
  if (!sample || !claims.batchIds.includes(sample.batch_id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: file } = await db
    .from("files")
    .select("path, size_bytes, gcs_object, mime")
    .eq("sample_id", sample.id)
    .eq("path", path)
    .maybeSingle();

  if (!file || !file.gcs_object) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if ((file.size_bytes ?? 0) > MAX_BYTES) {
    return NextResponse.json({ error: "too_large", size: file.size_bytes }, { status: 413 });
  }

  const buf = await downloadBuffer(file.gcs_object);
  const text = buf.toString("utf8");
  const lang = langForPath(file.path);
  const html = await highlightToHtml(text, lang);

  await logEvent({
    clientId: claims.clientId,
    grantId: claims.grantId,
    sessionId: claims.sessionId,
    batchId: sample.batch_id,
    sampleId: sample.id,
    eventType: "view_file",
    filePath: file.path,
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") ?? null,
  });

  return NextResponse.json(
    { path: file.path, lang, html, size: file.size_bytes },
    {
      headers: {
        // Content is effectively immutable per (sampleId, path). Cache at the
        // edge for a year; clients already hold a copy in React state too.
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    }
  );
}
