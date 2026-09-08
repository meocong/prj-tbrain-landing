"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight, Loader2 } from "lucide-react";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";
import { resetUnlocked } from "../_sections/useUnlocked";
import { C } from "../_sections/tokens";

type State = { kind: "idle" } | { kind: "checking" } | { kind: "error"; message: string };

const PATTERN = /^TB-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;

/** Same normalisation the server applies, so the client check cannot disagree. */
function normalize(raw: string) {
  return raw.trim().toUpperCase().replace(/[IL]/g, "1").replace(/O/g, "0");
}

const MESSAGES: Record<string, string> = {
  invalid_passcode: "That passcode is not valid, or it has expired. Check the email we sent you.",
  unknown_batch: "The sample library is not open for passcode access yet. Contact us and we will sort it out.",
  turnstile_failed: "We could not verify this browser. Reload the page and try again.",
  missing_passcode: "Enter the passcode from your access email.",
};

/**
 * Only same-origin, absolute-path redirects. The `redirect` param is attacker
 * controllable — a bare `router.push` on it would turn this form into an open
 * redirect that borrows our domain's credibility.
 */
function safeRedirect(raw: string | null): string {
  if (!raw) return "/samples/s";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/samples/s";
  return raw;
}

export function PasscodeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const turnstileRef = useRef<string>("");
  const isLocalDev = process.env.NODE_ENV !== "production";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalize(value);

    if (!code) {
      setState({ kind: "error", message: MESSAGES.missing_passcode });
      return;
    }
    if (!PATTERN.test(code)) {
      setState({
        kind: "error",
        message: "Passcodes look like TB-XXXX-XXXX. Check the email we sent you.",
      });
      return;
    }

    setState({ kind: "checking" });
    try {
      const res = await fetch("/samples/api/auth/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: code,
          turnstileToken: isLocalDev ? "dev-bypass" : turnstileRef.current,
        }),
      });

      if (res.ok) {
        track("unlock_success", { result: "success" });
        // The catalogue caches the answer to "is this browser unlocked?" for
        // the page load. Without this, navigating back to /samples in the same
        // tab would still show the locked bar against a live session.
        resetUnlocked();
        // Land on the downloads rather than back on the catalogue: the visitor
        // typed a passcode because they came for files, not for the pitch.
        router.push(safeRedirect(params.get("redirect")));
        router.refresh();
        return;
      }

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      track("open_passcode", { result: "rejected", reason: body.error });
      setState({
        kind: "error",
        message: MESSAGES[body.error ?? ""] ?? "Something went wrong. Try again in a moment.",
      });
    } catch {
      setState({ kind: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  };

  const invalid = state.kind === "error";

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 max-w-md">
      <div className="flex flex-col gap-2">
        <label htmlFor="passcode" className="text-sm font-medium" style={{ color: C.text }}>
          Access passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (state.kind === "error") setState({ kind: "idle" });
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby={invalid ? "passcode-error" : "passcode-help"}
          className="w-full rounded-xl px-4 py-3 font-mono text-base outline-none transition-colors"
          style={{
            background: C.band,
            border: `1px solid ${invalid ? C.danger : C.hairline}`,
            color: C.text,
            boxShadow: invalid ? `0 0 0 3px color-mix(in srgb, ${C.danger} 18%, transparent)` : undefined,
          }}
        />
        {invalid ? (
          <p id="passcode-error" role="alert" className="text-sm" style={{ color: C.danger }}>
            {state.message}
          </p>
        ) : (
          <p id="passcode-help" className="text-sm" style={{ color: C.textDim }}>
            Format TB-XXXX-XXXX. The session stays open for seven days on this browser.
          </p>
        )}
      </div>

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !isLocalDev && (
        <div className="mt-5">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => {
              turnstileRef.current = token;
            }}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state.kind === "checking"}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-70"
          style={{ background: C.accent, color: "#FFFFFF" }}
        >
          {state.kind === "checking" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking
            </>
          ) : (
            <>
              Open the sample set
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <Link
          href={requestUrl({ from: "passcode_page" })}
          className="text-sm underline underline-offset-4"
          style={{ color: C.textMid }}
        >
          No passcode yet
        </Link>
      </div>
    </form>
  );
}
