"use client";

import { useAdminAuth } from "@/lib/admin/auth-context";
import { AdminSidebar } from "./sidebar";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !adminUser) {
      router.push("/admin/login");
    }
  }, [loading, adminUser, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-brand-500)" }} />
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Animated mesh background */}
      <div className="page-mesh" />
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto relative z-10 p-6">
        <div className="mx-auto max-w-6xl animate-[fadeIn_0.3s_ease-out]">{children}</div>
      </main>
    </div>
  );
}
