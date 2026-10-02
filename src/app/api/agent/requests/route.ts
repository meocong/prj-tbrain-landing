import { NextResponse, type NextRequest } from "next/server";
import { requireAgent } from "@/lib/agent/auth";
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
    .select("id, type, post_id, brief, status, result, attempts, created_at, started_at, finished_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}
