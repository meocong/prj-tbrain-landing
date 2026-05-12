import "server-only";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listAdminResource } from "@/lib/admin/server/list";
import { AboutCardsClient } from "./about-cards-client";

export const dynamic = "force-dynamic";

export type AboutCardRow = {
  id: string;
  group_key: string;
  slug: string;
  title: string;
  label: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export default async function AboutCardsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = await listAdminResource<AboutCardRow>(
    {
      table: "about_cards",
      permCode: "content.view",
      select: "id, group_key, slug, title, label, description, icon, image_url, display_order, is_active, updated_at",
      searchable: ["title", "slug", "label", "description"],
      defaultSort: { key: "display_order", dir: "asc" },
      sortWhitelist: ["display_order", "title", "group_key", "updated_at", "is_active"],
      filters: {
        group_key: (v, q) => q.eq("group_key", v),
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
            About Cards
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Editable card groups shown on /about. Section headings and office CTA stay in code.
          </p>
        </div>
        <Link href="/admin/about-cards/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New card
        </Link>
      </div>
      <AboutCardsClient initial={initial} />
    </div>
  );
}
