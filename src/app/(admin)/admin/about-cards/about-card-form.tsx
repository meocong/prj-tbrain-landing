"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { ABOUT_CARD_GROUPS, type AboutCardGroupKey } from "@/lib/landing/about-card-groups";

export type AboutCardFormValues = {
  id?: string;
  group_key: AboutCardGroupKey;
  slug: string;
  title: string;
  label: string;
  description: string;
  icon: string;
  image_url: string;
  meta: string;
  display_order: number;
  is_active: boolean;
};

const GROUP_OPTIONS: Array<{ value: AboutCardGroupKey; label: string }> = [
  { value: "company", label: "Company / Mission / Team cards" },
  { value: "value", label: "How we deliver value cards" },
  { value: "sample_projects", label: "Sample project cards" },
  { value: "expertise", label: "Technical expertise cards" },
  { value: "team", label: "Team leadership profile cards" },
  { value: "experts", label: "Expert network profile cards" },
];

const ICON_OPTIONS = [
  "",
  "Factory",
  "ShieldCheck",
  "Users",
  "Brain",
  "Workflow",
  "CheckCircle",
  "MessageSquare",
  "LineChart",
  "Mic",
  "Database",
  "FlaskConical",
  "Bot",
  "Code2",
  "Globe",
  "Languages",
  "Cpu",
  "Wrench",
  "Tags",
  "BarChart3",
  "Code",
  "Terminal",
  "Heart",
  "Stethoscope",
] as const;

const EMPTY: AboutCardFormValues = {
  group_key: "company",
  slug: "",
  title: "",
  label: "",
  description: "",
  icon: "Factory",
  image_url: "",
  meta: "{}",
  display_order: 100,
  is_active: true,
};

const autoSlug = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 200);

function prettyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

export function AboutCardForm({ initial }: { initial?: AboutCardFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<AboutCardFormValues>(initial ?? EMPTY);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!ABOUT_CARD_GROUPS.includes(form.group_key)) {
        throw new Error("Invalid card group");
      }

      let meta: Record<string, unknown>;
      try {
        const parsed = JSON.parse(form.meta || "{}");
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Meta must be a JSON object");
        }
        meta = parsed as Record<string, unknown>;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Invalid meta JSON");
      }

      const slug = form.slug || autoSlug(form.title);
      const payload = {
        group_key: form.group_key,
        slug,
        title: form.title,
        label: form.label || null,
        description: form.description || null,
        icon: form.icon || null,
        image_url: form.image_url || null,
        meta,
        display_order: form.display_order,
        is_active: form.is_active,
      };

      if (isEdit && initial?.id) {
        const { error } = await supabaseAdmin.from("about_cards").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      }

      const { data, error } = await supabaseAdmin.from("about_cards").insert(payload).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      toast.success(isEdit ? "About card updated" : "About card created");
      if (!isEdit) router.push(`/admin/about-cards/${id}`);
      else router.refresh();
    },
    onError: (err: Error) => toast.error(err.message ?? "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!initial?.id) return;
      const { error } = await supabaseAdmin.from("about_cards").delete().eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("About card deleted");
      router.push("/admin/about-cards");
    },
    onError: (err: Error) => toast.error(err.message ?? "Delete failed"),
  });

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] max-w-3xl">
      <Link href="/admin/about-cards" className="inline-flex items-center gap-1 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft className="h-3.5 w-3.5" /> All about cards
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
        {isEdit ? "Edit about card" : "New about card"}
      </h1>

      <div className="space-y-5 rounded-2xl p-6" style={{ background: "var(--bg-elevated, #fff)", border: "1px solid var(--border-default)" }}>
        <Field label="Group" required>
          <select
            value={form.group_key}
            onChange={(e) => setForm({ ...form, group_key: e.target.value as AboutCardGroupKey })}
            className="input-field"
          >
            {GROUP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || autoSlug(e.target.value) })}
            className="input-field"
            placeholder="Tbrain builds managed data programs..."
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Slug">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input-field"
              placeholder="managed-data-programs"
            />
          </Field>
          <Field label="Display order">
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="input-field"
            />
          </Field>
        </div>

        <Field label="Label / role / domain" hint="Used as card eyebrow, team role, or expert domain depending on the group.">
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="input-field"
            placeholder="Company, Medical, AI training data strategy..."
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field min-h-[110px]"
            placeholder="Card body copy"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Icon" hint="Lucide icon name. Team and expert profile cards can leave this blank.">
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="input-field"
            >
              {ICON_OPTIONS.map((name) => (
                <option key={name || "blank"} value={name}>{name || "None"}</option>
              ))}
            </select>
          </Field>
          <Field label="Image URL" hint="Used by team and expert profile cards.">
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="input-field"
              placeholder="/images/avt-tamle.png"
            />
          </Field>
        </div>

        <Field label="Meta JSON" hint='For team cards, use {"projects":["Expert-led data programs","Model evaluation"]}.'>
          <textarea
            value={form.meta}
            onChange={(e) => setForm({ ...form, meta: e.target.value })}
            className="input-field min-h-[140px] font-mono text-xs"
            spellCheck={false}
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

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => { if (confirm("Delete this about card?")) deleteMutation.mutate(); }}
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
            <Save className="h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function toInitialForm(row: {
  id: string;
  group_key: AboutCardGroupKey;
  slug: string;
  title: string;
  label: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  meta: unknown;
  display_order: number;
  is_active: boolean;
}): AboutCardFormValues {
  return {
    id: row.id,
    group_key: row.group_key,
    slug: row.slug,
    title: row.title,
    label: row.label ?? "",
    description: row.description ?? "",
    icon: row.icon ?? "",
    image_url: row.image_url ?? "",
    meta: prettyJson(row.meta),
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
