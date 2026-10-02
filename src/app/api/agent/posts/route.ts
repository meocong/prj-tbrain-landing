import { NextResponse, type NextRequest } from "next/server";
import { requireAgent } from "@/lib/agent/auth";
import { AGENT_POST_COLUMNS, draftInput, toRow, uniqueSlug, zodError } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const baseUrl = () => process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

/**
 * GET /api/agent/posts?status=published|draft|all&q=&limit=
 * Lightweight index (no bodies) so the agent can avoid repeating topics and
 * pick internal links.
 */
export async function GET(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") ?? "published";
  const q = sp.get("q")?.trim();
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 100, 1), 300);

  let query = supabaseAdmin()
    .from("cms_posts")
    .select("id, slug, title, excerpt, category, tags, status, source, published_at, updated_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`title.ilike.%${q.replace(/[%,()]/g, " ")}%,excerpt.ilike.%${q.replace(/[%,()]/g, " ")}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    posts: (data ?? []).map((p: { slug: string; status: string }) => ({
      ...p,
      url: p.status === "published" ? `${baseUrl()}/blog/${p.slug}` : null,
    })),
  });
}

/** POST /api/agent/posts — create a draft. Never publishes. */
export async function POST(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;

  const parsed = draftInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const row = toRow(parsed.data);
  row.slug = await uniqueSlug(parsed.data.slug || parsed.data.title);
  row.status = "draft";
  row.source = "agent";
  row.ai_assisted = true;
  row.version = 1;

  const { data, error } = await supabaseAdmin()
    .from("cms_posts")
    .insert(row)
    .select(AGENT_POST_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { post: data, admin_url: `${baseUrl()}/admin/content/${data.id}` },
    { status: 201 },
  );
}
