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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-2xl bg-gradient-to-t from-white via-white/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-xs font-semibold text-[#6C3CF4] shadow-sm transition-colors hover:border-[#6C3CF4]"
            >
              Show full solution
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center border-t border-[#E5E7EB] bg-white py-3">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-xs font-semibold text-[#78818f] transition-colors hover:border-[#6C3CF4] hover:text-[#6C3CF4]"
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}
