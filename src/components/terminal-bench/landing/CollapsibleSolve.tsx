"use client";

export function CollapsibleSolve({ html }: { html: string }) {
  return (
    <div
      className="solve-sh-block overflow-auto px-5 py-6 text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
