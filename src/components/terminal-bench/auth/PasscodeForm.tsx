"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useRouter, useSearchParams } from "next/navigation";

export function PasscodeForm({ siteKey }: { siteKey: string | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const batchSlug = params.get("b") ?? "april-2026";
  const redirect = params.get("redirect");

  const [passcode, setPasscode] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isLocalDev = process.env.NODE_ENV !== "production";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/data/terminal-bench/api/auth/passcode", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          passcode,
          batchSlug,
          turnstileToken: isLocalDev ? "dev-bypass" : turnstileToken,
        }),
      });
      if (res.status === 429) {
        router.replace("/data/terminal-bench/blocked");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(errorMessage(data.error));
        setSubmitting(false);
        return;
      }
      const data = (await res.json()) as { batchSlug: string };
      router.replace(redirect ?? `/data/terminal-bench/s/${data.batchSlug}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-[#0e1b2e]">Passcode</span>
        <input
          type="text"
          autoFocus
          autoComplete="one-time-code"
          spellCheck={false}
          placeholder="TB-XXXX-XXXX"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value.toUpperCase())}
          className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 font-mono text-base tracking-widest text-[#0e1b2e] outline-none transition-colors focus:border-[#6C3CF4] focus:ring-2 focus:ring-[#6C3CF4]/20"
        />
      </label>

      {siteKey && !isLocalDev ? (
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
        disabled={submitting || !passcode || (!isLocalDev && siteKey !== null && !turnstileToken)}
        className="w-full rounded-xl bg-[#6C3CF4] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3] disabled:opacity-60"
      >
        {submitting ? "Checking…" : "Enter showcase →"}
      </button>

      <p className="text-center text-sm text-[#78818f]">
        Don&apos;t have a passcode?{" "}
        <a
          href="/data/terminal-bench/request-access"
          className="font-semibold text-[#6C3CF4] underline"
        >
          Request access
        </a>
      </p>
    </form>
  );
}

function errorMessage(code?: string): string {
  switch (code) {
    case "invalid_passcode":
      return "That passcode isn't valid (or has expired). Double-check the email or request access.";
    case "turnstile_failed":
      return "Human check failed. Please retry.";
    case "unknown_batch":
      return "Unknown batch. Contact drake@tbrain.ai.";
    case "missing_passcode":
      return "Please enter a passcode.";
    default:
      return "Something went wrong. Please try again.";
  }
}
