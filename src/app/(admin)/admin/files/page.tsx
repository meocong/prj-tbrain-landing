"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission, useAdminAuth } from "@/lib/admin/auth-context";
import { FolderOpen, Upload, Trash2, Download, Eye, Lock, Users, Plus, ArrowLeft, File } from "lucide-react";
import { toast } from "sonner";

export default function FilesPage() {
  const canUpload = useHasPermission("files.upload");
  const canDelete = useHasPermission("files.delete");
  const canManage = useHasPermission("files.manage");
  const { adminUser } = useAdminAuth();
  const queryClient = useQueryClient();
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Fetch folders
  const { data: folders } = useQuery({
    queryKey: ["fm-folders", currentFolder],
    queryFn: async () => {
      let query = supabaseAdmin.from("fm_folders").select("*").order("name");
      if (currentFolder) {
        query = query.eq("parent_id", currentFolder);
      } else {
        query = query.is("parent_id", null);
      }
      const { data } = await query;
      return data ?? [];
    },
  });

  // Fetch files in current folder
  const { data: files, isLoading } = useQuery({
    queryKey: ["fm-files", currentFolder],
    queryFn: async () => {
      let query = supabaseAdmin.from("fm_files").select("*").order("created_at", { ascending: false });
      if (currentFolder) {
        query = query.eq("folder_id", currentFolder);
      } else {
        query = query.is("folder_id", null);
      }
      const { data } = await query;
      return data ?? [];
    },
  });

  // Fetch current folder info for breadcrumb
  const { data: currentFolderInfo } = useQuery({
    queryKey: ["fm-folder-info", currentFolder],
    queryFn: async () => {
      if (!currentFolder) return null;
      const { data } = await supabaseAdmin.from("fm_folders").select("*").eq("id", currentFolder).single();
      return data;
    },
    enabled: !!currentFolder,
  });

  const createFolderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin.from("fm_folders").insert({
        name: newFolderName,
        parent_id: currentFolder,
        owner_id: adminUser?.id,
        visibility: "private",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Folder created");
      setNewFolderName("");
      setShowNewFolder(false);
      queryClient.invalidateQueries({ queryKey: ["fm-folders"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await supabaseAdmin.from("fm_files").delete().eq("id", fileId);
    },
    onSuccess: () => {
      toast.success("File deleted");
      queryClient.invalidateQueries({ queryKey: ["fm-files"] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      await supabaseAdmin.from("fm_folders").delete().eq("id", folderId);
    },
    onSuccess: () => {
      toast.success("Folder deleted");
      queryClient.invalidateQueries({ queryKey: ["fm-folders"] });
    },
  });

  const visibilityIcon = (v: string) => {
    if (v === "public") return <Eye className="h-3 w-3 text-green-500" />;
    if (v === "group") return <Users className="h-3 w-3 text-blue-500" />;
    return <Lock className="h-3 w-3 text-gray-400" />;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Files
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Manage files and folders with access control.
          </p>
        </div>
        <div className="flex gap-2">
          {canUpload && (
            <button className="btn-secondary text-sm" onClick={() => setShowNewFolder(!showNewFolder)}>
              <Plus className="h-3.5 w-3.5" /> New Folder
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <button onClick={() => setCurrentFolder(null)} className="flex items-center gap-1" style={{ color: "var(--color-brand-600)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Root
          </button>
          {currentFolderInfo && (
            <>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ color: "var(--text-primary)" }}>{(currentFolderInfo as Record<string, unknown>).name as string}</span>
            </>
          )}
        </div>
      )}

      {/* New folder form */}
      {showNewFolder && (
        <div className="glass-card mt-4 flex items-center gap-2 p-3">
          <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          <button onClick={() => createFolderMutation.mutate()} disabled={!newFolderName} className="btn-primary text-sm">Create</button>
        </div>
      )}

      {/* Folders */}
      {folders && folders.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Folders</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {folders.map((f: Record<string, unknown>) => (
              <div
                key={f.id as string}
                className="glass-card-hover cursor-pointer p-4"
                onClick={() => setCurrentFolder(f.id as string)}
              >
                <div className="flex items-center justify-between">
                  <FolderOpen className="h-8 w-8" style={{ color: "var(--color-brand-500)" }} />
                  <div className="flex items-center gap-1">
                    {visibilityIcon(f.visibility as string)}
                    {canDelete && (
                      <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete folder?")) deleteFolderMutation.mutate(f.id as string); }} className="p-0.5">
                        <Trash2 className="h-3 w-3" style={{ color: "var(--color-error)" }} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{f.name as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Files</h3>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
        ) : files?.length === 0 ? (
          <div className="glass-card p-12 text-center" style={{ color: "var(--text-muted)" }}>
            No files in this folder
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                  {["Name", "Type", "Size", "Visibility", "Downloads", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files?.map((f: Record<string, unknown>) => (
                  <tr key={f.id as string} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                        <span className="font-medium truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>{f.name as string}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{(f.mime_type as string)?.split("/")[1] || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{formatSize(f.size_bytes as number)}</td>
                    <td className="px-4 py-3">{visibilityIcon(f.visibility as string)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{f.download_count as number}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(f.created_at as string).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="btn-ghost p-1" title="Download"><Download className="h-3.5 w-3.5" /></button>
                        {canDelete && (
                          <button onClick={() => { if (confirm("Delete?")) deleteFileMutation.mutate(f.id as string); }} className="btn-ghost p-1" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--color-error)" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
