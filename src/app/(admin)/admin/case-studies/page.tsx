import "server-only";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listAdminResource } from "@/lib/admin/server/list";
import { CaseStudiesClient } from "./case-studies-client";

export const dynamic = "force-dynamic";

export type CaseStudyRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const initial = await listAdminResource<CaseStudyRow>(
    {
      table: "case_studies",
      permCode: "content.view",
      select: "id, slug, title, short_description, display_order, is_active, updated_at",
      searchable: ["title", "slug", "short_description"],
      defaultSort: { key: "display_order", dir: "asc" },
      sortWhitelist: ["display_order", "title", "updated_at", "is_active"],
      filters: {
        is_active: (v, q) => q.eq("is_active", v === "true"),
      },
    },
    sp
  );

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Case Studies
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Featured projects shown on the public /casestudy page. Drag display_order to reorder.
          </p>
        </div>
        <Link href="/admin/case-studies/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New case study
        </Link>
      </div>
      <CaseStudiesClient initial={initial} />
    </div>
  );
}
