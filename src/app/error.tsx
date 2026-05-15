"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-page)" }}>
      <div className="max-w-md w-full text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
        >
          <AlertTriangle className="h-7 w-7" style={{ color: "#dc2626" }} />
        </div>

        <h1
          className="mt-6 text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          Something went wrong
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
          We hit an unexpected error. Try again, or head back to the homepage.
        </p>

        {error.digest && (
          <p className="mt-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3]"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.10)", color: "var(--text-primary)" }}
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
