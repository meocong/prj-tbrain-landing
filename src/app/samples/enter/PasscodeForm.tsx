"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowRight, Loader2 } from "lucide-react";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";

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

export function PasscodeForm() {
  const router = useRouter();
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
        track("open_passcode", { result: "success" });
        router.push("/samples?unlocked=1");
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
        <label htmlFor="passcode" className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.92)" }}>
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
            background: "rgba(255,255,255,0.04)",
            border: invalid ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.16)",
            color: "#FFFFFF",
            boxShadow: invalid ? "0 0 0 3px rgba(248,113,113,0.14)" : undefined,
          }}
        />
        {invalid ? (
          <p id="passcode-error" role="alert" className="text-sm" style={{ color: "#FCA5A5" }}>
            {state.message}
          </p>
        ) : (
          <p id="passcode-help" className="text-sm" style={{ color: "rgba(226,232,240,0.6)" }}>
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
          style={{ background: "#A78BFA", color: "#0B0620" }}
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
          style={{ color: "rgba(226,232,240,0.72)" }}
        >
          No passcode yet
        </Link>
      </div>
    </form>
  );
}
