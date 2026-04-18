import Link from "next/link";
import { DifficultyBadge } from "@/components/terminal-bench/samples/DifficultyBadge";
import type { SampleRow } from "@/lib/terminal-bench/types";

export function MetadataHeader({
  sample,
  batchSlug,
}: {
  sample: SampleRow;
  batchSlug: string;
}) {
  const spec = sample.spec_json ?? {};
  const rows: [string, string | number | null | undefined][] = [
    ["author", sample.author_name],
    ["expert", sample.expert_time_min != null ? `${sample.expert_time_min}m` : null],
    ["junior", sample.junior_time_min != null ? `${sample.junior_time_min}m` : null],
    ["cpus", spec.cpus],
    ["memory", spec.memory_mb != null ? `${spec.memory_mb} MB` : null],
    ["storage", spec.storage_mb != null ? `${spec.storage_mb} MB` : null],
    ["agent t/o", spec.agent_timeout_sec != null ? `${spec.agent_timeout_sec}s` : null],
    ["verifier t/o", spec.verifier_timeout_sec != null ? `${spec.verifier_timeout_sec}s` : null],
  ];

  return (
    <div className="border-b border-[#E5E7EB] bg-white">
      <div className="container mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
              <Link href={`/data/terminal-bench/s/${batchSlug}`} className="hover:text-[#6C3CF4]">
                / {batchSlug}
              </Link>{" "}
              / {sample.slug}
            </p>
            <h1 className="mt-3 text-3xl font-medium leading-tight text-[#0e1b2e] md:text-4xl">
              {sample.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <DifficultyBadge value={sample.difficulty} />
              {sample.category ? (
                <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#78818f]">
                  {sample.category}
                </span>
              ) : null}
              {(sample.tags ?? []).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#78818f]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={`/data/terminal-bench/api/download/sample/${sample.id}`}
            prefetch={false}
            className="rounded-xl bg-[#6C3CF4] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3] hover:shadow-lg"
          >
            Download sample .zip
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-[#0e1b2e] md:grid-cols-4 lg:grid-cols-8">
          {rows.map(([label, value]) =>
            value != null ? (
              <div key={label}>
                <div className="font-family_avt text-[10px] uppercase tracking-widest text-[#78818f]">
                  {label}
                </div>
                <div className="mt-1 text-sm font-medium">{String(value)}</div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
