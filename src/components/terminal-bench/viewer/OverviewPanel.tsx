import type { FileRow, SampleRow } from "@/lib/terminal-bench/types";
import { DifficultyBadge } from "@/components/terminal-bench/samples/DifficultyBadge";

function extractSummary(md: string | null, maxChars = 720): string[] {
  if (!md) return [];
  // Strip fenced code blocks, then leading headings, then keep first paragraphs.
  const cleaned = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*#.*$/gm, "")
    .replace(/\r\n/g, "\n")
    .trim();

  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      p
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim()
    );

  const out: string[] = [];
  let used = 0;
  for (const p of paragraphs) {
    if (p.length < 20) continue; // skip fragments
    if (used + p.length > maxChars && out.length > 0) break;
    out.push(p);
    used += p.length;
    if (out.length >= 3) break;
  }
  return out;
}

export function OverviewPanel({
  sample,
  files,
}: {
  sample: SampleRow;
  files: FileRow[];
}) {
  const summary = extractSummary(sample.instruction_md);

  const extCounts = new Map<string, number>();
  let totalBytes = 0;
  for (const f of files) {
    const dot = f.path.lastIndexOf(".");
    const key = dot === -1 ? "(no ext)" : f.path.slice(dot);
    extCounts.set(key, (extCounts.get(key) ?? 0) + 1);
    totalBytes += f.size_bytes ?? 0;
  }
  const topExts = Array.from(extCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const spec = sample.spec_json ?? {};
  const readableBytes =
    totalBytes >= 1024 * 1024
      ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
      : totalBytes >= 1024
      ? `${(totalBytes / 1024).toFixed(0)} KB`
      : `${totalBytes} B`;

  const stats: { label: string; value: string }[] = [
    { label: "files", value: String(files.length) },
    { label: "source bytes", value: readableBytes },
    { label: "tests", value: String(sample.tests_json?.length ?? 0) },
    {
      label: "expert time",
      value: sample.expert_time_min != null ? `${sample.expert_time_min}m` : "—",
    },
    {
      label: "junior time",
      value: sample.junior_time_min != null ? `${sample.junior_time_min}m` : "—",
    },
    {
      label: "agent timeout",
      value: spec.agent_timeout_sec != null ? `${spec.agent_timeout_sec}s` : "—",
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      {/* Task description */}
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-family_avt text-[10px] uppercase tracking-[0.2em] text-[#78818f]">
            task brief
          </p>
          <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
          <DifficultyBadge value={sample.difficulty} />
          {sample.category ? (
            <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#78818f]">
              {sample.category}
            </span>
          ) : null}
          {(sample.tags ?? []).slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#78818f]"
            >
              {t}
            </span>
          ))}
        </div>

        {summary.length > 0 ? (
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[#0e1b2e]">
            {summary.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm italic text-[#78818f]">
            No task description captured.
          </p>
        )}

        {sample.author_name ? (
          <p className="mt-6 font-family_avt text-[11px] uppercase tracking-widest text-[#78818f]">
            authored by · {sample.author_name}
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[#E5E7EB] pt-6 text-xs text-[#78818f]">
          <span>Open the</span>
          <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-2 py-0.5 font-semibold text-[#6C3CF4]">
            Instructions
          </span>
          <span>tab for the exact prompt the agent sees.</span>
        </div>
      </section>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
          >
            <p className="font-family_avt text-[10px] uppercase tracking-widest text-[#78818f]">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#0e1b2e]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Language mix */}
      <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <p className="font-family_avt text-xs uppercase tracking-widest text-[#78818f]">
          Language mix
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {topExts.map(([ext, count]) => (
            <span
              key={ext}
              className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#0e1b2e]"
            >
              <span className="font-mono text-[#6C3CF4]">{ext}</span>{" "}
              <span className="text-[#78818f]">× {count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
