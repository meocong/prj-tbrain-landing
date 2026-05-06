"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, FileText, Plus, Printer, RefreshCw, Save, Trash2, Upload, Users } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { TipTapEditor } from "@/components/admin/editor/TipTapEditor";

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
  pdf_filename?: string | null;
  pdf_gcs_object?: string | null;
  extended_content?: string;
  client_name?: string;
  industry?: string;
  engagement_length?: string;
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
  extended_content: "",
  client_name: "",
  industry: "",
  engagement_length: "",
};

const autoSlug = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 200);

export function CaseStudyForm({ initial }: { initial?: CaseStudyFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<CaseStudyFormValues>(initial ?? EMPTY);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

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
        extended_content: form.extended_content?.trim() ? form.extended_content : null,
        client_name: form.client_name?.trim() || null,
        industry: form.industry?.trim() || null,
        engagement_length: form.engagement_length?.trim() || null,
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

  const uploadPdf = async () => {
    if (!pdfFile || !initial?.id) return;
    setUploadingPdf(true);
    try {
      const fd = new FormData();
      fd.append("file", pdfFile);
      const res = await fetch(`/api/admin/case-studies/${initial.id}/pdf`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      toast.success(`Uploaded ${json.filename}`);
      setForm((f) => ({ ...f, pdf_filename: json.filename, pdf_gcs_object: json.gcsObject }));
      setPdfFile(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const regeneratePdf = async () => {
    if (!initial?.id) return;
    if (!form.extended_content?.trim()) {
      toast.error("Add extended content first, then save.");
      return;
    }
    setUploadingPdf(true);
    try {
      const res = await fetch(`/api/admin/case-studies/${initial.id}/regenerate-pdf`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generate failed");
      toast.success(`PDF generated (${Math.round((json.sizeBytes ?? 0) / 1024)} KB)`);
      setForm((f) => ({ ...f, pdf_filename: json.filename, pdf_gcs_object: json.gcsObject }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const deletePdf = async () => {
    if (!initial?.id) return;
    if (!confirm("Remove the PDF brochure from this case study?")) return;
    setUploadingPdf(true);
    try {
      const res = await fetch(`/api/admin/case-studies/${initial.id}/pdf`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("PDF removed");
      setForm((f) => ({ ...f, pdf_filename: null, pdf_gcs_object: null }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingPdf(false);
    }
  };

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
            className="input-field min-h-[120px]"
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Client name" hint="Shown on the brochure header (optional).">
            <input
              type="text"
              value={form.client_name ?? ""}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="input-field"
              placeholder="Acme Corp"
            />
          </Field>
          <Field label="Industry">
            <input
              type="text"
              value={form.industry ?? ""}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="input-field"
              placeholder="Manufacturing"
            />
          </Field>
          <Field label="Engagement length">
            <input
              type="text"
              value={form.engagement_length ?? ""}
              onChange={(e) => setForm({ ...form, engagement_length: e.target.value })}
              className="input-field"
              placeholder="4 months"
            />
          </Field>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Extended content (printable brochure)
          </label>
          <p className="text-[11px] mb-2 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <Printer className="h-3 w-3" />
            Long-form story rendered on the public detail page and into the auto-generated PDF brochure.
            Use H2/H3 headings to split sections (Challenge, Approach, Results, etc.).
          </p>
          <TipTapEditor
            content={form.extended_content ?? ""}
            onChange={(html) => setForm((f) => ({ ...f, extended_content: html }))}
            placeholder="Tell the full story: challenge, approach, deliverables, outcomes, lessons learned…"
          />
        </div>

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
                  className="input-field flex-1"
                />
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => updateMetric(i, "label", e.target.value)}
                  placeholder="Tasks"
                  className="input-field flex-1"
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

        {isEdit && (
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              PDF brochure
            </label>
            <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>
              The gated download on /casestudy serves this file. Generate it from the extended
              content above, or upload a hand-designed PDF to override.
            </p>

            {form.pdf_filename ? (
              <div className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ background: "var(--bg-input)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0" style={{ color: "var(--color-brand-500)" }} />
                  <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {form.pdf_filename}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/casestudy/${form.slug}/pdf?preview=1`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs"
                    title="Open the live PDF in a new tab"
                  >
                    <Printer className="h-3.5 w-3.5" /> Preview
                  </a>
                  {form.extended_content?.trim() && (
                    <button
                      type="button"
                      onClick={regeneratePdf}
                      disabled={uploadingPdf}
                      className="btn-secondary text-xs"
                      title="Re-render from current extended content"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${uploadingPdf ? "animate-spin" : ""}`} />
                      {uploadingPdf ? "Generating…" : "Re-generate"}
                    </button>
                  )}
                  <Link
                    href={`/admin/case-studies/${initial?.id}/downloads`}
                    className="btn-secondary text-xs"
                    title="View download leads"
                  >
                    <Users className="h-3.5 w-3.5" /> Leads
                  </Link>
                  <button
                    type="button"
                    onClick={deletePdf}
                    disabled={uploadingPdf}
                    className="btn-ghost px-2"
                    aria-label="Remove PDF"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {form.extended_content?.trim() ? (
                  <button
                    type="button"
                    onClick={regeneratePdf}
                    disabled={uploadingPdf}
                    className="btn-primary text-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${uploadingPdf ? "animate-spin" : ""}`} />
                    {uploadingPdf ? "Generating…" : "Generate PDF from extended content"}
                  </button>
                ) : (
                  <div
                    className="rounded-lg p-3 text-xs"
                    style={{
                      background: "rgba(108,60,244,0.06)",
                      border: "1px dashed rgba(108,60,244,0.3)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>Auto-generate is unavailable.</strong>{" "}
                    This case study has no extended content yet. Scroll up, fill in the
                    <em> Extended content (printable brochure)</em> editor, click <strong>Save</strong>,
                    then return here to generate the PDF.
                  </div>
                )}
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Or upload a hand-designed PDF (max 25MB):
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                    className="input-field flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={uploadPdf}
                    disabled={!pdfFile || uploadingPdf}
                    className="btn-secondary text-xs"
                  >
                    <Upload className="h-3.5 w-3.5" /> {uploadingPdf ? "Uploading…" : "Upload"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
