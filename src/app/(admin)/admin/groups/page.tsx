"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission } from "@/lib/admin/auth-context";
import { Plus, Users, Trash2, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";

export default function GroupsPage() {
  const canCreate = useHasPermission("groups.create");
  const canManage = useHasPermission("groups.manage_members");
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["admin-groups"],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("groups").select("*").order("name");
      // Get member counts
      const counts: Record<string, number> = {};
      if (data) {
        for (const g of data) {
          const { count } = await supabaseAdmin.from("group_members").select("*", { count: "exact", head: true }).eq("group_id", g.id);
          counts[g.id] = count ?? 0;
        }
      }
      return (data ?? []).map((g: Record<string, unknown>) => ({ ...g, member_count: counts[g.id as string] || 0 }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin.from("groups").insert({ name: newName, description: newDesc || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Group created");
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabaseAdmin.from("groups").delete().eq("id", id);
    },
    onSuccess: () => {
      toast.success("Group deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Groups
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Manage permission groups. Users inherit permissions from all groups they belong to.
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            <Plus className="h-4 w-4" /> New Group
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass-card mt-4 p-4 space-y-3">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Group name" className="w-full rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          <button onClick={() => createMutation.mutate()} disabled={!newName || createMutation.isPending} className="btn-primary text-sm">Create</button>
        </div>
      )}

      {/* Groups list */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 w-full" />)
        ) : groups?.length === 0 ? (
          <div className="glass-card p-12 text-center" style={{ color: "var(--text-muted)" }}>No groups yet</div>
        ) : (
          groups?.map((g: Record<string, unknown>) => (
            <GroupCard
              key={g.id as string}
              group={g}
              isSelected={selectedGroup === g.id}
              onSelect={() => setSelectedGroup(selectedGroup === g.id ? null : g.id as string)}
              onDelete={() => { if (confirm("Delete this group?")) deleteMutation.mutate(g.id as string); }}
              canManage={canManage}
            />
          ))
        )}
      </div>
    </div>
  );
}

function GroupCard({ group, isSelected, onSelect, onDelete, canManage }: {
  group: Record<string, unknown>;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [addEmail, setAddEmail] = useState("");

  const { data: members } = useQuery({
    queryKey: ["group-members", group.id],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("group_members").select("*, user:admin_users(id, email, full_name)").eq("group_id", group.id as string);
      return data ?? [];
    },
    enabled: isSelected,
  });

  const { data: groupPerms } = useQuery({
    queryKey: ["group-permissions", group.id],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("group_permissions").select("permission_id").eq("group_id", group.id as string);
      return new Set((data ?? []).map((gp: { permission_id: string }) => gp.permission_id));
    },
    enabled: isSelected,
  });

  const { data: allPerms } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("permissions").select("*").order("resource, action");
      return data ?? [];
    },
    enabled: isSelected,
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabaseAdmin.from("admin_users").select("id").eq("email", addEmail).single();
      if (!user) throw new Error("User not found");
      await supabaseAdmin.from("group_members").insert({ group_id: group.id as string, user_id: user.id });
    },
    onSuccess: () => {
      toast.success("Member added");
      setAddEmail("");
      queryClient.invalidateQueries({ queryKey: ["group-members", group.id] });
    },
    onError: (e) => toast.error(e.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await supabaseAdmin.from("group_members").delete().eq("group_id", group.id as string).eq("user_id", userId);
    },
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ["group-members", group.id] });
    },
  });

  const togglePermMutation = useMutation({
    mutationFn: async ({ permId, add }: { permId: string; add: boolean }) => {
      if (add) {
        await supabaseAdmin.from("group_permissions").insert({ group_id: group.id as string, permission_id: permId });
      } else {
        await supabaseAdmin.from("group_permissions").delete().eq("group_id", group.id as string).eq("permission_id", permId);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group-permissions", group.id] }),
  });

  // Group permissions by resource
  const grouped: Record<string, Record<string, unknown>[]> = {};
  if (allPerms) {
    for (const p of allPerms) {
      const resource = p.resource as string;
      if (!grouped[resource]) grouped[resource] = [];
      grouped[resource].push(p);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between cursor-pointer" onClick={onSelect}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--color-brand-50)" }}>
            <Users className="h-5 w-5" style={{ color: "var(--color-brand-600)" }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{group.name as string}</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {group.description as string || "No description"} · {group.member_count as number} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{isSelected ? "▼" : "▶"}</span>
          {canManage && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="btn-ghost p-1">
              <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--color-error)" }} />
            </button>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="mt-5 space-y-5">
          {/* Members */}
          <div>
            <h4 className="flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <UserPlus className="h-4 w-4" /> Members
            </h4>
            {canManage && (
              <div className="mt-2 flex gap-2">
                <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="user@tbrain.ai" className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
                <button onClick={() => addMemberMutation.mutate()} disabled={!addEmail} className="btn-primary text-sm">Add</button>
              </div>
            )}
            <div className="mt-2 space-y-1">
              {members?.map((m: Record<string, unknown>) => {
                const user = m.user as { id: string; email: string; full_name: string | null } | null;
                return (
                  <div key={m.user_id as string} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)" }}>
                    <span style={{ color: "var(--text-primary)" }}>{user?.full_name || user?.email}</span>
                    {canManage && (
                      <button onClick={() => removeMemberMutation.mutate(m.user_id as string)} className="text-xs" style={{ color: "var(--color-error)" }}>Remove</button>
                    )}
                  </div>
                );
              })}
              {(!members || members.length === 0) && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No members</p>}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <Shield className="h-4 w-4" /> Permissions
            </h4>
            {groupPerms && (
              <div className="mt-2 space-y-3">
                {Object.entries(grouped).map(([resource, perms]) => (
                  <div key={resource}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{resource}</p>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((p) => {
                        const has = groupPerms.has(p.id as string);
                        return (
                          <label key={p.id as string} className="flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 text-xs" style={{ backgroundColor: has ? "rgba(108,60,244,0.08)" : "transparent", color: has ? "var(--color-brand-600)" : "var(--text-muted)" }}>
                            <input type="checkbox" checked={has} onChange={() => togglePermMutation.mutate({ permId: p.id as string, add: !has })} className="h-3 w-3" />
                            {p.action as string}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
