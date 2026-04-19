"use client";

import { useMemo, useState } from "react";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { Images, Copy, X, ExternalLink } from "lucide-react";
import type { StaticImage } from "@/lib/admin/gallery-static";

type GalleryItem = {
  key: string;
  src: string;
  label: string;
  origin: "static" | "post_cover" | "upload";
  meta: string;
  linkTo?: string;
};

const PAGE_SIZE = 24;

export function GalleryClient({
  staticImages,
  postCovers,
  uploads,
  search,
  originFilter,
  page,
}: {
  staticImages: StaticImage[];
  postCovers: Array<{ id: string; title: string; cover_image_url: string }>;
  uploads: Array<{ id: string; name: string; gcs_object: string; mime_type: string | null; size_bytes: number | null }>;
  search: string;
  originFilter: string;
  page: number;
}) {
  const [detail, setDetail] = useState<GalleryItem | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const items = useMemo<GalleryItem[]>(() => {
    const out: GalleryItem[] = [];
    for (const s of staticImages) out.push({ key: `static:${s.path}`, src: s.path, label: s.name, origin: "static", meta: `${s.ext.toUpperCase()} · ${(s.size_bytes / 1024).toFixed(0)}KB` });
    for (const p of postCovers) out.push({ key: `post:${p.id}`, src: p.cover_image_url, label: p.title, origin: "post_cover", meta: "post cover", linkTo: `/admin/content/${p.id}` });
    for (const u of uploads) out.push({ key: `upload:${u.id}`, src: u.gcs_object.startsWith("http") ? u.gcs_object : `/api/files/${u.id}`, label: u.name, origin: "upload", meta: u.mime_type ?? "upload" });
    return out;
  }, [staticImages, postCovers, uploads]);

  const filtered = useMemo(() => {
    let list = items;
    if (originFilter !== "all") list = list.filter((it) => it.origin === originFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((it) => it.label.toLowerCase().includes(s));
    }
    return list;
  }, [items, search, originFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const originLabel: Record<GalleryItem["origin"], string> = { static: "Static", post_cover: "Post cover", upload: "Upload" };
  const originColor: Record<GalleryItem["origin"], string> = { static: "var(--text-muted)", post_cover: "var(--color-brand-500)", upload: "#16a34a" };

  const columns: Column<GalleryItem>[] = [
    {
      key: "label",
      header: "Image",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-14 shrink-0 overflow-hidden rounded"
            style={{ background: "var(--bg-input)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.src} alt={r.label} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm" style={{ color: "var(--text-primary)" }} title={r.label}>{r.label}</p>
            <code className="block truncate text-[10px]" style={{ color: "var(--text-muted)", maxWidth: 300 }}>{r.src}</code>
          </div>
        </div>
      ),
    },
    {
      key: "origin",
      header: "Source",
      render: (r) => (
        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "var(--bg-input)", color: originColor[r.origin] }}>
          {originLabel[r.origin]}
        </span>
      ),
    },
    { key: "meta", header: "Meta", render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.meta}</span> },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(r.src);
              setCopied(r.key);
              setTimeout(() => setCopied((c) => (c === r.key ? null : c)), 1500);
            }}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
            style={{ color: "var(--text-secondary)", background: "var(--bg-input)" }}
            title="Copy URL"
          >
            {copied === r.key ? "Copied ✓" : <><Copy className="h-3 w-3" /> Copy</>}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setDetail(null)}
        >
          <div
            className="glass-card max-w-3xl w-full overflow-hidden animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{detail.label}</h3>
                <code className="text-[10px]" style={{ color: "var(--text-muted)" }}>{detail.src}</code>
              </div>
              <button onClick={() => setDetail(null)} aria-label="Close">
                <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={detail.src} alt={detail.label} className="w-full max-h-[70vh] object-contain" style={{ background: "var(--bg-input)" }} />
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{detail.meta}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(detail.src); }}
                  className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs"
                  style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
                >
                  <Copy className="h-3 w-3" /> Copy URL
                </button>
                {detail.linkTo && (
                  <a
                    href={detail.linkTo}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs"
                    style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <DataTableSSR<GalleryItem>
        columns={columns}
        rows={paged}
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        search={search}
        sort={{ key: "label", dir: "asc" }}
        activeFilters={{ origin: originFilter === "all" ? "" : originFilter }}
        searchPlaceholder="Search gallery…"
        filters={[
          {
            key: "origin",
            label: "Source",
            options: [
              { value: "all", label: "All sources" },
              { value: "static", label: "Static" },
              { value: "post_cover", label: "Post cover" },
              { value: "upload", label: "Upload" },
            ],
          },
        ]}
        rowKey={(r) => r.key}
        onRowClick={(r) => setDetail(r)}
        empty={<><Images className="h-6 w-6 mx-auto mb-1 opacity-40" /> No images match.</>}
      />
    </>
  );
}
