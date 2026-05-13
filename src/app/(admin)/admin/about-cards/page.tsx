import "server-only";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
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
  meta: Record<string, unknown> | null;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export type AboutSectionRow = {
  id: string;
  group_key: string;
  eyebrow: string | null;
  title_before: string | null;
  title_highlight: string | null;
  title_after: string | null;
  description: string | null;
  child_widget_type: "icon-card" | "profile-card" | "avatar-card";
  layout: "two" | "three" | "four";
  accent: string;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export default async function AboutCardsAdminPage() {
  await requireAdmin("content.view");
  const [cardsResult, sectionsResult] = await Promise.all([
    supabaseAdmin()
      .from("about_cards")
      .select("id, group_key, slug, title, label, description, icon, image_url, meta, display_order, is_active, updated_at")
      .order("group_key", { ascending: true })
      .order("display_order", { ascending: true }),
    supabaseAdmin()
      .from("about_sections")
      .select("id, group_key, eyebrow, title_before, title_highlight, title_after, description, child_widget_type, layout, accent, display_order, is_active, updated_at")
      .order("display_order", { ascending: true }),
  ]);

  if (cardsResult.error) {
    console.error("[admin/about-cards]", cardsResult.error.message);
  }
  const sectionsReady = !sectionsResult.error;
  if (sectionsResult.error && !sectionsResult.error.message.includes("about_sections")) {
    console.error("[admin/about-sections]", sectionsResult.error.message);
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            About Page Builder
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Edit section widgets, headings, and child card widgets directly on the landing-style preview.
          </p>
        </div>
      </div>
      <AboutCardsClient
        initialRows={(cardsResult.data ?? []) as AboutCardRow[]}
        initialSections={(sectionsResult.data ?? []) as AboutSectionRow[]}
        sectionsReady={sectionsReady}
      />
    </div>
  );
}
