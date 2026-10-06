import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET ?peek=1 — how many admin jobs are waiting (the agent's poll script calls
 * this every couple of minutes and only wakes the LLM when it's non-zero).
 * Without peek: the 20 most recent jobs, for /status.
 */
export async function GET(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const db = supabaseAdmin();

  if (req.nextUrl.searchParams.get("peek")) {
    const stale = new Date(Date.now() - 90 * 60_000).toISOString();
    const { count, error } = await db
      .from("cms_agent_requests")
      .select("id", { count: "exact", head: true })
      .or(`status.eq.queued,and(status.eq.running,started_at.lt.${stale})`);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pending: count ?? 0 });
  }

  const { data, error } = await db
    .from("cms_agent_requests")
    .select("id, type, post_id, topic_id, brief, status, result, attempts, via, requested_by_label, created_at, started_at, finished_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createInput = z
  .object({
    type: z.enum(["draft", "revise", "scout"]),
    post_id: z.string().regex(UUID).optional(),
    topic_seq: z.number().int().positive().optional(),
    brief: z
      .object({
        idea: z.string().max(4000).optional(),
        keyword: z.string().max(120).optional(),
        audience: z.string().max(500).optional(),
        notes: z.string().max(8000).optional(),
        experience: z.string().max(4000).optional(),
        post_type: z.enum(["news_hook", "field_story", "trend_pov", "buyer_guide", "proof", "deep_dive", "synthesis", "by_the_numbers"]).optional(),
        skip_outline: z.boolean().optional(),
      })
      .default({}),
    requested_by_label: z.string().max(120).optional(),
  })
  .refine((v) => v.type !== "revise" || v.post_id, { message: "revise needs post_id", path: ["post_id"] })
  .refine((v) => v.type !== "draft" || v.topic_seq || v.brief.idea?.trim(), {
    message: "draft needs brief.idea or topic_seq",
    path: ["brief"],
  });

/**
 * POST — queue a job on someone's behalf from chat (Telegram). It runs in the
 * background like an admin-queued job: the poll wakes the agent, which claims
 * it, does it and reports back with links. A topic can be referenced by its
 * short number (#12) instead of re-typing the idea.
 */
export async function POST(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const parsed = createInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });
  const { type, post_id, topic_seq, brief, requested_by_label } = parsed.data;
  const db = supabaseAdmin();

  let topicId: string | null = null;
  if (topic_seq) {
    const { data: topic } = await db
      .from("cms_topic_ideas")
      .select("id, status, title, post_id")
      .eq("seq", topic_seq)
      .maybeSingle();
    if (!topic) return NextResponse.json({ error: "topic_not_found" }, { status: 404 });
    if (topic.status === "queued" || topic.status === "drafted")
      return NextResponse.json({ error: `topic_already_${topic.status}`, post_id: topic.post_id }, { status: 409 });
    topicId = topic.id;
  }

  if (type === "revise") {
    const { data: post } = await db.from("cms_posts").select("id, status").eq("id", post_id!).maybeSingle();
    if (!post) return NextResponse.json({ error: "post_not_found" }, { status: 404 });
    if (post.status !== "draft") return NextResponse.json({ error: "not_a_draft", status: post.status }, { status: 409 });
  }

  const { data, error } = await db
    .from("cms_agent_requests")
    .insert({
      type,
      post_id: post_id ?? null,
      topic_id: topicId,
      brief,
      status: "queued",
      via: "telegram",
      requested_by_label: requested_by_label ?? null,
    })
    .select("id, type, created_at")
    .single();
  if (error) {
    // 23505: another job holds this topic; 23514: the DB validation trigger refused it.
    const conflict = error.code === "23505" || error.code === "23514";
    return NextResponse.json({ error: conflict ? error.message || "conflict" : error.message }, { status: conflict ? 409 : 500 });
  }

  const { count } = await db
    .from("cms_agent_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["queued", "running", "awaiting_approval"])
    .lt("created_at", data.created_at);
  return NextResponse.json({ request: data, jobs_ahead: count ?? 0 }, { status: 201 });
}
