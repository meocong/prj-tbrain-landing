import "server-only";
import { EXPERTISE_AREAS, EXPERTS, LEADERSHIP, SAMPLE_PROJECTS } from "@/lib/constants/marketing";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { ABOUT_CARD_GROUPS, type AboutCardGroupKey } from "./about-card-groups";

export type AboutCard = {
  id?: string;
  groupKey: string;
  slug: string;
  title: string;
  label: string | null;
  description: string;
  icon: string | null;
  imageUrl: string | null;
  meta: Record<string, unknown>;
  displayOrder: number;
};

type AboutCardRow = {
  id: string;
  group_key: string;
  slug: string;
  title: string;
  label: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  meta: Record<string, unknown> | null;
  display_order: number;
};

export type AboutCardGroups = Record<AboutCardGroupKey, AboutCard[]>;

export async function getAboutCards(groupKey: AboutCardGroupKey): Promise<AboutCard[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("about_cards")
      .select("id, group_key, slug, title, label, description, icon, image_url, meta, display_order")
      .eq("group_key", groupKey)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_GROUPS[groupKey];
    return (data as AboutCardRow[]).map((row) => toCard(row)).filter((card): card is AboutCard => Boolean(card));
  } catch (err) {
    console.error(`[about-cards/${groupKey}] load failed, using fallback:`, err);
    return FALLBACK_GROUPS[groupKey];
  }
}

export async function getAboutCardGroups(): Promise<AboutCardGroups> {
  const entries = await Promise.all(
    ABOUT_CARD_GROUPS.map(async (groupKey) => [groupKey, await getAboutCards(groupKey)] as const)
  );
  return Object.fromEntries(entries) as AboutCardGroups;
}

export async function getAboutCardsBySection(): Promise<Record<string, AboutCard[]>> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("about_cards")
      .select("id, group_key, slug, title, label, description, icon, image_url, meta, display_order")
      .eq("is_active", true)
      .order("group_key", { ascending: true })
      .order("display_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_GROUPS;

    return (data as AboutCardRow[]).reduce<Record<string, AboutCard[]>>((acc, row) => {
      const card = toCard(row, { allowCustomGroups: true });
      if (!card) return acc;
      acc[card.groupKey] = [...(acc[card.groupKey] ?? []), card];
      return acc;
    }, {});
  } catch (err) {
    console.error("[about-cards] load failed, using fallback:", err);
    return FALLBACK_GROUPS;
  }
}

function toCard(row: AboutCardRow, options?: { allowCustomGroups?: boolean }): AboutCard | null {
  if (!options?.allowCustomGroups && !ABOUT_CARD_GROUPS.includes(row.group_key as AboutCardGroupKey)) return null;
  return {
    id: row.id,
    groupKey: row.group_key as AboutCardGroupKey,
    slug: row.slug,
    title: row.title,
    label: row.label,
    description: row.description ?? "",
    icon: row.icon,
    imageUrl: row.image_url,
    meta: row.meta ?? {},
    displayOrder: row.display_order,
  };
}

const fallbackCompanyCards: AboutCard[] = [
  {
    groupKey: "company",
    slug: "company",
    label: "Company",
    title: "Tbrain builds managed data programs for frontier AI teams.",
    description:
      "We combine expert operations, workflow software, and AI-native quality control so customers can ship complex datasets without building the whole delivery stack in-house.",
    icon: "Factory",
    imageUrl: null,
    meta: {},
    displayOrder: 10,
  },
  {
    groupKey: "company",
    slug: "mission",
    label: "Mission",
    title: "Turn specialized human expertise into reliable model signal.",
    description:
      "Our mission is to make agentic AI measurably better through auditable expert feedback, rigorous evaluation, and domain-specific data programs.",
    icon: "ShieldCheck",
    imageUrl: null,
    meta: {},
    displayOrder: 20,
  },
  {
    groupKey: "company",
    slug: "team",
    label: "Team",
    title: "Operators, engineers, and domain experts working as one pod.",
    description:
      "Tbrain brings together AI training data operators, engineering delivery leaders, and expert contributors across coding, medical, manufacturing, robotics, and data science.",
    icon: "Users",
    imageUrl: null,
    meta: {},
    displayOrder: 30,
  },
];

const fallbackValueCards: AboutCard[] = [
  {
    groupKey: "value",
    slug: "domain-specific-expert-pods",
    label: null,
    title: "Domain-Specific Expert Pods",
    description: "Coding, STEM, medical, manufacturing, agent tool use, and other high-stakes domains.",
    icon: "Brain",
    imageUrl: null,
    meta: {},
    displayOrder: 10,
  },
  {
    groupKey: "value",
    slug: "custom-software-tools",
    label: null,
    title: "Custom software & tools",
    description: "Purpose-built workflows that make expert review measurable, auditable, and fast to operate.",
    icon: "Workflow",
    imageUrl: null,
    meta: {},
    displayOrder: 20,
  },
  {
    groupKey: "value",
    slug: "verifiable-loops",
    label: null,
    title: "Verifiable loops",
    description: "Closed-loop reinforcement learning systems for agents to self-improve from concrete outcomes.",
    icon: "CheckCircle",
    imageUrl: null,
    meta: {},
    displayOrder: 30,
  },
];

const FALLBACK_GROUPS: AboutCardGroups = {
  company: fallbackCompanyCards,
  value: fallbackValueCards,
  sample_projects: SAMPLE_PROJECTS.map((project, index) => ({
    groupKey: "sample_projects",
    slug: slugify(project.title),
    label: null,
    title: project.title,
    description: project.description,
    icon: ["MessageSquare", "LineChart", "Mic"][index] ?? "Bot",
    imageUrl: null,
    meta: {},
    displayOrder: (index + 1) * 10,
  })),
  expertise: EXPERTISE_AREAS.map((area, index) => ({
    groupKey: "expertise",
    slug: slugify(area.label),
    label: null,
    title: area.label.replace(/:$/, ""),
    description: area.detail,
    icon: ["Database", "Brain", "FlaskConical", "Bot", "Code2", "LineChart", "CheckCircle"][index] ?? "CheckCircle",
    imageUrl: null,
    meta: {},
    displayOrder: (index + 1) * 10,
  })),
  team: LEADERSHIP.map((person, index) => ({
    groupKey: "team",
    slug: slugify(person.name),
    label: index === 0 ? "AI training data strategy" : "Engineering delivery leadership",
    title: person.name,
    description: person.bio,
    icon: null,
    imageUrl: person.avatar,
    meta: {
      projects:
        index === 0
          ? ["Expert-led data programs", "Model evaluation", "Global expert network"]
          : ["Engineering operations", "Enterprise delivery", "Managed expert teams"],
    },
    displayOrder: (index + 1) * 10,
  })),
  experts: EXPERTS.map((expert, index) => ({
    groupKey: "experts",
    slug: slugify(expert.name),
    label: expert.domain,
    title: expert.name,
    description: expert.title,
    icon: null,
    imageUrl: expert.avatar,
    meta: { detail: expert.detail },
    displayOrder: (index + 1) * 10,
  })),
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 200);
}
