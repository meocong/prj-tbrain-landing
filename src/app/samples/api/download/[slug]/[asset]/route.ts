import { NextResponse, type NextRequest } from "next/server";
import { sampleSession, clientIp } from "@/lib/samples/access";
import { assetFor, FULL_SET_SLUG } from "@/lib/samples/downloads";
import { signDownloadUrl } from "@/lib/terminal-bench/gcs";
import { logEvent } from "@/lib/terminal-bench/events";

/**
 * Signed download for one asset of one sample.
 *
 * Nothing is served from this origin: the route checks the session, signs a
 * five-minute V4 URL against the bucket and redirects. The bytes go browser to
 * GCS, so a 1.8 GB segment never crosses the Next server, and a copied link
 * dies in five minutes rather than becoming a public mirror.
 *
 * `_set` as the slug means the whole library rather than one sample.
 */
export const runtime = "nodejs";

const TTL_SECONDS = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; asset: string }> }
) {
  const { slug, asset } = await params;

  const claims = await sampleSession(req);
  if (!claims) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const entry = assetFor(slug, asset);
  if (!entry) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // The big delivery files are uploaded out of band. Until one lands, say so
  // plainly instead of signing a URL for an object that is not in the bucket —
  // a signed 404 looks like a broken download rather than pending logistics.
  if (!entry.object) {
    return NextResponse.json(
      { error: "not_staged", filename: entry.filename, bytes: entry.bytes },
      { status: 409 }
    );
  }

  let url: string;
  try {
    url = await signDownloadUrl(entry.object, TTL_SECONDS);
  } catch (err) {
    console.error("[samples/download] sign failed:", err);
    return NextResponse.json({ error: "sign_failed" }, { status: 502 });
  }

  await logEvent({
    clientId: claims.clientId ?? null,
    grantId: claims.grantId ?? null,
    sessionId: claims.sessionId,
    batchId: claims.batchIds[0] ?? null,
    eventType: slug === FULL_SET_SLUG ? "download_batch_zip" : "download_sample_zip",
    filePath: entry.object,
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") ?? null,
    meta: { project: "samples", slug, asset, bytes: entry.bytes },
  });

  return NextResponse.redirect(url, { status: 302 });
}
