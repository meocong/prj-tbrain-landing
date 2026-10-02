"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Editor } from "@tiptap/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Check, Loader2, Sparkles, X as XIcon } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useAdminAuth } from "@/lib/admin/auth-context";

export interface SeoSuggestion {
  seo_title: string;
  seo_description: string;
  excerpt: string;
  tags: string[];
  slug: string;
}

interface AgentRequest {
  id: string;
  type: "draft" | "revise" | "scout";
  post_id: string | null;
  brief: { idea?: string; notes?: string; keyword?: string };
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  result: { post_id?: string; message?: string };
  created_at: string;
}

const inputStyle = {
  backgroundColor: "var(--bg-input)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
} as const;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * AI in the post editor. "Assist" edits the selected passage or proposes SEO
 * fields right away (GLM via /api/admin/ai/assist). "Agent" hands a job to the
 * content agent (write a full researched draft / revise this post); it picks
 * the job up from cms_agent_requests within a few minutes.
 */
export function AiPanel({
  editor,
  title,
  postId,
  postStatus,
  onSeo,
}: {
  editor: Editor | null;
  title: string;
  postId?: string;
  postStatus?: string;
  onSeo: (seo: SeoSuggestion) => void;
}) {
  const [tab, setTab] = useState<"assist" | "agent">("assist");
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "var(--bg-input)" }}>
        {(["assist", "agent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            style={{
              backgroundColor: tab === t ? "var(--bg-card, #fff)" : "transparent",
              color: tab === t ? "var(--color-brand-600)" : "var(--text-secondary)",
            }}
          >
            {t === "assist" ? <Sparkles className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            {t === "assist" ? "AI assist" : "Content agent"}
          </button>
        ))}
      </div>
      {tab === "assist" ? (
        <AssistTab editor={editor} title={title} onSeo={onSeo} />
      ) : (
        <AgentTab postId={postId} postStatus={postStatus} />
      )}
    </div>
  );
}

function AssistTab({ editor, title, onSeo }: { editor: Editor | null; title: string; onSeo: (s: SeoSuggestion) => void }) {
  const [selection, setSelection] = useState<{ from: number; to: number; text: string } | null>(null);
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<{ text: string; from: number; to: number } | null>(null);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { from, to } = editor.state.selection;
      const text = from === to ? "" : editor.state.doc.textBetween(from, to, "\n\n");
      setSelection(text.trim() ? { from, to, text } : null);
    };
    update();
    editor.on("selectionUpdate", update);
    return () => {
      editor.off("selectionUpdate", update);
    };
  }, [editor]);

  const run = useMutation({
    mutationFn: async (action: "rewrite" | "shorten" | "expand" | "fix" | "seo") => {
      const text = action === "seo" ? editor?.getText() ?? "" : selection?.text ?? "";
      if (!text.trim()) throw new Error(action === "seo" ? "Write some content first" : "Select a passage first");
      const res = await fetch("/api/admin/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text, title, instruction: instruction || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error === "rate_limited" ? "Too many requests, wait a minute" : "AI is unavailable right now");
      return { action, json };
    },
    onSuccess: ({ action, json }) => {
      if (action === "seo") {
        onSeo(json.seo as SeoSuggestion);
        toast.success("SEO fields filled — review them below");
      } else if (selection) {
        setResult({ text: json.text as string, from: selection.from, to: selection.to });
      }
    },
    onError: (e) => toast.error(e.message),
  });

  function apply() {
    if (!editor || !result) return;
    const html = result.text
      .split(/\n{2,}/)
      .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br>")}</p>`)
      .join("");
    editor.chain().focus().insertContentAt({ from: result.from, to: result.to }, html).run();
    setResult(null);
  }

  const busy = run.isPending;
  return (
    <div className="space-y-2.5">
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {selection
          ? `Selected ${selection.text.split(/\s+/).filter(Boolean).length} words`
          : "Select a passage in the editor to rewrite it."}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {(["rewrite", "shorten", "expand", "fix"] as const).map((a) => (
          <button
            key={a}
            onClick={() => run.mutate(a)}
            disabled={busy || !selection}
            className="btn-secondary justify-center text-xs capitalize"
          >
            {a === "fix" ? "Fix grammar" : a}
          </button>
        ))}
      </div>
      <input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Optional instruction (e.g. more technical)"
        className="w-full rounded-lg px-2.5 py-1.5 text-xs"
        style={inputStyle}
      />
      {busy && (
        <p className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
        </p>
      )}
      {result && (
        <div className="space-y-1.5 rounded-lg p-2.5 text-xs" style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}>
          <div className="max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">{result.text}</div>
          <div className="flex gap-1.5">
            <button onClick={apply} className="btn-primary flex-1 justify-center text-xs">
              <Check className="h-3 w-3" /> Replace selection
            </button>
            <button onClick={() => setResult(null)} className="btn-ghost text-xs">
              <XIcon className="h-3 w-3" /> Discard
            </button>
          </div>
        </div>
      )}
      <button onClick={() => run.mutate("seo")} disabled={busy} className="btn-ghost w-full justify-center text-xs">
        <Sparkles className="h-3 w-3" /> Generate SEO title, description, excerpt, tags
      </button>
    </div>
  );
}

