import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import type { AboutCardGroupKey } from "@/lib/landing/about-card-groups";
import { AboutCardForm, toInitialForm } from "../about-card-form";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  group_key: AboutCardGroupKey;
  slug: string;
  title: string;
  label: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  meta: unknown;
  display_order: number;
  is_active: boolean;
};

export default async function EditAboutCardPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.edit");
  const { id } = await params;

  const { data } = await supabaseAdmin()
    .from("about_cards")
    .select("id, group_key, slug, title, label, description, icon, image_url, meta, display_order, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return <AboutCardForm initial={toInitialForm(data as Row)} />;
}
