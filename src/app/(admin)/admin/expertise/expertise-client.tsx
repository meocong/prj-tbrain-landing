"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import type { ExpertiseRow } from "./page";

type Draft = {
  id?: string;
  label: string;
  detail: string;
  display_order: number;
  is_active: boolean;
  _dirty?: boolean;
  _new?: boolean;
};

export function ExpertiseClient({ initial }: { initial: ExpertiseRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Draft[]>(initial);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const dirty = rows.filter((r) => r._dirty || r._new);
      for (const r of dirty) {
        if (!r.label.trim() || !r.detail.trim()) continue;
        const payload = {
          label: r.label,
          detail: r.detail,
          display_order: r.display_order,
          is_active: r.is_active,
        };
        if (r._new) {
          const { error } = await supabaseAdmin.from("expertise_areas").insert(payload);
          if (error) throw error;
        } else if (r.id) {
          const { error } = await supabaseAdmin.from("expertise_areas").update(payload).eq("id", r.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success("Expertise areas saved");
      router.refresh();
    },
    onError: (err: Error) => toast.error(err.message ?? "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from("expertise_areas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      router.refresh();
    },
    onError: (err: Error) => toast.error(err.message ?? "Delete failed"),
  });

  const update = (i: number, patch: Partial<Draft>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch, _dirty: true } : r)));

  const addRow = () => {
    const next = (rows[rows.length - 1]?.display_order ?? 0) + 10;
    setRows((rs) => [...rs, { label: "", detail: "", display_order: next, is_active: true, _new: true, _dirty: true }]);
  };

  const dirtyCount = rows.filter((r) => r._dirty || r._new).length;

  return (
    <div>
      <div className="space-y-2 rounded-2xl p-5" style={{ background: "var(--bg-elevated, #fff)", border: "1px solid var(--border-default)" }}>
        {rows.length === 0 && (
          <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
            No expertise areas yet.
          </p>
        )}
        {rows.map((r, i) => (
          <div key={r.id ?? `new-${i}`} className="flex gap-2 items-start">
            <input
              type="number"
              value={r.display_order}
              onChange={(e) => update(i, { display_order: Number(e.target.value) })}
              className="input-field w-16"
              title="Order"
            />
            <input
              type="text"
              value={r.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Coding & DevOps:"
              className="input-field w-48"
            />
            <input
              type="text"
              value={r.detail}
              onChange={(e) => update(i, { detail: e.target.value })}
              placeholder="Python, C++, Java, Linux sysadmin, full stack"
              className="input-field flex-1"
            />
            <label className="flex items-center gap-1 text-xs whitespace-nowrap pt-2" style={{ color: "var(--text-muted)" }}>
              <input
                type="checkbox"
                checked={r.is_active}
                onChange={(e) => update(i, { is_active: e.target.checked })}
              />
              Active
            </label>
            {r.id ? (
              <button
                type="button"
                onClick={() => { if (confirm("Delete this entry?")) deleteMutation.mutate(r.id!); }}
                className="btn-ghost px-2 mt-1"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                className="btn-ghost px-2 mt-1"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button type="button" onClick={addRow} className="btn-secondary text-sm">
          <Plus className="h-4 w-4" /> Add area
        </button>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={dirtyCount === 0 || saveMutation.isPending}
          className="btn-primary text-sm"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Saving…" : dirtyCount ? `Save ${dirtyCount} change${dirtyCount === 1 ? "" : "s"}` : "Save"}
        </button>
      </div>
    </div>
  );
}
