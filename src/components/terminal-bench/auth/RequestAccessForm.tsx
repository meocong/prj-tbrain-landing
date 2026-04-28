"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { readUtm } from "@/lib/utm";

const TEAM_SIZES = ["1-10", "11-50", "51-200", "200+"];
const TARGET_USES = [
  { id: "training", label: "Training data" },
  { id: "evaluation", label: "Evaluation" },
  { id: "model-testing", label: "Model testing" },
  { id: "other", label: "Other" },
];

export function RequestAccessForm({ siteKey }: { siteKey: string | null }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [targetUse, setTargetUse] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleTarget(id: string) {
    setTargetUse((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/data/terminal-bench/api/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          company,
          role,
          teamSize,
          useCase,
          targetUse,
          batchSlug: "april-2026",
          turnstileToken,
          ...readUtm(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(`Could not submit (${data.error ?? "unknown"}).`);
        setSubmitting(false);
        return;
      }
      router.push("/data/terminal-bench/request-sent");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" required>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Work email" required>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Company" required>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Role / title">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Team size">
        <div className="flex flex-wrap gap-2">
          {TEAM_SIZES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setTeamSize(s)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                teamSize === s
                  ? "border-[#6C3CF4] bg-[#6C3CF4] text-white"
                  : "border-[#E5E7EB] bg-white text-[#0e1b2e] hover:border-[#6C3CF4]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Intended use">
        <div className="flex flex-wrap gap-2">
          {TARGET_USES.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => toggleTarget(t.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                targetUse.includes(t.id)
                  ? "border-[#6C3CF4] bg-[#6C3CF4] text-white"
                  : "border-[#E5E7EB] bg-white text-[#0e1b2e] hover:border-[#6C3CF4]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Use case">
        <textarea
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          rows={4}
          placeholder="What are you trying to evaluate or improve?"
          className={`${inputCls} resize-none`}
        />
      </Field>

      {siteKey ? (
        <div className="flex justify-center">
          <Turnstile
            siteKey={siteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || (siteKey !== null && !turnstileToken)}
        className="w-full rounded-xl bg-[#6C3CF4] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3] disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Submit request →"}
      </button>
    </form>
  );
}

const inputCls =
  "mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base text-[#0e1b2e] outline-none transition-colors focus:border-[#6C3CF4] focus:ring-2 focus:ring-[#6C3CF4]/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0e1b2e]">
        {label}
        {required ? <span className="text-[#6C3CF4]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
