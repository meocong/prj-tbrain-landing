"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  Bot,
  Check,
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
type JobStatus = "queued" | "running" | "awaiting_approval" | "done" | "failed" | "cancelled";
type PostType = "news_hook" | "field_story" | "trend_pov" | "buyer_guide" | "proof" | "deep_dive" | "synthesis" | "by_the_numbers";

const POST_TYPES: { value: PostType; label: string; hint: string }[] = [
  { value: "field_story", label: "Field story", hint: "A real problem we hit and how we solved it" },
  { value: "news_hook", label: "News + our take", hint: "Something new came out; what it means and how we do it" },
  { value: "deep_dive", label: "Deep dive", hint: "Take one paper, dataset or release apart: method, figures, what it means" },
  { value: "synthesis", label: "Synthesis", hint: "Several sources on one question, compared side by side" },
  { value: "by_the_numbers", label: "By the numbers", hint: "Our own analysis of public data (Hugging Face Hub, arXiv): counts, charts, what they show" },
  { value: "trend_pov", label: "Trend / where it's going", hint: "Where the field is heading, with evidence and a clear position" },
  { value: "buyer_guide", label: "Buyer guide", hint: "Explain a topic and help a buyer decide (checklist, FAQ)" },
  { value: "proof", label: "Proof / results", hint: "Numbers we are allowed to publish, and what they show" },
];

interface Outline {
  post_type?: PostType;
  title?: string;
  reader?: string;
  problem?: string;
  takeaway?: string;
  opening?: string;
  sections?: { h2: string; point: string }[];
  closing?: string;
  cta?: string;
  images?: { url: string; why: string; kind?: string; credit?: string; license?: string }[];
  notes?: string;
}

interface Idea {
  id: string;
  seq: number;
  title: string;
  why_now: string | null;
  angle: string | null;
  keyword: string | null;
  audience: string | null;
  data_line: string | null;
  post_type: PostType | null;
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
  experience?: string;
  post_type?: PostType;
  skip_outline?: boolean;
  outline_feedback?: string | null;
}

interface Job {
  id: string;
  type: "draft" | "revise" | "scout";
  post_id: string | null;
  topic_id: string | null;
  brief: Brief;
  status: JobStatus;
  result: { post_id?: string; message?: string; outline?: Outline };
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
  running: { label: "Working", color: "#1d4ed8", bg: "#dbeafe" },
  awaiting_approval: { label: "Outline ready", color: "#6d28d9", bg: "#ede9fe" },
  done: { label: "Done", color: "#166534", bg: "#dcfce7" },
  failed: { label: "Failed", color: "#991b1b", bg: "#fee2e2" },
  cancelled: { label: "Cancelled", color: "#475569", bg: "#f1f5f9" },
};

