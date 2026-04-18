"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth, useHasPermission } from "@/lib/admin/auth-context";
import { ADMIN_NAV } from "@/lib/admin/constants";
import { LogOut, Shield } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const { adminUser, signOut } = useAdminAuth();

  return (
    <aside
      className="flex h-screen w-60 flex-col border-r"
      style={{
        borderColor: "var(--border-default)",
        backgroundColor: "var(--bg-sidebar)",
      }}
    >
      {/* Logo */}
      <div
        className="flex h-14 items-center gap-2 px-4 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <Shield
          className="h-5 w-5"
          style={{ color: "var(--color-brand-500)" }}
        />
        <span
          className="text-sm font-semibold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          Tbrain Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {ADMIN_NAV.map((item) => {
          const allowed = useHasPermission(item.permission);
          if (!allowed) return null;

          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                color: active ? "var(--color-brand-600)" : "var(--text-secondary)",
                backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
                fontWeight: active ? 600 : 400,
              }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {adminUser && (
        <div
          className="border-t px-3 py-3"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
              style={{
                backgroundColor: "var(--color-brand-50)",
                color: "var(--color-brand-600)",
              }}
            >
              {(adminUser.full_name || adminUser.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="truncate text-xs font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {adminUser.full_name || adminUser.email}
              </p>
              <p
                className="truncate text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {adminUser.role?.name}
              </p>
            </div>
            <button
              onClick={signOut}
              className="rounded p-1 transition-colors hover:bg-[var(--bg-input)]"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
