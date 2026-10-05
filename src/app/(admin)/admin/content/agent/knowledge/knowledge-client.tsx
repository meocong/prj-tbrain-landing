"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Archive,
  ArchiveRestore,
  BookOpen,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  FileUp,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Tag as TagIcon,
  X as XIcon,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useAdminAuth, useHasPermission } from "@/lib/admin/auth-context";

type Kind = "story" | "fact" | "doc" | "image";
type Status = "draft" | "approved" | "archived";

interface KnowledgeItem {
  id: string;
  kind: Kind;
  title: string;
  body: string;
  file_path: string | null;
  file_name: string | null;
  file_text: string | null;
  image_url: string | null;
  image_description: string | null;
  data_line: string | null;
  tags: string[];
  status: Status;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PostRef {
  id: string;
  title: string;
  agent_meta: { knowledge_ids?: string[] } | null;
}

const DATA_LINES = ["egocentric", "exocentric", "teleop", "mocap", "hand pose", "game", "LLM data", "general"];

const KIND_LABEL: Record<Kind, string> = { story: "Story", fact: "Fact", doc: "Doc", image: "Image" };
const KIND_LABEL_PLURAL: Record<Kind, string> = { story: "Stories", fact: "Facts", doc: "Docs", image: "Images" };
const KIND_ICON: Record<Kind, typeof BookOpen> = { story: BookOpen, fact: Lightbulb, doc: FileText, image: ImageIcon };
const KIND_BADGE: Record<Kind, string> = { story: "badge-info", fact: "badge-info", doc: "badge-muted", image: "badge-success" };
const STATUS_BADGE: Record<Status, string> = { draft: "badge-warning", approved: "badge-success", archived: "badge-muted" };

const inputStyle = {
  backgroundColor: "var(--bg-input)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
} as const;

const labelStyle = { color: "var(--text-secondary)" } as const;

function ago(iso: string | null) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

const IMAGE_PATH_RE = /^(\/images\/|\/samples\/posters\/|\/api\/asset\/cms\/)[A-Za-z0-9_./-]+$/;

type NewItem = {
  kind: Kind;
  title: string;
  body?: string;
  image_url?: string;
  image_description?: string;
  data_line?: string | null;
  tags?: string[];
};

type AddMode = null | "story-fact" | "image" | "doc";

/**
 * Agent knowledge: field stories, Tbrain facts, uploaded docs and described
 * images the content agent may draw on beyond public sources. Everything
 * starts as a draft; the agent API only ever returns approved items, so
 * nothing reaches a post until a reviewer approves it here.
 */
export function KnowledgeClient({ adminNames }: { adminNames: Record<string, string> }) {
  const { adminUser } = useAdminAuth();
  const canEdit = useHasPermission("content.edit");
  const canApprove = useHasPermission("content.publish") || useHasPermission("approvals.approve");
  const queryClient = useQueryClient();

  const [kindFilter, setKindFilter] = useState<"all" | Kind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("draft");
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState<AddMode>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["knowledge", kindFilter, statusFilter, search],
    queryFn: async () => {
      let q = supabaseAdmin.from("cms_agent_knowledge").select("*").order("updated_at", { ascending: false }).limit(200);
      if (kindFilter !== "all") q = q.eq("kind", kindFilter);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const term = search.trim().replace(/[%,()]/g, " ");
      if (term) q = q.or(`title.ilike.%${term}%,body.ilike.%${term}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as KnowledgeItem[];
    },
  });

  // Cheapest way to compute "used in N posts": pull every post that carries
  // agent_meta and check knowledge_ids client-side (small admin-only dataset).
  const { data: posts } = useQuery({
    queryKey: ["knowledge-post-usage"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin.from("cms_posts").select("id, title, agent_meta").not("agent_meta", "is", null);
      if (error) throw error;
      return (data ?? []) as PostRef[];
    },
  });

  const usageMap = useMemo(() => {
    const m = new Map<string, { id: string; title: string }[]>();
    for (const p of posts ?? []) {
      const ids = p.agent_meta?.knowledge_ids;
      if (!Array.isArray(ids)) continue;
      for (const kid of ids) {
        if (typeof kid !== "string") continue;
        if (!m.has(kid)) m.set(kid, []);
        m.get(kid)!.push({ id: p.id, title: p.title });
      }
    }
    return m;
  }, [posts]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    queryClient.invalidateQueries({ queryKey: ["knowledge-post-usage"] });
  };

  const create = useMutation({
    mutationFn: async (row: NewItem) => {
      const { error } = await supabaseAdmin.from("cms_agent_knowledge").insert({ ...row, status: "draft" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added as draft");
      setAddMode(null);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const uploadDoc = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await fetch("/api/admin/knowledge/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "upload_failed");
      return json as { id: string; textChars: number };
    },
    onSuccess: (json) => {
      toast.success(`Uploaded — ${json.textChars.toLocaleString()} characters extracted`);
      setAddMode(null);
      invalidate();
    },
    onError: (e) => toast.error(`Upload failed: ${(e as Error).message}`),
  });

  const save = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabaseAdmin.from("cms_agent_knowledge").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });

  function act(id: string, patch: Record<string, unknown>, okMessage: string) {
    save.mutate({ id, patch }, { onSuccess: () => toast.success(okMessage) });
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/content/agent" className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-brand-600)" }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Content Agent
        </Link>
        <h1 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
          Agent knowledge
        </h1>
        <p className="mt-1 max-w-3xl text-sm" style={{ color: "var(--text-muted)" }}>
          The content agent only ever uses <strong>approved</strong> items — drafts here are invisible to it. Stories and
          facts give posts first-hand detail a generic draft can&apos;t have; images need a description of what they show
          and when a writer should reach for them.
        </p>
      </div>

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAddMode(addMode === "story-fact" ? null : "story-fact")} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Add story/fact
          </button>
          <button onClick={() => setAddMode(addMode === "image" ? null : "image")} className="btn-ghost text-sm">
            <ImageIcon className="h-4 w-4" /> Add image
          </button>
          <button onClick={() => setAddMode(addMode === "doc" ? null : "doc")} className="btn-ghost text-sm">
            <FileUp className="h-4 w-4" /> Upload document
          </button>
        </div>
      )}

      {addMode === "story-fact" && (
        <StoryFactForm busy={create.isPending} onCancel={() => setAddMode(null)} onSubmit={(row) => create.mutate(row)} />
      )}
      {addMode === "image" && (
        <ImageForm busy={create.isPending} onCancel={() => setAddMode(null)} onSubmit={(row) => create.mutate(row)} />
      )}
      {addMode === "doc" && (
        <UploadDocForm busy={uploadDoc.isPending} onCancel={() => setAddMode(null)} onUpload={(fd) => uploadDoc.mutate(fd)} />
      )}

      <div className="glass-card flex flex-wrap items-center gap-3 p-3">
        <div className="flex gap-1 rounded-lg p-0.5 text-xs" style={{ background: "var(--bg-input)" }}>
          {(["all", "story", "fact", "doc", "image"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className="rounded-md px-2.5 py-1 font-medium capitalize"
              style={{
                backgroundColor: kindFilter === k ? "var(--bg-card, #fff)" : "transparent",
                color: kindFilter === k ? "var(--color-brand-600)" : "var(--text-secondary)",
              }}
            >
              {k === "all" ? "All" : KIND_LABEL_PLURAL[k]}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
          className="rounded-lg px-2.5 py-1.5 text-xs"
          style={inputStyle}
        >
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
          <option value="all">All statuses</option>
        </select>
        <div className="relative flex-1" style={{ minWidth: "200px", maxWidth: "320px" }}>
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or body…"
            className="w-full rounded-lg py-1.5 pl-8 pr-7 text-xs"
            style={inputStyle}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <XIcon className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="glass-card p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          </div>
        )}
        {items?.length === 0 && (
          <div className="glass-card p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Nothing here yet.
          </div>
        )}
        {items?.map((item) => (
          <KnowledgeCard
            key={item.id}
            item={item}
            canEdit={canEdit}
            canApprove={canApprove}
            usedIn={usageMap.get(item.id) ?? []}
            creatorName={item.created_by ? (item.created_by === adminUser?.id ? "you" : adminNames[item.created_by]) : undefined}
            reviewerName={item.reviewed_by ? (item.reviewed_by === adminUser?.id ? "you" : adminNames[item.reviewed_by]) : undefined}
            busy={save.isPending}
            onSave={(patch) => act(item.id, patch, "Saved")}
            onApprove={() => act(item.id, { status: "approved" }, "Approved")}
            onBackToDraft={() => act(item.id, { status: "draft" }, "Back to draft")}
            onArchive={() => act(item.id, { status: "archived" }, "Archived")}
            onRestore={() => act(item.id, { status: "draft" }, "Restored to draft")}
          />
        ))}
      </div>
    </div>
  );
}

function StoryFactForm({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  onCancel: () => void;
  onSubmit: (row: NewItem) => void;
}) {
  const [kind, setKind] = useState<"story" | "fact">("story");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dataLine, setDataLine] = useState("");
  const [tags, setTags] = useState("");

  function submit() {
    if (title.trim().length < 3) return toast.error("Title needs at least 3 characters");
    if (!body.trim()) return toast.error("Write the story or fact");
    onSubmit({
      kind,
      title: title.trim(),
      body: body.trim(),
      data_line: dataLine || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  return (
    <div className="glass-card space-y-3 p-4">
      <div className="flex gap-1 rounded-lg p-0.5 text-xs" style={{ background: "var(--bg-input)" }}>
        {(["story", "fact"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className="rounded-md px-3 py-1 font-medium capitalize"
            style={{
              backgroundColor: kind === k ? "var(--bg-card, #fff)" : "transparent",
              color: kind === k ? "var(--color-brand-600)" : "var(--text-secondary)",
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        Only write what may appear publicly. No customer names, prices, sample IDs.
      </p>
      <label className="block text-[11px] font-medium" style={labelStyle}>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle} />
      </label>
      <label className="block text-[11px] font-medium" style={labelStyle}>
        Body (markdown)
        <textarea
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={kind === "story" ? "What happened, where, and the detail only Tbrain would know…" : "The fact itself, plus anything that makes it checkable…"}
          className="mt-1 w-full resize-y rounded-lg px-2.5 py-2 text-xs font-normal"
          style={inputStyle}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[11px] font-medium" style={labelStyle}>
          Data line
          <select value={dataLine} onChange={(e) => setDataLine(e.target.value)} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle}>
            <option value="">—</option>
            {DATA_LINES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] font-medium" style={labelStyle}>
          Tags
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma separated" className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle} />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="btn-primary text-xs">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add as draft
        </button>
        <button onClick={onCancel} className="btn-ghost text-xs">Cancel</button>
      </div>
    </div>
  );
}

function ImageForm({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  onCancel: () => void;
  onSubmit: (row: NewItem) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dataLine, setDataLine] = useState("");
  const [tags, setTags] = useState("");

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/uploads/image", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error ?? "upload_failed");
      setUrl(json.url as string);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    if (title.trim().length < 3) return toast.error("Title needs at least 3 characters");
    if (!IMAGE_PATH_RE.test(url.trim())) {
      return toast.error("Path must start with /images/, /samples/posters/ or /api/asset/cms/");
    }
    if (description.trim().length < 20) return toast.error("Describe the image in at least 20 characters");
    onSubmit({
      kind: "image",
      title: title.trim(),
      image_url: url.trim(),
      image_description: description.trim(),
      data_line: dataLine || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  return (
    <div className="glass-card space-y-3 p-4">
      <label className="block text-[11px] font-medium" style={labelStyle}>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle} />
      </label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-secondary text-xs">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload a file"}
        </button>
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>or paste an existing site path below</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="/images/… or /samples/posters/… or /api/asset/cms/…"
        className="w-full rounded-lg px-2.5 py-1.5 text-xs"
        style={inputStyle}
      />
      {url && IMAGE_PATH_RE.test(url.trim()) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
      )}
      <label className="block text-[11px] font-medium" style={labelStyle}>
        Description — what it shows, and what kind of paragraph it suits ({description.trim().length}/20 min)
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Teleop rig with two UR5 arms and ALOHA gripper, operator seated behind a shadow console. Good for a setup/hardware paragraph."
          className="mt-1 w-full resize-y rounded-lg px-2.5 py-2 text-xs font-normal"
          style={inputStyle}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[11px] font-medium" style={labelStyle}>
          Data line
          <select value={dataLine} onChange={(e) => setDataLine(e.target.value)} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle}>
            <option value="">—</option>
            {DATA_LINES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] font-medium" style={labelStyle}>
          Tags
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma separated" className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle} />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="btn-primary text-xs">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add as draft
        </button>
        <button onClick={onCancel} className="btn-ghost text-xs">Cancel</button>
      </div>
    </div>
  );
}

function UploadDocForm({
  busy,
  onCancel,
  onUpload,
}: {
  busy: boolean;
  onCancel: () => void;
  onUpload: (fd: FormData) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dataLine, setDataLine] = useState("");
  const [tags, setTags] = useState("");

  function submit() {
    if (!file) return toast.error("Choose a PDF, DOCX, MD or TXT file");
    const fd = new FormData();
    fd.append("file", file);
    if (title.trim()) fd.append("title", title.trim());
    if (note.trim()) fd.append("note", note.trim());
    if (dataLine) fd.append("data_line", dataLine);
    if (tags.trim()) fd.append("tags", tags.trim());
    onUpload(fd);
  }

  return (
    <div className="glass-card space-y-3 p-4">
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        PDF, DOCX, MD or TXT, up to 10 MB. Text is extracted automatically and the item lands as a draft for review.
      </p>
      <input
        type="file"
        accept=".pdf,.docx,.md,.txt"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full rounded-lg px-2.5 py-1.5 text-xs"
        style={inputStyle}
      />
      <label className="block text-[11px] font-medium" style={labelStyle}>
        Title (defaults to the file name)
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle} />
      </label>
      <label className="block text-[11px] font-medium" style={labelStyle}>
        Note (optional)
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this doc matters, what to pull from it…" className="mt-1 w-full resize-y rounded-lg px-2.5 py-2 text-xs font-normal" style={inputStyle} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-[11px] font-medium" style={labelStyle}>
          Data line
          <select value={dataLine} onChange={(e) => setDataLine(e.target.value)} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle}>
            <option value="">—</option>
            {DATA_LINES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] font-medium" style={labelStyle}>
          Tags
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma separated" className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-xs font-normal" style={inputStyle} />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="btn-primary text-xs">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />} Upload
        </button>
        <button onClick={onCancel} className="btn-ghost text-xs">Cancel</button>
      </div>
    </div>
  );
}

function KnowledgeCard({
  item,
  canEdit,
  canApprove,
  usedIn,
  creatorName,
  reviewerName,
  busy,
  onSave,
  onApprove,
  onBackToDraft,
  onArchive,
  onRestore,
}: {
  item: KnowledgeItem;
  canEdit: boolean;
  canApprove: boolean;
  usedIn: { id: string; title: string }[];
  creatorName?: string;
  reviewerName?: string;
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onApprove: () => void;
  onBackToDraft: () => void;
  onArchive: () => void;
  onRestore: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [imageUrl, setImageUrl] = useState(item.image_url ?? "");
  const [imageDescription, setImageDescription] = useState(item.image_description ?? "");
  const [dataLine, setDataLine] = useState(item.data_line ?? "");
  const [tags, setTags] = useState(item.tags.join(", "));

  const Icon = KIND_ICON[item.kind];

  function startEdit() {
    setTitle(item.title);
    setBody(item.body);
    setImageUrl(item.image_url ?? "");
    setImageDescription(item.image_description ?? "");
    setDataLine(item.data_line ?? "");
    setTags(item.tags.join(", "));
    setEditing(true);
  }

  function submitEdit() {
    if (title.trim().length < 3) return toast.error("Title needs at least 3 characters");
    const patch: Record<string, unknown> = {
      title: title.trim(),
      data_line: dataLine || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (item.kind === "image") {
      if (!IMAGE_PATH_RE.test(imageUrl.trim())) return toast.error("Path must start with /images/, /samples/posters/ or /api/asset/cms/");
      if (imageDescription.trim().length < 20) return toast.error("Describe the image in at least 20 characters");
      patch.image_url = imageUrl.trim();
      patch.image_description = imageDescription.trim();
    } else {
      patch.body = body.trim();
    }
    onSave(patch);
    setEditing(false);
  }

  return (
    <article className="glass-card space-y-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className={`badge ${KIND_BADGE[item.kind]}`}>
              <Icon className="mr-1 h-3 w-3" /> {KIND_LABEL[item.kind]}
            </span>
            <span className={`badge ${STATUS_BADGE[item.status]}`}>{item.status}</span>
            {item.data_line && <span className="rounded px-1.5 py-0.5" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>{item.data_line}</span>}
            <span style={{ color: "var(--text-muted)" }}>· updated {ago(item.updated_at)}</span>
          </div>
          {editing ? (
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-sm font-semibold" style={inputStyle} />
          ) : (
            <h3 className="mt-1 text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
          )}
        </div>
      </div>

      {editing ? (
        item.kind === "image" ? (
          <div className="space-y-2">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-lg px-2.5 py-1.5 text-xs" style={inputStyle} />
            {imageUrl && IMAGE_PATH_RE.test(imageUrl.trim()) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Preview" className="h-28 w-full rounded-lg object-cover" />
            )}
            <textarea rows={3} value={imageDescription} onChange={(e) => setImageDescription(e.target.value)} className="w-full resize-y rounded-lg px-2.5 py-2 text-xs" style={inputStyle} />
          </div>
        ) : (
          <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} className="w-full resize-y rounded-lg px-2.5 py-2 text-xs" style={inputStyle} placeholder={item.kind === "doc" ? "Note (optional)" : undefined} />
        )
      ) : item.kind === "image" ? (
        <div className="flex gap-3">
          {item.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.title} className="h-20 w-28 shrink-0 rounded-lg object-cover" />
          )}
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.image_description}</p>
        </div>
      ) : item.kind === "doc" ? (
        <div className="space-y-1.5">
          {item.body && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.body}</p>}
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <FileText className="h-3.5 w-3.5" />
            {item.file_name}
            {item.file_text != null && <span>· {item.file_text.length.toLocaleString()} chars extracted</span>}
            {item.file_path && (
              <a href={`/api/admin/knowledge/${item.id}/file`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline" style={{ color: "var(--color-brand-600)" }}>
                <ExternalLink className="h-3 w-3" /> Open original
              </a>
            )}
          </div>
          {item.file_text && (
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg p-2 text-[11px]" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
              {item.file_text.slice(0, 1500)}
              {item.file_text.length > 1500 ? "…" : ""}
            </pre>
          )}
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-xs" style={{ color: "var(--text-secondary)" }}>{item.body}</p>
      )}

      {editing && (
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={dataLine} onChange={(e) => setDataLine(e.target.value)} className="rounded-lg px-2.5 py-1.5 text-xs" style={inputStyle}>
            <option value="">—</option>
            {DATA_LINES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" className="rounded-lg px-2.5 py-1.5 text-xs" style={inputStyle} />
        </div>
      )}

      {!editing && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px]" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
              <TagIcon className="h-2.5 w-2.5" /> {t}
            </span>
          ))}
        </div>
      )}

      {usedIn.length > 0 && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Used in {usedIn.length} post{usedIn.length === 1 ? "" : "s"}:{" "}
          {usedIn.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <Link href={`/admin/content/${p.id}`} className="underline" style={{ color: "var(--color-brand-600)" }}>{p.title}</Link>
            </span>
          ))}
        </p>
      )}

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {creatorName && <>created by {creatorName}</>}
        {item.reviewed_at && reviewerName && <> · reviewed by {reviewerName} {ago(item.reviewed_at)}</>}
      </p>

      <div className="flex flex-wrap items-center gap-3 border-t pt-2 text-[11px] font-medium" style={{ borderColor: "var(--border-default)" }}>
        {editing ? (
          <>
            <button onClick={submitEdit} disabled={busy} className="btn-primary text-xs">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost text-xs">Cancel</button>
          </>
        ) : (
          canEdit && item.status !== "archived" && (
            <button onClick={startEdit} className="inline-flex items-center gap-1" style={{ color: "var(--color-brand-600)" }}>
              <Edit3 className="h-3 w-3" /> Edit
            </button>
          )
        )}
        {!editing && canApprove && item.status === "draft" && (
          <button onClick={onApprove} className="inline-flex items-center gap-1" style={{ color: "#16a34a" }}>
            <CheckCircle2 className="h-3 w-3" /> Approve
          </button>
        )}
        {!editing && canEdit && item.status === "approved" && (
          <button onClick={onBackToDraft} className="inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <RotateCcw className="h-3 w-3" /> Back to draft
          </button>
        )}
        {!editing && canEdit && item.status !== "archived" && (
          <button onClick={onArchive} className="inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <Archive className="h-3 w-3" /> Archive
          </button>
        )}
        {!editing && canEdit && item.status === "archived" && (
          <button onClick={onRestore} className="inline-flex items-center gap-1" style={{ color: "var(--color-brand-600)" }}>
            <ArchiveRestore className="h-3 w-3" /> Restore
          </button>
        )}
      </div>
    </article>
  );
}
