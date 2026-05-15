import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight health check for uptime monitors + load balancers.
 * - 200 + status=ok when DB reachable
 * - 503 + status=degraded when any dependency fails
 * Designed to be fast (<100ms) and not leak sensitive info.
 */
export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, "ok" | "fail"> = {};
  let allOk = true;

  // 1. Database reachability — single COUNT on a small table
  try {
    const db = supabaseAdmin();
    const { error } = await db
      .from("permissions")
      .select("code", { count: "exact", head: true })
      .limit(1);
    if (error) throw error;
    checks.database = "ok";
  } catch {
    checks.database = "fail";
    allOk = false;
  }

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      checks,
      duration_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}
