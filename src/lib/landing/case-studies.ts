import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { FEATURED_CASE_STUDIES } from "@/lib/constants/marketing";

export type CaseStudyMetric = { value: string; label: string };

export type CaseStudy = {
  id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  metrics: CaseStudyMetric[];
};

const FALLBACK_SLUGS = [
  "terminal-bench",
  "robotics-mocap",
  "multimodal-annotation",
  "enterprise-ai-agents",
  "video-game-pipeline",
];

function fallbackCaseStudies(): CaseStudy[] {
  return FEATURED_CASE_STUDIES.map((study, index) => ({
    ...study,
    slug: FALLBACK_SLUGS[index],
  }));
}

type Row = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  metrics: CaseStudyMetric[] | null;
  display_order: number;
  is_active: boolean;
};

/**
 * Read active case studies from DB. Falls back to the static constants if the
 * table is empty or the query fails — guarantees /casestudy never goes blank.
 */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("case_studies")
      .select("id, slug, title, short_description, description, image_url, metrics, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return fallbackCaseStudies();

    return (data as Row[]).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      shortDescription: r.short_description ?? "",
      description: r.description ?? "",
      image: r.image_url || "/images/code-screen.jpg",
      metrics: Array.isArray(r.metrics) ? r.metrics : [],
    }));
  } catch (err) {
    console.error("[case-studies] load failed, using fallback:", err);
    return fallbackCaseStudies();
  }
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("case_studies")
      .select("id, slug, title, short_description, description, image_url, metrics, display_order, is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return fallbackCaseStudies().find((study) => study.slug === slug) ?? null;

    const row = data as Row;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      shortDescription: row.short_description ?? "",
      description: row.description ?? "",
      image: row.image_url || "/images/code-screen.jpg",
      metrics: Array.isArray(row.metrics) ? row.metrics : [],
    };
  } catch (err) {
    console.error("[case-study] load failed, using fallback:", err);
    return fallbackCaseStudies().find((study) => study.slug === slug) ?? null;
  }
}
