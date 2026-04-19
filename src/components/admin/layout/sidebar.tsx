"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuth, useHasPermission } from "@/lib/admin/auth-context";
import { ADMIN_NAV } from "@/lib/admin/constants";
import { LogOut } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const { adminUser, signOut } = useAdminAuth();

  return (
    <aside
      className="flex h-screen w-64 flex-col relative z-20"
      style={{
        borderRight: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-sidebar)",
      }}
    >
      {/* Logo */}
      <div
        className="flex h-14 items-center gap-2 px-4"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <Image
          src="/images/logo.svg"
          width={100}
          height={30}
          alt="Tbrain"
          className="dark:invert opacity-80"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
              className={active ? "sidebar-item-active" : "sidebar-item"}
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
          className="px-3 py-3"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "rgba(108,60,244,0.12)",
                color: "var(--color-brand-500, #8B5CF6)",
              }}
            >
              {(adminUser.full_name || adminUser.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="truncate text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {adminUser.full_name || adminUser.email.split("@")[0]}
              </p>
              <p
                className="truncate text-[10px] uppercase tracking-wide font-medium"
                style={{ color: "var(--color-brand-500, #8B5CF6)" }}
              >
                {adminUser.role?.name || "Admin"}
              </p>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg p-1.5 transition-colors hover:bg-[var(--bg-input)]"
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
