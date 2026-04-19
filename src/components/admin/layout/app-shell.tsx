"use client";

import { useAdminAuth } from "@/lib/admin/auth-context";
import { AdminSidebar } from "./sidebar";
import { Loader2, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const THEME_KEY = "tbrain-admin-theme";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useAdminAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light") return false;
    if (saved === "dark") return true;
    return !window.matchMedia?.("(prefers-color-scheme: light)").matches;
  });

  useEffect(() => {
    if (!loading && !adminUser) {
      router.push("/admin/login");
    }
  }, [loading, adminUser, router]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--color-brand-500)" }}
        />
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Animated mesh background */}
      <div className="page-mesh" />

      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-2.5 sticky top-0 z-20"
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-subtle)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div />
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              color: "var(--text-muted)",
              background: "var(--bg-input)",
              border: "1px solid var(--border-default)",
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDark ? "Light" : "Dark"}
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl animate-[fadeIn_0.3s_ease-out]">{children}</div>
        </main>
      </div>
    </div>
  );
}
