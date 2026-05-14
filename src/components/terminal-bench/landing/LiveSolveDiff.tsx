import { highlightToHtml } from "@/lib/terminal-bench/highlight";
import { SectionHeading } from "@/components/terminal-bench/shared/SectionHeading";
import { CollapsibleSolve } from "./CollapsibleSolve";

const PREVIEW_SH = `#!/usr/bin/env bash
# Compact expert solution preview.
set -euo pipefail

# Patch the REPL to cancel outstanding tasks on Ctrl-C.
sed -i 's/loop.run_forever()/await _drain_and_close(loop)/' src/repl.py

# Run the deterministic verifier.
python -m pytest -q tests/test_outputs.py
`;

const FEATURED_SLUG = "asyncio-repl-lifecycle";

export async function LiveSolveDiff() {
  const bash = PREVIEW_SH;
  const html = await highlightToHtml(bash, "bash");
  const lineCount = bash.split("\n").length;

  return (
    <section className="relative bg-[#FAFAF7] dark:bg-[#020617]">
      <div className="container mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-col items-center gap-6 text-center">
          <div className="max-w-3xl">
            <SectionHeading label="real artifact" className="mb-0" centered>
              One expert solution. <span className="gradient-text">Readable preview.</span>
            </SectionHeading>
            <p className="mt-5 mx-auto max-w-xl text-base leading-relaxed text-[#78818f]">
              This compact <code className="font-mono text-[#0e1b2e]">solve.sh</code>{" "}
              preview shows how a Terminal Bench sample is patched and verified
              inside <code className="font-mono text-[#0e1b2e]">tbrain-{FEATURED_SLUG}</code>.
              Full artifacts remain available inside the showcase.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-center text-[#0e1b2e]">
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

        <div className="rounded-2xl border border-[#263244] bg-[#0D1117] shadow-[0_24px_60px_-32px_rgba(14,27,46,0.45)]">
          <div className="flex items-center justify-between border-b border-[#263244] px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-[#CBD5E1]">
                solution/solve.sh
              </span>
            </div>
            <span className="font-family_avt text-[11px] uppercase tracking-widest text-[#6C3CF4]">
              bash · github-dark
            </span>
          </div>
          <CollapsibleSolve html={html} />
        </div>
      </div>
    </section>
  );
}
