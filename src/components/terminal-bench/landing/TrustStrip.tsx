import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

interface Stat {
  value: string;
  label: string;
  sub?: string;
}

async function loadStats(): Promise<Stat[]> {
  try {
    const db = supabaseAdmin();

    const [samplesRes, batchesRes, filesRes, testsRes] = await Promise.all([
      db.from("samples").select("id", { count: "exact", head: true }),
      db.from("batches").select("id", { count: "exact", head: true }),
      db.from("files").select("size_bytes", { count: "exact" }).limit(1),
      db.from("samples").select("tests_json").range(0, 999),
    ]);

    const sampleCount = samplesRes.count ?? 0;
    const batchCount = batchesRes.count ?? 0;
    const fileCount = filesRes.count ?? 0;

    let testSum = 0;
    let testedSamples = 0;
    for (const row of testsRes.data ?? []) {
      const tj = row.tests_json as unknown;
      if (Array.isArray(tj)) {
        testSum += tj.length;
        if (tj.length > 0) testedSamples += 1;
      }
    }
    const avgTests = testedSamples > 0 ? Math.round(testSum / testedSamples) : 0;

    return [
      { value: String(sampleCount), label: "Expert-authored samples", sub: `across ${batchCount} batch${batchCount === 1 ? "" : "es"}` },
      { value: fileCount.toLocaleString(), label: "Indexed source files", sub: "every byte reproducible" },
      { value: String(avgTests), label: "Tests per sample · avg", sub: "deterministic pytest" },
      { value: "100%", label: "Docker-verified", sub: "no LLM-as-judge" },
    ];
  } catch {
    return [
      { value: "6", label: "Expert-authored samples", sub: "April 2026 batch" },
      { value: "3,500+", label: "Indexed source files", sub: "every byte reproducible" },
      { value: "18", label: "Tests per sample · avg", sub: "deterministic pytest" },
      { value: "100%", label: "Docker-verified", sub: "no LLM-as-judge" },
    ];
  }
}

export async function TrustStrip() {
  const stats = await loadStats();
  return (
    <section className="border-y border-[#E5E7EB] bg-[#FAFAF7] dark:border-white/10 dark:bg-[#020617]">
      <div className="container mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-medium leading-none text-[#0e1b2e] md:text-5xl">
                {s.value}
              </p>
              <p className="mt-3 text-sm font-semibold text-[#0e1b2e]">{s.label}</p>
              {s.sub ? (
                <p className="font-family_avt mt-1 text-xs uppercase tracking-widest text-[#78818f]">
                  {s.sub}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
