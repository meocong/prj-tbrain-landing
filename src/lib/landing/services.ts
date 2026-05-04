import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { DOMAIN_PODS, EXPERTISE_AREAS, SERVICES } from "@/lib/constants/marketing";

export type Service = { title: string; description: string; icon: string };
export type ExpertiseArea = { label: string; detail: string };

type ServiceRow = {
  title: string;
  description: string | null;
  icon: string;
};
type ExpertiseRow = {
  label: string;
  detail: string;
};

export type ServiceCategory = "service" | "domain";

/**
 * Fetch services filtered by category. Defaults to "service" for backward compat
 * with old call sites. New /services page calls with both "service" and "domain"
 * to render two separate sections.
 */
export async function getServices(category: ServiceCategory = "service"): Promise<Service[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("services")
      .select("title, description, icon, display_order, is_active, category")
      .eq("is_active", true)
      .eq("category", category)
      .order("display_order", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) {
      return category === "service" ? SERVICES : DOMAIN_PODS;
    }
    return (data as ServiceRow[]).map((r) => ({
      title: r.title,
      description: r.description ?? "",
      icon: r.icon,
    }));
  } catch (err) {
    console.error("[services] load failed, using fallback:", err);
    return category === "service" ? SERVICES : DOMAIN_PODS;
  }
}

export async function getExpertiseAreas(): Promise<ExpertiseArea[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("expertise_areas")
      .select("label, detail, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return EXPERTISE_AREAS;
    return (data as ExpertiseRow[]).map((r) => ({ label: r.label, detail: r.detail }));
  } catch (err) {
    console.error("[expertise] load failed, using fallback:", err);
    return EXPERTISE_AREAS;
  }
}
