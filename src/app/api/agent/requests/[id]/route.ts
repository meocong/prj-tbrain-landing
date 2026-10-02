import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const input = z.object({
  status: z.enum(["done", "failed"]),
  result: z
    .object({
      post_id: z.string().regex(UUID).optional(),
      message: z.string().max(2000).optional(),
      topics: z
        .array(
          z.object({
            title: z.string().max(300),
            why_now: z.string().max(1000).optional(),
            angle: z.string().max(1000).optional(),
            keyword: z.string().max(120).optional(),
            sources: z.array(z.string().url().max(2000)).max(10).optional(),
            score: z.number().min(0).max(20).optional(),
          }),
        )
        .max(10)
        .optional(),
    })
    .default({}),
});

/** PATCH — finish a job the agent claimed (only while it is running). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("cms_agent_requests")
    .update({ status: parsed.data.status, result: parsed.data.result, finished_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "running")
    .select("id, type, status, result")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_running" }, { status: 409 });
  return NextResponse.json({ request: data });
}
