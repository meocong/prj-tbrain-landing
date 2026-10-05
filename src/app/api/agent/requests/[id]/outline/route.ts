import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const baseUrl = () => process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

const outline = z.object({
  post_type: z.enum(["news_hook", "field_story", "trend_pov", "buyer_guide", "proof"]),
  title: z.string().trim().min(10).max(160),
  reader: z.string().max(400),
  problem: z.string().max(600),
  takeaway: z.string().max(600),
  opening: z.string().max(1500),
  sections: z
    .array(z.object({ h2: z.string().max(200), point: z.string().max(800) }))
    .min(2)
    .max(9),
  closing: z.string().max(800),
  cta: z.string().max(300),
  images: z.array(z.object({ url: z.string().max(300), why: z.string().max(400) })).max(6).default([]),
  knowledge_ids: z.array(z.string().regex(UUID)).max(20).default([]),
  sources: z.array(z.string().max(2000)).max(15).default([]),
  notes: z.string().max(1500).optional(),
});

/**
 * POST — phase 1 of a draft job: the agent proposes an outline and the job
 * waits in `awaiting_approval` until a human approves or asks for changes
 * (admin card or Telegram → review_agent_outline). Only while running.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const parsed = z.object({ outline }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const db = supabaseAdmin();
  const { data: current } = await db
    .from("cms_agent_requests")
    .select("id, type, status, result")
    .eq("id", id)
    .maybeSingle();
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (current.type !== "draft" || current.status !== "running")
    return NextResponse.json({ error: "not_running_draft" }, { status: 409 });

  const { data, error } = await db
    .from("cms_agent_requests")
    .update({
      status: "awaiting_approval",
      result: { ...(current.result ?? {}), outline: parsed.data.outline, outline_at: new Date().toISOString() },
    })
    .eq("id", id)
    .eq("status", "running")
    .select("id, status")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_running" }, { status: 409 });
  return NextResponse.json({ request: data, review_url: `${baseUrl()}/admin/content/agent?job=${id}` });
}
