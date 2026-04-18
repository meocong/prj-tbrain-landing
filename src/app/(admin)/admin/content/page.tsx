"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { POST_STATUS_BADGE } from "@/lib/admin/constants";
import { useHasPermission } from "@/lib/admin/auth-context";
import { Plus, Search, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function ContentPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const canCreate = useHasPermission("content.create");
  const canPublish = useHasPermission("content.publish");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts", search, statusFilter, page],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("cms_posts")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) {
        query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count } = await query;
      return { posts: data ?? [], total: count ?? 0 };
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabaseAdmin
        .from("cms_posts")
        .update({
          status: publish ? "published" : "draft",
          published_at: publish ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.publish ? "Post published" : "Post unpublished");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            Content
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {data?.total ?? 0} posts
          </p>
        </div>
        {canCreate && (
          <Link href="/admin/content/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="glass-card mt-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1" style={{ maxWidth: "320px" }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search posts..."
            className="w-full rounded-lg py-2 pl-9 pr-8 text-sm"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5">
              <X className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Posts list */}
      <div className="mt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton mt-2 h-4 w-1/3" />
            </div>
          ))
        ) : data?.posts.length === 0 ? (
          <div className="glass-card p-12 text-center" style={{ color: "var(--text-muted)" }}>
            No posts found
          </div>
        ) : (
          data?.posts.map((p: Record<string, unknown>) => (
            <div key={p.id as string} className="glass-card-hover p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/content/${p.id}`}
                    className="text-base font-medium hover:underline"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
                  >
                    {p.title as string}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span className={`badge ${POST_STATUS_BADGE[p.status as string] || "badge-muted"}`}>
                      {p.status as string}
                    </span>
                    <span>/{p.slug as string}</span>
                    {p.category ? <span className="badge badge-info">{String(p.category)}</span> : null}
                    <span>{new Date(p.updated_at as string).toLocaleDateString()}</span>
                  </div>
                  {p.excerpt ? (
                    <p className="mt-1 line-clamp-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {String(p.excerpt)}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {canPublish && p.status === "draft" && (
                    <button
                      onClick={() => publishMutation.mutate({ id: p.id as string, publish: true })}
                      className="btn-ghost text-xs"
                      style={{ color: "var(--color-success)" }}
                    >
                      Publish
                    </button>
                  )}
                  {p.status === "published" && (
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost p-1.5"
                      title="View live"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Page {page + 1} of {totalPages}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost p-1.5">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost p-1.5">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
