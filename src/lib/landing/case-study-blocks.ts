import "server-only";
import { CASE_STUDY_BLOCK_TYPES, type CaseStudyBlock, type CaseStudyBlockType } from "./case-study-block-types";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
export type { CaseStudyBlock, CaseStudyBlockType };

type Row = {
  id: string;
  case_study_id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  config: Record<string, unknown> | null;
  display_order: number;
  is_active: boolean;
};

export async function getCaseStudyBlocks(caseStudyId: string): Promise<CaseStudyBlock[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("case_study_blocks")
      .select("id, case_study_id, type, title, subtitle, content, config, display_order, is_active")
      .eq("case_study_id", caseStudyId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return ((data ?? []) as Row[]).map(toBlock).filter((block): block is CaseStudyBlock => Boolean(block));
  } catch (err) {
    console.error("[case-study-blocks] load failed:", err);
    return [];
  }
}

function toBlock(row: Row): CaseStudyBlock | null {
  if (!CASE_STUDY_BLOCK_TYPES.includes(row.type as CaseStudyBlockType)) return null;
  return {
    id: row.id,
    caseStudyId: row.case_study_id,
    type: row.type as CaseStudyBlockType,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    config: row.config ?? {},
    displayOrder: row.display_order,
    isActive: row.is_active,
  };
}
