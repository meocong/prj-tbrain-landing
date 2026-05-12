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
  created_at?: string | null;
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

const BLOCK_SELECT = "id, case_study_id, type, title, subtitle, content, config, display_order, is_active, created_at, updated_at";

export async function ensureCaseStudyBlocks(
  db: SupabaseClient,
  study: CaseStudySeedSource,
  existing: CaseStudyBlockSeedRow[] | null | undefined
): Promise<CaseStudyBlockSeedRow[]> {
  const normalizedExisting = await removeExactDuplicateBlocks(db, existing ?? []);
  if (normalizedExisting.length) return normalizedExisting;

  const seedBlocks = buildSeedBlocks(study);
  if (!seedBlocks.length) return [];

  const { data: latest, error: latestError } = await db
    .from("case_study_blocks")
    .select(BLOCK_SELECT)
    .eq("case_study_id", study.id)
    .order("display_order", { ascending: true });

  if (latestError) {
    console.error("[case-study-block-seed] latest check failed:", latestError.message);
  }

  const normalizedLatest = await removeExactDuplicateBlocks(db, (latest ?? []) as CaseStudyBlockSeedRow[]);
  if (normalizedLatest.length) return normalizedLatest;

  const { data, error } = await db
    .from("case_study_blocks")
    .insert(seedBlocks)
    .select(BLOCK_SELECT)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[case-study-block-seed] seed failed:", error.message);
    return [];
  }

  return removeExactDuplicateBlocks(db, (data ?? []) as CaseStudyBlockSeedRow[]);
}

async function removeExactDuplicateBlocks(db: SupabaseClient, rows: CaseStudyBlockSeedRow[]) {
  if (rows.length < 2) return rows;

  const sorted = [...rows].sort((a, b) => {
    if (a.display_order !== b.display_order) return a.display_order - b.display_order;
    return (a.created_at ?? "").localeCompare(b.created_at ?? "") || a.id.localeCompare(b.id);
  });

  const seen = new Set<string>();
  const keep: CaseStudyBlockSeedRow[] = [];
  const removeIds: string[] = [];

  for (const row of sorted) {
    const signature = [
      row.case_study_id,
      row.type,
      row.title ?? "",
      row.subtitle ?? "",
      row.content ?? "",
      stableStringify(row.config ?? {}),
      String(row.display_order),
    ].join("\u001f");

    if (seen.has(signature)) {
      removeIds.push(row.id);
    } else {
      seen.add(signature);
      keep.push(row);
    }
  }

  if (removeIds.length) {
    const { error } = await db.from("case_study_blocks").delete().in("id", removeIds);
    if (error) {
      console.error("[case-study-block-seed] duplicate cleanup failed:", error.message);
      return sorted;
    }
  }

  return keep;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
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
