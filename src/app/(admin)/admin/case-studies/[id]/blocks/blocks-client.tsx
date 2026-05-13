"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { CaseStudyWidget } from "@/components/case-studies/CaseStudyWidgetRenderer";
import { CASE_STUDY_BLOCK_TYPES, type CaseStudyBlock, type CaseStudyBlockType } from "@/lib/landing/case-study-block-types";

type JsonConfig = Record<string, unknown>;
type Tone = "blue" | "indigo" | "purple" | "green" | "red" | "orange" | "yellow";

export type CaseStudyBlockRow = {
  id: string;
  case_study_id: string;
  type: CaseStudyBlockType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  config: JsonConfig | null;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

type EditableBlock = {
  id: string;
  caseStudyId: string;
  type: CaseStudyBlockType;
  title: string;
  subtitle: string;
  content: string;
  config: JsonConfig;
  displayOrder: number;
  isActive: boolean;
  updatedAt?: string;
};

const WIDGET_LABELS: Record<CaseStudyBlockType, string> = {
  metrics_grid: "Metrics grid",
  text_card: "Text card",
  objective_grid: "Objective grid",
  challenge_cards: "Challenge cards",
  qa_framework: "QA framework",
  process_steps: "Process steps",
  outcome: "Outcome",
  image: "Image",
  cta: "CTA",
};

const TONES: Tone[] = ["blue", "indigo", "purple", "green", "red", "orange", "yellow"];

export function CaseStudyBlocksClient({
  caseStudyId,
  caseTitle,
  caseDescription,
  rows,
}: {
  caseStudyId: string;
  caseTitle: string;
  caseDescription: string;
  rows: CaseStudyBlockRow[];
}) {
  const [blocks, setBlocks] = useState<EditableBlock[]>(() => rows.map(fromRow).sort(byOrder));
  const [caseInfo, setCaseInfo] = useState({ title: caseTitle, description: caseDescription });
  const [caseInfoFocused, setCaseInfoFocused] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const selected = blocks.find((block) => block.id === selectedId) ?? null;
  const orderedBlocks = useMemo(() => [...blocks].sort(byOrder), [blocks]);

  const caseInfoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin
        .from("case_studies")
        .update({
          title: caseInfo.title.trim() || "Untitled case study",
          short_description: caseInfo.description.trim() || null,
        })
        .eq("id", caseStudyId);
      if (error) throw error;
    },
    onSuccess: () => {
      setCaseInfoFocused(false);
      toast.success("Case study info saved");
    },
    onError: (err: Error) => toast.error(err.message || "Save case study info failed"),
  });

  const saveMutation = useMutation({
    mutationFn: async (block: EditableBlock) => {
      const { error } = await supabaseAdmin
        .from("case_study_blocks")
        .update(toPayload(block))
        .eq("id", block.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedId(null);
      toast.success("Widget saved");
    },
    onError: (err: Error) => toast.error(err.message || "Save failed"),
  });

  const createMutation = useMutation({
    mutationFn: async (type: CaseStudyBlockType) => {
      const block = makeDefaultBlock(type, caseStudyId, nextOrder(blocks));
      const { data, error } = await supabaseAdmin
        .from("case_study_blocks")
        .insert(toInsertPayload(block))
        .select("id, case_study_id, type, title, subtitle, content, config, display_order, is_active, updated_at")
        .single();
      if (error) throw error;
      return fromRow(data as CaseStudyBlockRow);
    },
    onSuccess: (block) => {
      setBlocks((current) => [...current, block].sort(byOrder));
      setSelectedId(block.id);
      setShowAdd(false);
      if (block.type === "image") {
        requestAnimationFrame(() => {
          const node = document.querySelector<HTMLElement>(`[data-case-widget-id="${block.id}"]`);
          node?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
          node?.focus({ preventScroll: true });
        });
      }
      toast.success("Widget added");
    },
    onError: (err: Error) => toast.error(err.message || "Add widget failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (block: EditableBlock) => {
      const { error } = await supabaseAdmin.from("case_study_blocks").delete().eq("id", block.id);
      if (error) throw error;
      return block.id;
    },
    onSuccess: (id) => {
      setBlocks((current) => {
        const next = current.filter((block) => block.id !== id);
        setSelectedId(null);
        return next;
      });
      toast.success("Widget deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Delete failed"),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (block: EditableBlock) => {
      const copy = { ...block, title: `${block.title || WIDGET_LABELS[block.type]} copy`, displayOrder: nextOrder(blocks) };
      const { data, error } = await supabaseAdmin
        .from("case_study_blocks")
        .insert(toInsertPayload(copy))
        .select("id, case_study_id, type, title, subtitle, content, config, display_order, is_active, updated_at")
        .single();
      if (error) throw error;
      return fromRow(data as CaseStudyBlockRow);
    },
    onSuccess: (block) => {
      setBlocks((current) => [...current, block].sort(byOrder));
      setSelectedId(block.id);
      toast.success("Widget duplicated");
    },
    onError: (err: Error) => toast.error(err.message || "Duplicate failed"),
  });

  const orderMutation = useMutation({
    mutationFn: async (ordered: EditableBlock[]) => {
      await Promise.all(
        ordered.map((block, index) =>
          supabaseAdmin
            .from("case_study_blocks")
            .update({ display_order: (index + 1) * 10 })
            .eq("id", block.id)
            .then(({ error }) => {
              if (error) throw error;
            })
        )
      );
    },
    onSuccess: () => toast.success("Order saved"),
    onError: (err: Error) => toast.error(err.message || "Order save failed"),
  });

  function updateSelected(next: EditableBlock) {
    setBlocks((current) => current.map((block) => (block.id === next.id ? next : block)).sort(byOrder));
  }

  function reorder(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setBlocks((current) => {
      const from = current.findIndex((block) => block.id === dragId);
      const to = current.findIndex((block) => block.id === targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      const ordered = next.map((block, index) => ({ ...block, displayOrder: (index + 1) * 10 }));
      orderMutation.mutate(ordered);
      return ordered;
    });
  }

  function moveBlock(blockId: string, direction: "up" | "down") {
    setBlocks((current) => {
      const ordered = [...current].sort(byOrder);
      const from = ordered.findIndex((block) => block.id === blockId);
      const to = direction === "up" ? from - 1 : from + 1;
      if (from < 0 || to < 0 || to >= ordered.length) return current;
      const next = [...ordered];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      const nextOrdered = next.map((block, index) => ({ ...block, displayOrder: (index + 1) * 10 }));
      orderMutation.mutate(nextOrdered);
      return nextOrdered;
    });
  }

  return (
    <div className="space-y-5">
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Detail page widgets</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Drag sections to reorder. Click any widget to edit its content directly in place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {orderMutation.isPending && <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Saving order...</span>}
          <button type="button" onClick={() => setShowAdd(true)} className="btn-primary cursor-pointer text-sm">
            <Plus className="h-4 w-4" /> Add widget
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border-default)" }}>
        <div className="min-h-[720px] min-w-[860px] rounded-2xl bg-slate-50">
          <main className="mx-auto max-w-[1128px] px-4 py-12" onClick={() => { setSelectedId(null); setCaseInfoFocused(false); }}>
            <header
              className="group/case-info relative mb-12 rounded-3xl transition"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedId(null);
                setCaseInfoFocused(true);
              }}
            >
              <div className={`absolute -inset-x-3 -inset-y-3 rounded-3xl border transition ${caseInfoFocused ? "border-[#6C3CF4] bg-[#6C3CF4]/[0.05] shadow-[0_0_0_4px_rgba(108,60,244,0.12)]" : "border-transparent group-hover/case-info:border-[#6C3CF4]/30 group-hover/case-info:bg-[#6C3CF4]/[0.02]"}`} />
              <div className={`absolute left-3 top-0 z-20 flex -translate-y-[calc(100%+0.5rem)] items-center gap-1 rounded-full border bg-white/95 p-1 shadow-sm transition ${caseInfoFocused ? "opacity-100" : "opacity-0 group-hover/case-info:opacity-100"}`} style={{ borderColor: "var(--border-default)" }}>
                <button type="button" onClick={(event) => { event.stopPropagation(); caseInfoMutation.mutate(); }} disabled={caseInfoMutation.isPending} className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full bg-[#6C3CF4] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#5b2ee0] disabled:opacity-60" title="Save case study info">
                  <Save className="h-3.5 w-3.5" /> {caseInfoMutation.isPending ? "Saving" : "Save"}
                </button>
              </div>
              <div className="relative">
                <input
                  value={caseInfo.title}
                  onFocus={() => setCaseInfoFocused(true)}
                  onChange={(event) => setCaseInfo((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-xl border border-transparent bg-transparent px-2 py-1 text-4xl font-semibold leading-[1.1] text-[#222222] outline-none transition focus:border-[#6C3CF4]/40 focus:bg-white/70 lg:text-5xl"
                  placeholder="Case study title"
                />
                <textarea
                  value={caseInfo.description}
                  onFocus={() => setCaseInfoFocused(true)}
                  onChange={(event) => setCaseInfo((current) => ({ ...current, description: event.target.value }))}
                  className="mt-4 min-h-[64px] w-full resize-none rounded-xl border border-transparent bg-transparent px-2 py-1 text-lg italic text-[#78818f] outline-none transition focus:border-[#6C3CF4]/40 focus:bg-white/70"
                  placeholder="Short description shown under the title"
                />
              </div>
            </header>

            <div className="space-y-2">
              {orderedBlocks.map((block) => (
                <EditableBlockFrame
                  key={block.id}
                  block={block}
                  selected={selected?.id === block.id}
                  dragged={dragId === block.id}
                  saving={saveMutation.isPending && selected?.id === block.id}
                  deleting={deleteMutation.isPending && selected?.id === block.id}
                  onSelect={() => setSelectedId(block.id)}
                  onChange={updateSelected}
                  onSave={(next) => saveMutation.mutate(next)}
                  onToggleActive={() => {
                    const next = { ...block, isActive: !block.isActive };
                    updateSelected(next);
                    saveMutation.mutate(next);
                  }}
                  onDuplicate={() => duplicateMutation.mutate(block)}
                  onMoveUp={() => moveBlock(block.id, "up")}
                  onMoveDown={() => moveBlock(block.id, "down")}
                  onDelete={() => {
                    if (confirm("Delete this widget?")) deleteMutation.mutate(block);
                  }}
                  onDragStart={() => setDragId(block.id)}
                  onDrop={() => reorder(block.id)}
                  onDragEnd={() => setDragId(null)}
                />
              ))}
              <AddBlockTile onCreate={() => setShowAdd(true)} />
            </div>
          </main>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl p-5 shadow-2xl" style={{ background: "var(--bg-elevated, #fff)" }}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Add widget</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Choose a UI block. It will be created with editable default content.</p>
              </div>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary cursor-pointer text-xs">Close</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CASE_STUDY_BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => createMutation.mutate(type)}
                  disabled={createMutation.isPending}
                  className="cursor-pointer rounded-xl border p-4 text-left transition hover:shadow-md"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{WIDGET_LABELS[type]}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{defaultDescription(type)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableBlockFrame({
  block,
  selected,
  dragged,
  saving,
  deleting,
  onSelect,
  onChange,
  onSave,
  onToggleActive,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDragStart,
  onDrop,
  onDragEnd,
}: {
  block: EditableBlock;
  selected: boolean;
  dragged: boolean;
  saving: boolean;
  deleting: boolean;
  onSelect: () => void;
  onChange: (block: EditableBlock) => void;
  onSave: (block: EditableBlock) => void;
  onToggleActive: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  return (
    <section
      data-case-widget-id={block.id}
      tabIndex={-1}
      className={`group/case-widget relative rounded-3xl transition ${!block.isActive ? "opacity-45 grayscale" : ""} ${dragged ? "scale-[0.99] opacity-60" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <div className={`absolute -inset-x-3 -inset-y-3 rounded-3xl border transition ${selected ? "border-[#6C3CF4] bg-[#6C3CF4]/[0.05] shadow-[0_0_0_4px_rgba(108,60,244,0.12)]" : dragged ? "border-[#6C3CF4]/60 bg-[#6C3CF4]/[0.04]" : "border-transparent group-hover/case-widget:border-[#6C3CF4]/30 group-hover/case-widget:bg-[#6C3CF4]/[0.02]"}`} />
      <div className={`absolute left-3 top-0 z-20 flex -translate-y-[calc(100%+0.5rem)] items-center gap-1 rounded-full border bg-white/95 p-1 shadow-sm transition ${selected ? "opacity-100" : "opacity-0 group-hover/case-widget:opacity-100"}`} style={{ borderColor: "var(--border-default)" }}>
        <button
          type="button"
          draggable
          onClick={(event) => event.stopPropagation()}
          onDragStart={(event) => {
            event.stopPropagation();
            event.dataTransfer.effectAllowed = "move";
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full hover:bg-slate-100 active:cursor-grabbing"
          title="Drag widget"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onMoveUp(); }} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100" title="Move up">
          <ArrowUp className="h-4 w-4" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onMoveDown(); }} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100" title="Move down">
          <ArrowDown className="h-4 w-4" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onToggleActive(); }} className="cursor-pointer rounded-full p-1.5 hover:bg-slate-100" title={block.isActive ? "Hide" : "Show"}>
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onDuplicate(); }} className="cursor-pointer rounded-full p-1.5 hover:bg-slate-100" title="Duplicate">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} className="cursor-pointer rounded-full p-1.5 text-red-600 hover:bg-red-50" title="Delete" disabled={deleting}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        {selected && (
          <button type="button" onClick={(event) => { event.stopPropagation(); onSave(block); }} disabled={saving} className="ml-1 inline-flex cursor-pointer h-9 items-center gap-1 rounded-full bg-[#6C3CF4] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#5b2ee0] disabled:opacity-60" title="Save widget">
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving" : "Save"}
          </button>
        )}
      </div>
      <div className="absolute right-3 top-3 z-20 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider opacity-0 shadow-sm transition group-hover/case-widget:opacity-100" style={{ color: "var(--text-muted)" }}>
        {WIDGET_LABELS[block.type]} {block.isActive ? "" : "Hidden"}
      </div>
      <div className="relative" onClick={selected ? (event) => event.stopPropagation() : undefined}>
        {selected ? (
          <InlineWidgetEditor block={block} onChange={onChange} />
        ) : (
          <button type="button" onClick={onSelect} className="block w-full cursor-pointer text-left">
            <CaseStudyWidget block={toPublicBlock(block)} fallbackMetrics={[]} />
          </button>
        )}
      </div>
    </section>
  );
}

function AddBlockTile({ onCreate }: { onCreate: () => void }) {
  return (
    <button
      type="button"
      onClick={onCreate}
      className="mb-8 flex cursor-pointer min-h-[148px] w-full flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-6 text-center transition hover:border-[#6C3CF4] hover:bg-[#6C3CF4]/[0.03]"
      style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
    >
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
        <Plus className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Add case study widget</span>
      <span className="mt-1 text-xs">Add metrics, text sections, QA framework, process, outcome, or CTA into this preview.</span>
    </button>
  );
}

function InlineWidgetEditor({
  block,
  onChange,
}: {
  block: EditableBlock;
  onChange: (block: EditableBlock) => void;
}) {
  const patchConfig = (patch: JsonConfig) => onChange({ ...block, config: { ...block.config, ...patch } });

  if (block.type === "metrics_grid") {
    const metrics = asObjectArray(block.config.metrics);
    return (
      <div className="relative mb-16 rounded-3xl border-2 border-[#6C3CF4] p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={index} className="rounded-2xl border-t-4 border-blue-600 bg-white/80 p-5 text-center shadow-lg">
              <InlineInput value={stringValue(metric.value)} onChange={(value) => patchArray(block, "metrics", index, { ...metric, value }, patchConfig)} className="text-center text-4xl font-bold text-blue-600" />
              <InlineInput value={stringValue(metric.label)} onChange={(label) => patchArray(block, "metrics", index, { ...metric, label }, patchConfig)} className="mt-2 text-center text-sm font-medium text-gray-600" />
              <MiniRemove onClick={() => removeArrayItem(block, "metrics", index, patchConfig)} />
            </div>
          ))}
          <InlineAdd onClick={() => patchConfig({ metrics: [...metrics, { value: "100%", label: "Metric label" }] })} label="Metric" />
        </div>
      </div>
    );
  }

  if (block.type === "text_card") {
    const shell = stringValue(block.config.variant) === "blue_gradient" ? "bg-gradient-to-br from-blue-50/80 to-indigo-50/80" : "bg-white/80";
    return (
      <section className={`relative mb-12 rounded-2xl border-2 border-[#6C3CF4] ${shell} p-8 shadow-md`}>
        <LegacyInlineHeading value={block.title} onChange={(title) => onChange({ ...block, title })} tone="blue" />
        <InlineArea value={block.content} onChange={(content) => onChange({ ...block, content })} className="min-h-[120px] text-lg leading-relaxed text-[#222222]" />
        <InlineVariant value={stringValue(block.config.variant)} onChange={(variant) => patchConfig({ variant })} />
      </section>
    );
  }

  if (block.type === "objective_grid") {
    const items = asObjectArray(block.config.items);
    return (
      <section className="relative mb-12 rounded-3xl border-2 border-[#6C3CF4] p-4">
        <LegacyInlineHeading value={block.title} onChange={(title) => onChange({ ...block, title })} tone="indigo" />
        <div className="rounded-2xl bg-white/80 p-8 shadow-md">
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((item, index) => (
              <InlineItemCard key={index} item={item} fields={["icon", "title", "body", "tone"]} onChange={(next) => patchArray(block, "items", index, next, patchConfig)} onRemove={() => removeArrayItem(block, "items", index, patchConfig)} />
            ))}
            <InlineAdd onClick={() => patchConfig({ items: [...items, { icon: "🎯", title: "Objective", body: "Describe the objective.", tone: "blue" }] })} label="Card" />
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "challenge_cards") {
    const cards = asObjectArray(block.config.cards);
    return (
      <section className="relative mb-12 rounded-3xl border-2 border-[#6C3CF4] p-4">
        <LegacyInlineHeading value={block.title} onChange={(title) => onChange({ ...block, title })} tone="red" />
        <div className="space-y-6">
          {cards.map((card, index) => (
            <InlineWideCard key={index} item={card} fields={["icon", "title", "body", "tone"]} onChange={(next) => patchArray(block, "cards", index, next, patchConfig)} onRemove={() => removeArrayItem(block, "cards", index, patchConfig)} />
          ))}
          <InlineAdd onClick={() => patchConfig({ cards: [...cards, { icon: "1", title: "Challenge", body: "Describe the challenge.", tone: "red" }] })} label="Challenge" />
        </div>
      </section>
    );
  }

  if (block.type === "qa_framework") {
    const layers = asObjectArray(block.config.layers);
    const sampleGates = asObjectArray(block.config.sampleGates);
    const solutionCards = asObjectArray(block.config.solutionCards);
    return (
      <section className="relative mb-12 rounded-2xl border-2 border-[#6C3CF4] bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-8 shadow-md">
        <LegacyInlineHeading value={block.title} onChange={(title) => onChange({ ...block, title })} tone="indigo" />
        <InlineArea value={block.content} onChange={(content) => onChange({ ...block, content })} className="mb-8 min-h-[80px] text-lg leading-relaxed text-[#222222]" />
        <div className="mb-8 rounded-xl bg-white/90 p-8 shadow-inner">
          <InlineInput value={stringValue(block.config.frameworkTitle) || "5-Layer Quality Assurance Framework"} onChange={(frameworkTitle) => patchConfig({ frameworkTitle })} className="mb-8 text-center text-2xl font-bold text-[#222222]" />
          <div className="space-y-4">
            {layers.map((layer, index) => (
              <InlineWideCard key={index} item={layer} fields={["num", "label", "title", "body", "tone"]} onChange={(next) => patchArray(block, "layers", index, next, patchConfig)} onRemove={() => removeArrayItem(block, "layers", index, patchConfig)} />
            ))}
            <InlineAdd onClick={() => patchConfig({ layers: [...layers, { num: "L1", label: "Layer", title: "QA Layer", body: "Describe the layer.", tone: "blue" }] })} label="QA layer" />
          </div>
        </div>
        <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 p-6">
          <InlineInput value={stringValue(block.config.sampleGateTitle) || "Parallel Statistical Quality Gates"} onChange={(sampleGateTitle) => patchConfig({ sampleGateTitle })} className="mb-4 text-center font-bold text-[#222222]" />
          <div className="grid gap-4 md:grid-cols-2">
            {sampleGates.map((gate, index) => (
              <InlineWideCard key={index} item={gate} fields={["num", "label", "body", "tone"]} onChange={(next) => patchArray(block, "sampleGates", index, next, patchConfig)} onRemove={() => removeArrayItem(block, "sampleGates", index, patchConfig)} />
            ))}
            <InlineAdd onClick={() => patchConfig({ sampleGates: [...sampleGates, { num: "5%", label: "Sample", body: "Describe the gate.", tone: "yellow" }] })} label="Gate" />
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {solutionCards.map((card, index) => (
            <InlineItemCard key={index} item={card} fields={["icon", "title", "body", "tone"]} onChange={(next) => patchArray(block, "solutionCards", index, next, patchConfig)} onRemove={() => removeArrayItem(block, "solutionCards", index, patchConfig)} />
          ))}
          <InlineAdd onClick={() => patchConfig({ solutionCards: [...solutionCards, { icon: "✓", title: "Solution", body: "Describe the solution.", tone: "green" }] })} label="Solution" />
        </div>
      </section>
    );
  }

  if (block.type === "process_steps") {
    const steps = asObjectArray(block.config.steps);
    return (
      <section className="relative mb-12 rounded-3xl border-2 border-[#6C3CF4] p-4">
        <LegacyInlineHeading value={block.title} onChange={(title) => onChange({ ...block, title })} tone="blue" />
        <div className="space-y-4">
          {steps.map((step, index) => (
            <InlineWideCard key={index} item={step} fields={["number", "title", "body", "tone"]} onChange={(next) => patchArray(block, "steps", index, next, patchConfig)} onRemove={() => removeArrayItem(block, "steps", index, patchConfig)} />
          ))}
          <InlineAdd onClick={() => patchConfig({ steps: [...steps, { number: "1", title: "Step title", body: "Describe this step.", tone: "blue" }] })} label="Step" />
        </div>
      </section>
    );
  }

  if (block.type === "outcome") {
    const cards = asObjectArray(block.config.cards);
    const benefits = asStringArray(block.config.benefits);
    return (
      <section className="relative mb-12 rounded-2xl border-2 border-[#6C3CF4] bg-gradient-to-br from-green-50/80 to-emerald-50/80 p-8 shadow-md">
        <LegacyInlineHeading value={block.title} onChange={(title) => onChange({ ...block, title })} tone="green" />
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {cards.map((card, index) => (
            <InlineItemCard key={index} item={card} fields={["value", "label", "body", "tone"]} onChange={(next) => patchArray(block, "cards", index, next, patchConfig)} onRemove={() => removeArrayItem(block, "cards", index, patchConfig)} />
          ))}
          <InlineAdd onClick={() => patchConfig({ cards: [...cards, { value: "100%", label: "Result", body: "Describe the result.", tone: "green" }] })} label="Outcome" />
        </div>
        <div className="rounded-xl bg-white/90 p-6 shadow-md">
          <InlineInput value={stringValue(block.config.benefitsTitle) || "Client Benefits"} onChange={(benefitsTitle) => patchConfig({ benefitsTitle })} className="mb-4 text-xl font-bold text-[#222222]" />
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <InlineInput value={benefit} onChange={(value) => patchConfig({ benefits: benefits.map((item, itemIndex) => itemIndex === index ? value : item) })} className="flex-1 text-[#222222]" />
                <MiniRemove onClick={() => patchConfig({ benefits: benefits.filter((_, itemIndex) => itemIndex !== index) })} />
              </div>
            ))}
            <InlineAdd onClick={() => patchConfig({ benefits: [...benefits, "New benefit"] })} label="Benefit" />
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "image") {
    const src = stringValue(block.config.src);
    return (
      <section className="relative mb-12 rounded-3xl border-2 border-[#6C3CF4] bg-white/80 p-4 shadow-md">
        <div className="grid gap-3 md:grid-cols-3">
          <InlineInput value={src} onChange={(value) => patchConfig({ src: value })} placeholder="Image URL, e.g. /images/project.jpg" className="md:col-span-2 rounded-lg border border-blue-100 bg-white/80 text-sm text-[#222222]" />
          <InlineInput value={stringValue(block.config.alt)} onChange={(alt) => patchConfig({ alt })} placeholder="Alt text for accessibility" className="rounded-lg border border-blue-100 bg-white/80 text-sm text-[#222222]" />
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-slate-100">
          {src ? <img src={src} alt={stringValue(block.config.alt) || block.title || "Case study image"} className="h-auto w-full object-cover" /> : <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">Image URL is empty</div>}
        </div>
        <InlineInput value={stringValue(block.config.caption)} onChange={(caption) => patchConfig({ caption })} placeholder="Caption (optional)" className="mt-3 text-center text-sm text-gray-600" />
      </section>
    );
  }

  return (
    <section className="relative rounded-2xl border-2 border-[#6C3CF4] bg-gradient-to-r from-emerald-600 to-blue-700 p-8 text-center text-white shadow-xl">
      <InlineInput value={block.title} onChange={(title) => onChange({ ...block, title })} className="text-center text-3xl font-bold text-white" />
      <InlineInput value={block.subtitle} onChange={(subtitle) => onChange({ ...block, subtitle })} className="mx-auto mt-4 max-w-2xl text-center text-xl text-emerald-100" />
      <div className="mx-auto mt-6 grid max-w-xl gap-3 md:grid-cols-2">
        <InlineInput value={stringValue(block.config.label)} onChange={(label) => patchConfig({ label })} className="rounded-lg bg-white px-4 py-3 text-center font-bold text-emerald-700" />
        <InlineInput value={stringValue(block.config.href)} onChange={(href) => patchConfig({ href })} className="rounded-lg bg-white/15 px-4 py-3 text-center text-sm text-white" />
      </div>
    </section>
  );
}

function LegacyInlineHeading({ value, onChange, tone }: { value: string; onChange: (value: string) => void; tone: Tone }) {
  return (
    <h2 className="mb-6 flex items-center text-3xl font-bold text-[#222222]">
      <div className={`mr-4 h-8 w-2 rounded-full ${toneBg(tone, 600)}`} />
      <InlineInput value={value} onChange={onChange} className="min-w-0 flex-1 text-3xl font-bold text-[#222222]" />
    </h2>
  );
}

function InlineItemCard({
  item,
  fields,
  onChange,
  onRemove,
}: {
  item: JsonConfig;
  fields: string[];
  onChange: (item: JsonConfig) => void;
  onRemove: () => void;
}) {
  const tone = normalizeTone(item.tone);
  return (
    <article className="relative h-full rounded-xl bg-white/90 p-5 text-center shadow-md">
      <MiniRemove onClick={onRemove} />
      {fields.includes("icon") && <InlineInput value={stringValue(item.icon)} onChange={(icon) => onChange({ ...item, icon })} className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 text-center text-2xl" />}
      {fields.includes("value") && <InlineInput value={stringValue(item.value)} onChange={(value) => onChange({ ...item, value })} className={`text-center text-5xl font-bold ${toneText(tone, 600)}`} />}
      {fields.includes("num") && <InlineInput value={stringValue(item.num)} onChange={(num) => onChange({ ...item, num })} className={`mx-auto mb-2 h-12 w-20 rounded-xl text-center text-xl font-bold text-white ${toneBg(tone, 500)}`} />}
      {fields.includes("number") && <InlineInput value={stringValue(item.number)} onChange={(number) => onChange({ ...item, number })} className={`mx-auto mb-2 h-12 w-12 rounded-full text-center text-xl font-bold ${toneBg(tone, 100)} ${toneText(tone, 700)}`} />}
      {fields.includes("label") && <InlineInput value={stringValue(item.label)} onChange={(label) => onChange({ ...item, label })} className="mt-2 text-center text-sm font-semibold text-gray-600" />}
      {fields.includes("title") && <InlineInput value={stringValue(item.title)} onChange={(title) => onChange({ ...item, title })} className="mt-2 text-center text-lg font-bold text-[#222222]" />}
      {fields.includes("body") && <InlineArea value={stringValue(item.body)} onChange={(body) => onChange({ ...item, body })} className="mt-2 min-h-[72px] text-center text-sm leading-relaxed text-gray-600" />}
      {fields.includes("tone") && <ToneDots value={tone} onChange={(nextTone) => onChange({ ...item, tone: nextTone })} />}
    </article>
  );
}

function InlineWideCard({
  item,
  fields,
  onChange,
  onRemove,
}: {
  item: JsonConfig;
  fields: string[];
  onChange: (item: JsonConfig) => void;
  onRemove: () => void;
}) {
  const tone = normalizeTone(item.tone);
  const badge = stringValue(item.icon || item.num || item.number || item.label);
  return (
    <article className={`relative rounded-xl border-l-4 bg-white/90 p-5 shadow-md ${toneBorder(tone)}`}>
      <MiniRemove onClick={onRemove} />
      <div className="flex items-start gap-4 pr-7">
        {(fields.includes("icon") || fields.includes("num") || fields.includes("number") || fields.includes("label")) && (
          <InlineInput
            value={badge}
            onChange={(value) => {
              const key = fields.includes("icon") ? "icon" : fields.includes("num") ? "num" : fields.includes("number") ? "number" : "label";
              onChange({ ...item, [key]: value });
            }}
            className={`h-12 w-16 shrink-0 rounded-xl text-center font-bold ${toneBg(tone, 100)} ${toneText(tone, 700)}`}
          />
        )}
        <div className="min-w-0 flex-1">
          {fields.includes("title") && <InlineInput value={stringValue(item.title)} onChange={(title) => onChange({ ...item, title })} className="text-lg font-bold text-[#222222]" />}
          {fields.includes("body") && <InlineArea value={stringValue(item.body)} onChange={(body) => onChange({ ...item, body })} className="mt-2 min-h-[64px] text-sm leading-relaxed text-gray-600" />}
          {fields.includes("tone") && <ToneDots value={tone} onChange={(nextTone) => onChange({ ...item, tone: nextTone })} />}
        </div>
      </div>
    </article>
  );
}

function InlineInput({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full border border-transparent bg-transparent px-2 py-1 outline-none transition focus:border-[#6C3CF4]/50 focus:bg-white/70 ${className ?? ""}`}
    />
  );
}

function InlineArea({ value, onChange, className }: { value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full resize-y border border-transparent bg-transparent px-2 py-1 outline-none transition focus:border-[#6C3CF4]/50 focus:bg-white/70 ${className ?? ""}`}
    />
  );
}

function InlineAdd({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[120px] cursor-pointer items-center justify-center rounded-xl border border-dashed bg-white/70 px-4 py-5 text-sm font-semibold text-[#6C3CF4] hover:border-[#6C3CF4] hover:bg-white">
      <Plus className="mr-2 h-4 w-4" /> Add {label}
    </button>
  );
}

function MiniRemove({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="absolute right-2 top-2 cursor-pointer rounded-full bg-white/90 p-1 text-red-600 opacity-0 shadow-sm transition hover:bg-red-50 group-hover/case-widget:opacity-100">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function InlineVariant({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="mt-4 flex gap-2">
      {[
        ["", "White"],
        ["blue_gradient", "Blue"],
      ].map(([next, label]) => (
        <button key={next} type="button" onClick={() => onChange(next)} className={value === next ? "btn-primary cursor-pointer text-xs" : "btn-secondary cursor-pointer text-xs"}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ToneDots({ value, onChange }: { value: Tone; onChange: (tone: Tone) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {TONES.map((tone) => (
        <button
          key={tone}
          type="button"
          onClick={() => onChange(tone)}
          className={`h-5 w-5 cursor-pointer rounded-full border-2 ${toneBg(tone, 500)} ${value === tone ? "border-slate-900" : "border-white"}`}
          title={tone}
        />
      ))}
    </div>
  );
}

function patchArray(_block: EditableBlock, key: string, index: number, item: JsonConfig, patchConfig: (patch: JsonConfig) => void) {
  const items = asObjectArray(_block.config[key]);
  patchConfig({ [key]: items.map((current, itemIndex) => itemIndex === index ? item : current) });
}

function removeArrayItem(block: EditableBlock, key: string, index: number, patchConfig: (patch: JsonConfig) => void) {
  patchConfig({ [key]: asObjectArray(block.config[key]).filter((_, itemIndex) => itemIndex !== index) });
}

function WidgetEditor({ block, onChange }: { block: EditableBlock; onChange: (block: EditableBlock) => void }) {
  const setConfig = (config: JsonConfig) => onChange({ ...block, config });
  const patchConfig = (patch: JsonConfig) => setConfig({ ...block.config, ...patch });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} className="input-field" />
        </Field>
        <Field label="Subtitle">
          <input value={block.subtitle} onChange={(event) => onChange({ ...block, subtitle: event.target.value })} className="input-field" />
        </Field>
      </div>

      {block.type === "metrics_grid" && (
        <ArrayEditor
          label="Metrics"
          items={asObjectArray(block.config.metrics)}
          emptyItem={{ value: "100%", label: "Metric label" }}
          fields={["value", "label"]}
          onChange={(metrics) => patchConfig({ metrics })}
        />
      )}

      {block.type === "text_card" && (
        <>
          <Field label="Card style">
            <select value={stringValue(block.config.variant)} onChange={(event) => patchConfig({ variant: event.target.value })} className="input-field">
              <option value="">White card</option>
              <option value="blue_gradient">Blue gradient card</option>
            </select>
          </Field>
          <Field label="Body HTML">
            <textarea value={block.content} onChange={(event) => onChange({ ...block, content: event.target.value })} className="input-field min-h-[180px]" />
          </Field>
        </>
      )}

      {block.type === "objective_grid" && (
        <ArrayEditor
          label="Objective cards"
          items={asObjectArray(block.config.items)}
          emptyItem={{ icon: "🎯", title: "Objective", body: "Describe the objective.", tone: "blue" }}
          fields={["icon", "title", "body", "tone"]}
          onChange={(items) => patchConfig({ items })}
        />
      )}

      {block.type === "challenge_cards" && (
        <ArrayEditor
          label="Challenge cards"
          items={asObjectArray(block.config.cards)}
          emptyItem={{ icon: "1", title: "Challenge", body: "Describe the challenge.", tone: "red" }}
          fields={["icon", "title", "body", "tone"]}
          onChange={(cards) => patchConfig({ cards })}
        />
      )}

      {block.type === "qa_framework" && (
        <>
          <Field label="Intro HTML">
            <textarea value={block.content} onChange={(event) => onChange({ ...block, content: event.target.value })} className="input-field min-h-[120px]" />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Framework title">
              <input value={stringValue(block.config.frameworkTitle)} onChange={(event) => patchConfig({ frameworkTitle: event.target.value })} className="input-field" />
            </Field>
            <Field label="Sample gate title">
              <input value={stringValue(block.config.sampleGateTitle)} onChange={(event) => patchConfig({ sampleGateTitle: event.target.value })} className="input-field" />
            </Field>
          </div>
          <Field label="Warning text">
            <input value={stringValue(block.config.warning)} onChange={(event) => patchConfig({ warning: event.target.value })} className="input-field" />
          </Field>
          <ArrayEditor
            label="QA layers"
            items={asObjectArray(block.config.layers)}
            emptyItem={{ num: "L1", label: "Layer", title: "QA Layer", body: "Describe the layer.", tone: "blue" }}
            fields={["num", "label", "title", "body", "tone"]}
            onChange={(layers) => patchConfig({ layers })}
          />
          <ArrayEditor
            label="Sample gates"
            items={asObjectArray(block.config.sampleGates)}
            emptyItem={{ num: "5%", label: "Sample", body: "Describe the statistical gate.", tone: "yellow" }}
            fields={["num", "label", "body", "tone"]}
            onChange={(sampleGates) => patchConfig({ sampleGates })}
          />
          <ArrayEditor
            label="Solution cards"
            items={asObjectArray(block.config.solutionCards)}
            emptyItem={{ icon: "✓", title: "Solution", body: "Describe the solution.", tone: "green" }}
            fields={["icon", "title", "body", "tone"]}
            onChange={(solutionCards) => patchConfig({ solutionCards })}
          />
        </>
      )}

      {block.type === "process_steps" && (
        <ArrayEditor
          label="Steps"
          items={asObjectArray(block.config.steps)}
          emptyItem={{ number: "1", title: "Step title", body: "Describe this step.", tone: "blue" }}
          fields={["number", "title", "body", "tone"]}
          onChange={(steps) => patchConfig({ steps })}
        />
      )}

      {block.type === "outcome" && (
        <>
          <ArrayEditor
            label="Outcome cards"
            items={asObjectArray(block.config.cards)}
            emptyItem={{ value: "100%", label: "Result", body: "Describe the result.", tone: "green" }}
            fields={["value", "label", "body", "tone"]}
            onChange={(cards) => patchConfig({ cards })}
          />
          <Field label="Benefits title">
            <input value={stringValue(block.config.benefitsTitle)} onChange={(event) => patchConfig({ benefitsTitle: event.target.value })} className="input-field" />
          </Field>
          <StringListEditor label="Benefits" items={asStringArray(block.config.benefits)} onChange={(benefits) => patchConfig({ benefits })} />
        </>
      )}

      {block.type === "image" && (
        <>
          <Field label="Image URL">
            <input value={stringValue(block.config.src)} onChange={(event) => patchConfig({ src: event.target.value })} className="input-field" placeholder="/images/example.jpg or https://..." />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Alt text">
              <input value={stringValue(block.config.alt)} onChange={(event) => patchConfig({ alt: event.target.value })} className="input-field" placeholder="Describe the image for accessibility" />
            </Field>
            <Field label="Caption">
              <input value={stringValue(block.config.caption)} onChange={(event) => patchConfig({ caption: event.target.value })} className="input-field" placeholder="Optional caption shown below the image" />
            </Field>
          </div>
        </>
      )}

      {block.type === "cta" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Button label">
            <input value={stringValue(block.config.label)} onChange={(event) => patchConfig({ label: event.target.value })} className="input-field" />
          </Field>
          <Field label="Button URL">
            <input value={stringValue(block.config.href)} onChange={(event) => patchConfig({ href: event.target.value })} className="input-field" />
          </Field>
        </div>
      )}
    </div>
  );
}

function ArrayEditor({
  label,
  items,
  emptyItem,
  fields,
  onChange,
}: {
  label: string;
  items: JsonConfig[];
  emptyItem: JsonConfig;
  fields: string[];
  onChange: (items: JsonConfig[]) => void;
}) {
  function update(index: number, key: string, value: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-default)" }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
        <button type="button" onClick={() => onChange([...items, emptyItem])} className="btn-secondary cursor-pointer text-xs">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Item {index + 1}</span>
              <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="cursor-pointer text-xs" style={{ color: "#dc2626" }}>
                Remove
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((field) => (
                <Field key={field} label={fieldLabel(field)}>
                  {field === "tone" ? (
                    <select value={stringValue(item[field]) || "blue"} onChange={(event) => update(index, field, event.target.value)} className="input-field">
                      {TONES.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
                    </select>
                  ) : field === "body" ? (
                    <textarea value={stringValue(item[field])} onChange={(event) => update(index, field, event.target.value)} className="input-field min-h-[92px]" />
                  ) : (
                    <input value={stringValue(item[field])} onChange={(event) => update(index, field, event.target.value)} className="input-field" />
                  )}
                </Field>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StringListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-default)" }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
        <button type="button" onClick={() => onChange([...items, "New benefit"])} className="btn-secondary cursor-pointer text-xs">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input value={item} onChange={(event) => onChange(items.map((current, itemIndex) => itemIndex === index ? event.target.value : current))} className="input-field" />
            <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="btn-secondary cursor-pointer text-xs" style={{ color: "#dc2626" }}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

function fromRow(row: CaseStudyBlockRow): EditableBlock {
  return {
    id: row.id,
    caseStudyId: row.case_study_id,
    type: row.type,
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    content: row.content ?? "",
    config: row.config ?? {},
    displayOrder: row.display_order,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

function toPublicBlock(block: EditableBlock): CaseStudyBlock {
  return {
    id: block.id,
    caseStudyId: block.caseStudyId,
    type: block.type,
    title: block.title || null,
    subtitle: block.subtitle || null,
    content: block.content || null,
    config: block.config,
    displayOrder: block.displayOrder,
    isActive: block.isActive,
  };
}

function toPayload(block: EditableBlock) {
  return {
    title: block.title || null,
    subtitle: block.subtitle || null,
    content: block.content || null,
    config: block.config,
    display_order: block.displayOrder,
    is_active: block.isActive,
  };
}

function toInsertPayload(block: EditableBlock) {
  return {
    case_study_id: block.caseStudyId,
    type: block.type,
    ...toPayload(block),
  };
}

function makeDefaultBlock(type: CaseStudyBlockType, caseStudyId: string, displayOrder: number): EditableBlock {
  const defaults = defaultContent(type);
  return {
    id: `new-${Date.now()}`,
    caseStudyId,
    type,
    title: defaults.title,
    subtitle: defaults.subtitle ?? "",
    content: defaults.content ?? "",
    config: defaults.config,
    displayOrder,
    isActive: true,
  };
}

function defaultContent(type: CaseStudyBlockType): { title: string; subtitle?: string; content?: string; config: JsonConfig } {
  switch (type) {
    case "metrics_grid":
      return { title: "Metrics", config: { metrics: [{ value: "100%", label: "Metric label" }, { value: "24h", label: "Delivery window" }] } };
    case "text_card":
      return { title: "About the Client", content: "<p>Describe this section.</p>", config: { variant: "blue_gradient" } };
    case "objective_grid":
      return { title: "Project Objective", config: { items: [{ icon: "🎯", title: "Objective", body: "Describe the objective.", tone: "blue" }] } };
    case "challenge_cards":
      return { title: "Challenge", config: { cards: [{ icon: "1", title: "Challenge", body: "Describe the challenge.", tone: "red" }] } };
    case "qa_framework":
      return {
        title: "Our Solution",
        content: "<p>Describe the QA approach.</p>",
        config: {
          frameworkTitle: "5-Layer Quality Assurance Framework",
          sampleGateTitle: "Parallel Statistical Quality Gates",
          warning: "If mismatch exceeds threshold, batch returns for re-QA",
          layers: [
            { num: "L1", label: "Annotator", title: "Primary Annotation", body: "Initial production layer.", tone: "blue" },
            { num: "L2", label: "Reviewer", title: "Expert Review", body: "Review and corrections.", tone: "purple" },
            { num: "L3", label: "Final", title: "Final Validation", body: "Final acceptance before delivery.", tone: "green" },
          ],
          sampleGates: [{ num: "5%", label: "Sample", body: "Randomized statistical sampling.", tone: "yellow" }],
          solutionCards: [{ icon: "✓", title: "Quality System", body: "Layered QA and traceable output.", tone: "green" }],
        },
      };
    case "process_steps":
      return { title: "Implementation Process", config: { steps: [{ number: "1", title: "Step title", body: "Describe this step.", tone: "blue" }] } };
    case "outcome":
      return {
        title: "Outstanding Outcome",
        config: {
          cards: [{ value: "100%", label: "Result", body: "Describe the result.", tone: "green" }],
          benefitsTitle: "Client Benefits",
          benefits: ["Clear business benefit"],
        },
      };
    case "image":
      return {
        title: "",
        config: {
          src: "/images/code-screen.jpg",
          alt: "Case study project visual",
          caption: "Optional image caption",
        },
      };
    case "cta":
      return {
        title: "Need Expert Data Services?",
        subtitle: "Let Tbrain deliver precision-engineered data solutions on enterprise timelines",
        config: { label: "Connect Us Today", href: "https://www.linkedin.com/company/tbrain-ai" },
      };
  }
}

function defaultDescription(type: CaseStudyBlockType) {
  const map: Record<CaseStudyBlockType, string> = {
    metrics_grid: "Top metric cards",
    text_card: "Rich text section",
    objective_grid: "Three-column objective cards",
    challenge_cards: "Stacked challenge cards",
    qa_framework: "Layered QA diagram and solution cards",
    process_steps: "Implementation timeline cards",
    outcome: "Results and client benefits",
    image: "Full-width image with caption",
    cta: "Final call to action",
  };
  return map[type];
}

function asObjectArray(value: unknown): JsonConfig[] {
  return Array.isArray(value) ? value.filter((item): item is JsonConfig => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeTone(value: unknown): Tone {
  const tone = typeof value === "string" ? value : "";
  if (TONES.includes(tone as Tone)) return tone as Tone;
  return "blue";
}

function toneBg(tone: Tone, shade: 100 | 500 | 600) {
  const map: Record<Tone, Record<number, string>> = {
    blue: { 100: "bg-blue-100", 500: "bg-blue-500", 600: "bg-blue-600" },
    indigo: { 100: "bg-indigo-100", 500: "bg-indigo-500", 600: "bg-indigo-600" },
    purple: { 100: "bg-purple-100", 500: "bg-purple-500", 600: "bg-purple-600" },
    green: { 100: "bg-green-100", 500: "bg-green-500", 600: "bg-green-600" },
    red: { 100: "bg-red-100", 500: "bg-red-500", 600: "bg-red-600" },
    orange: { 100: "bg-orange-100", 500: "bg-orange-500", 600: "bg-orange-600" },
    yellow: { 100: "bg-yellow-100", 500: "bg-yellow-500", 600: "bg-yellow-600" },
  };
  return map[tone][shade];
}

function toneText(tone: Tone, shade: 600 | 700) {
  const map: Record<Tone, Record<number, string>> = {
    blue: { 600: "text-blue-600", 700: "text-blue-700" },
    indigo: { 600: "text-indigo-600", 700: "text-indigo-700" },
    purple: { 600: "text-purple-600", 700: "text-purple-700" },
    green: { 600: "text-green-600", 700: "text-green-700" },
    red: { 600: "text-red-600", 700: "text-red-700" },
    orange: { 600: "text-orange-600", 700: "text-orange-700" },
    yellow: { 600: "text-yellow-600", 700: "text-yellow-700" },
  };
  return map[tone][shade];
}

function toneBorder(tone: Tone) {
  const map: Record<Tone, string> = {
    blue: "border-blue-500",
    indigo: "border-indigo-500",
    purple: "border-purple-500",
    green: "border-green-500",
    red: "border-red-500",
    orange: "border-orange-500",
    yellow: "border-yellow-500",
  };
  return map[tone];
}

function fieldLabel(field: string) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function nextOrder(blocks: EditableBlock[]) {
  return blocks.length ? Math.max(...blocks.map((block) => block.displayOrder)) + 10 : 10;
}

function byOrder(a: EditableBlock, b: EditableBlock) {
  return a.displayOrder - b.displayOrder;
}
