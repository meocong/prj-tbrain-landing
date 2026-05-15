import "server-only";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { Tag, Tags, FileText, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

type PostRow = { id: string; title: string; status: string; tags: string[] | null };

export default async function TagsPage() {
  await requireAdmin("content.view");
  const db = supabaseAdmin();
  const { data } = await db
    .from("cms_posts")
    .select("id, title, status, tags")
    .order("updated_at", { ascending: false });

  const posts = (data ?? []) as PostRow[];
  const tagIndex = new Map<string, number>();
  let untagged = 0;
  for (const p of posts) {
    if (!p.tags || p.tags.length === 0) {
      untagged++;
      continue;
    }
    for (const t of p.tags) {
      const key = t.trim();
      if (!key) continue;
      tagIndex.set(key, (tagIndex.get(key) ?? 0) + 1);
    }
  }
  const sorted = [...tagIndex.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Tags
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Every tag used across your CMS posts. Click one to filter the content list.
          </p>
        </div>
        <Link href="/admin/content" className="btn-ghost text-sm">← All posts</Link>
      </div>

      <KpiStrip
        items={[
          { label: "Distinct tags", value: sorted.length, icon: Tags, accent: "primary" },
          { label: "Tagged posts", value: posts.length - untagged, icon: Tag, accent: "success" },
          { label: "Total posts", value: posts.length, icon: FileText, accent: "info" },
          { label: "Untagged", value: untagged, icon: AlertTriangle, accent: "warning" },
        ]}
      />

      {sorted.length === 0 ? (
        <div className="glass-card p-12 text-center" style={{ color: "var(--text-muted)" }}>
          No tags yet. Add tags when creating or editing a post.
        </div>
      ) : (
        <div className="glass-card p-5">
          <div className="flex flex-wrap gap-2">
            {sorted.map(([name, count]) => (
              <Link
                key={name}
                href={`/admin/content?tag=${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                style={{
                  background: "var(--color-brand-50)",
                  color: "var(--color-brand-600)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ opacity: 0.7 }}>#</span>
                <span>{name}</span>
                <span
                  className="ml-1 rounded-full px-1.5 text-[10px]"
                  style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
                >
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {untagged > 0 && (
        <div className="mt-5">
          <h2
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Untagged posts ({untagged})
          </h2>
          <div className="glass-card divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {posts.filter((p) => !p.tags || p.tags.length === 0).slice(0, 25).map((p) => (
              <Link
                key={p.id}
                href={`/admin/content/${p.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-[var(--bg-input)] transition-colors"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span style={{ color: "var(--text-primary)" }}>{p.title}</span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
