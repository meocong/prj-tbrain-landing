import Link from "next/link";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

interface Tile {
  slug: string;
  title: string;
  difficulty: string | null;
  category: string | null;
  testCount: number;
  expertMin: number | null;
  juniorMin: number | null;
  batchSlug: string;
}

async function loadTiles(): Promise<{ tiles: Tile[]; batchSlug: string; batchName: string | null }> {
  try {
    const db = supabaseAdmin();
    const { data: batch } = await db
      .from("batches")
      .select("id, slug, name, created_at")
      .eq("project", "terminal-bench")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!batch) return { tiles: [], batchSlug: "april-2026", batchName: null };

    const { data: rows } = await db
      .from("samples")
      .select("slug, title, difficulty, category, expert_time_min, junior_time_min, tests_json")
      .eq("batch_id", batch.id)
      .order("slug")
      .range(0, 999);

    const tiles: Tile[] = (rows ?? []).map((r) => ({
      slug: r.slug as string,
      title: (r.title as string) ?? (r.slug as string),
      difficulty: (r.difficulty as string | null) ?? null,
      category: (r.category as string | null) ?? null,
      testCount: Array.isArray(r.tests_json) ? (r.tests_json as unknown[]).length : 0,
      expertMin: (r.expert_time_min as number | null) ?? null,
      juniorMin: (r.junior_time_min as number | null) ?? null,
      batchSlug: batch.slug as string,
    }));

    return { tiles, batchSlug: batch.slug as string, batchName: (batch.name as string) ?? null };
  } catch {
    return { tiles: [], batchSlug: "april-2026", batchName: null };
  }
}

const DIFF_STYLES: Record<string, string> = {
  easy: "bg-[#DCFCE7] text-[#166534]",
  medium: "bg-[#FEF3C7] text-[#92400E]",
  hard: "bg-[#FEE2E2] text-[#991B1B]",
};

export async function SampleGalleryPreview() {
  const { tiles, batchSlug, batchName } = await loadTiles();
  if (tiles.length === 0) return null;

  return (
    <section className="container mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
            / this month&apos;s batch{batchName ? ` · ${batchName}` : ""}
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium leading-tight text-[#0e1b2e] md:text-5xl">
            {tiles.length} samples. <span className="gradient-text">Ready to inspect.</span>
          </h2>
        </div>
        <Link
          href="/data/terminal-bench/enter"
          className="group font-family_avt text-xs uppercase tracking-widest text-[#6C3CF4] hover:text-[#5a2fd3]"
        >
          Open showcase
          <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const redirectTo = `/data/terminal-bench/s/${t.batchSlug}/${t.slug}`;
          const href = `/data/terminal-bench/enter?b=${t.batchSlug}&redirect=${encodeURIComponent(redirectTo)}`;
          const diffKey = (t.difficulty ?? "").toLowerCase();
          return (
            <Link
              key={t.slug}
              href={href}
              className="group relative flex flex-col gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#6C3CF4]/40 hover:shadow-[0_18px_40px_-24px_rgba(108,60,244,0.35)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-xs text-[#78818f]">tbrain-{t.slug}</p>
                {t.difficulty ? (
                  <span
                    className={`font-family_avt rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${
                      DIFF_STYLES[diffKey] ?? "bg-[#F3F4F6] text-[#0e1b2e]"
                    }`}
                  >
                    {t.difficulty}
                  </span>
                ) : null}
              </div>
              <h3 className="text-xl font-medium leading-snug text-[#0e1b2e]">
                {t.title}
              </h3>
              <div className="mt-auto flex items-center gap-5 border-t border-[#E5E7EB] pt-4 text-xs text-[#78818f]">
                <Stat label="tests" value={t.testCount} />
                {t.expertMin != null ? <Stat label="expert" value={`${t.expertMin}m`} /> : null}
                {t.juniorMin != null ? <Stat label="junior" value={`${t.juniorMin}m`} /> : null}
                {t.category ? (
                  <span className="ml-auto rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#0e1b2e]">
                    {t.category}
                  </span>
                ) : null}
              </div>
              <span className="absolute right-5 top-5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] text-xs text-[#78818f] transition-all group-hover:border-[#6C3CF4] group-hover:bg-[#6C3CF4] group-hover:text-white">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="flex flex-col">
      <span className="text-sm font-medium text-[#0e1b2e]">{value}</span>
      <span className="font-family_avt text-[10px] uppercase tracking-widest text-[#78818f]">
        {label}
      </span>
    </span>
  );
}
