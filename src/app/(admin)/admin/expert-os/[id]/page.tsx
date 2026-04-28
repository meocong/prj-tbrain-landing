import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { ExpertOsForm, type ExpertOsFormValues } from "../expert-os-form";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
};

export default async function EditExpertOsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.edit");
  const { id } = await params;

  const { data } = await supabaseAdmin()
    .from("expert_os_features")
    .select("id, slug, title, description, icon, display_order, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const r = data as Row;

  const initial: ExpertOsFormValues = {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? "",
    icon: r.icon,
    display_order: r.display_order,
    is_active: r.is_active,
  };

  return <ExpertOsForm initial={initial} />;
}