function AgentTab({ postId, postStatus }: { postId?: string; postStatus?: string }) {
  const { adminUser } = useAdminAuth();
  const queryClient = useQueryClient();
  const [idea, setIdea] = useState("");
  const [keyword, setKeyword] = useState("");
  const isRevise = Boolean(postId);
  const canRevise = postStatus === "draft";

  const { data: requests } = useQuery({
    queryKey: ["agent-requests", postId ?? "new", adminUser?.id],
    enabled: Boolean(adminUser),
    queryFn: async () => {
      let q = supabaseAdmin
        .from("cms_agent_requests")
        .select("id, type, post_id, brief, status, result, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      q = postId ? q.eq("post_id", postId) : q.eq("type", "draft").eq("requested_by", adminUser!.id);
      const { data } = await q;
      return (data ?? []) as AgentRequest[];
    },
    refetchInterval: (query) =>
      (query.state.data as AgentRequest[] | undefined)?.some((r) => r.status === "queued" || r.status === "running")
        ? 10_000
        : false,
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!idea.trim()) throw new Error(isRevise ? "Describe what to change" : "Describe the post idea");
      const row = isRevise
        ? { type: "revise", post_id: postId, brief: { notes: idea.trim() } }
        : { type: "draft", brief: { idea: idea.trim(), keyword: keyword.trim() || undefined } };
      const { error } = await supabaseAdmin
        .from("cms_agent_requests")
        .insert({ ...row, status: "queued", requested_by: adminUser?.id });
      if (error) throw error;
    },
    onSuccess: () => {
      setIdea("");
      setKeyword("");
      toast.success("Sent to the content agent — it picks jobs up within a few minutes");
      queryClient.invalidateQueries({ queryKey: ["agent-requests"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from("cms_agent_requests").update({ status: "cancelled" }).eq("id", id).eq("status", "queued");
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agent-requests"] }),
  });

  return (
    <div className="space-y-2.5">
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {isRevise
          ? "The agent revises this draft from your notes, re-checks facts and sends it back for review."
          : "The agent researches the topic, writes a full sourced draft with critic + fact-check, and puts it in Approvals."}
      </p>
      {isRevise && !canRevise ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Only drafts can be revised by the agent. Unpublish first.</p>
      ) : (
        <>
          <textarea
            rows={4}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={isRevise ? "What should change? e.g. shorter intro, add a checklist, less jargon" : "Post idea, angle, who it's for, links to use…"}
            className="w-full resize-y rounded-lg px-2.5 py-2 text-xs"
            style={inputStyle}
          />
          {!isRevise && (
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Target keyword (optional)"
              className="w-full rounded-lg px-2.5 py-1.5 text-xs"
              style={inputStyle}
            />
          )}
          <button onClick={() => submit.mutate()} disabled={submit.isPending} className="btn-primary w-full justify-center text-xs">
            <Bot className="h-3.5 w-3.5" /> {isRevise ? "Ask agent to revise" : "Ask agent to write a draft"}
          </button>
        </>
      )}
      {requests && requests.length > 0 && (
        <ul className="space-y-1.5 border-t pt-2" style={{ borderColor: "var(--border-default)" }}>
          {requests.map((r) => (
            <li key={r.id} className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{r.brief.idea || r.brief.notes || r.type}</span>
                <span className="flex shrink-0 items-center gap-1 font-medium">
                  {(r.status === "queued" || r.status === "running") && <Loader2 className="h-3 w-3 animate-spin" />}
                  {r.status}
                </span>
              </div>
              {r.status === "done" && r.result.post_id && r.result.post_id !== postId && (
                <Link href={`/admin/content/${r.result.post_id}`} className="font-medium" style={{ color: "var(--color-brand-600)" }}>
                  Open draft →
                </Link>
              )}
              {r.status === "done" && r.post_id && r.post_id === postId && (
                <button onClick={() => window.location.reload()} className="font-medium underline" style={{ color: "var(--color-brand-600)" }}>
                  Reload to see the revision (unsaved edits are lost)
                </button>
              )}
              {r.result.message && <p style={{ color: "var(--text-muted)" }}>{r.result.message}</p>}
              {r.status === "queued" && (
                <button onClick={() => cancel.mutate(r.id)} className="underline" style={{ color: "var(--text-muted)" }}>
                  cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
