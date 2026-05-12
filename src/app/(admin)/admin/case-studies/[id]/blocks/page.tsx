import "server-only";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { CaseStudyBlocksClient, type CaseStudyBlockRow } from "./blocks-client";

export const dynamic = "force-dynamic";

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
};

export default async function CaseStudyBlocksPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.view");
  const { id } = await params;
  const db = supabaseAdmin();

  const [{ data: study }, { data: blocks }] = await Promise.all([
    db.from("case_studies").select("id, title, slug").eq("id", id).maybeSingle(),
    db
      .from("case_study_blocks")
      .select("id, case_study_id, type, title, subtitle, content, config, display_order, is_active, updated_at")
      .eq("case_study_id", id)
      .order("display_order", { ascending: true }),
  ]);

  const current = study as CaseStudy | null;
  if (!current) {
    return (
      <div>
        <Link href="/admin/case-studies" className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to case studies
        </Link>
        <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>Case study not found.</p>
      </div>
    );
  }

  const rows = (blocks ?? []) as CaseStudyBlockRow[];

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <Link href={`/admin/case-studies/${id}`} className="inline-flex items-center gap-1 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to case study
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Page widgets
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Configure the detail-page blocks for {current.title}. Lower order renders first.
          </p>
        </div>
      </div>

      <CaseStudyBlocksClient caseStudyId={id} rows={rows} />
    </div>
  );
}
