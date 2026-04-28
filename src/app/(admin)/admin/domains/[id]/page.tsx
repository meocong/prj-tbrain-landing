import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { DomainForm, type DomainFormValues } from "../domain-form";

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

export default async function EditDomainPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.edit");
  const { id } = await params;

  const { data } = await supabaseAdmin()
    .from("services")
    .select("id, slug, title, description, icon, display_order, is_active")
    .eq("id", id)
    .eq("category", "domain")
    .maybeSingle();
  if (!data) notFound();
  const r = data as Row;

  const initial: DomainFormValues = {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? "",
    icon: r.icon,
    display_order: r.display_order,
    is_active: r.is_active,
  };

  return <DomainForm initial={initial} />;
}
