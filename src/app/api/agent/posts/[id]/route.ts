import { NextResponse, type NextRequest } from "next/server";
import { requireAgent } from "@/lib/agent/auth";
import { AGENT_POST_COLUMNS, draftPatch, toRow, uniqueSlug, zodError, agentMayEdit } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Ctx = { params: Promise<{ id: string }> };

/** GET — the post plus its review state, so the agent can pick up feedback. */
export async function GET(req: NextRequest, { params }: Ctx) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const db = supabaseAdmin();
  const { data: post } = await db.from("cms_posts").select(AGENT_POST_COLUMNS).eq("id", id).maybeSingle();
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: reviews } = await db
    .from("approval_requests")
    .select("id, status, review_note, submitted_at, reviewed_at")
    .eq("resource_type", "post")
    .eq("resource_id", id)
    .order("submitted_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ post, reviews: reviews ?? [] });
}

/**
 * PATCH — revise a draft. Only agent-sourced drafts are editable: published
 * posts and anything a human wrote are off limits.
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = draftPatch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const db = supabaseAdmin();
  const { data: current } = await db
    .from("cms_posts")
    .select("id, status, source, version")
    .eq("id", id)
    .maybeSingle();
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!(await agentMayEdit(current))) return NextResponse.json({ error: "not_agent_post" }, { status: 403 });
  if (current.status !== "draft") return NextResponse.json({ error: "not_a_draft", status: current.status }, { status: 409 });

  const row = toRow(parsed.data);
  if (parsed.data.slug !== undefined) row.slug = await uniqueSlug(parsed.data.slug, id);
  row.version = (current.version || 1) + 1;

  const { data, error } = await db
    .from("cms_posts")
    .update(row)
    .eq("id", id)
    .eq("status", "draft")
    // Optimistic lock: a concurrent run (or a human save) bumped the version.
    .eq("version", current.version)
    .select(AGENT_POST_COLUMNS)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "conflict", hint: "post changed meanwhile; get_post and retry" }, { status: 409 });

  return NextResponse.json({ post: data });
}
