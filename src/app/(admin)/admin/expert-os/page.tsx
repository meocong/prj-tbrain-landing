import "server-only";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listAdminResource } from "@/lib/admin/server/list";
import { ExpertOsClient } from "./expert-os-client";

export const dynamic = "force-dynamic";

export type ExpertOsRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export default async function ExpertOsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const initial = await listAdminResource<ExpertOsRow>(
    {
      table: "expert_os_features",
      permCode: "content.view",
      select: "id, slug, title, description, icon, display_order, is_active, updated_at",
      searchable: ["title", "slug", "description"],
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
            Platform Features
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Expert OS feature cards shown on /platform. Edit titles, descriptions, and icons.
          </p>
        </div>
        <Link href="/admin/expert-os/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New feature
        </Link>
      </div>
      <ExpertOsClient initial={initial} />
    </div>
  );
}
