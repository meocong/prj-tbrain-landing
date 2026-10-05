import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { signDownloadUrl } from "@/lib/terminal-bench/gcs";

export const runtime = "nodejs";

/** Redirects to a short-lived signed URL for a knowledge doc's original file. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.view");
  const { id } = await params;

  const db = supabaseAdmin();
  const { data } = await db.from("cms_agent_knowledge").select("file_path").eq("id", id).maybeSingle();
  if (!data?.file_path) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const url = await signDownloadUrl(data.file_path, 10 * 60);
  return NextResponse.redirect(url);
}
