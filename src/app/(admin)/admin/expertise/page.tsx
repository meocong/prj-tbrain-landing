import "server-only";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { ExpertiseClient } from "./expertise-client";

export const dynamic = "force-dynamic";

export type ExpertiseRow = {
  id: string;
  label: string;
  detail: string;
  display_order: number;
  is_active: boolean;
};

export default async function ExpertisePage() {
  await requireAdmin("content.view");

  const { data } = await supabaseAdmin()
    .from("expertise_areas")
    .select("id, label, detail, display_order, is_active")
    .order("display_order", { ascending: true });

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Expertise Areas
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Bullet list shown inside the &ldquo;Deep Technical Expertise&rdquo; card on /services.
        </p>
      </div>
      <ExpertiseClient initial={(data ?? []) as ExpertiseRow[]} />
    </div>
  );
}
