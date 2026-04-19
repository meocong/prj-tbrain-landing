"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHasPermission } from "@/lib/admin/auth-context";
import { Save, Loader2 } from "lucide-react";
import type { Product } from "@/lib/admin/types";

export function SettingsClient({ product }: { product: Product }) {
  const router = useRouter();
  const canEdit = useHasPermission("data.manage");
  const [form, setForm] = useState({
    name: product.name,
    description: product.description ?? "",
    site_url: product.site_url ?? "",
    is_active: product.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setBanner(null);
    const res = await fetch(`/api/admin/products/${product.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        site_url: form.site_url || null,
        is_active: form.is_active,
      }),
    });
    setSaving(false);
    const j = await res.json();
    if (j.ok) {
      setBanner("Saved.");
      router.refresh();
    } else {
      setBanner(j.error ?? "save_failed");
    }
    setTimeout(() => setBanner(null), 2500);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {banner && (
        <div className="rounded-md px-3 py-2 text-sm animate-[fadeIn_0.2s_ease-out]"
          style={{ background: "rgba(16,185,129,0.08)", color: "#16a34a" }}>
          {banner}
        </div>
      )}

      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Display name</label>
          <input
            value={form.name}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Slug</label>
          <input value={product.slug} disabled className="input-field" style={{ fontFamily: "ui-monospace, monospace", opacity: 0.6 }} />
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>Slug is immutable — used by the public site URL.</p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
          <textarea
            value={form.description}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input-field"
            style={{ resize: "vertical" }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Public site URL</label>
          <input
            value={form.site_url}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, site_url: e.target.value })}
            placeholder="/data/terminal-bench or https://…"
            className="input-field"
          />
        </div>

        <div>
          <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
            <input
              type="checkbox"
              checked={form.is_active}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active (appears in Products list + accepts new access requests)
          </label>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Type: {product.sample_type ?? "—"}
          </span>
          <button type="button" onClick={save} disabled={!canEdit || saving} className="btn-primary text-xs">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}
