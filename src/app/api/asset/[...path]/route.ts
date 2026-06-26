import { NextResponse, type NextRequest } from "next/server";
import { downloadBuffer } from "@/lib/terminal-bench/gcs";

export const runtime = "nodejs";

// Permanent proxy for CMS-uploaded images. Replaces the old 7-day GCS signed
// URLs that were embedded into case_studies.extended_content and expired
// (→ 400 Bad Request). Objects under cms/ are content-addressed (uuid in the
// filename) so the response is immutable and edge-cacheable forever.

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

function contentTypeFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return MIME[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const objectPath = (segments ?? []).join("/");

  // Only serve CMS uploads; block traversal / arbitrary object reads.
  if (!objectPath.startsWith("cms/") || objectPath.includes("..")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const buf = await downloadBuffer(objectPath);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(objectPath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