const isActive = (s: JobStatus) => s === "queued" || s === "running" || s === "awaiting_approval";
const isBusy = (s: JobStatus) => s === "queued" || s === "running";

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
    refetchInterval: (q) => ((q.state.data as Job[] | undefined)?.some((j) => isBusy(j.status)) ? 10_000 : 60_000),
  });

  const { data: ideas } = useQuery({
    queryKey: ["agent-hub-ideas", ideaFilter],
    queryFn: async () => {
      const statuses: IdeaStatus[] = ideaFilter === "open" ? ["new", "queued"] : [ideaFilter];
      const { data, error } = await supabaseAdmin
        .from("cms_topic_ideas")
        .select("id, seq, title, why_now, angle, keyword, audience, data_line, post_type, sources, score, status, post_id, created_at")
        .in("status", statuses)
        .order("created_at", { ascending: false })
        .order("seq", { ascending: true })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as Idea[];
    },
    refetchInterval: () => (jobs?.some((j) => isBusy(j.status)) ? 10_000 : 60_000),
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
          : "Queued — the agent picks it up within ~2 min; new drafts come back as an outline to approve first",
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

  const review = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: "approve" | "revise" | "cancel"; notes?: string }) => {
      const { error } = await supabaseAdmin.rpc("review_agent_outline", { p_id: id, p_action: action, p_notes: notes ?? null });
      if (error) throw error;
      return action;
    },
    onSuccess: (action) => {
      toast.success(
        action === "approve"
          ? "Outline approved — the agent writes the full draft next (~20-40 min)"
          : action === "revise"
            ? "Sent back — the agent will propose a new outline"
            : "Job cancelled",
      );
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const focusJob = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("job") : null;
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
            Pick a topic the agent proposed (or bring your own) and add a brief. The agent researches and sends an
            outline for approval here and in Telegram, then writes the full draft in the background. Drafts go to
            Approvals; nothing is published without a human. It only uses approved items from Knowledge.
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link href="/admin/content/agent/knowledge" className="btn-ghost text-sm">
              <BookOpen className="h-4 w-4" /> Knowledge
            </Link>
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
            Jobs run one at a time: an outline takes ~5-10 minutes, the full draft ~20-40 minutes after approval.
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
              busy={queue.isPending || review.isPending}
              focused={focusJob === job.id}
              onCancel={() => cancel.mutate(job.id)}
              onRevise={(postId, notes) => queue.mutate({ type: "revise", post_id: postId, brief: { notes } })}
              onReview={(action, notes) => review.mutate({ id: job.id, action, notes })}
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
  const [experience, setExperience] = useState("");
  const [postType, setPostType] = useState<PostType | "">(initial?.post_type ?? "");
  const [skipOutline, setSkipOutline] = useState(false);

  function submit() {
    if (!idea.trim()) {
      toast.error("Describe the post idea");
      return;
    }
    const clean = (s: string) => s.trim() || undefined;
    onSubmit({
      idea: idea.trim(),
      keyword: clean(keyword),
      audience: clean(audience),
      notes: clean(notes),
      experience: clean(experience),
      post_type: postType || undefined,
      skip_outline: skipOutline || undefined,
    });
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
      <label className="block text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
        Kind of post
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value as PostType | "")}
          className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal"
          style={inputStyle}
        >
          <option value="">Let the agent choose</option>
          {POST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label} — {t.hint}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
        What we have seen or done (first-hand, public-safe)
        <textarea
          rows={3}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="A real situation from our capture or QC work this post can tell: what went wrong, what we changed, what happened. No customer names, prices or sample IDs."
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
      <label className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
        <input type="checkbox" checked={skipOutline} onChange={(e) => setSkipOutline(e.target.checked)} />
        Write straight away (skip outline approval)
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
            {idea.post_type && (
              <span className="rounded px-1.5 py-0.5" style={{ background: "var(--bg-input)" }}>
                {POST_TYPES.find((t) => t.value === idea.post_type)?.label}
              </span>
            )}
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
              post_type: idea.post_type ?? undefined,
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
  focused,
  onCancel,
  onRevise,
  onReview,
}: {
  job: Job;
  ideaTitle?: string;
  posts: Record<string, PostRef>;
  who: string;
  mine: boolean;
  canEdit: boolean;
  busy: boolean;
  focused?: boolean;
  onCancel: () => void;
  onRevise: (postId: string, notes: string) => void;
  onReview: (action: "approve" | "revise" | "cancel", notes?: string) => void;
}) {
  const [revising, setRevising] = useState(false);
  const [outlineNotes, setOutlineNotes] = useState("");
  const outline = job.result?.outline;
  const [notes, setNotes] = useState("");
  const st = JOB_STATUS[job.status];
  const postId = job.result?.post_id || job.post_id || undefined;
  const post = postId ? posts[postId] : undefined;
  const label =
    job.type === "scout"
      ? "Find new topics"
      : job.type === "revise"
        ? `Revise: ${post?.title ?? "post"}`
        : post?.title || outline?.title || ideaTitle || job.brief.idea?.split("\n")[0] || "New draft";
  const detail = job.type === "revise" ? job.brief.notes : job.type === "draft" ? job.brief.notes : undefined;

  return (
    <article
      className="glass-card space-y-1.5 p-3"
      style={focused || job.status === "awaiting_approval" ? { boxShadow: "0 0 0 2px #c4b5fd" } : undefined}
    >
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
      {job.status === "awaiting_approval" && outline && (
        <OutlineView
          outline={outline}
          canEdit={canEdit}
          busy={busy}
          notes={outlineNotes}
          setNotes={setOutlineNotes}
          onReview={onReview}
        />
      )}
      {job.brief.outline_feedback && job.status !== "awaiting_approval" && job.status !== "done" && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Outline feedback: “{job.brief.outline_feedback}”
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

function OutlineView({
  outline,
  canEdit,
  busy,
  notes,
  setNotes,
  onReview,
}: {
  outline: Outline;
  canEdit: boolean;
  busy: boolean;
  notes: string;
  setNotes: (v: string) => void;
  onReview: (action: "approve" | "revise" | "cancel", notes?: string) => void;
}) {
  const type = POST_TYPES.find((t) => t.value === outline.post_type)?.label;
  return (
    <div className="space-y-2 rounded-lg p-3 text-xs" style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6d28d9" }}>
        Proposed outline{type ? ` · ${type}` : ""}
      </p>
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{outline.title}</p>
      {outline.reader && <p><span className="font-medium">Reader: </span>{outline.reader}</p>}
      {outline.problem && <p><span className="font-medium">Problem: </span>{outline.problem}</p>}
      {outline.takeaway && <p><span className="font-medium">Takeaway: </span>{outline.takeaway}</p>}
      {outline.opening && (
        <div>
          <p className="font-medium">Opening</p>
          <p className="whitespace-pre-wrap italic">{outline.opening}</p>
        </div>
      )}
      {outline.sections && outline.sections.length > 0 && (
        <ol className="list-decimal space-y-1 pl-4">
          {outline.sections.map((sec, i) => (
            <li key={i}>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>{sec.h2}</span>
              {sec.point && <span> — {sec.point}</span>}
            </li>
          ))}
        </ol>
      )}
      {outline.closing && <p><span className="font-medium">Ending: </span>{outline.closing}</p>}
      {outline.cta && <p><span className="font-medium">CTA: </span>{outline.cta}</p>}
      {outline.images && outline.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {outline.images.map((im, i) => (
            <figure key={i} className="w-36">
              {/^\/(images|samples\/posters|api\/asset\/cms)\//.test(im.url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={im.url} alt="" className="h-20 w-36 rounded object-contain bg-white" />
              )}
              <figcaption className="mt-0.5 text-[10px] leading-tight">
                {im.kind === "chart" ? "Chart: " : im.kind === "source_figure" ? "Figure: " : ""}
                {im.why}
                {im.credit && <span className="block" style={{ color: "var(--text-muted)" }}>{im.credit}{im.license ? `, ${im.license}` : ""}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {outline.notes && <p style={{ color: "var(--text-muted)" }}>{outline.notes}</p>}
      {canEdit && (
        <div className="space-y-1.5 border-t pt-2" style={{ borderColor: "var(--border-default)" }}>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional for approve; required for changes (e.g. sharper opening, drop section 3, use the fisheye story)"
            className="w-full resize-y rounded-lg px-2.5 py-1.5 text-xs"
            style={inputStyle}
          />
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => onReview("approve", notes.trim() || undefined)} className="btn-primary text-xs">
              <Check className="h-3.5 w-3.5" /> Approve outline
            </button>
            <button
              disabled={busy}
              onClick={() => (notes.trim() ? onReview("revise", notes.trim()) : toast.error("Say what to change"))}
              className="btn-ghost text-xs"
            >
              <PenLine className="h-3.5 w-3.5" /> Request changes
            </button>
            <button disabled={busy} onClick={() => onReview("cancel")} className="btn-ghost text-xs">
              <XIcon className="h-3.5 w-3.5" /> Cancel job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
