"use client";

import { useState } from "react";

export function CollapsibleSolve({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className={`solve-sh-block overflow-auto px-5 py-6 text-sm leading-relaxed transition-[max-height] duration-300 ease-out ${
          expanded ? "max-h-[70vh]" : "max-h-[340px]"
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {!expanded ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-2xl bg-gradient-to-t from-[#0D1117] via-[#0D1117]/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full border border-[#263244] bg-[#111827] px-4 py-1.5 text-xs font-semibold text-[#A78BFA] shadow-sm transition-colors hover:border-[#A78BFA]"
            >
              Show full solution
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center border-t border-[#263244] bg-[#0D1117] py-3">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-full border border-[#263244] bg-[#111827] px-4 py-1.5 text-xs font-semibold text-[#CBD5E1] transition-colors hover:border-[#A78BFA] hover:text-[#A78BFA]"
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}
