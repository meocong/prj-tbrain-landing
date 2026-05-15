"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission } from "@/lib/admin/auth-context";
import { ChevronLeft, Save, Eye } from "lucide-react";
import { TipTapEditor } from "@/components/admin/editor/TipTapEditor";

type Tpl = {
  id: string;
  product_id: string | null;
  key: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  variables: string[];
  is_active: boolean;
};

export default function EditEmailTemplatePage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const canEdit = useHasPermission("content.edit");

  const { data: tpl } = useQuery({
    queryKey: ["email-template", params.id],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("email_templates")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();
      return data as Tpl | null;
    },
  });

  const [form, setForm] = useState<Tpl | null>(null);
  useEffect(() => { if (tpl) setForm(tpl); }, [tpl]);

  const save = useMutation({
    mutationFn: async (t: Tpl) => {
      const { error } = await supabaseAdmin
        .from("email_templates")
        .update({
          name: t.name,
          subject: t.subject,
          body_html: t.body_html,
          body_text: t.body_text,
          is_active: t.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-template", params.id] });
      qc.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });

  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const runPreview = async () => {
    if (!form) return;
    const sampleVars: Record<string, string> = {};
    for (const v of form.variables ?? []) {
      sampleVars[v] =
        v === "passcode" ? "TB-ABCD-EFGH" :
        v === "client_name" ? "Drake Nguyen" :
        v === "product_name" ? "Terminal-Bench" :
        v === "site_url" ? "https://tbrain.ai/data/terminal-bench" :
        v === "expires_at" ? "Dec 31, 2026" :
        v === "reason" ? "We've paused external access for this batch." :
        `{{${v}}}`;
    }
    const res = await fetch("/api/admin/templates/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: form.id, vars: sampleVars }),
    });
    const j = await res.json();
    if (j.ok) setPreview(j.rendered);
  };

  if (!form) return null;

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/email-templates"
        className="inline-flex items-center gap-1 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All templates
      </Link>

      <div className="mb-5 flex items-start justify-between">
        <div>
          <input
            value={form.name}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-0 bg-transparent text-2xl font-bold outline-none"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          />
          <code className="text-xs" style={{ color: "var(--text-muted)" }}>
            {form.key} {form.product_id ? "· scoped" : "· global"}
          </code>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={runPreview}
            className="btn-secondary text-xs"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <button
            type="button"
            disabled={!canEdit || save.isPending}
            onClick={() => save.mutate(form)}
            className="btn-primary text-xs"
          >
            <Save className="h-3.5 w-3.5" /> {save.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Subject</label>
          <input
            value={form.subject}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Body (rich editor)
          </label>
          <TipTapEditor
            content={form.body_html}
            onChange={(html) => setForm({ ...form, body_html: html })}
            placeholder="Write the email body. Use {{var}} to insert variables."
          />
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            Variables are substituted at send time. Type <code>{"{{passcode}}"}</code> etc.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Body plain text (optional)
          </label>
          <textarea
            value={form.body_text ?? ""}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, body_text: e.target.value || null })}
            rows={6}
            className="input-field font-mono text-xs"
            style={{ resize: "vertical" }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Available variables
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(form.variables ?? []).map((v) => (
              <code
                key={v}
                className="rounded px-1.5 py-0.5 text-[11px]"
                style={{ background: "var(--bg-input)", color: "var(--color-brand-500)" }}
              >
                {`{{${v}}}`}
              </code>
            ))}
          </div>
        </div>
      </div>

      {preview && (
        <div className="glass-card mt-5 overflow-hidden">
          <div
            className="px-4 py-2 text-xs font-medium"
            style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            Preview — {preview.subject}
          </div>
          <iframe
            srcDoc={preview.html}
            className="w-full"
            style={{ height: 360, background: "white" }}
            title="Email preview"
          />
        </div>
      )}
    </div>
  );
}
