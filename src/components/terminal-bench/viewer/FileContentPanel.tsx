"use client";

import { useEffect, useRef, useState } from "react";
import { FileExplorer } from "./FileExplorer";

interface ManifestFile {
  path: string;
  size_bytes: number | null;
  mime: string | null;
}

const SKELETON_WIDTHS = [92, 78, 96, 65, 88, 72, 94, 70, 83, 90, 74, 95];

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {SKELETON_WIDTHS.map((w, i) => (
        <div
          key={i}
          className="h-3 rounded bg-[#F3F4F6]"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

function TreeSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[95, 80, 88, 72, 90, 65, 82, 78, 92].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded bg-[#F3F4F6]"
          style={{ width: `${w}%`, marginLeft: `${(i % 3) * 10}px` }}
        />
      ))}
    </div>
  );
}

export function FileContentPanel({
  sampleId,
  initialPath,
}: {
  sampleId: string;
  initialPath?: string;
}) {
  const [files, setFiles] = useState<ManifestFile[] | null>(null);
  const [active, setActive] = useState<string | null>(initialPath ?? null);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    void fetch(`/data/terminal-bench/api/files/${sampleId}`)
      .then((r) => r.json())
      .then((data: { files: ManifestFile[] }) => {
        if (cancelled) return;
        setFiles(data.files);
        if (!active && data.files.length > 0) {
          // Pick a representative first file: README, then Dockerfile, then
          // the first source file, else the first file.
          const ordered = [
            data.files.find((f) => /readme/i.test(f.path)),
            data.files.find((f) => /dockerfile$/i.test(f.path)),
            data.files.find((f) => f.path.startsWith("src/") && !f.path.includes("__pycache__")),
            data.files.find((f) => /\.(md|py|ts|js|go|rs|sh|toml)$/i.test(f.path)),
            data.files[0],
          ];
          const pick = ordered.find(Boolean)!;
          setActive(pick.path);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleId]);

  useEffect(() => {
    if (!active) return;
    const cached = cache.current.get(active);
    if (cached !== undefined) {
      setHtml(cached);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHtml(null);
    void fetch(
      `/data/terminal-bench/api/files/${sampleId}/content?path=${encodeURIComponent(active)}`
    )
      .then(async (r) => {
        const data = (await r.json()) as { html?: string; error?: string };
        if (cancelled) return;
        if (!r.ok) {
          setHtml(null);
          setError(data.error ?? "load_failed");
        } else {
          const body = data.html ?? "";
          cache.current.set(active, body);
          setHtml(body);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sampleId, active]);

  const manifestLoading = files === null;
  const noFiles = files !== null && files.length === 0;

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="max-h-[70vh] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-4">
          {manifestLoading ? (
            <TreeSkeleton />
          ) : noFiles ? (
            <p className="text-sm text-[#78818f]">No files indexed.</p>
          ) : (
            <FileExplorer entries={files!} activePath={active} onSelect={setActive} />
          )}
        </aside>

        <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
            <p className="truncate font-mono text-xs text-[#0e1b2e]">
              {active ?? (manifestLoading ? "Loading files…" : "No files")}
            </p>
            {loading ? <span className="text-xs text-[#78818f]">loading…</span> : null}
          </div>
          <div className="max-h-[75vh] overflow-auto p-5 text-sm">
            {error ? (
              <p className="text-sm text-red-700">Could not load this file ({error}).</p>
            ) : manifestLoading || loading || (active && html === null) ? (
              <ContentSkeleton />
            ) : html ? (
              <div
                className="shiki-container [&_pre]:!bg-transparent"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : noFiles ? (
              <p className="text-sm text-[#78818f]">
                This sample has no indexed files.
              </p>
            ) : html === "" ? (
              <p className="text-sm text-[#78818f]">
                Empty file — nothing to preview.
              </p>
            ) : (
              <ContentSkeleton />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
