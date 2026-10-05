import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const input = z.object({
  action: z.enum(["approve", "revise", "cancel"]),
  notes: z.string().max(4000).optional(),
  by: z.string().max(120).optional(),
});

/**
 * POST — someone in chat approved an outline, asked for changes or cancelled
 * it. Same rules as the admin button (review_agent_outline).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const { data, error } = await supabaseAdmin().rpc("review_agent_outline", {
    p_id: id,
    p_action: parsed.data.action,
    p_notes: parsed.data.notes ?? null,
    p_by: parsed.data.by ?? null,
  });
  if (error) {
    const conflict = error.code === "23514" || error.code === "22023";
    return NextResponse.json({ error: error.message }, { status: conflict ? 409 : 500 });
  }
  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ request: { id: row?.id, status: row?.status } });
}
