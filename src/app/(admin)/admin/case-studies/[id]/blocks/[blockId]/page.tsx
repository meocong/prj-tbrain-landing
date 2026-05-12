import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import type { CaseStudyBlockType } from "@/lib/landing/case-study-block-types";
import { CaseStudyBlockForm, toBlockForm } from "../block-form";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  case_study_id: string;
  type: CaseStudyBlockType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  config: unknown;
  display_order: number;
  is_active: boolean;
};

export default async function EditCaseStudyBlockPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>;
}) {
  await requireAdmin("content.edit");
  const { id, blockId } = await params;

  const { data } = await supabaseAdmin()
    .from("case_study_blocks")
    .select("id, case_study_id, type, title, subtitle, content, config, display_order, is_active")
    .eq("id", blockId)
    .eq("case_study_id", id)
    .maybeSingle();

  if (!data) notFound();
  return <CaseStudyBlockForm caseStudyId={id} initial={toBlockForm(data as Row)} />;
}
