import "server-only";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { ensureCaseStudyBlocks, type CaseStudySeedSource } from "@/lib/admin/case-study-block-seed";
import { CaseStudyBlocksClient, type CaseStudyBlockRow } from "./blocks/blocks-client";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  metrics: Array<{ value: string; label: string }> | null;
  extended_content: string | null;
};

export default async function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.edit");
  const { id } = await params;
  const db = supabaseAdmin();

  const [{ data }, { data: blocks }] = await Promise.all([
    db
      .from("case_studies")
      .select("id, slug, title, short_description, description, metrics, extended_content")
      .eq("id", id)
      .maybeSingle(),
    db
      .from("case_study_blocks")
      .select("id, case_study_id, type, title, subtitle, content, config, display_order, is_active, updated_at")
      .eq("case_study_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (!data) notFound();
  const r = data as Row;
  const rows = await ensureCaseStudyBlocks(db, r as CaseStudySeedSource, (blocks ?? []) as CaseStudyBlockRow[]);

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <Link href="/admin/case-studies" className="inline-flex items-center gap-1 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> All case studies
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            {r.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Add, edit, and drag case study widgets directly on the detail-page preview.
          </p>
        </div>
      </div>

      <CaseStudyBlocksClient caseStudyId={r.id} caseTitle={r.title} rows={rows} />
    </div>
  );
}
