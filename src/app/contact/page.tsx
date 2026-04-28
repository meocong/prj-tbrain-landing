"use client";

import { useState, useRef } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Send, CheckCircle } from "lucide-react";
import { readUtm } from "@/lib/utm";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    role: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const turnstileRef = useRef<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          turnstileToken: turnstileRef.current || "dev-bypass",
          ...readUtm(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send message");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <Header />
        <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-3">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              Thank you!
            </h2>
            <p className="mt-2 text-lg text-[#78818f]">
              We received your message and will get back to you within 1-2
              business days.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-3 pb-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="text-4xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              Get in <span className="gradient-text">touch</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#78818f]">
              Tell us about your project and we&apos;ll get back to you with a
              tailored solution.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#6C3CF4]"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-input)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#6C3CF4]"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-input)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#6C3CF4]"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-input)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Role
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#6C3CF4]"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-input)" }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Message *
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Tell us about your project, timeline, and requirements..."
                className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#6C3CF4]"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-input)" }}
              />
            </div>

            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => {
                  turnstileRef.current = token;
                }}
              />
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
