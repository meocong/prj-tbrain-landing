"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function CreatePasscodePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    clientEmail: "",
    batchId: "",
    expiresInDays: 30,
    maxUses: "",
    note: "",
    sendEmail: true,
  });

  // Fetch batches for dropdown
  const { data: batches } = useQuery({
    queryKey: ["admin-batches"],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("batches")
        .select("id, name, slug, project")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/passcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: form.clientEmail,
          batchId: form.batchId,
          expiresInDays: form.expiresInDays,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          note: form.note || undefined,
          sendEmail: form.sendEmail,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create passcode");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(
        form.sendEmail
          ? "Passcode created and emailed to client"
          : `Passcode created: ${data.passcode}`
      );
      router.push("/admin/passcodes");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      <Link
        href="/admin/passcodes"
        className="inline-flex items-center gap-1 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Passcodes
      </Link>

      <h1
        className="mt-4 text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        Create Passcode
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Issue a new passcode for a client to access data.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="mt-8 max-w-lg space-y-5"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Client Email *
          </label>
          <input
            type="email"
            required
            value={form.clientEmail}
            onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
            placeholder="client@company.com"
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Batch *
          </label>
          <select
            required
            value={form.batchId}
            onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="">Select a batch...</option>
            {batches?.map((b: { id: string; name: string; project: string }) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.project})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Expires in (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={form.expiresInDays}
              onChange={(e) => setForm((f) => ({ ...f, expiresInDays: Number(e.target.value) }))}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Max uses (optional)
            </label>
            <input
              type="number"
              min={1}
              value={form.maxUses}
              onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
              placeholder="Unlimited"
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Note (optional)
          </label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Internal note about this passcode"
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.sendEmail}
            onChange={(e) => setForm((f) => ({ ...f, sendEmail: e.target.checked }))}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Send passcode to client via email
          </span>
        </label>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="btn-primary w-full justify-center py-2.5"
        >
          <Send className="h-4 w-4" />
          {createMutation.isPending ? "Creating..." : "Create Passcode"}
        </button>
      </form>
    </div>
  );
}
