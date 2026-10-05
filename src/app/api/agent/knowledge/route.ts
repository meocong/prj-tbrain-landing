import { NextResponse, type NextRequest } from "next/server";
import { requireAgent } from "@/lib/agent/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = new Set(["story", "fact", "doc", "image"]);

/**
 * GET ?kind=&q=&data_line=&limit= — approved knowledge only (drafts and
 * archived items never reach the agent). Docs come back with a text excerpt;
 * GET /api/agent/knowledge/[id] returns the full extracted text.
 */
export async function GET(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 40, 1), 100);

  let q = supabaseAdmin()
    .from("cms_agent_knowledge")
    .select("id, kind, title, body, file_name, file_text, image_url, image_description, data_line, tags, updated_at")
    .eq("status", "approved")
    .order("updated_at", { ascending: false })
    .limit(limit);
  const kind = sp.get("kind");
  if (kind && KINDS.has(kind)) q = q.eq("kind", kind);
  const line = sp.get("data_line");
  if (line) q = q.eq("data_line", line.slice(0, 60));
  const term = sp.get("q")?.replace(/[%,()]/g, " ").trim().slice(0, 100);
  if (term) q = q.or(`title.ilike.%${term}%,body.ilike.%${term}%,image_description.ilike.%${term}%,file_text.ilike.%${term}%`);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const items = (data ?? []).map(({ file_text, ...k }) => ({
    ...k,
    body: k.body?.slice(0, 3000) ?? "",
    excerpt: file_text ? file_text.slice(0, 1500) : undefined,
    text_chars: file_text?.length ?? undefined,
  }));
  return NextResponse.json({ items });
}
