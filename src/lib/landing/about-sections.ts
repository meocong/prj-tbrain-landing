import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { ABOUT_CARD_GROUPS, type AboutCardGroupKey } from "./about-card-groups";

export type AboutSection = {
  id?: string;
  groupKey: AboutCardGroupKey;
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string | null;
  titleAfter: string | null;
  description: string | null;
  childWidgetType: "icon-card" | "profile-card" | "avatar-card";
  layout: "two" | "three" | "four";
  accent: string;
  displayOrder: number;
  isActive: boolean;
};

type AboutSectionRow = {
  id: string;
  group_key: string;
  eyebrow: string | null;
  title_before: string | null;
  title_highlight: string | null;
  title_after: string | null;
  description: string | null;
  child_widget_type: string | null;
  layout: string | null;
  accent: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

export async function getAboutSections(): Promise<AboutSection[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("about_sections")
      .select("id, group_key, eyebrow, title_before, title_highlight, title_after, description, child_widget_type, layout, accent, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_ABOUT_SECTIONS;
    return (data as AboutSectionRow[]).map(toSection).filter((section): section is AboutSection => Boolean(section));
  } catch (err) {
    console.error("[about-sections] load failed, using fallback:", err);
    return FALLBACK_ABOUT_SECTIONS;
  }
}

function toSection(row: AboutSectionRow): AboutSection | null {
  if (!ABOUT_CARD_GROUPS.includes(row.group_key as AboutCardGroupKey)) return null;
  const fallback = FALLBACK_ABOUT_SECTIONS.find((section) => section.groupKey === row.group_key);
  return {
    id: row.id,
    groupKey: row.group_key as AboutCardGroupKey,
    eyebrow: row.eyebrow ?? fallback?.eyebrow ?? "",
    titleBefore: row.title_before ?? fallback?.titleBefore ?? "",
    titleHighlight: row.title_highlight ?? fallback?.titleHighlight ?? null,
    titleAfter: row.title_after ?? fallback?.titleAfter ?? null,
    description: row.description ?? fallback?.description ?? null,
    childWidgetType: parseChildWidgetType(row.child_widget_type, fallback?.childWidgetType ?? "icon-card"),
    layout: parseLayout(row.layout, fallback?.layout ?? "three"),
    accent: row.accent ?? fallback?.accent ?? "#6C3CF4",
    displayOrder: row.display_order ?? fallback?.displayOrder ?? 100,
    isActive: row.is_active ?? true,
  };
}

function parseChildWidgetType(value: string | null | undefined, fallback: AboutSection["childWidgetType"]) {
  return value === "profile-card" || value === "avatar-card" || value === "icon-card" ? value : fallback;
}

function parseLayout(value: string | null | undefined, fallback: AboutSection["layout"]) {
  return value === "two" || value === "three" || value === "four" ? value : fallback;
}

export const FALLBACK_ABOUT_SECTIONS: AboutSection[] = [
  {
    groupKey: "company",
    eyebrow: "/ company",
    titleBefore: "Built for the messy middle between",
    titleHighlight: "models and ground truth",
    titleAfter: "",
    description:
      "Tbrain is a data and evaluation partner for teams that need more than generic annotation: expert judgment, managed workflows, and measurable quality.",
    childWidgetType: "icon-card",
    layout: "three",
    accent: "#6C3CF4",
    displayOrder: 10,
    isActive: true,
  },
  {
    groupKey: "value",
    eyebrow: "/ how we deliver value",
    titleBefore: "Optimized for",
    titleHighlight: "scaling complexity",
    titleAfter: "",
    description:
      "Legacy marketplaces break on high-stakes AI work. Tbrain provides verifiable software systems and expert-led loops required for agents to self-improve.",
    childWidgetType: "icon-card",
    layout: "three",
    accent: "#6C3CF4",
    displayOrder: 20,
    isActive: true,
  },
  {
    groupKey: "sample_projects",
    eyebrow: "/ sample projects",
    titleBefore: "Programs that turn expertise into",
    titleHighlight: "model signal",
    titleAfter: "",
    description: null,
    childWidgetType: "icon-card",
    layout: "three",
    accent: "#10B981",
    displayOrder: 30,
    isActive: true,
  },
  {
    groupKey: "expertise",
    eyebrow: "/ technical expertise",
    titleBefore: "Deep technical expertise across",
    titleHighlight: "hard domains",
    titleAfter: "",
    description: null,
    childWidgetType: "icon-card",
    layout: "two",
    accent: "#6C3CF4",
    displayOrder: 40,
    isActive: true,
  },
  {
    groupKey: "team",
    eyebrow: "/ team",
    titleBefore: "The operators behind",
    titleHighlight: "Tbrain programs",
    titleAfter: "",
    description:
      "Tbrain combines AI training data operators, engineering delivery leaders, and domain experts to build evaluation, annotation, and human-feedback programs for high-stakes AI work.",
    childWidgetType: "profile-card",
    layout: "two",
    accent: "#6C3CF4",
    displayOrder: 50,
    isActive: true,
  },
  {
    groupKey: "experts",
    eyebrow: "/ expert network",
    titleBefore: "Domain experts when accuracy depends on depth",
    titleHighlight: "",
    titleAfter: "",
    description:
      "Tbrain works with specialized contributors across STEM, medical, coding, data science, robotics, and other technical domains where generic labeling teams are not enough.",
    childWidgetType: "avatar-card",
    layout: "four",
    accent: "#6C3CF4",
    displayOrder: 60,
    isActive: true,
  },
];
