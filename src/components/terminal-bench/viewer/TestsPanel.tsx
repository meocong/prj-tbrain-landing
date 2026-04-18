"use client";

import { useEffect } from "react";
import type { TestEntry } from "@/lib/terminal-bench/types";

function humanise(name: string): string {
  const body = name.replace(/^test_/, "").replace(/([A-Z])/g, " $1");
  return body.replace(/[_\.]/g, " ").trim().replace(/^./, (c) => c.toUpperCase());
}

export function TestsPanel({
  tests,
  sampleId,
  batchId,
}: {
  tests: TestEntry[] | null;
  sampleId: string;
  batchId: string;
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
    return (
      <div className="container mx-auto max-w-3xl px-6 py-20 text-center text-[#78818f]">
        No tests captured for this sample.
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
