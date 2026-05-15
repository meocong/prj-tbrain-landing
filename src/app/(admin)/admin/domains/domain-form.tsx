"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";

export type DomainFormValues = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
};

const ICON_OPTIONS = [
  "Code", "Terminal", "Stethoscope", "Heart", "Factory", "Wrench",
  "Globe", "Languages", "Bot", "BarChart3", "Cpu", "Brain", "Database",
] as const;

const EMPTY: DomainFormValues = {
  slug: "",
  title: "",
  description: "",
  icon: "Globe",
  display_order: 100,
  is_active: true,
};

const autoSlug = (t: string) =>
  ("domain-" + t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")).slice(0, 200);

export function DomainForm({ initial }: { initial?: DomainFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<DomainFormValues>(initial ?? EMPTY);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || autoSlug(form.title);
      const payload = {
        slug,
        title: form.title,
        description: form.description || null,
        icon: form.icon,
        display_order: form.display_order,
        is_active: form.is_active,
        category: "domain",
      };
      if (isEdit && initial?.id) {
        const { error } = await supabaseAdmin.from("services").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      } else {
        const { data, error } = await supabaseAdmin.from("services").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: (id) => {
      toast.success(isEdit ? "Domain updated" : "Domain created");
      if (!isEdit) router.push(`/admin/domains/${id}`);
      else router.refresh();
    },
    onError: (err: Error) => toast.error(err.message ?? "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!initial?.id) return;
      const { error } = await supabaseAdmin.from("services").delete().eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Domain deleted");
      router.push("/admin/domains");
    },
    onError: (err: Error) => toast.error(err.message ?? "Delete failed"),
  });

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] max-w-2xl">
      <Link href="/admin/domains" className="inline-flex items-center gap-1 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> All domains
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
        {isEdit ? "Edit domain" : "New domain"}
      </h1>

      <div className="space-y-5 rounded-2xl p-6" style={{ background: "var(--bg-elevated, #fff)", border: "1px solid var(--border-default)" }}>
        <Field label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || autoSlug(e.target.value) })}
            className="input-field"
            placeholder="Coding"
          />
        </Field>

        <Field label="Slug">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="input-field"
            placeholder="domain-coding"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[100px]"
            placeholder="Software engineering, debugging, and DevOps tasks across modern stacks."
          />
        </Field>

        <Field label="Icon" hint="lucide-react icon name. Choose from the available options.">
          <select
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="input-field"
          >
            {ICON_OPTIONS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Display order">
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
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>Active</span>
            </label>
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => { if (confirm("Delete this domain?")) deleteMutation.mutate(); }}
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
