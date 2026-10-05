import { NextResponse, type NextRequest } from "next/server";
import { requireAgent } from "@/lib/agent/auth";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET — one approved knowledge item with its full body and extracted document text. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAgent(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { data, error } = await supabaseAdmin()
    .from("cms_agent_knowledge")
    .select("id, kind, title, body, file_name, file_text, image_url, image_description, data_line, tags, updated_at")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ item: data });
}
