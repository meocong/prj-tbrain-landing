import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

type Body = {
  title?: string;
  short_description?: string | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin("content.edit");
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Body | null;

  const title = body?.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("case_studies")
    .update({
      title,
      short_description: body?.short_description?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error("[case-study-builder/info] update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
