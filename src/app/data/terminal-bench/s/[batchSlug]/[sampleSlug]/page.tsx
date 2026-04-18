import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/terminal-bench/auth";
import { logEvent } from "@/lib/terminal-bench/events";
import { MetadataHeader } from "@/components/terminal-bench/viewer/MetadataHeader";
import { OverviewPanel } from "@/components/terminal-bench/viewer/OverviewPanel";
import { InstructionPanel } from "@/components/terminal-bench/viewer/InstructionPanel";
import { TestsPanel } from "@/components/terminal-bench/viewer/TestsPanel";
import { SolutionPanel } from "@/components/terminal-bench/viewer/SolutionPanel";
import { FileContentPanel } from "@/components/terminal-bench/viewer/FileContentPanel";
import { ViewerTabs } from "@/components/terminal-bench/viewer/ViewerTabs";
import {
  InstructionSkeleton,
  SolutionSkeleton,
  FilesSkeleton,
  TestsSkeleton,
} from "@/components/terminal-bench/viewer/ViewerSkeletons";
import type { FileRow, SampleRow } from "@/lib/terminal-bench/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SampleViewerPage({
  params,
}: {
  params: Promise<{ batchSlug: string; sampleSlug: string }>;
}) {
  const { batchSlug, sampleSlug } = await params;
  const db = supabaseAdmin();
  const { data: batch } = await db
    .from("batches")
    .select("id, slug")
    .eq("project", "terminal-bench")
    .eq("slug", batchSlug)
    .maybeSingle();
  if (!batch) notFound();

  const { data: sample } = await db
    .from("samples")
    .select("*")
    .eq("batch_id", batch.id)
    .eq("slug", sampleSlug)
    .maybeSingle<SampleRow>();
  if (!sample) notFound();

  // Paginate — MSAL has 1919 files; a single range query returns everything
  // with room to spare without tripping Next.js's hidden fetch-page cap.
  const fileRows: FileRow[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: page } = await db
      .from("files")
      .select("id, sample_id, path, mime, size_bytes, gcs_object")
      .eq("sample_id", sample.id)
      .order("path")
      .range(from, from + PAGE - 1);
    if (!page || page.length === 0) break;
    fileRows.push(...(page as FileRow[]));
    if (page.length < PAGE) break;
  }

  const solutionFile =
    fileRows.find((f) => f.path === "solution/solve.sh") ??
    fileRows.find((f) => f.path.startsWith("solution/"));

  // Detect the test harness layout so the Tests tab can show meaningful
  // empty-state copy instead of "No tests captured" when a sample uses a
  // non-pytest verifier (shell, patch-based, custom python locations).
  const harnessFiles = fileRows
    .filter((f) => f.path.startsWith("tests/") && !f.path.includes("/files/"))
    .map((f) => f.path);

  // Audit: log the viewer open.
  const h = await headers();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionJwt(token) : null;
  if (claims) {
    await logEvent({
      clientId: claims.clientId,
      grantId: claims.grantId,
      sessionId: claims.sessionId,
      batchId: batch.id,
      sampleId: sample.id,
      eventType: "view_sample",
      ip: h.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
      userAgent: h.get("user-agent"),
    });
  }

  return (
    <>
      <MetadataHeader sample={sample} batchSlug={batch.slug} />
      <ViewerTabs initial="overview">
        {{
          overview: <OverviewPanel sample={sample} files={fileRows} />,
          instructions: (
            <Suspense fallback={<InstructionSkeleton />}>
              <InstructionPanel markdown={sample.instruction_md} />
            </Suspense>
          ),
          files: (
            <Suspense fallback={<FilesSkeleton />}>
              <FileContentPanel sampleId={sample.id} />
            </Suspense>
          ),
          tests: (
            <Suspense fallback={<TestsSkeleton />}>
              <TestsPanel
                tests={sample.tests_json}
                sampleId={sample.id}
                batchId={batch.id}
                harnessFiles={harnessFiles}
              />
            </Suspense>
          ),
          solution: solutionFile ? (
            <Suspense fallback={<SolutionSkeleton />}>
              <SolutionPanel
                sampleId={sample.id}
                batchId={batch.id}
                solutionPath={solutionFile.path}
              />
            </Suspense>
          ) : (
            <div className="container mx-auto max-w-3xl px-6 py-20 text-center text-[#78818f]">
              No reference solution published for this sample.
            </div>
          ),
        }}
      </ViewerTabs>
    </>
  );
}
