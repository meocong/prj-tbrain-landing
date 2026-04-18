"use client";

import { useState, type ReactNode } from "react";

export type TabKey = "overview" | "instructions" | "files" | "tests" | "solution";

const LABELS: Record<TabKey, string> = {
  overview: "Overview",
  instructions: "Instructions",
  files: "Files",
  tests: "Tests",
  solution: "Solution",
};

export function ViewerTabs({
  initial = "overview",
  children,
}: {
  initial?: TabKey;
  children: Record<TabKey, ReactNode>;
}) {
  const [active, setActive] = useState<TabKey>(initial);
  const keys: TabKey[] = ["overview", "instructions", "files", "tests", "solution"];

  return (
    <div>
      <div className="sticky top-20 z-[5] border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex gap-1 overflow-x-auto">
            {keys.map((k) => (
              <button
                key={k}
                onClick={() => setActive(k)}
                className={`relative px-4 py-4 text-sm font-semibold transition-colors ${
                  active === k
                    ? "text-[#6C3CF4]"
                    : "text-[#78818f] hover:text-[#0e1b2e]"
                }`}
              >
                {LABELS[k]}
                {active === k ? (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#6C3CF4]" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>{children[active]}</div>
    </div>
  );
}
