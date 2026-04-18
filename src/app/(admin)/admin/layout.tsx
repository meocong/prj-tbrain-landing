import type { Metadata } from "next";
import { AdminAuthProvider } from "@/lib/admin/auth-context";
import { AdminShell } from "@/components/admin/layout/app-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin — Tbrain",
    template: "%s | Admin — Tbrain",
  },
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen" style={{ backgroundColor: "var(--bg-page)" }}>
      <AdminAuthProvider>
        <AdminShell>{children}</AdminShell>
      </AdminAuthProvider>
    </div>
  );
}
