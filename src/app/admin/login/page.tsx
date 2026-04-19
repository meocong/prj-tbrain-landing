"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { Shield, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push(redirect);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div
        className="glass-card w-full max-w-[400px] p-8 animate-[scaleIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ backgroundColor: "var(--bg-elevated)", borderTop: "2px solid #8B5CF6" }}
      >
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.svg" width={120} height={36} alt="Tbrain" className="invert opacity-90" />
        </div>

        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.12)" }}>
            <Shield className="h-5 w-5" style={{ color: "#A78BFA" }} />
          </div>
          <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Admin Panel
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Sign in to manage tbrain.ai
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.15)" }}>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "var(--text-primary)" }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
          <button onClick={() => setShowEmail(!showEmail)} className="text-xs transition-colors hover:text-[#A78BFA]" style={{ color: "var(--text-muted)" }}>or email</button>
          <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
        </div>

        {showEmail && (
          <div className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@tbrain.ai" className="input-field" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" />
            <button onClick={handleEmailLogin} disabled={loading || !email || !password} className="btn-primary w-full justify-center">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>Authorized team members only</p>
      </div>
    </div>
  );
}
