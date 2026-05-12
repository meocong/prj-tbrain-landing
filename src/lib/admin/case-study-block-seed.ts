import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CaseStudyBlockType } from "@/lib/landing/case-study-block-types";

export type CaseStudyBlockSeedRow = {
  id: string;
  case_study_id: string;
  type: CaseStudyBlockType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  config: Record<string, unknown> | null;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export type CaseStudySeedSource = {
  id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  metrics: Array<{ value: string; label: string }> | null;
  extended_content: string | null;
};

type InsertBlock = {
  case_study_id: string;
  type: CaseStudyBlockType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  config: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
};

const BLOCK_SELECT = "id, case_study_id, type, title, subtitle, content, config, display_order, is_active, updated_at";

export async function ensureCaseStudyBlocks(
  db: SupabaseClient,
  study: CaseStudySeedSource,
  existing: CaseStudyBlockSeedRow[] | null | undefined
): Promise<CaseStudyBlockSeedRow[]> {
  if (existing?.length) return existing;

  const seedBlocks = buildSeedBlocks(study);
  if (!seedBlocks.length) return [];

  const { data, error } = await db
    .from("case_study_blocks")
    .insert(seedBlocks)
    .select(BLOCK_SELECT)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[case-study-block-seed] seed failed:", error.message);
    return [];
  }

  return (data ?? []) as CaseStudyBlockSeedRow[];
}

function buildSeedBlocks(study: CaseStudySeedSource): InsertBlock[] {
  const blocks: InsertBlock[] = [];
  let order = 10;

  const metrics = normalizeMetrics(study.metrics);
  if (metrics.length) {
    blocks.push(block(study.id, "metrics_grid", "Key Metrics", null, null, { metrics }, order));
    order += 10;
  }

  const summary = [study.short_description, study.description]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => `<p>${escapeHtml(value)}</p>`)
    .join("");
  if (summary) {
    blocks.push(block(study.id, "text_card", "Overview", null, summary, { variant: "blue_gradient" }, order));
    order += 10;
  }

  const sections = splitHtmlSections(study.extended_content ?? "");
  for (const section of sections) {
    blocks.push(block(study.id, "text_card", section.title, null, section.body, {}, order));
    order += 10;
  }

  blocks.push(
    block(
      study.id,
      "cta",
      "Need Expert Data Services?",
      "Let Tbrain deliver precision-engineered data solutions on enterprise timelines",
      null,
      { label: "Connect Us Today", href: "https://www.linkedin.com/company/tbrain-ai" },
      order
    )
  );

  return blocks;
}

function block(
  caseStudyId: string,
  type: CaseStudyBlockType,
  title: string | null,
  subtitle: string | null,
  content: string | null,
  config: Record<string, unknown>,
  displayOrder: number
): InsertBlock {
  return {
    case_study_id: caseStudyId,
    type,
    title,
    subtitle,
    content,
    config,
    display_order: displayOrder,
    is_active: true,
  };
}

function normalizeMetrics(metrics: CaseStudySeedSource["metrics"]) {
  return (metrics ?? [])
    .map((metric) => ({
      value: typeof metric.value === "string" ? metric.value.trim() : "",
      label: typeof metric.label === "string" ? metric.label.trim() : "",
    }))
    .filter((metric) => metric.value && metric.label)
    .slice(0, 4);
}

function splitHtmlSections(html: string) {
  const source = html.trim();
  if (!source) return [];

  const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const matches = Array.from(source.matchAll(h2Pattern));

  if (!matches.length) {
    return [{ title: "Detail Content", body: source }];
  }

  return matches
    .map((match, index) => {
      const next = matches[index + 1];
      const start = (match.index ?? 0) + match[0].length;
      const end = next?.index ?? source.length;
      return {
        title: stripTags(match[1]).trim() || `Section ${index + 1}`,
        body: source.slice(start, end).trim(),
      };
    })
    .filter((section) => section.body);
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
