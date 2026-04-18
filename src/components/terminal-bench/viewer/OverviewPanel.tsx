import type { FileRow, SampleRow, TestEntry } from "@/lib/terminal-bench/types";
import { DifficultyBadge } from "@/components/terminal-bench/samples/DifficultyBadge";

function extractSummary(md: string | null, maxChars = 1200): string[] {
  if (!md) return [];
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
    if (p.length < 20) continue;
    if (used + p.length > maxChars && out.length > 0) break;
    out.push(p);
    used += p.length;
    if (out.length >= 5) break;
  }
  return out;
}

interface DetectedTool {
  name: string;
  from: string;
}

function detectStack(files: FileRow[]): DetectedTool[] {
  const paths = files.map((f) => f.path.toLowerCase());
  const has = (re: RegExp) => paths.some((p) => re.test(p));
  const got: DetectedTool[] = [];
  const add = (name: string, from: string, cond: boolean) => {
    if (cond) got.push({ name, from });
  };
  add("Docker", "Dockerfile", has(/(^|\/)dockerfile$/));
  add("docker-compose", "compose.yml", has(/docker-compose\.(yml|yaml)$/));
  add("Python", "requirements / pyproject", has(/(^|\/)(requirements\.txt|pyproject\.toml|setup\.py|setup\.cfg|poetry\.lock|uv\.lock|pipfile)$/));
  add("pytest", "pytest config", has(/(^|\/)(pytest\.ini|conftest\.py|pyproject\.toml)$/) && has(/tests?\//));
  add("Node", "package.json", has(/(^|\/)package\.json$/));
  add("Yarn", "yarn.lock", has(/(^|\/)yarn\.lock$/));
  add("npm", "package-lock.json", has(/(^|\/)package-lock\.json$/));
  add("pnpm", "pnpm-lock.yaml", has(/(^|\/)pnpm-lock\.yaml$/));
  add("TypeScript", "tsconfig.json", has(/(^|\/)tsconfig\.json$/));
  add("Go", "go.mod", has(/(^|\/)go\.mod$/));
  add("Rust", "Cargo.toml", has(/(^|\/)cargo\.toml$/));
  add("Make", "Makefile", has(/(^|\/)makefile$/));
  add("Shell", "scripts/*.sh", has(/\.sh$/));
  add("SQL", ".sql files", has(/\.sql$/));
  add("YAML config", ".yml/.yaml", has(/\.(yml|yaml)$/));
  return got;
}

interface DirEntry {
  dir: string;
  count: number;
  bytes: number;
}

function topDirs(files: FileRow[], max = 6): DirEntry[] {
  const map = new Map<string, DirEntry>();
  for (const f of files) {
    const firstSlash = f.path.indexOf("/");
    const dir = firstSlash === -1 ? "(root)" : f.path.slice(0, firstSlash);
    const entry = map.get(dir) ?? { dir, count: 0, bytes: 0 };
    entry.count += 1;
    entry.bytes += f.size_bytes ?? 0;
    map.set(dir, entry);
  }
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, max);
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

function firstSentence(s: string | null): string | null {
  if (!s) return null;
  const clean = s.trim().replace(/\s+/g, " ");
  const m = clean.match(/^(.{20,180}?[.!?])(\s|$)/);
  return m ? m[1] : clean.slice(0, 160);
}

function formatIngested(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function OverviewPanel({
  sample,
  files,
}: {
  sample: SampleRow;
  files: FileRow[];
}) {
  const summary = extractSummary(sample.instruction_md);
  const spec = sample.spec_json ?? {};
  const tests: TestEntry[] = sample.tests_json ?? [];
  const stack = detectStack(files);
  const dirs = topDirs(files);

  const extCounts = new Map<string, number>();
  let totalBytes = 0;
  for (const f of files) {
    const dot = f.path.lastIndexOf(".");
    const slash = f.path.lastIndexOf("/");
    const key = dot === -1 || dot < slash ? "(no ext)" : f.path.slice(dot);
    extCounts.set(key, (extCounts.get(key) ?? 0) + 1);
    totalBytes += f.size_bytes ?? 0;
  }
  const topExts = Array.from(extCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const hasSolution =
    files.some((f) => f.path === "solution/solve.sh") ||
    files.some((f) => f.path.startsWith("solution/"));

  const envSpec: { label: string; value: string | null }[] = [
    { label: "cpus", value: spec.cpus != null ? String(spec.cpus) : null },
    { label: "memory", value: spec.memory_mb != null ? `${spec.memory_mb} MB` : null },
    { label: "storage", value: spec.storage_mb != null ? `${spec.storage_mb} MB` : null },
    {
      label: "build timeout",
      value: spec.build_timeout_sec != null ? `${spec.build_timeout_sec}s` : null,
    },
    {
      label: "agent timeout",
      value: spec.agent_timeout_sec != null ? `${spec.agent_timeout_sec}s` : null,
    },
    {
      label: "verifier timeout",
      value: spec.verifier_timeout_sec != null ? `${spec.verifier_timeout_sec}s` : null,
    },
  ];

  const effortStats = [
    {
      label: "expert time",
      value: sample.expert_time_min != null ? `${sample.expert_time_min}m` : "—",
    },
    {
      label: "junior time",
      value: sample.junior_time_min != null ? `${sample.junior_time_min}m` : "—",
    },
    { label: "files", value: String(files.length) },
    { label: "source", value: formatBytes(totalBytes) },
    { label: "tests", value: String(tests.length) },
    {
      label: "solution",
      value: hasSolution ? "published" : "—",
    },
  ];

  const testsPreview = tests.slice(0, 8);
  const testsMore = Math.max(0, tests.length - testsPreview.length);

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12 space-y-10">
      {/* Task brief */}
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
          {(sample.tags ?? []).map((t) => (
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

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#E5E7EB] pt-6 text-xs text-[#78818f]">
          {sample.author_name ? (
            <span className="font-family_avt uppercase tracking-widest">
              authored by · <span className="text-[#0e1b2e]">{sample.author_name}</span>
              {sample.author_email ? (
                <span className="ml-1 text-[#78818f] normal-case tracking-normal">
                  ({sample.author_email})
                </span>
              ) : null}
            </span>
          ) : null}
          <span>·</span>
          <span className="font-family_avt uppercase tracking-widest">
            ingested · <span className="text-[#0e1b2e]">{formatIngested(sample.created_at)}</span>
          </span>
          <span>·</span>
          <span className="font-mono text-[#0e1b2e]">{sample.slug}</span>
        </div>
      </section>

      {/* Effort / scale stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {effortStats.map((s) => (
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

      {/* Environment spec + Stack detection side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <p className="font-family_avt text-xs uppercase tracking-widest text-[#78818f]">
            Container spec
          </p>
          <p className="mt-1 text-xs text-[#78818f]">
            Deterministic resource caps enforced at run-time.
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {envSpec.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between border-b border-dashed border-[#E5E7EB] pb-2 last:border-0"
              >
                <dt className="font-family_avt text-[10px] uppercase tracking-widest text-[#78818f]">
                  {row.label}
                </dt>
                <dd className="font-mono text-[#0e1b2e]">{row.value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <p className="font-family_avt text-xs uppercase tracking-widest text-[#78818f]">
            Stack detected
          </p>
          <p className="mt-1 text-xs text-[#78818f]">
            Tooling inferred from the ingested file tree.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {stack.length > 0 ? (
              stack.map((t) => (
                <span
                  key={t.name}
                  title={`detected from ${t.from}`}
                  className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#0e1b2e]"
                >
                  <span className="font-semibold text-[#6C3CF4]">{t.name}</span>{" "}
                  <span className="text-[#78818f]">· {t.from}</span>
                </span>
              ))
            ) : (
              <p className="text-sm italic text-[#78818f]">
                No recognised tooling — ask the author for a stack summary.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Directory map + Language mix */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <p className="font-family_avt text-xs uppercase tracking-widest text-[#78818f]">
            Repository map
          </p>
          <p className="mt-1 text-xs text-[#78818f]">
            Top-level directories by file count.
          </p>
          <div className="mt-5 space-y-3">
            {dirs.map((d) => {
              const pct = files.length > 0 ? (d.count / files.length) * 100 : 0;
              return (
                <div key={d.dir}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-mono text-[#0e1b2e]">{d.dir}/</span>
                    <span className="text-xs text-[#78818f]">
                      {d.count} files · {formatBytes(d.bytes)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
                    <div
                      className="h-full rounded-full bg-[#6C3CF4]"
                      style={{ width: `${Math.min(100, pct).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <p className="font-family_avt text-xs uppercase tracking-widest text-[#78818f]">
            Language mix
          </p>
          <p className="mt-1 text-xs text-[#78818f]">
            File extensions by count, top {topExts.length}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
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
        </section>
      </div>

      {/* Tests preview */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-family_avt text-xs uppercase tracking-widest text-[#78818f]">
              Test harness preview
            </p>
            <p className="mt-1 text-xs text-[#78818f]">
              First {testsPreview.length} of {tests.length} pytest cases parsed from{" "}
              <span className="font-mono">tests/test_outputs.py</span>.
            </p>
          </div>
          {testsMore > 0 ? (
            <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#78818f]">
              +{testsMore} more in Tests tab
            </span>
          ) : null}
        </div>
        {tests.length === 0 ? (
          <p className="mt-5 text-sm italic text-[#78818f]">
            No tests parsed — the sample may use a non-pytest harness.
          </p>
        ) : (
          <ol className="mt-5 space-y-3">
            {testsPreview.map((t, i) => (
              <li
                key={t.name + i}
                className="flex gap-4 rounded-xl border border-dashed border-[#E5E7EB] p-3"
              >
                <span className="font-family_avt shrink-0 text-[10px] uppercase tracking-widest text-[#6C3CF4]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-[#0e1b2e]">{t.name}</p>
                  {t.docstring ? (
                    <p className="mt-1 text-xs leading-relaxed text-[#78818f]">
                      {firstSentence(t.docstring)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Footer pill → next steps */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAF7] px-6 py-5 text-xs text-[#78818f]">
        <div className="flex flex-wrap items-center gap-2">
          <span>Jump to</span>
          {[
            ["Instructions", "the full prompt the agent sees"],
            ["Files", "browse every file in the container"],
            ["Tests", "all parsed pytest assertions"],
            hasSolution ? ["Solution", "reference solve.sh"] : null,
          ]
            .filter((x): x is [string, string] => Array.isArray(x))
            .map(([label, hint]) => (
              <span
                key={label}
                title={hint}
                className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 font-semibold text-[#6C3CF4]"
              >
                {label}
              </span>
            ))}
        </div>
        <span className="font-family_avt uppercase tracking-widest">
          sample id · <span className="font-mono normal-case text-[#0e1b2e]">{sample.id.slice(0, 8)}</span>
        </span>
      </section>
    </div>
  );
}
