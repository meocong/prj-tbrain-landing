"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";

type Metric = { value: string; label: string };

export type CaseStudyFormValues = {
  id?: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  image_url: string;
  metrics: Metric[];
  display_order: number;
  is_active: boolean;
};

const EMPTY: CaseStudyFormValues = {
  slug: "",
  title: "",
  short_description: "",
  description: "",
  image_url: "",
  metrics: [{ value: "", label: "" }],
  display_order: 100,
  is_active: true,
};

const autoSlug = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 200);

export function CaseStudyForm({ initial }: { initial?: CaseStudyFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<CaseStudyFormValues>(initial ?? EMPTY);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || autoSlug(form.title);
      const payload = {
        slug,
        title: form.title,
        short_description: form.short_description || null,
        description: form.description || null,
        image_url: form.image_url || null,
        metrics: form.metrics.filter((m) => m.value.trim() && m.label.trim()),
        display_order: form.display_order,
        is_active: form.is_active,
      };

      if (isEdit && initial?.id) {
        const { error } = await supabaseAdmin
          .from("case_studies")
          .update(payload)
          .eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      } else {
        const { data, error } = await supabaseAdmin
          .from("case_studies")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: (id) => {
      toast.success(isEdit ? "Case study updated" : "Case study created");
      if (!isEdit) router.push(`/admin/case-studies/${id}`);
      else router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Save failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!initial?.id) return;
      const { error } = await supabaseAdmin
        .from("case_studies")
        .delete()
        .eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Case study deleted");
      router.push("/admin/case-studies");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Delete failed");
    },
  });

  const addMetric = () =>
    setForm((f) => ({ ...f, metrics: [...f.metrics, { value: "", label: "" }] }));
  const removeMetric = (i: number) =>
    setForm((f) => ({ ...f, metrics: f.metrics.filter((_, j) => j !== i) }));
  const updateMetric = (i: number, key: keyof Metric, val: string) =>
    setForm((f) => ({
      ...f,
      metrics: f.metrics.map((m, j) => (j === i ? { ...m, [key]: val } : m)),
    }));

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] max-w-3xl">
      <Link
        href="/admin/case-studies"
        className="inline-flex items-center gap-1 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All case studies
      </Link>

      <h1
        className="text-2xl font-bold tracking-tight mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        {isEdit ? "Edit case study" : "New case study"}
      </h1>

      <div className="space-y-5 rounded-2xl p-6" style={{ background: "var(--bg-elevated, #fff)", border: "1px solid var(--border-default)" }}>
        <Field label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || autoSlug(e.target.value) })}
            className="input-field"
            placeholder="Terminal Bench: Agent Evaluation Platform"
          />
        </Field>

        <Field label="Slug" hint="URL-friendly identifier. Auto-derived from title.">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="input-field"
            placeholder="terminal-bench"
          />
        </Field>

        <Field label="Short description" hint="One-line tagline shown above the description.">
          <input
            type="text"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            className="input-field"
            placeholder="500+ multi-step reasoning tasks with 4-layer validation"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-base min-h-[120px]"
            placeholder="Built a comprehensive benchmark for AI terminal agents…"
          />
        </Field>

        <Field label="Image URL" hint="Path under /public (e.g. /images/foo.jpg) or full URL.">
          <input
            type="text"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="input-field"
            placeholder="/images/code-screen.jpg"
          />
        </Field>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Metrics
          </label>
          <p className="text-[11px] mb-2" style={{ color: "var(--text-muted)" }}>
            Up to 4 stat boxes shown on the card. Empty rows are dropped on save.
          </p>
          <div className="space-y-2">
            {form.metrics.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={m.value}
                  onChange={(e) => updateMetric(i, "value", e.target.value)}
                  placeholder="500+"
                  className="input-base flex-1"
                />
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => updateMetric(i, "label", e.target.value)}
                  placeholder="Tasks"
                  className="input-base flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeMetric(i)}
                  className="btn-ghost px-2"
                  aria-label="Remove metric"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addMetric} className="btn-secondary text-xs mt-2">
            <Plus className="h-3.5 w-3.5" /> Add metric
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Display order" hint="Lower = earlier. Featured slot is the lowest.">
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="input-field"
            />
          </Field>
          <Field label="Status">
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                Active (visible on /casestudy)
              </span>
            </label>
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this case study? This cannot be undone.")) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="btn-secondary text-xs"
              style={{ color: "#dc2626", borderColor: "rgba(220,38,38,0.3)" }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!form.title.trim() || saveMutation.isPending}
            className="btn-primary text-sm"
          >
            <Save className="h-4 w-4" /> {saveMutation.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
