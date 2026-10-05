"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bot,
  Eye,
  FileEdit,
  Lightbulb,
  Loader2,
  MessageCircle,
  PenLine,
  RotateCcw,
  Search,
  Sparkles,
  X as XIcon,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useAdminAuth, useHasPermission } from "@/lib/admin/auth-context";

type IdeaStatus = "new" | "queued" | "drafted" | "dismissed";
type JobStatus = "queued" | "running" | "done" | "failed" | "cancelled";

interface Idea {
  id: string;
  seq: number;
  title: string;
  why_now: string | null;
  angle: string | null;
  keyword: string | null;
  audience: string | null;
  data_line: string | null;
  sources: string[];
  score: number | null;
  status: IdeaStatus;
  post_id: string | null;
  created_at: string;
}

interface Brief {
  idea?: string;
  keyword?: string;
  audience?: string;
  notes?: string;
}

interface Job {
  id: string;
  type: "draft" | "revise" | "scout";
  post_id: string | null;
  topic_id: string | null;
  brief: Brief;
  status: JobStatus;
  result: { post_id?: string; message?: string };
  via: "admin" | "telegram" | "schedule";
  requested_by: string | null;
  requested_by_label: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

interface PostRef {
  id: string;
  title: string;
  status: string;
}

const inputStyle = {
  backgroundColor: "var(--bg-input)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
} as const;

const JOB_STATUS: Record<JobStatus, { label: string; color: string; bg: string }> = {
  queued: { label: "Queued", color: "#92400e", bg: "#fef3c7" },
  running: { label: "Writing", color: "#1d4ed8", bg: "#dbeafe" },
  done: { label: "Done", color: "#166534", bg: "#dcfce7" },
  failed: { label: "Failed", color: "#991b1b", bg: "#fee2e2" },
  cancelled: { label: "Cancelled", color: "#475569", bg: "#f1f5f9" },
};

const isActive = (s: JobStatus) => s === "queued" || s === "running";

function ago(iso: string | null) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

/**
 * Content agent hub: topic ideas the agent proposed (weekly or on demand),
 * a button to pick one up as a background draft job with a detailed brief,
 * and every job's progress with links to the resulting draft. The same jobs
 * can be queued from Telegram; the agent posts review links there when done.
 */
export function AgentHubClient({ adminNames }: { adminNames: Record<string, string> }) {
  const { adminUser } = useAdminAuth();
  const canEdit = useHasPermission("content.edit");
  const queryClient = useQueryClient();
  const [ideaFilter, setIdeaFilter] = useState<"open" | "drafted" | "dismissed">("open");
  const [ownIdeaOpen, setOwnIdeaOpen] = useState(false);

  const { data: jobs } = useQuery({
    queryKey: ["agent-hub-jobs"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("cms_agent_requests")
        .select("id, type, post_id, topic_id, brief, status, result, via, requested_by, requested_by_label, created_at, started_at, finished_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as Job[];
    },
    refetchInterval: (q) => ((q.state.data as Job[] | undefined)?.some((j) => isActive(j.status)) ? 10_000 : 60_000),
  });

  const { data: ideas } = useQuery({
    queryKey: ["agent-hub-ideas", ideaFilter],
    queryFn: async () => {
      const statuses: IdeaStatus[] = ideaFilter === "open" ? ["new", "queued"] : [ideaFilter];
      const { data, error } = await supabaseAdmin
        .from("cms_topic_ideas")
        .select("id, seq, title, why_now, angle, keyword, audience, data_line, sources, score, status, post_id, created_at")
        .in("status", statuses)
        .order("created_at", { ascending: false })
        .order("seq", { ascending: true })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as Idea[];
    },
    refetchInterval: () => (jobs?.some((j) => isActive(j.status)) ? 10_000 : 60_000),
  });

  // Titles/statuses of every post a job touched, for links and revise gating.
  const postIds = [
    ...new Set(
      [...(jobs ?? []).flatMap((j) => [j.post_id, j.result?.post_id]), ...(ideas ?? []).map((i) => i.post_id)].filter(
        (x): x is string => Boolean(x),
      ),
    ),
  ];
  const { data: posts } = useQuery({
    queryKey: ["agent-hub-posts", postIds.join(",")],
    enabled: postIds.length > 0,
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("cms_posts").select("id, title, status").in("id", postIds);
      return Object.fromEntries(((data ?? []) as PostRef[]).map((p) => [p.id, p]));
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["agent-hub-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["agent-hub-ideas"] });
  };

  const queue = useMutation({
    mutationFn: async (row: { type: Job["type"]; post_id?: string; topic_id?: string; brief: Brief }) => {
      const { error } = await supabaseAdmin
        .from("cms_agent_requests")
        .insert({ ...row, status: "queued", requested_by: adminUser?.id });
      if (error) throw error;
      return row.type;
    },
    onSuccess: (type) => {
      toast.success(
        type === "scout"
          ? "Topic search queued — ideas appear here in ~15-30 min"
          : "Queued — the agent picks it up within ~2 min and posts the review link when done",
      );
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const setIdeaStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "new" | "dismissed" }) => {
      const { error } = await supabaseAdmin.from("cms_topic_ideas").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from("cms_agent_requests").update({ status: "cancelled" }).eq("id", id).eq("status", "queued");
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });

  const scoutActive = jobs?.some((j) => j.type === "scout" && isActive(j.status));
  const activeCount = jobs?.filter((j) => isActive(j.status)).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Content Agent
          </h1>
          <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--text-muted)" }}>
            Pick a topic the agent proposed (or bring your own), add a brief, and it researches and writes a full
            draft in the background. When it&apos;s done the draft appears here and in Approvals, and the review link
            goes to the Telegram group. Nothing is published without a human.
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => queue.mutate({ type: "scout", brief: {} })}
              disabled={queue.isPending || scoutActive}
              className="btn-ghost text-sm"
            >
              {scoutActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {scoutActive ? "Finding topics…" : "Find new topics"}
            </button>
            <button onClick={() => setOwnIdeaOpen((v) => !v)} className="btn-primary text-sm">
              <PenLine className="h-4 w-4" /> Write from my idea
            </button>
          </div>
        )}
      </div>

      {ownIdeaOpen && canEdit && (
        <div className="glass-card p-4">
          <BriefForm
            submitLabel="Ask agent to write"
            busy={queue.isPending}
            onCancel={() => setOwnIdeaOpen(false)}
            onSubmit={(brief) => {
              queue.mutate({ type: "draft", brief }, { onSuccess: () => setOwnIdeaOpen(false) });
            }}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Ideas */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <Lightbulb className="h-4 w-4" /> Topic ideas
            </h2>
            <div className="flex gap-1 rounded-lg p-0.5 text-xs" style={{ background: "var(--bg-input)" }}>
              {(["open", "drafted", "dismissed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setIdeaFilter(f)}
                  className="rounded-md px-2 py-1 font-medium capitalize"
                  style={{
                    backgroundColor: ideaFilter === f ? "var(--bg-card, #fff)" : "transparent",
                    color: ideaFilter === f ? "var(--color-brand-600)" : "var(--text-secondary)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {ideas?.length === 0 && (
            <div className="glass-card p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {ideaFilter === "open"
                ? "No open ideas. The agent proposes topics every Monday, or click “Find new topics”."
                : `No ${ideaFilter} ideas.`}
            </div>
          )}
          {ideas?.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              post={idea.post_id ? posts?.[idea.post_id] : undefined}
              canEdit={canEdit}
              busy={queue.isPending}
              onWrite={(brief) => queue.mutate({ type: "draft", topic_id: idea.id, brief })}
              onStatus={(status) => setIdeaStatus.mutate({ id: idea.id, status })}
            />
          ))}
        </section>

        {/* Jobs */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <Bot className="h-4 w-4" /> Agent jobs
            {activeCount > 0 && (
              <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                {activeCount} in progress
              </span>
            )}
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Jobs run one at a time; a full draft takes about 20-40 minutes (research, critic, fact-check).
          </p>
          {jobs?.length === 0 && (
            <div className="glass-card p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              No jobs yet.
            </div>
          )}
          {jobs?.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              ideaTitle={ideas?.find((i) => i.id === job.topic_id)?.title}
              posts={posts ?? {}}
              who={
                job.requested_by_label ||
                (job.requested_by ? (job.requested_by === adminUser?.id ? "you" : adminNames[job.requested_by]) : null) ||
                (job.via === "schedule" ? "weekly schedule" : "someone")
              }
              mine={job.requested_by === adminUser?.id}
              canEdit={canEdit}
              busy={queue.isPending}
              onCancel={() => cancel.mutate(job.id)}
              onRevise={(postId, notes) => queue.mutate({ type: "revise", post_id: postId, brief: { notes } })}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function BriefForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: {
  initial?: Brief;
  submitLabel: string;
  busy: boolean;
  onSubmit: (brief: Brief) => void;
  onCancel: () => void;
}) {
  const [idea, setIdea] = useState(initial?.idea ?? "");
  const [keyword, setKeyword] = useState(initial?.keyword ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [notes, setNotes] = useState("");

  function submit() {
    if (!idea.trim()) {
      toast.error("Describe the post idea");
      return;
    }
    const clean = (s: string) => s.trim() || undefined;
    onSubmit({ idea: idea.trim(), keyword: clean(keyword), audience: clean(audience), notes: clean(notes) });
  }

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
        Idea and angle
        <textarea
          rows={3}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="What the post argues, and what Tbrain can say that others can't"
          className="mt-1 w-full resize-y rounded-lg px-2.5 py-2 text-xs font-normal"
          style={inputStyle}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
          Target keyword
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. teleoperation dataset"
            className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal"
            style={inputStyle}
          />
        </label>
        <label className="block text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
          Reader
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. robotics data buyers at VLA startups"
            className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal"
            style={inputStyle}
          />
        </label>
      </div>
      <label className="block text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
        Details for the writer (optional)
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Must-cover points, sources to use, samples to show, length, tone, CTA, things to avoid…"
          className="mt-1 w-full resize-y rounded-lg px-2.5 py-2 text-xs font-normal"
          style={inputStyle}
        />
      </label>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="btn-primary text-xs">
          <Bot className="h-3.5 w-3.5" /> {submitLabel}
        </button>
        <button onClick={onCancel} className="btn-ghost text-xs">
          Cancel
        </button>
      </div>
    </div>
  );
}

function IdeaCard({
  idea,
  post,
  canEdit,
  busy,
  onWrite,
  onStatus,
}: {
  idea: Idea;
  post?: PostRef;
  canEdit: boolean;
  busy: boolean;
  onWrite: (brief: Brief) => void;
  onStatus: (status: "new" | "dismissed") => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className="glass-card space-y-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span className="font-mono font-semibold" style={{ color: "var(--color-brand-600)" }}>
              #{idea.seq}
            </span>
            {idea.data_line && <span className="rounded px-1.5 py-0.5" style={{ background: "var(--bg-input)" }}>{idea.data_line}</span>}
            {idea.score != null && <span>score {idea.score}/20</span>}
            <span>· {ago(idea.created_at)}</span>
          </div>
          <h3 className="mt-1 text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
            {idea.title}
          </h3>
        </div>
        {idea.status === "queued" && (
          <span className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
            <Loader2 className="h-3 w-3 animate-spin" /> Being written
          </span>
        )}
      </div>
      {idea.why_now && (
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="font-medium">Why now: </span>
          {idea.why_now}
        </p>
      )}
      {idea.angle && (
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="font-medium">Tbrain angle: </span>
          {idea.angle}
        </p>
      )}
      {(idea.keyword || idea.audience) && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {idea.audience}
          {idea.audience && idea.keyword ? " · " : ""}
          {idea.keyword && <>keyword “{idea.keyword}”</>}
        </p>
      )}
      {idea.sources?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {idea.sources.map((s) => (
            <a key={s} href={s} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-brand-600)" }}>
              {host(s)}
            </a>
          ))}
        </div>
      )}
      {idea.status === "drafted" && idea.post_id && (
        <Link href={`/admin/content/${idea.post_id}`} className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-brand-600)" }}>
          <FileEdit className="h-3.5 w-3.5" /> {post?.title ?? "Open draft"} →
        </Link>
      )}
      {canEdit && idea.status === "new" && !open && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => setOpen(true)} className="btn-primary text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Write this
          </button>
          <button onClick={() => onStatus("dismissed")} className="btn-ghost text-xs">
            <XIcon className="h-3.5 w-3.5" /> Dismiss
          </button>
        </div>
      )}
      {canEdit && idea.status === "dismissed" && (
        <button onClick={() => onStatus("new")} className="btn-ghost text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Restore
        </button>
      )}
      {open && (
        <div className="border-t pt-3" style={{ borderColor: "var(--border-default)" }}>
          <BriefForm
            initial={{
              idea: [idea.title, idea.angle && `Angle: ${idea.angle}`].filter(Boolean).join("\n\n"),
              keyword: idea.keyword ?? "",
              audience: idea.audience ?? "",
            }}
            submitLabel={`Write #${idea.seq}`}
            busy={busy}
            onCancel={() => setOpen(false)}
            onSubmit={(brief) => {
              onWrite(brief);
              setOpen(false);
            }}
          />
        </div>
      )}
    </article>
  );
}

