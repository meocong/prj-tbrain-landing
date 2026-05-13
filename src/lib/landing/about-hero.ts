import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export type AboutHeroStat = {
  value: number;
  suffix: string;
  label: string;
};

export type AboutHero = {
  id?: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  description: string;
  stats: AboutHeroStat[];
  updatedAt?: string;
};

type AboutHeroRow = {
  id: string;
  title_before: string | null;
  title_highlight: string | null;
  title_after: string | null;
  description: string | null;
  stats: unknown;
  updated_at: string;
};

export const FALLBACK_ABOUT_HERO: AboutHero = {
  titleBefore: "The improvement layer for",
  titleHighlight: "agentic AI",
  titleAfter: "",
  description:
    "Expert-validated environments, data, and evaluation programs that make agentic AI measurably better. Run by domain pods built for high-stakes work.",
  stats: [
    { value: 17, suffix: "K+", label: "Expert Pipeline" },
    { value: 8, suffix: "+", label: "Core Domains" },
    { value: 3, suffix: "+", label: "Data Modalities" },
    { value: 100, suffix: "%", label: "Verifiable Loops" },
  ],
};

export async function getAboutHero(): Promise<AboutHero> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("about_hero_settings")
      .select("id, title_before, title_highlight, title_after, description, stats, updated_at")
      .eq("key", "about")
      .maybeSingle();

    if (error) {
      if (isMissingAboutHeroTable(error)) return FALLBACK_ABOUT_HERO;
      throw error;
    }
    if (!data) return FALLBACK_ABOUT_HERO;
    return toHero(data as AboutHeroRow);
  } catch (err) {
    console.error("[about-hero] load failed, using fallback:", err);
    return FALLBACK_ABOUT_HERO;
  }
}

function isMissingAboutHeroTable(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || Boolean(error.message?.includes("about_hero_settings"));
}

function toHero(row: AboutHeroRow): AboutHero {
  return {
    id: row.id,
    titleBefore: row.title_before ?? FALLBACK_ABOUT_HERO.titleBefore,
    titleHighlight: row.title_highlight ?? FALLBACK_ABOUT_HERO.titleHighlight,
    titleAfter: row.title_after ?? FALLBACK_ABOUT_HERO.titleAfter,
    description: row.description ?? FALLBACK_ABOUT_HERO.description,
    stats: parseStats(row.stats),
    updatedAt: row.updated_at,
  };
}

function parseStats(value: unknown): AboutHeroStat[] {
  if (!Array.isArray(value)) return FALLBACK_ABOUT_HERO.stats;
  const parsed = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const stat = item as Record<string, unknown>;
      return {
        value: Number(stat.value) || 0,
        suffix: typeof stat.suffix === "string" ? stat.suffix : "",
        label: typeof stat.label === "string" ? stat.label : "",
      };
    })
    .filter((item): item is AboutHeroStat => Boolean(item?.label));
  return parsed.length > 0 ? parsed : FALLBACK_ABOUT_HERO.stats;
}
