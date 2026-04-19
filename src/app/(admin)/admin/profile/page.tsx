"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { Save, LogOut, Shield } from "lucide-react";

type Group = { id: string; name: string };

export default function ProfilePage() {
  const { adminUser, signOut, permissions } = useAdminAuth();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (adminUser) {
      setFullName(adminUser.full_name ?? "");
      setAvatarUrl(adminUser.avatar_url ?? "");
    }
  }, [adminUser]);

  const { data: groups } = useQuery({
    queryKey: ["my-groups", adminUser?.id],
    enabled: !!adminUser?.id,
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("group_members")
        .select("group:groups(id, name)")
        .eq("user_id", adminUser!.id);
      const arr = ((data ?? []) as unknown as Array<{ group: Group | null }>).map((r) => r.group).filter(Boolean) as Group[];
      return arr;
    },
  });

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName || null, avatar_url: avatarUrl || null }),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!adminUser) return null;

  const isSuperAdmin = permissions.includes("*");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          My Profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Your admin account settings.
        </p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold shrink-0"
            style={{
              backgroundColor: "rgba(108,60,244,0.12)",
              color: "var(--color-brand-500)",
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!avatarUrl && (fullName || adminUser.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {adminUser.email}
            </p>
            <div className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: "var(--color-brand-500)" }}>
              <Shield className="h-3 w-3" />
              <span className="uppercase font-medium">
                {isSuperAdmin ? "Super Admin" : adminUser.role?.name ?? "Admin"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Display name
          </label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Avatar URL (optional)
          </label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="input-field"
            placeholder="https://…"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Groups
          </label>
          {groups && groups.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {groups.map((g) => (
                <span
                  key={g.id}
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isSuperAdmin ? "Super admins bypass group membership." : "Not in any groups yet."}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => void signOut().then(() => (window.location.href = "/admin/login"))}
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
          <button type="button" onClick={save} disabled={saving} className="btn-primary text-xs">
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
