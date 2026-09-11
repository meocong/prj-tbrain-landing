import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

type Body = {
  items?: Array<{ id?: string; display_order?: number }>;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin("content.edit");
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Body | null;
  const items = body?.items ?? [];

  if (!items.length || items.some((item) => !item.id || typeof item.display_order !== "number")) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  const db = supabaseAdmin();
  for (const item of items) {
    const { error } = await db
      .from("case_study_blocks")
      .update({ display_order: item.display_order })
      .eq("id", item.id)
      .eq("case_study_id", id);
    if (error) {
      console.error("[case-study-builder/reorder] update failed", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
