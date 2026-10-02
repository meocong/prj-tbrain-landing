import { NextResponse, type NextRequest } from "next/server";
import { requireAgent } from "@/lib/agent/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const baseUrl = () => process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

/**
 * POST — put an agent draft in the review queue (/admin/approvals). A human
 * approving it there is the only way it gets published. Idempotent: an
 * existing pending request is reused.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const db = supabaseAdmin();
  const { data: post } = await db
    .from("cms_posts")
    .select("id, slug, title, status, source")
    .eq("id", id)
    .maybeSingle();
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (post.source !== "agent") return NextResponse.json({ error: "not_agent_post" }, { status: 403 });
  if (post.status !== "draft") return NextResponse.json({ error: "not_a_draft", status: post.status }, { status: 409 });

  const { data: pending } = await db
    .from("approval_requests")
    .select("id")
    .eq("resource_type", "post")
    .eq("resource_id", id)
    .eq("status", "pending")
    .maybeSingle();

  let requestId = pending?.id as string | undefined;
  if (!requestId) {
    const { data, error } = await db
      .from("approval_requests")
      .insert({ resource_type: "post", resource_id: id, status: "pending" })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    requestId = data.id;
  }

  return NextResponse.json({
    approval_id: requestId,
    review_url: `${baseUrl()}/admin/approvals?id=${requestId}`,
    edit_url: `${baseUrl()}/admin/content/${id}`,
    preview_url: `${baseUrl()}/admin/content/${id}/preview`,
  });
}
