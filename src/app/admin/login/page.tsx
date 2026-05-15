"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { getAdminAuthCallbackUrl, sanitizeAdminRedirect } from "@/lib/admin/auth-redirect";
import { AlertCircle, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Image from "next/image";

const ssoEnabled = process.env.NEXT_PUBLIC_TBRAIN_SSO_ENABLED === "true";
const ssoProvider = (process.env.NEXT_PUBLIC_TBRAIN_SSO_PROVIDER || "keycloak") as Provider;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeAdminRedirect(searchParams.get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for callback / auth-context error
  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;
    const blockedEmail = searchParams.get("email");
    if (err === "not_admin") {
      setError(
        blockedEmail
          ? `${blockedEmail} is not authorized for admin access. Ask an existing super admin to add you, or sign in with a different account.`
          : "Your account is not authorized for admin access."
      );
    } else if (err === "auth_callback_failed") {
      setError(
        "Sign-in could not be completed. The auth provider rejected the request — check that the email exists, third-party cookies are allowed, then try again."
      );
    } else {
      setError(`Authentication failed (${err}). Please try again.`);
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push(redirect);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAdminAuthCallbackUrl(window.location.origin, redirect),
      },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const handleSsoLogin = async () => {
    setError(null);
    setSsoLoading(true);
    const { error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: ssoProvider,
      options: {
        redirectTo: getAdminAuthCallbackUrl(window.location.origin, redirect),
        scopes: "openid profile email",
      },
    });
    if (error) { setError(error.message); setSsoLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="glass-card w-full max-w-[420px] animate-[scaleIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ borderTop: "2px solid #6C3CF4" }}
      >
        {/* Logo + Title */}
        <div className="text-center pt-8 pb-6 px-8">
          <div className="flex justify-center mb-3">
            <Image src="/images/logo.svg" width={140} height={42} alt="Tbrain" className="invert opacity-90" />
          </div>
          <h1 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Admin Panel
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Landing & Content Management
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mb-4 flex items-start gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.15)" }}>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 px-8">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@tbrain.ai"
                className="input-field" style={{ paddingLeft: "2.5rem" }}
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field" style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary w-full justify-center"
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 px-8 my-5">
          <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
          <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>or</span>
          <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
        </div>

        {/* SSO + Google */}
        <div className="px-8 pb-8 space-y-3">
          {ssoEnabled && (
            <button
              onClick={handleSsoLogin}
              disabled={ssoLoading || googleLoading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-60"
              style={{
                background: "rgba(108,60,244,0.12)",
                border: "1px solid rgba(108,60,244,0.35)",
                color: "var(--text-primary)",
              }}
            >
              <ShieldCheck className="h-[18px] w-[18px]" style={{ color: "#A78BFA" }} />
              {ssoLoading ? "Redirecting..." : "Continue with TBrain SSO"}
            </button>
          )}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || ssoLoading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
            style={{ background: "white", border: "1.5px solid #dadce0", color: "#3c4043" }}
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.1 24.1 0 000 21.56l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {googleLoading ? "Redirecting..." : "Sign in with Google"}
          </button>

          <p className="text-center text-[10px] mt-5" style={{ color: "var(--text-muted)" }}>
            Powered by Tbrain AI
          </p>
        </div>
      </div>
    </div>
  );
}