function JobCard({
  job,
  ideaTitle,
  posts,
  who,
  mine,
  canEdit,
  busy,
  onCancel,
  onRevise,
}: {
  job: Job;
  ideaTitle?: string;
  posts: Record<string, PostRef>;
  who: string;
  mine: boolean;
  canEdit: boolean;
  busy: boolean;
  onCancel: () => void;
  onRevise: (postId: string, notes: string) => void;
}) {
  const [revising, setRevising] = useState(false);
  const [notes, setNotes] = useState("");
  const st = JOB_STATUS[job.status];
  const postId = job.result?.post_id || job.post_id || undefined;
  const post = postId ? posts[postId] : undefined;
  const label =
    job.type === "scout"
      ? "Find new topics"
      : job.type === "revise"
        ? `Revise: ${post?.title ?? "post"}`
        : post?.title || ideaTitle || job.brief.idea?.split("\n")[0] || "New draft";
  const detail = job.type === "revise" ? job.brief.notes : job.type === "draft" ? job.brief.notes : undefined;

  return (
    <article className="glass-card space-y-1.5 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        <span
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: st.bg, color: st.color }}
        >
          {isActive(job.status) && <Loader2 className="h-3 w-3 animate-spin" />}
          {st.label}
        </span>
      </div>
      <p className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
        {job.via === "telegram" && <MessageCircle className="h-3 w-3" />}
        {job.type} · {who}
        {job.via === "telegram" ? " via Telegram" : ""} · {ago(job.created_at)}
        {job.status === "running" && job.started_at ? ` · started ${ago(job.started_at)}` : ""}
      </p>
      {detail && (
        <p className="line-clamp-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          “{detail}”
        </p>
      )}
      {job.result?.message && (
        <p className="text-[11px]" style={{ color: job.status === "failed" ? "#991b1b" : "var(--text-secondary)" }}>
          {job.result.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
        {job.status === "done" && postId && (
          <>
            <Link href={`/admin/content/${postId}`} className="inline-flex items-center gap-1" style={{ color: "var(--color-brand-600)" }}>
              <FileEdit className="h-3 w-3" /> Edit
            </Link>
            <Link href={`/admin/content/${postId}/preview`} className="inline-flex items-center gap-1" style={{ color: "var(--color-brand-600)" }}>
              <Eye className="h-3 w-3" /> Preview
            </Link>
            {canEdit && post?.status === "draft" && !revising && (
              <button onClick={() => setRevising(true)} className="inline-flex items-center gap-1" style={{ color: "var(--color-brand-600)" }}>
                <PenLine className="h-3 w-3" /> Request changes
              </button>
            )}
          </>
        )}
        {job.status === "queued" && mine && (
          <button onClick={onCancel} className="underline" style={{ color: "var(--text-muted)" }}>
            Cancel
          </button>
        )}
      </div>
      {revising && postId && (
        <div className="space-y-1.5 pt-1">
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What should change? e.g. shorter intro, add a checklist, fix the number in section 3"
            className="w-full resize-y rounded-lg px-2.5 py-2 text-xs"
            style={inputStyle}
          />
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => {
                if (!notes.trim()) return toast.error("Describe what to change");
                onRevise(postId, notes.trim());
                setRevising(false);
                setNotes("");
              }}
              className="btn-primary text-xs"
            >
              <Bot className="h-3.5 w-3.5" /> Send to agent
            </button>
            <button onClick={() => setRevising(false)} className="btn-ghost text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
