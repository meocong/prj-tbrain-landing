import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { verifySessionJwt, SESSION_COOKIE } from "@/lib/terminal-bench/auth";
import { FilterableSampleGrid } from "@/components/terminal-bench/samples/FilterBar";
import type { SampleRow } from "@/lib/terminal-bench/types";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BatchGridPage({
  params,
}: {
  params: { batchSlug: string };
}) {
  const db = supabaseAdmin();
  const { data: batch } = await db
    .from("batches")
    .select("id, slug, name, description, gcs_batch_zip_object")
    .eq("project", "terminal-bench")
    .eq("slug", params.batchSlug)
    .maybeSingle();

  if (!batch) notFound();

  // Explicit range: Next.js's cached fetch layer silently caps this query to
  // the first page's worth of rows when no range is set. `.range(0, 999)`
  // forces the full batch to come back.
  const { data: samples } = await db
    .from("samples")
    .select("*")
    .eq("batch_id", batch.id)
    .order("title")
    .range(0, 999);

  const rows = (samples ?? []) as SampleRow[];

  // Authorisation happens in middleware; here we just confirm the batch is
  // inside the session's whitelist so we can show a "download batch" button.
  const token = cookies().get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionJwt(token) : null;
  const canDownloadBatch =
    claims?.batchIds.includes(batch.id) && !!batch.gcs_batch_zip_object;

  headers(); // ensures server component runs dynamically

  return (
    <main className="container mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
            / terminal-bench / {batch.slug}
          </p>
          <h1 className="mt-3 text-4xl font-medium text-[#0e1b2e] md:text-5xl">
            {batch.name}
          </h1>
          {batch.description ? (
            <p className="mt-3 max-w-2xl text-base text-[#78818f]">
              {batch.description}
            </p>
          ) : null}
        </div>
        {canDownloadBatch ? (
          <Link
            href={`/data/terminal-bench/api/download/batch/${batch.id}`}
            prefetch={false}
            className="rounded-xl border border-[#0e1b2e] px-5 py-3 text-sm font-semibold text-[#0e1b2e] transition-all hover:bg-[#0e1b2e] hover:text-white"
          >
            Download full batch .zip
          </Link>
        ) : null}
      </div>

      <FilterableSampleGrid samples={rows} batchSlug={batch.slug} />
    </main>
  );
}
