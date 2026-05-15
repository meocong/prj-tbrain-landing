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

        // Fetch admin user with permissions from API
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.adminUser);
          setPermissions(data.permissions);
        }
      } catch {
        // Auth failed — user is not admin
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();

    const {
      data: { subscription },
    } = supabaseAdmin.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.adminUser);
          setPermissions(data.permissions);
        }
      } else {
        setUser(null);
        setAdminUser(null);
        setPermissions([]);
      }
    });

    return () => subscription.unsubscribe();
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
