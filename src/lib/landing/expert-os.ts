import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export type ExpertOsFeature = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
};

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
};

const FALLBACK: ExpertOsFeature[] = [
  {
    id: "fallback-kb",
    slug: "agent-knowledge-base",
    title: "Agent Knowledge Base",
    description: "Custom one-to-one training and instant reference guides for agents.",
    icon: "Brain",
  },
  {
    id: "fallback-judge",
    slug: "llm-as-a-judge",
    title: "LLM-as-a-Judge",
    description: "Automated evaluation before final human judgment, ensuring high quality at scale.",
    icon: "Scale",
  },
  {
    id: "fallback-workflow",
    slug: "agentic-workflows",
    title: "Agentic Workflows",
    description: "Workflow automation that lets agents collaborate and improve agents.",
    icon: "Workflow",
  },
  {
    id: "fallback-soul",
    slug: "agent-identity-soul",
    title: "Agent Identity & Soul",
    description: "Persistent identity, beliefs, and goals that make agent behavior coherent over time.",
    icon: "Sparkles",
  },
];

export async function getExpertOsFeatures(): Promise<ExpertOsFeature[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("expert_os_features")
      .select("id, slug, title, description, icon, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK;
    return (data as Row[]).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description ?? "",
      icon: r.icon,
    }));
  } catch (err) {
    console.error("[expert-os] load failed, using fallback:", err);
    return FALLBACK;
  }
}
