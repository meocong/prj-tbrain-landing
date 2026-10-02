"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useAdminAuth } from "@/lib/admin/auth-context";
import type { CmsPostSocial, SocialNetwork } from "@/lib/admin/types";

/**
 * Manual social sharing for a published post. The content agent pre-writes a
 * message per network (cms_post_social); a human edits it, clicks share, and
 * marks it posted. Auto-posting (Buffer / native APIs) can reuse the same rows.
 */

const NETWORKS: { key: SocialNetwork; label: string; limit: number; hint: string }[] = [
  { key: "linkedin", label: "LinkedIn", limit: 3000, hint: "Opens LinkedIn with the message pre-filled." },
  {
    key: "facebook",
    label: "Facebook",
    limit: 5000,
    hint: "Facebook doesn't allow pre-filled text: the message is copied — paste it into the composer.",
  },
  // t.co wraps every link to 23 chars, plus one space.
  { key: "x", label: "X", limit: 280 - 24, hint: "Opens X with the message and link." },
];

function shareUrl(network: SocialNetwork, postUrl: string, message: string): string {
  const tagged = `${postUrl}?utm_source=${network}&utm_medium=social&utm_campaign=blog`;
  const e = encodeURIComponent;
  switch (network) {
    case "linkedin":
      return `https://www.linkedin.com/feed/?shareActive=true&text=${e(`${message}\n\n${tagged}`)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${e(tagged)}`;
    case "x":
      return `https://x.com/intent/post?text=${e(message)}&url=${e(tagged)}`;
  }
}

export function SharePanel({ postId, slug, published }: { postId: string; slug: string; published: boolean }) {
  const queryClient = useQueryClient();
  const { adminUser } = useAdminAuth();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<Record<string, string>>({});

  const { data: rows } = useQuery({
    queryKey: ["admin-post-social", postId],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("cms_post_social").select("*").eq("post_id", postId);
      return (data ?? []) as CmsPostSocial[];
    },
  });

  useEffect(() => {
    if (!rows) return;
    setDrafts(Object.fromEntries(rows.map((r) => [r.network, r.message])));
    setLinks(Object.fromEntries(rows.map((r) => [r.network, r.external_url ?? ""])));
  }, [rows]);

  const save = useMutation({
    mutationFn: async ({ network, patch }: { network: SocialNetwork; patch: Partial<CmsPostSocial> }) => {
      const { error } = await supabaseAdmin
        .from("cms_post_social")
        .upsert({ post_id: postId, network, message: drafts[network] ?? "", ...patch }, { onConflict: "post_id,network" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-post-social", postId] }),
    onError: (e) => toast.error(e.message),
  });

  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : `/blog/${slug}`;

  async function share(network: SocialNetwork) {
    const message = drafts[network] ?? "";
    if (message) {
      try {
        await navigator.clipboard.writeText(network === "facebook" ? message : `${message}\n\n${postUrl}`);
        toast.success(network === "facebook" ? "Message copied — paste it into Facebook" : "Message copied");
      } catch {
        // Clipboard can be blocked; the share URL still carries the text where supported.
      }
    }
    window.open(shareUrl(network, postUrl, message), "_blank", "noopener,noreferrer,width=720,height=720");
    save.mutate({ network, patch: { status: "shared", shared_by: adminUser?.id ?? null, shared_at: new Date().toISOString() } });
  }

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Share</h3>
      </div>
      {!published && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Publish the post first. You can edit the messages now.
        </p>
      )}
      {NETWORKS.map(({ key, label, limit, hint }) => {
        const row = rows?.find((r) => r.network === key);
        const message = drafts[key] ?? "";
        const over = message.length > limit;
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span className="text-[10px]" style={{ color: over ? "var(--color-error)" : "var(--text-muted)" }}>
                {row?.status && row.status !== "draft" ? `${row.status} · ` : ""}
                {message.length}/{limit}
              </span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
              onBlur={() => { if ((row?.message ?? "") !== message) save.mutate({ network: key, patch: {} }); }}
              placeholder={`${label} message`}
              className="w-full resize-y rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => share(key)}
                disabled={!published || over}
                title={hint}
                className="btn-secondary flex-1 justify-center text-xs"
              >
                <ExternalLink className="h-3 w-3" /> Share on {label}
              </button>
              <button
                onClick={async () => { await navigator.clipboard.writeText(message); toast.success("Copied"); }}
                disabled={!message}
                className="btn-ghost text-xs px-2"
                aria-label={`Copy ${label} message`}
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            {row && row.status !== "draft" && (
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={links[key] ?? ""}
                  onChange={(e) => setLinks((l) => ({ ...l, [key]: e.target.value }))}
                  placeholder="Link to the live post (optional)"
                  className="min-w-0 flex-1 rounded-lg px-2 py-1 text-[11px]"
                  style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
                <button
                  onClick={() => save.mutate({ network: key, patch: { status: "posted", external_url: links[key] || null } })}
                  className="btn-ghost text-[11px] px-2"
                >
                  <Check className="h-3 w-3" /> Posted
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
