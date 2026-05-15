"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabaseAdmin } from "./supabase-browser";
import type { AdminUserWithPermissions } from "./types";
import type { User } from "@supabase/supabase-js";

interface AdminAuthState {
  user: User | null;
  adminUser: AdminUserWithPermissions | null;
  permissions: string[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState>({
  user: null,
  adminUser: null,
  permissions: [],
  loading: true,
  signOut: async () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

/**
 * Check permission client-side.
 * Super admins (permissions = ["*"]) bypass all checks.
 */
export function useHasPermission(code: string): boolean {
  const { permissions } = useAdminAuth();
  if (permissions.includes("*")) return true;
  return permissions.includes(code);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUserWithPermissions | null>(
    null
  );
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bounceUnauthorized(email: string | null | undefined) {
      // Authenticated with Supabase but the email isn't in admin_users.
      // Sign the user out so a retry isn't stuck on the same dead session,
      // then send them back to login with a clear reason.
      try {
        await supabaseAdmin.auth.signOut();
      } catch {
        /* ignore — we're redirecting anyway */
      }
      if (cancelled) return;
      const params = new URLSearchParams({ error: "not_admin" });
      if (email) params.set("email", email);
      window.location.replace(`/admin/login?${params.toString()}`);
    }

    async function loadAdminUser(sessionEmail?: string | null) {
      const res = await fetch("/api/admin/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (cancelled) return;
        setAdminUser(data.adminUser);
        setPermissions(data.permissions);
        return;
      }
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        await bounceUnauthorized(body?.email ?? sessionEmail ?? null);
      }
      // 401 or other: AdminAuthProvider only wraps protected layouts so
      // middleware will redirect to login on the next navigation anyway.
    }

    const fetchAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabaseAdmin.auth.getSession();

        if (!session?.user) {
          setLoading(false);
          return;
        }

        setUser(session.user);
        await loadAdminUser(session.user.email);
      } catch (err) {
        console.error("[admin-auth] fetchAuth error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAuth();

    const {
      data: { subscription },
    } = supabaseAdmin.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadAdminUser(session.user.email);
      } else {
        setUser(null);
        setAdminUser(null);
        setPermissions([]);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabaseAdmin.auth.signOut();
    setUser(null);
    setAdminUser(null);
    setPermissions([]);
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, adminUser, permissions, loading, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
