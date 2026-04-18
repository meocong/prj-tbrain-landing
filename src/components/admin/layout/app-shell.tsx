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
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--color-brand-500)" }}
        />
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
