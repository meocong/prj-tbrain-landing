import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const input = z.object({
  linkedin: z.string().trim().min(1).max(3000).optional(),
  facebook: z.string().trim().min(1).max(5000).optional(),
  x: z.string().trim().min(1).max(280).optional(),
});

/**
 * PUT — store the share copy per network. Humans post it from the admin
 * Share panel; messages someone already shared are left untouched.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const db = supabaseAdmin();
  const { data: post } = await db.from("cms_posts").select("id, source").eq("id", id).maybeSingle();
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (post.source !== "agent") return NextResponse.json({ error: "not_agent_post" }, { status: 403 });

  const { data: existing } = await db.from("cms_post_social").select("network, status").eq("post_id", id);
  const locked = new Set(
    (existing ?? []).filter((r: { status: string }) => r.status !== "draft").map((r: { network: string }) => r.network),
  );

  const rows = (Object.entries(parsed.data) as [string, string | undefined][])
    .filter(([network, message]) => message && !locked.has(network))
    .map(([network, message]) => ({ post_id: id, network, message, status: "draft" }));

  if (rows.length) {
    const { error } = await db.from("cms_post_social").upsert(rows, { onConflict: "post_id,network" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: rows.map((r) => r.network), skipped_already_shared: [...locked] });
}
