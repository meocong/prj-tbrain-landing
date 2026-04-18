"use client";

import { useEffect } from "react";
import type { TestEntry } from "@/lib/terminal-bench/types";

function humanise(name: string): string {
  const body = name.replace(/^test_/, "").replace(/([A-Z])/g, " $1");
  return body.replace(/[_\.]/g, " ").trim().replace(/^./, (c) => c.toUpperCase());
}

interface Harness {
  kind: "shell" | "patch" | "python-custom" | "unknown";
  entries: string[];
}

function detectHarness(files: string[]): Harness {
  if (files.length === 0) return { kind: "unknown", entries: [] };
  const has = (re: RegExp) => files.some((p) => re.test(p));
  if (has(/\.sh$/)) {
    return { kind: "shell", entries: files.filter((p) => /\.(sh|bash)$/.test(p)) };
  }
  if (has(/\.patch$/)) {
    return { kind: "patch", entries: files.filter((p) => /\.patch$/.test(p)) };
  }
  if (has(/test.*\.py$/)) {
    return { kind: "python-custom", entries: files.filter((p) => /\.py$/.test(p)) };
  }
  return { kind: "unknown", entries: files };
}

const HARNESS_COPY: Record<Harness["kind"], { title: string; body: string }> = {
  shell: {
    title: "Shell-based verifier",
    body: "This sample runs its assertions via a shell script (tests/test.sh) instead of pytest. Open the Files tab to read the script end-to-end.",
  },
  patch: {
    title: "Patch-based verifier",
    body: "Tests are delivered as a git patch applied at verify time. Inspect tests/tests.patch in the Files tab to see what the agent must satisfy.",
  },
  "python-custom": {
    title: "Custom pytest layout",
    body: "This sample keeps its pytest cases outside the canonical tests/test_outputs.py path. Open the Files tab to read each test module.",
  },
  unknown: {
    title: "No tests indexed",
    body: "The ingest pipeline did not extract pytest cases from this sample. If a custom harness lives in the repo, browse it via the Files tab.",
  },
};

export function TestsPanel({
  tests,
  sampleId,
  batchId,
  harnessFiles = [],
}: {
  tests: TestEntry[] | null;
  sampleId: string;
  batchId: string;
  harnessFiles?: string[];
}) {
  useEffect(() => {
    void fetch("/data/terminal-bench/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        events: [{ type: "view_tests", sampleId, batchId }],
      }),
    });
  }, [sampleId, batchId]);

  if (!tests || tests.length === 0) {
    const harness = detectHarness(harnessFiles);
    const copy = HARNESS_COPY[harness.kind];
    return (
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="font-family_avt text-[10px] uppercase tracking-[0.2em] text-[#6C3CF4]">
            harness · {harness.kind.replace("-", " ")}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-[#0e1b2e]">{copy.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#78818f]">{copy.body}</p>
          {harness.entries.length > 0 ? (
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {harness.entries.slice(0, 8).map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 font-mono text-xs text-[#0e1b2e]"
                >
                  {p}
                </li>
              ))}
              {harness.entries.length > 8 ? (
                <li className="rounded-full border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-1 text-xs text-[#78818f]">
                  +{harness.entries.length - 8} more
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <p className="font-family_avt text-xs uppercase tracking-widest text-[#78818f]">
        {tests.length} test{tests.length === 1 ? "" : "s"}
      </p>
      <ul className="mt-6 space-y-4">
        {tests.map((t) => (
          <li
            key={t.name}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5"
          >
            <p className="text-base font-semibold text-[#0e1b2e]">
              {humanise(t.name)}
            </p>
            <p className="mt-1 font-mono text-xs text-[#78818f]">{t.name}</p>
            {t.docstring ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#0e1b2e]">
                {t.docstring}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
