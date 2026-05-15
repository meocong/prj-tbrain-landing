import "server-only";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type DownloadRow = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  ip: string | null;
  user_agent: string | null;
  downloaded_at: string;
};

export default async function CaseStudyDownloadsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("contacts.view");
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: caseStudy } = await db
    .from("case_studies")
    .select("id, title, slug")
    .eq("id", id)
    .maybeSingle();
  if (!caseStudy) notFound();

  const { data: downloads, count } = await db
    .from("case_study_downloads")
    .select("id, email, full_name, company, ip, user_agent, downloaded_at", { count: "exact" })
    .eq("case_study_id", id)
    .order("downloaded_at", { ascending: false })
    .limit(200);

  const rows = (downloads ?? []) as DownloadRow[];

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <Link
        href={`/admin/case-studies/${id}`}
        className="inline-flex items-center gap-1 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to case study
      </Link>

      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight flex items-center gap-2"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          <Download className="h-5 w-5" style={{ color: "var(--color-brand-500)" }} />
          PDF Downloads — {caseStudy.title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {count ?? 0} email lead{(count ?? 0) === 1 ? "" : "s"} captured. Showing the most recent 200.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-elevated, #fff)", border: "1px solid var(--border-default)" }}>
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No downloads yet. Once visitors submit the email gate on /casestudy, leads will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">IP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{r.email}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{r.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{r.company ?? "—"}</td>
                  <td className="px-4 py-3 text-[11px]"><code style={{ color: "var(--text-muted)" }}>{r.ip ?? "—"}</code></td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(r.downloaded_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
