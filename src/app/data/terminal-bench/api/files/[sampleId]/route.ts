import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/terminal-bench/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sampleId: string }> }) {
  const { sampleId } = await params;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionJwt(token) : null;
  if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const { data: sample } = await db
    .from("samples")
    .select("id, batch_id")
    .eq("id", sampleId)
    .maybeSingle();

  if (!sample || !claims.batchIds.includes(sample.batch_id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const all: { path: string; mime: string | null; size_bytes: number | null }[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await db
      .from("files")
      .select("path, mime, size_bytes")
      .eq("sample_id", sample.id)
      .order("path")
      .range(from, from + PAGE - 1);
    if (error || !page || page.length === 0) break;
    all.push(...page);
    if (page.length < PAGE) break;
  }

  return NextResponse.json(
    { files: all },
    {
      headers: {
        // Manifest is stable per sampleId (re-ingests are rare). Let Vercel's
        // edge hold it for an hour; serve stale for a day while revalidating.
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
