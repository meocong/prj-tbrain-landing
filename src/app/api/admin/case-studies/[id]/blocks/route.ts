import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { CASE_STUDY_BLOCK_TYPES, type CaseStudyBlockType } from "@/lib/landing/case-study-block-types";

export const runtime = "nodejs";

type Body = {
  type?: CaseStudyBlockType;
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  config?: Record<string, unknown>;
  display_order?: number;
  is_active?: boolean;
};

const BLOCK_SELECT = "id, case_study_id, type, title, subtitle, content, config, display_order, is_active, updated_at";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin("content.create");
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Body | null;

  if (!body?.type || !CASE_STUDY_BLOCK_TYPES.includes(body.type)) {
    return NextResponse.json({ error: "Invalid widget type" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("case_study_blocks")
    .insert({
      case_study_id: id,
      type: body.type,
      title: body.title || null,
      subtitle: body.subtitle || null,
      content: body.content || null,
      config: body.config ?? {},
      display_order: body.display_order ?? 100,
      is_active: body.is_active ?? true,
    })
    .select(BLOCK_SELECT)
    .single();

  if (error) {
    console.error("[case-study-builder/block] create failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, row: data });
}
