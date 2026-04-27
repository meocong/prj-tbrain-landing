import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { SERVICES, EXPERTISE_AREAS } from "@/lib/constants/marketing";

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

export async function getServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("services")
      .select("title, description, icon, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return SERVICES;
    return (data as ServiceRow[]).map((r) => ({
      title: r.title,
      description: r.description ?? "",
      icon: r.icon,
    }));
  } catch (err) {
    console.error("[services] load failed, using fallback:", err);
    return SERVICES;
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
