"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { STATIC_IMAGES } from "@/lib/admin/gallery-static";
import { Images, FileText, Upload as UploadIcon, Copy } from "lucide-react";

type GalleryItem = {
  key: string;
  src: string;
  label: string;
  origin: "static" | "post_cover" | "upload";
  meta?: string;
  linkTo?: string;
};

export default function GalleryPage() {
  const [filter, setFilter] = useState<"all" | GalleryItem["origin"]>("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { data: posts } = useQuery({
    queryKey: ["gallery-post-covers"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("cms_posts")
        .select("id, slug, title, cover_image_url")
        .not("cover_image_url", "is", null)
        .order("updated_at", { ascending: false });
      return (data ?? []) as Array<{ id: string; slug: string; title: string; cover_image_url: string }>;
    },
  });

  const { data: uploads } = useQuery({
    queryKey: ["gallery-uploads"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("fm_files")
        .select("id, name, gcs_object, mime_type, size_bytes, created_at")
        .order("created_at", { ascending: false });
      return (data ?? []) as Array<{ id: string; name: string; gcs_object: string; mime_type: string | null; size_bytes: number | null; created_at: string }>;
    },
  });

  const items = useMemo<GalleryItem[]>(() => {
    const out: GalleryItem[] = [];
    for (const s of STATIC_IMAGES) {
      out.push({
        key: `static:${s.path}`,
        src: s.path,
        label: s.name,
        origin: "static",
        meta: `${s.ext.toUpperCase()} · ${(s.size_bytes / 1024).toFixed(0)}KB`,
      });
    }
    for (const p of posts ?? []) {
      out.push({
        key: `post:${p.id}`,
        src: p.cover_image_url,
        label: p.title,
        origin: "post_cover",
        meta: "post cover",
        linkTo: `/admin/content/${p.id}`,
      });
    }
    for (const u of uploads ?? []) {
      out.push({
        key: `upload:${u.id}`,
        src: u.gcs_object.startsWith("http") ? u.gcs_object : `/api/files/${u.id}`,
        label: u.name,
        origin: "upload",
        meta: u.mime_type ?? "upload",
      });
    }
    return out;
  }, [posts, uploads]);

  const filtered = items.filter((it) => {
    if (filter !== "all" && it.origin !== filter) return false;
    if (search && !it.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const originLabel: Record<GalleryItem["origin"], string> = {
    static: "Static",
    post_cover: "Post cover",
    upload: "Upload",
  };
  const originColor: Record<GalleryItem["origin"], string> = {
    static: "var(--text-muted)",
    post_cover: "var(--color-brand-500)",
    upload: "#16a34a",
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Gallery
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {STATIC_IMAGES.length} static · {(posts?.length ?? 0)} post covers · {(uploads?.length ?? 0)} uploads
          </p>
        </div>
      </div>

      <div className="glass-card mb-4 flex flex-wrap items-center gap-2 p-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gallery…"
          className="input-field"
          style={{ maxWidth: 280 }}
        />
        <div className="flex gap-1">
          {(["all", "static", "post_cover", "upload"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: filter === f ? "var(--sidebar-active-bg)" : "var(--bg-input)",
                color: filter === f ? "var(--color-brand-500)" : "var(--text-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              {f === "all" ? "All" : originLabel[f as GalleryItem["origin"]]}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {filtered.length} items
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((it) => (
          <div
            key={it.key}
            className="glass-card overflow-hidden"
            style={{ transition: "transform 0.15s" }}
          >
            <div
              className="relative aspect-[4/3] overflow-hidden"
              style={{ background: "var(--bg-input)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt={it.label}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span
                className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase"
                style={{ background: "rgba(0,0,0,0.55)", color: "white" }}
              >
                {originLabel[it.origin]}
              </span>
            </div>
            <div className="p-2">
              <p
                className="truncate text-xs font-medium"
                style={{ color: "var(--text-primary)" }}
                title={it.label}
              >
                {it.label}
              </p>
              <div className="mt-1 flex items-center justify-between gap-1 text-[10px]">
                <span style={{ color: originColor[it.origin] }}>{it.meta}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(it.src);
                    setCopied(it.key);
                    setTimeout(() => setCopied((c) => (c === it.key ? null : c)), 1500);
                  }}
                  className="rounded p-1"
                  style={{ color: "var(--text-muted)" }}
                  title="Copy URL"
                >
                  {copied === it.key ? "✓" : <Copy className="h-3 w-3" />}
                </button>
              </div>
              {it.linkTo && (
                <Link
                  href={it.linkTo}
                  className="mt-1 block text-[10px]"
                  style={{ color: "var(--color-brand-500)" }}
                >
                  Open post →
                </Link>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div
            className="col-span-full flex flex-col items-center gap-2 py-12 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <Images className="h-8 w-8" />
            No images match.
          </div>
        )}
      </div>

      {/* Prevent unused-import warnings for icons reserved for future upload UI */}
      <div className="hidden">
        <FileText />
        <UploadIcon />
      </div>
    </div>
  );
}
