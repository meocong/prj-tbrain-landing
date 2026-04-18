import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { downloadBuffer, fileObject } from "@/lib/terminal-bench/gcs";
import { highlightToHtml } from "@/lib/terminal-bench/highlight";

const FALLBACK_SH = `#!/usr/bin/env bash
# Example expert solution (sample unavailable at build time).
set -euo pipefail

# Patch the REPL to cancel outstanding tasks on Ctrl-C.
sed -i 's/loop.run_forever()/await _drain_and_close(loop)/' src/repl.py

# Run the deterministic verifier.
python -m pytest -q tests/test_outputs.py
`;

const FEATURED_SLUG = "asyncio-repl-lifecycle";

async function loadSolveSh(): Promise<{ bash: string; slug: string; title: string | null } > {
  try {
    const db = supabaseAdmin();
    const { data: sample } = await db
      .from("samples")
      .select("id, slug, title")
      .eq("slug", FEATURED_SLUG)
      .maybeSingle();
    if (!sample) return { bash: FALLBACK_SH, slug: FEATURED_SLUG, title: null };

    const buf = await downloadBuffer(fileObject(sample.id as string, "solution/solve.sh"));
    return { bash: buf.toString("utf8"), slug: sample.slug as string, title: (sample.title as string | null) ?? null };
  } catch {
    return { bash: FALLBACK_SH, slug: FEATURED_SLUG, title: null };
  }
}

export async function LiveSolveDiff() {
  const { bash, slug, title } = await loadSolveSh();
  const html = await highlightToHtml(bash, "bash");
  const lineCount = bash.split("\n").length;

  return (
    <section className="relative bg-[#FAFAF7]">
      <div className="container mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-10 grid items-end gap-6 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
              / real artefact
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium leading-tight text-[#0e1b2e] md:text-5xl">
              One expert solution. <span className="gradient-text">Byte-for-byte.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#78818f]">
              This is the exact <code className="font-mono text-[#0e1b2e]">solve.sh</code>{" "}
              shipped inside <code className="font-mono text-[#0e1b2e]">tbrain-{slug}</code>
              {title ? ` — ${title}` : ""}. It runs in the same Docker container the
              verifier uses. If it passes here, it passes for every evaluation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[#0e1b2e] md:justify-self-end">
            <div>
              <p className="text-3xl font-medium md:text-4xl">{lineCount}</p>
              <p className="font-family_avt mt-1 text-[11px] uppercase tracking-widest text-[#78818f]">
                lines of bash
              </p>
            </div>
            <div>
              <p className="text-3xl font-medium md:text-4xl">0</p>
              <p className="font-family_avt mt-1 text-[11px] uppercase tracking-widest text-[#78818f]">
                llm judges involved
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-32px_rgba(14,27,46,0.25)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-[#78818f]">
                solution/solve.sh
              </span>
            </div>
            <span className="font-family_avt text-[11px] uppercase tracking-widest text-[#6C3CF4]">
              bash · github-light
            </span>
          </div>
          <div
            className="solve-sh-block overflow-x-auto px-5 py-6 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
