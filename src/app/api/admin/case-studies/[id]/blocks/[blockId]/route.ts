import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

type Body = {
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  config?: Record<string, unknown>;
  display_order?: number;
  is_active?: boolean;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  await requireAdmin("content.edit");
  const { id, blockId } = await params;
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db
    .from("case_study_blocks")
    .update({
      title: body.title || null,
      subtitle: body.subtitle || null,
      content: body.content || null,
      config: body.config ?? {},
      display_order: body.display_order ?? 100,
      is_active: body.is_active ?? true,
    })
    .eq("id", blockId)
    .eq("case_study_id", id);

  if (error) {
    console.error("[case-study-builder/block] update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  await requireAdmin("content.delete");
  const { id, blockId } = await params;

  const db = supabaseAdmin();
  const { error } = await db
    .from("case_study_blocks")
    .delete()
    .eq("id", blockId)
    .eq("case_study_id", id);

  if (error) {
    console.error("[case-study-builder/block] delete failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
