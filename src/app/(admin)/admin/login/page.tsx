"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div
        className="glass-card w-full max-w-sm p-8 text-center"
        style={{ backgroundColor: "var(--bg-elevated)" }}
      >
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-brand-50)" }}>
          <Shield className="h-6 w-6" style={{ color: "var(--color-brand-600)" }} />
        </div>

        <h1
          className="text-xl font-semibold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          Admin Login
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Sign in with your Tbrain account
        </p>

        {error && (
          <div
            className="mt-4 rounded-lg p-3 text-sm"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-primary mt-6 w-full"
          style={{ padding: "0.75rem 1rem" }}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
          Only authorized team members can access the admin panel.
        </p>
      </div>
    </div>
  );
}
