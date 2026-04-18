"use client";

import { useEffect, useState } from "react";

export function SolutionPanel({
  sampleId,
  batchId,
  solutionPath,
}: {
  sampleId: string;
  batchId: string;
  solutionPath: string;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetch("/data/terminal-bench/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        events: [{ type: "view_solution", sampleId, batchId }],
      }),
    });
  }, [sampleId, batchId]);

  useEffect(() => {
    let cancelled = false;
    void fetch(
      `/data/terminal-bench/api/files/${sampleId}/content?path=${encodeURIComponent(solutionPath)}`
    )
      .then(async (r) => {
        const data = (await r.json()) as { html?: string; error?: string };
        if (cancelled) return;
        if (!r.ok) setError(data.error ?? "load_failed");
        else setHtml(data.html ?? "");
      });
    return () => {
      cancelled = true;
    };
  }, [sampleId, solutionPath]);

  async function onCopy() {
    if (!html) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.innerText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <p className="font-mono text-xs text-[#0e1b2e]">{solutionPath}</p>
          <button
            type="button"
            onClick={onCopy}
            disabled={!html}
            className="rounded-lg border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#0e1b2e] hover:border-[#6C3CF4] hover:text-[#6C3CF4] disabled:opacity-50"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5 text-sm">
          {error ? (
            <p className="text-sm text-red-700">Could not load solution ({error}).</p>
          ) : html ? (
            <div
              className="shiki-container [&_pre]:!bg-transparent"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-sm text-[#78818f]">Loading…</p>
          )}
        </div>
      </div>
    </div>
  );
}
