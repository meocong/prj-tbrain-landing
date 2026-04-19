"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuth, useHasPermission } from "@/lib/admin/auth-context";
import { ADMIN_NAV } from "@/lib/admin/constants";
import { LogOut, UserCircle, Sun, Moon, MoreHorizontal } from "lucide-react";

const THEME_KEY = "tbrain-admin-theme";

function roleLabel(permissions: string[], roleCode?: string | null): { label: string; color: string } {
  if (permissions.includes("*") || roleCode === "super_admin")
    return { label: "Super Admin", color: "var(--color-brand-500, #8B5CF6)" };
  if (roleCode === "admin") return { label: "Admin", color: "#3B82F6" };
  return { label: "User", color: "var(--text-muted)" };
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { adminUser, signOut, permissions } = useAdminAuth();

  // Theme toggle state (mirrors AdminShell logic so menu reflects current)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });
  useEffect(() => {
    const root = document.documentElement;
    isDark ? root.classList.add("dark") : root.classList.remove("dark");
    window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Longest-prefix-wins active logic — one item per render
  const activeHref = useMemo(() => {
    const candidates = ADMIN_NAV.filter((item) =>
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, cur) => (cur.href.length > best.href.length ? cur : best)).href;
  }, [pathname]);

  // Build ordered section groups
  const groups = useMemo(() => {
    const out: Array<{ section: string | undefined; items: typeof ADMIN_NAV }> = [];
    for (const item of ADMIN_NAV) {
      const last = out[out.length - 1];
      if (last && last.section === item.section) last.items.push(item);
      else out.push({ section: item.section, items: [item] });
    }
    return out;
  }, []);

  const role = roleLabel(permissions, adminUser?.role?.code);

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
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g, gi) => {
          const visible = g.items.filter((item) => useHasPermission(item.permission));
          if (visible.length === 0) return null;
          return (
            <div key={gi} className={gi === 0 ? "space-y-1" : "mt-5 space-y-1"}>
              {g.section && (
                <p
                  className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)", opacity: 0.7 }}
                >
                  {g.section}
                </p>
              )}
              {visible.map((item) => {
                const active = item.href === activeHref;
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
            </div>
          );
        })}
      </nav>

      {/* User chip with dropdown */}
      {adminUser && (
        <div
          ref={menuRef}
          className="relative px-3 py-3"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          {open && (
            <div
              className="absolute bottom-full left-3 right-3 mb-2 glass-card overflow-hidden"
              style={{
                borderColor: "var(--border-default)",
                background: "var(--bg-card)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              <Link
                href="/admin/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-input)]"
                style={{ color: "var(--text-primary)" }}
              >
                <UserCircle className="h-4 w-4" /> My Profile
              </Link>
              <button
                type="button"
                onClick={() => setIsDark((d) => !d)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[var(--bg-input)]"
                style={{ color: "var(--text-primary)" }}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              <div style={{ borderTop: "1px solid var(--border-subtle)" }} />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut().then(() => (window.location.href = "/admin/login"));
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[var(--bg-input)]"
                style={{ color: "#dc2626" }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center gap-2.5 rounded-lg p-1.5 transition-colors"
            style={{
              background: open ? "var(--bg-input)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!open) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-input)";
            }}
            onMouseLeave={(e) => {
              if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0"
              style={{
                backgroundColor: adminUser.avatar_url ? undefined : "rgba(108,60,244,0.12)",
                color: "var(--color-brand-500, #8B5CF6)",
                backgroundImage: adminUser.avatar_url ? `url(${adminUser.avatar_url})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!adminUser.avatar_url && (adminUser.full_name || adminUser.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p
                className="truncate text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {adminUser.full_name || adminUser.email.split("@")[0]}
              </p>
              <p
                className="truncate text-[10px] uppercase tracking-wide font-medium"
                style={{ color: role.color }}
              >
                {role.label}
              </p>
            </div>
            <MoreHorizontal className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      )}
    </aside>
  );
}
