import { NextResponse, type NextRequest } from "next/server";
import { requireAgent } from "@/lib/agent/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const baseUrl = () => process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

/**
 * POST — atomically take the oldest waiting job (claim_agent_request RPC,
 * FOR UPDATE SKIP LOCKED). Returns { request: null } when the queue is empty.
 * For revise jobs the current post is included so the agent can start editing.
 */
export async function POST(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const db = supabaseAdmin();

  const { data, error } = await db.rpc("claim_agent_request");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const request = Array.isArray(data) ? data[0] ?? null : data ?? null;
  if (!request) return NextResponse.json({ request: null });

  let post = null;
  if (request.post_id) {
    const { data: p } = await db
      .from("cms_posts")
      .select("id, slug, title, status, source, excerpt, content_html, seo_title, seo_description, tags, category, cover_image_url, agent_meta")
      .eq("id", request.post_id)
      .maybeSingle();
    post = p;
  }

  let topic = null;
  if (request.topic_id) {
    const { data: t } = await db
      .from("cms_topic_ideas")
      .select("seq, title, why_now, angle, keyword, audience, data_line, sources")
      .eq("id", request.topic_id)
      .maybeSingle();
    topic = t;
  }

  let requester = request.requested_by_label ?? null;
  if (request.requested_by) {
    const { data: u } = await db.from("admin_users").select("full_name, email").eq("id", request.requested_by).maybeSingle();
    requester = u ? u.full_name || u.email : requester;
  }

  return NextResponse.json({
    request,
    post,
    topic,
    requested_by: requester,
    edit_url: request.post_id ? `${baseUrl()}/admin/content/${request.post_id}` : null,
  });
}
