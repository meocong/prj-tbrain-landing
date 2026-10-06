import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Sources render as links in the admin: http(s) only.
const httpUrl = z.string().max(2000).regex(/^https?:\/\/[^\s]+$/i, "must be an http(s) URL");

const topic = z.object({
  title: z.string().trim().min(3).max(300),
  why_now: z.string().max(1000).optional(),
  angle: z.string().max(1000).optional(),
  keyword: z.string().max(120).optional(),
  audience: z.string().max(300).optional(),
  data_line: z.string().max(60).optional(),
  sources: z.array(httpUrl).max(10).default([]),
  score: z.number().min(0).max(20).optional(),
  post_type: z.enum(["news_hook", "field_story", "trend_pov", "buyer_guide", "proof", "deep_dive", "synthesis", "by_the_numbers"]).optional(),
  funnel: z.enum(["top", "middle", "bottom"]).optional(),
});

const saveInput = z.object({
  topics: z.array(topic).min(1).max(10),
  request_id: z.string().regex(UUID).optional(),
});

const COLUMNS = "id, seq, title, why_now, angle, keyword, audience, data_line, post_type, funnel, sources, score, status, post_id, created_at";

/** GET ?status=new|queued|drafted|dismissed|all&limit= — topic ideas, newest first. */
export async function GET(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const status = req.nextUrl.searchParams.get("status") || "new";
  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 30, 1), 100);
  let q = supabaseAdmin().from("cms_topic_ideas").select(COLUMNS).order("created_at", { ascending: false }).limit(limit);
  if (status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ topics: data ?? [] });
}

/**
 * POST — save a scout shortlist. Returns each topic's short number (#seq),
 * which is what the agent quotes in chat and what "viết #12" refers to.
 */
export async function POST(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const parsed = saveInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const rows = parsed.data.topics.map((t) => ({ ...t, request_id: parsed.data.request_id ?? null }));
  const { data, error } = await supabaseAdmin().from("cms_topic_ideas").insert(rows).select("id, seq, title");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Insert order is preserved by the identity column; sort to be explicit.
  const saved = (data ?? []).sort((a, b) => Number(a.seq) - Number(b.seq));
  return NextResponse.json({ topics: saved }, { status: 201 });
}
