import Link from "next/link";
import { Download } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import type { SampleRow } from "@/lib/terminal-bench/types";

export function SampleCard({
  sample,
  batchSlug,
}: {
  sample: SampleRow;
  batchSlug: string;
}) {
  const expertMin = sample.expert_time_min;
  const juniorMin = sample.junior_time_min;
  const hasZip = !!sample.gcs_sample_zip_object;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all hover:border-[#6C3CF4]/40 hover:shadow-lg">
      {hasZip ? (
        <a
          href={`/data/terminal-bench/api/download/sample/${sample.id}`}
          download
          aria-label={`Download ${sample.title} zip`}
          title="Download sample zip"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#78818f] transition-colors hover:border-[#6C3CF4]/40 hover:text-[#6C3CF4]"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-4 w-4" />
        </a>
      ) : null}

      <Link
        href={`/data/terminal-bench/s/${batchSlug}/${sample.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={`Open ${sample.title}`}
      />

      <div className="pointer-events-none flex flex-col h-full">
        <div className="flex items-center gap-3">
          <DifficultyBadge value={sample.difficulty} />
          {sample.category ? (
            <span className="text-xs font-medium uppercase tracking-wider text-[#78818f]">
              {sample.category}
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 text-xl font-semibold leading-snug text-[#0e1b2e] group-hover:text-[#6C3CF4]">
          {sample.title}
        </h3>

        {sample.tags && sample.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {sample.tags.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-2.5 py-0.5 text-xs text-[#78818f]"
              >
                {t}
              </span>
            ))}
            {sample.tags.length > 5 ? (
              <span className="rounded-full px-2.5 py-0.5 text-xs text-[#78818f]">
                +{sample.tags.length - 5}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-6 text-xs text-[#78818f]">
          <span>
            expert {expertMin ? `${expertMin}m` : "—"} · junior{" "}
            {juniorMin ? `${juniorMin}m` : "—"}
          </span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>
  );
}
