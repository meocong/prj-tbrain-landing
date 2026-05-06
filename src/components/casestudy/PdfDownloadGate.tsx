"use client";

import { useState } from "react";
import { Download, FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  slug: string;
  title: string;
};

export function PdfDownloadGate({ slug, title }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", company: "" });

  const close = () => {
    if (submitting) return;
    setOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) {
      toast.error("Please enter your work email");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/casestudy/${slug}/pdf`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          full_name: form.full_name.trim() || null,
          company: form.company.trim() || null,
          referrer: typeof document !== "undefined" ? document.referrer : null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) {
        throw new Error(json.detail ?? json.error ?? "Download failed");
      }
      const a = document.createElement("a");
      a.href = json.url;
      a.download = json.filename ?? `${slug}.pdf`;
      a.rel = "noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Brochure downloaded — check your downloads folder");
      setOpen(false);
      setForm({ email: "", full_name: "", company: "" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[#6C3CF4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a2fd3]"
      >
        <Download className="h-4 w-4" />
        Download printable brochure (PDF)
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#6C3CF4]/10 p-2">
                  <FileText className="h-5 w-5 text-[#6C3CF4]" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Get the PDF brochure</h3>
                  <p className="text-xs text-gray-500">{title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Work email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#6C3CF4] focus:outline-none focus:ring-2 focus:ring-[#6C3CF4]/20"
                  placeholder="you@company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Full name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#6C3CF4] focus:outline-none focus:ring-2 focus:ring-[#6C3CF4]/20"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#6C3CF4] focus:outline-none focus:ring-2 focus:ring-[#6C3CF4]/20"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-gray-500">
                We&apos;ll email you future case studies and product updates. Unsubscribe any time.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6C3CF4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a2fd3] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Preparing download…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Download PDF
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
