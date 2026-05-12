"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
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
  cta: "CTA",
};

const TONES: Tone[] = ["blue", "indigo", "purple", "green", "red", "orange", "yellow"];

export function CaseStudyBlocksClient({
  caseStudyId,
  caseTitle,
  rows,
}: {
  caseStudyId: string;
  caseTitle: string;
  rows: CaseStudyBlockRow[];
}) {
  const [blocks, setBlocks] = useState<EditableBlock[]>(() => rows.map(fromRow).sort(byOrder));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const selected = blocks.find((block) => block.id === selectedId) ?? null;
  const orderedBlocks = useMemo(() => [...blocks].sort(byOrder), [blocks]);

  const saveMutation = useMutation({
    mutationFn: async (block: EditableBlock) => {
      const { error } = await supabaseAdmin
        .from("case_study_blocks")
        .update(toPayload(block))
        .eq("id", block.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Widget saved"),
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

  return (
    <div className="space-y-5">
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{caseTitle}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Hover a section to edit, drag, duplicate, hide, or delete it. Add widgets directly inside the preview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {orderMutation.isPending && <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Saving order...</span>}
          <button type="button" onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Add widget
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border-default)" }}>
        <div className="min-h-[720px] min-w-[860px] rounded-2xl bg-slate-50">
          <main className="mx-auto max-w-[1128px] px-4 py-12">
            <header className="mb-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Case study detail preview</p>
              <h1 className="text-4xl font-semibold leading-[1.1] text-[#222222] lg:text-5xl">{caseTitle}</h1>
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
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-xs">Close</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CASE_STUDY_BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => createMutation.mutate(type)}
                  disabled={createMutation.isPending}
                  className="rounded-xl border p-4 text-left transition hover:shadow-md"
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
  onDelete: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  return (
    <section
      className={`group/case-widget relative rounded-3xl transition ${!block.isActive ? "opacity-45 grayscale" : ""} ${dragged ? "scale-[0.99] opacity-60" : ""}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
    >
      <div className={`absolute -inset-x-3 -inset-y-3 rounded-3xl border transition ${selected ? "border-[#6C3CF4]/50 bg-[#6C3CF4]/[0.035]" : "border-transparent group-hover/case-widget:border-[#6C3CF4]/30 group-hover/case-widget:bg-[#6C3CF4]/[0.02]"}`} />
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full border bg-white/95 p-1 opacity-0 shadow-sm transition group-hover/case-widget:opacity-100" style={{ borderColor: "var(--border-default)" }}>
        <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" title="Drag">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onToggleActive(); }} className="rounded-full p-1.5 hover:bg-slate-100" title={block.isActive ? "Hide" : "Show"}>
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onDuplicate(); }} className="rounded-full p-1.5 hover:bg-slate-100" title="Duplicate">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} className="rounded-full p-1.5 text-red-600 hover:bg-red-50" title="Delete" disabled={deleting}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="absolute right-3 top-3 z-20 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider opacity-0 shadow-sm transition group-hover/case-widget:opacity-100" style={{ color: "var(--text-muted)" }}>
        {WIDGET_LABELS[block.type]} {block.isActive ? "" : "Hidden"}
      </div>
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        {selected ? (
          <div className="mb-8 rounded-3xl border-2 border-[#6C3CF4] bg-white p-5 shadow-[0_24px_80px_rgba(108,60,244,0.16)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{WIDGET_LABELS[block.type]}</p>
                <h2 className="mt-1 text-xl font-bold" style={{ color: "var(--text-primary)" }}>{block.title || "Untitled widget"}</h2>
              </div>
              <button type="button" onClick={() => onSave(block)} disabled={saving} className="btn-primary text-xs">
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
            <WidgetEditor block={block} onChange={onChange} />
          </div>
        ) : (
          <CaseStudyWidget block={toPublicBlock(block)} fallbackMetrics={[]} />
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
      className="mb-8 flex min-h-[148px] w-full flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-6 text-center transition hover:border-[#6C3CF4] hover:bg-[#6C3CF4]/[0.03]"
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
        <button type="button" onClick={() => onChange([...items, emptyItem])} className="btn-secondary text-xs">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Item {index + 1}</span>
              <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs" style={{ color: "#dc2626" }}>
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
        <button type="button" onClick={() => onChange([...items, "New benefit"])} className="btn-secondary text-xs">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input value={item} onChange={(event) => onChange(items.map((current, itemIndex) => itemIndex === index ? event.target.value : current))} className="input-field" />
            <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="btn-secondary text-xs" style={{ color: "#dc2626" }}>
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

function fieldLabel(field: string) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function nextOrder(blocks: EditableBlock[]) {
  return blocks.length ? Math.max(...blocks.map((block) => block.displayOrder)) + 10 : 10;
}

function byOrder(a: EditableBlock, b: EditableBlock) {
  return a.displayOrder - b.displayOrder;
}
