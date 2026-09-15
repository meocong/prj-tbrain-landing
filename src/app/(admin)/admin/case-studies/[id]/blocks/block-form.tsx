"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { CASE_STUDY_BLOCK_TYPES, type CaseStudyBlockType } from "@/lib/landing/case-study-block-types";

export type BlockFormValues = {
  id?: string;
  case_study_id: string;
  type: CaseStudyBlockType;
  title: string;
  subtitle: string;
  content: string;
  config: string;
  display_order: number;
  is_active: boolean;
};

const EMPTY_CONFIG = "{}";

export function CaseStudyBlockForm({
  caseStudyId,
  initial,
}: {
  caseStudyId: string;
  initial?: BlockFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<BlockFormValues>(
    initial ?? {
      case_study_id: caseStudyId,
      type: "text_card",
      title: "",
      subtitle: "",
      content: "",
      config: EMPTY_CONFIG,
      display_order: 100,
      is_active: true,
    }
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      let config: Record<string, unknown>;
      try {
        const parsed = JSON.parse(form.config || "{}");
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Config must be a JSON object");
        }
        config = parsed as Record<string, unknown>;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Invalid config JSON");
      }

      const payload = {
        case_study_id: caseStudyId,
        type: form.type,
        title: form.title || null,
        subtitle: form.subtitle || null,
        content: form.content || null,
        config,
        display_order: form.display_order,
        is_active: form.is_active,
      };

      if (isEdit && initial?.id) {
        const { error } = await supabaseAdmin.from("case_study_blocks").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      }

      const { data, error } = await supabaseAdmin.from("case_study_blocks").insert(payload).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      toast.success(isEdit ? "Widget updated" : "Widget created");
      if (!isEdit) router.push(`/admin/case-studies/${caseStudyId}/blocks/${id}`);
      else router.refresh();
    },
    onError: (err: Error) => toast.error(err.message ?? "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!initial?.id) return;
      const { error } = await supabaseAdmin.from("case_study_blocks").delete().eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Widget deleted");
      router.push(`/admin/case-studies/${caseStudyId}/blocks`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Delete failed"),
  });

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] max-w-3xl">
      <Link href={`/admin/case-studies/${caseStudyId}/blocks`} className="inline-flex items-center gap-1 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> All widgets
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
        {isEdit ? "Edit widget" : "New widget"}
      </h1>

      <div className="space-y-5 rounded-2xl p-6" style={{ background: "var(--bg-elevated, #fff)", border: "1px solid var(--border-default)" }}>
        <Field label="Widget type" required>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CaseStudyBlockType })} className="input-field">
            {CASE_STUDY_BLOCK_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          </Field>
          <Field label="Subtitle">
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
          </Field>
        </div>

        <Field label="Content HTML" hint="Use this for rich text inside text/QA blocks. Leave blank for pure config widgets.">
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field min-h-[120px] font-mono text-xs" spellCheck={false} />
        </Field>

        <Field label="Config JSON" hint="This controls cards, steps, QA layers, CTA link, etc.">
          <textarea value={form.config} onChange={(e) => setForm({ ...form, config: e.target.value })} className="input-field min-h-[260px] font-mono text-xs" spellCheck={false} />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Display order">
            <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="input-field" />
          </Field>
          <Field label="Status">
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>Active</span>
            </label>
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => { if (confirm("Delete this widget?")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              className="btn-secondary text-xs"
              style={{ color: "#dc2626", borderColor: "rgba(220,38,38,0.3)" }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ) : <span />}
          <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary text-sm">
            <Save className="h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function toBlockForm(row: {
  id: string;
  case_study_id: string;
  type: CaseStudyBlockType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  config: unknown;
  display_order: number;
  is_active: boolean;
}): BlockFormValues {
  return {
    id: row.id,
    case_study_id: row.case_study_id,
    type: row.type,
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    content: row.content ?? "",
    config: JSON.stringify(row.config ?? {}, null, 2),
    display_order: row.display_order,
    is_active: row.is_active,
  };
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}
