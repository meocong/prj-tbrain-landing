import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/terminal-bench/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { signDownloadUrl } from "@/lib/terminal-bench/gcs";
import { logEvent } from "@/lib/terminal-bench/events";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { type: "sample" | "batch"; id: string } }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionJwt(token) : null;
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;

  if (params.type === "sample") {
    const { data: sample } = await db
      .from("samples")
      .select("id, batch_id, gcs_sample_zip_object")
      .eq("id", params.id)
      .maybeSingle();
    if (!sample || !sample.gcs_sample_zip_object) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!claims.batchIds.includes(sample.batch_id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const url = await signDownloadUrl(sample.gcs_sample_zip_object, 300);
    await logEvent({
      clientId: claims.clientId,
      grantId: claims.grantId,
      sessionId: claims.sessionId,
      batchId: sample.batch_id,
      sampleId: sample.id,
      eventType: "download_sample_zip",
      ip,
      userAgent,
    });
    return NextResponse.redirect(url, { status: 302 });
  }

  if (params.type === "batch") {
    const { data: batch } = await db
      .from("batches")
      .select("id, gcs_batch_zip_object")
      .eq("id", params.id)
      .maybeSingle();
    if (!batch || !batch.gcs_batch_zip_object) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!claims.batchIds.includes(batch.id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const url = await signDownloadUrl(batch.gcs_batch_zip_object, 300);
    await logEvent({
      clientId: claims.clientId,
      grantId: claims.grantId,
      sessionId: claims.sessionId,
      batchId: batch.id,
      eventType: "download_batch_zip",
      ip,
      userAgent,
    });
    return NextResponse.redirect(url, { status: 302 });
  }

  return NextResponse.json({ error: "bad_type" }, { status: 400 });
}
