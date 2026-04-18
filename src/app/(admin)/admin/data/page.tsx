"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { getAllDataProjects } from "@/lib/data/config";
import { Database, Package, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DataProjectsPage() {
  const projects = getAllDataProjects();

  const { data: stats } = useQuery({
    queryKey: ["admin-data-stats"],
    queryFn: async () => {
      const results: Record<string, { batches: number; samples: number }> = {};
      for (const project of projects) {
        const [batchRes, sampleRes] = await Promise.all([
          supabaseAdmin
            .from("batches")
            .select("id", { count: "exact", head: true })
            .eq("project", project.dbProject),
          supabaseAdmin
            .from("samples")
            .select("id", { count: "exact", head: true }),
        ]);
        results[project.slug] = {
          batches: batchRes.count ?? 0,
          samples: sampleRes.count ?? 0,
        };
      }
      return results;
    },
    staleTime: 60_000,
  });

  return (
    <div>
      <h1
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        Data Projects
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Manage data products and their batches.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const s = stats?.[project.slug];
          return (
            <div key={project.slug} className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "rgba(108,60,244,0.08)" }}
                >
                  <Database className="h-5 w-5 text-[#6C3CF4]" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                    {project.name}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Prefix: {project.passcodePrefix}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                {project.description}
              </p>

              <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {s?.batches ?? "—"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>batches</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {s?.samples ?? "—"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>samples</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/data/${project.slug}`}
                  target="_blank"
                  className="btn-ghost text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Site
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
