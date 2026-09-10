import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { ScrollProgress } from "@/components/marketing/fx/ScrollProgress";
import {
  CATEGORIES,
  categoryBySlug,
  skillFolders,
  skillFolderBySlug,
  usesConfigFolders,
} from "@/lib/samples/categories";
import { CAPABILITY } from "@/lib/samples/capability";
import samples from "@/lib/samples/samples.json";
import { SampleCatalog } from "../../_sections/SampleCatalog";
import { CaptureSpec } from "../../_sections/CaptureSpec";
import { RigViews } from "../../_sections/RigViews";
import { AccessPaths } from "../../_sections/AccessPaths";
import { C } from "../../_sections/tokens";
import { Reveal } from "../../_sections/Reveal";

/**
 * One folder, opened.
 *
 * The bottom of the tree Tam asked for: `/samples` names the capture
 * configurations, `/samples/<category>` lists the groups inside one, and this
 * page is where clips finally play. Everything above it ships stills only, so
 * this is the first level that costs video — and it costs one clip per hover
 * rather than a grid of them, because `SampleCatalog` mounts its cards with
 * `preload="none"`.
 *
 * Deliberately thin. The category page above already says what the modality is,
 * what records it, and how it is delivered; repeating any of that here would
 * put a second page of preamble between a reader and the thing they clicked
 * twice to reach.
 */

type Params = { params: Promise<{ category: string; group: string }> };

/**
 * A "group" is a camera configuration on egocentric and a skill group
 * everywhere else — the two axes the folder level uses, resolved to the same
 * route shape so there is one leaf page rather than two.
 */
function resolveGroup(modality: string, slug: string) {
  if (usesConfigFolders(modality)) {
    const tier = (CAPABILITY[modality] ?? []).find((t) => t.key === slug);
    if (!tier) return null;
    const rows = (samples as unknown as { modality: string; tier: string; durationSec: number }[])
      .filter((r) => r.modality === modality && r.tier === slug);
    return {
      kind: "tier" as const,
      slug,
      name: tier.name,
      lead: tier.pitch ?? tier.when ?? null,
      count: rows.length,
      minutes: rows.reduce((a, r) => a + r.durationSec, 0) / 60,
    };
  }
  const f = skillFolderBySlug(modality, slug);
  if (!f) return null;
  return { kind: "skill" as const, slug, name: f.name, lead: null, count: f.count, minutes: f.minutes };
}

export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.modality && !c.externalHref).flatMap((c) =>
    usesConfigFolders(c.modality!)
      ? (CAPABILITY[c.modality!] ?? [])
          .filter((t) => ["mono", "stereo", "stereo6", "wrist"].includes(t.key))
          .map((t) => ({ category: c.slug, group: t.key }))
      : skillFolders(c.modality!).map((f) => ({ category: c.slug, group: f.slug })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, group } = await params;
  const c = categoryBySlug(category);
  const f = c?.modality ? resolveGroup(c.modality, group) : null;
  if (!c || !f) return {};

  const title = `${f.name} — ${c.name} samples`;
  const description =
    `${f.count} ${c.name.toLowerCase()} recordings of ${f.name.toLowerCase()}, ` +
    `${f.minutes.toFixed(1)} minutes playable. Capture metadata and delivery formats on every record.`;

  return {
    title,
    description,
    alternates: { canonical: `/samples/${c.slug}/${f.slug}` },
    openGraph: { title, description, url: `/samples/${c.slug}/${f.slug}`, type: "website" },
  };
}

export default async function SkillGroupPage({ params }: Params) {
  const { category, group } = await params;
  const c = categoryBySlug(category);
  if (!c || c.externalHref || !c.modality) notFound();

  const folder = resolveGroup(c.modality, group);
  if (!folder) notFound();

  return (
    <div className="samples-scope bp-chrome" style={{ background: C.base }}>
      <ScrollProgress />
      <Header />
      <main style={{ color: C.text }}>
        <section className="bp-grid bp-frame relative">
          <div className="mx-auto max-w-[1400px] px-4 pb-6 pt-28 md:pt-32 lg:px-10 xl:px-16">
            <Reveal variant="rise">
              {/* Back to the folders, not to /samples. The reader is two levels
                  down and the level they came from is the one they want. */}
              <Link
                href={`/samples/${c.slug}`}
                className="inline-flex items-center gap-2 text-[13px]"
                style={{ color: C.textMid }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {usesConfigFolders(c.modality)
                  ? "All camera configurations"
                  : `All ${c.name.toLowerCase()} groups`}
              </Link>

              <h1
                className="mt-6 text-balance text-4xl font-medium tracking-tight md:text-5xl"
                style={{
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.06,
                }}
              >
                {folder.name}
              </h1>

              {folder.lead && (
                <p
                  className="mt-5 max-w-2xl text-[15px] leading-relaxed"
                  style={{ color: C.textMid }}
                >
                  {folder.lead}
                </p>
              )}

              <p className="bp-mono mt-5 text-[11px]" style={{ color: C.accent }}>
                {folder.count} {folder.count === 1 ? "record" : "records"} ·{" "}
                {folder.minutes.toFixed(1)} min · {c.name}
              </p>
            </Reveal>
          </div>
        </section>

        {/* The rig, on the page that sells it.

            Both of these used to sit at the top of /samples/egocentric, which
            sells four configurations — and they describe exactly one. Tam,
            2026-09-10: "cái phần chữ của em chỉ apply cho Egocentric 6 cam."
            CaptureSpec states the six cameras and three stereo pairs; RigViews
            shows all six playing at the same instant. Both are the argument for
            THIS configuration and neither is an argument for mono. */}
        {group === "stereo6" && (
          <>
            <CaptureSpec category={c} />
            <RigViews />
          </>
        )}

        {/* The catalogue, seeded to this folder. The rail stays live: a reader
            who wants the whole configuration can deselect the chip rather than
            navigate back up. */}
        {folder.kind === "tier" ? (
          <SampleCatalog modality={c.modality} tier={folder.slug} />
        ) : (
          <SampleCatalog modality={c.modality} skillGroup={folder.name} />
        )}

        <AccessPaths />
      </main>
      <Footer />
    </div>
  );
}
