"use client";

import { useState, useEffect } from "react";
import { X, Eye, Send, Loader2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";

export type IssueModalProps = {
  open: boolean;
  productSlug: string;
  productId: string;
  onClose: () => void;
  onIssued?: (result: { passcode_plain: string; email: { ok: boolean; error?: string } }) => void;
};

type BatchOption = { id: string; name: string; slug: string };

export function IssuePasscodeModal({ open, productSlug, productId, onClose, onIssued }: IssueModalProps) {
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [batchId, setBatchId] = useState("");
  const [email, setEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    supabaseAdmin
      .from("batches")
      .select("id, name, slug")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBatches((data ?? []) as BatchOption[]);
        if (data && data.length > 0 && !batchId) setBatchId(data[0].id);
      });
  }, [open, productId, batchId]);

  if (!open) return null;

  const runPreview = async () => {
    setError(null);
    // Find the passcode_granted template for this product (or global fallback)
    const { data: scoped } = await supabaseAdmin
      .from("email_templates")
      .select("id")
      .eq("key", "passcode_granted")
      .eq("is_active", true)
      .eq("product_id", productId)
      .maybeSingle();
    let tplId = scoped?.id;
    if (!tplId) {
      const { data: global } = await supabaseAdmin
        .from("email_templates")
        .select("id")
        .eq("key", "passcode_granted")
        .eq("is_active", true)
        .is("product_id", null)
        .maybeSingle();
      tplId = global?.id;
    }
    if (!tplId) {
      setError("No passcode_granted template found");
      return;
    }
    const expiresAt = new Date(Date.now() + expiresInDays * 86400_000);
    const res = await fetch("/api/admin/templates/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: tplId,
        vars: {
          client_name: clientName || email || "(recipient)",
          product_name: productSlug,
          passcode: "TB-SAMPLE-CODE",
          site_url: `/data/${productSlug}`,
          expires_at: expiresAt.toLocaleDateString(),
        },
      }),
    });
    const j = await res.json();
    if (j.ok) setPreview(j.rendered);
    else setError(j.error ?? "preview_failed");
  };

  const submit = async (sendEmail: boolean) => {
    if (!email || !batchId) {
      setError("Email and batch are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/passcodes/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_slug: productSlug,
          batch_id: batchId,
          client_email: email,
          client_name: clientName || null,
          company: company || null,
          note: note || null,
          expires_in_days: expiresInDays,
          send_email: sendEmail,
        }),
      });
      const j = await res.json();
      if (!j.ok) {
        setError(j.error ?? "issue_failed");
        return;
      }
      onIssued?.(j);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
        >
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Issue passcode
          </h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Client email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Full name
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Company
              </label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Expires in (days)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Batch *
            </label>
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="input-field">
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.slug})
                </option>
              ))}
              {batches.length === 0 && <option value="">(no batches)</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Note (internal)
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input-field" />
          </div>

          {error && (
            <div
              className="rounded-md p-2 text-xs"
              style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}
            >
              {error}
            </div>
          )}

          {preview && (
            <div className="overflow-hidden rounded-lg" style={{ border: "1px solid var(--border-default)" }}>
              <div
                className="px-3 py-1.5 text-xs"
                style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
              >
                Preview · {preview.subject}
              </div>
              <iframe srcDoc={preview.html} className="w-full" style={{ height: 240, background: "white" }} title="preview" />
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between gap-2 px-5 py-3"
          style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
        >
          <button type="button" onClick={runPreview} className="btn-secondary text-xs">
            <Eye className="h-3.5 w-3.5" /> Preview email
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={loading}
              className="btn-secondary text-xs"
            >
              Create without emailing
            </button>
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={loading}
              className="btn-primary text-xs"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Create &amp; send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
