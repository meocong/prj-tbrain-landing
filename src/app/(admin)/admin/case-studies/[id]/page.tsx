import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { CaseStudyForm, type CaseStudyFormValues } from "../case-study-form";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  metrics: Array<{ value: string; label: string }> | null;
  display_order: number;
  is_active: boolean;
};

export default async function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.edit");
  const { id } = await params;

  const { data } = await supabaseAdmin()
    .from("case_studies")
    .select("id, slug, title, short_description, description, image_url, metrics, display_order, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const r = data as Row;

  const initial: CaseStudyFormValues = {
    id: r.id,
    slug: r.slug,
    title: r.title,
    short_description: r.short_description ?? "",
    description: r.description ?? "",
    image_url: r.image_url ?? "",
    metrics: r.metrics?.length ? r.metrics : [{ value: "", label: "" }],
    display_order: r.display_order,
    is_active: r.is_active,
  };

  return <CaseStudyForm initial={initial} />;
}
