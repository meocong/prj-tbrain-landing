import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { STATIC_IMAGES } from "@/lib/admin/gallery-static";
import { GalleryClient } from "./gallery-client";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("files.view");
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  const db = supabaseAdmin();
  const [posts, uploads] = await Promise.all([
    db.from("cms_posts").select("id, title, cover_image_url").not("cover_image_url", "is", null).order("updated_at", { ascending: false }),
    db.from("fm_files").select("id, name, gcs_object, mime_type, size_bytes, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Gallery
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {STATIC_IMAGES.length} static · {(posts.data ?? []).length} post covers · {(uploads.data ?? []).length} uploads
        </p>
      </div>
      <GalleryClient
        staticImages={STATIC_IMAGES}
        postCovers={(posts.data ?? []) as Array<{ id: string; title: string; cover_image_url: string }>}
        uploads={(uploads.data ?? []) as Array<{ id: string; name: string; gcs_object: string; mime_type: string | null; size_bytes: number | null }>}
        search={first(sp.search)}
        originFilter={first(sp.origin) || "all"}
        page={Number(first(sp.page) || 0)}
      />
    </div>
  );
}
