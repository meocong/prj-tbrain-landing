import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import {
  CATEGORIES,
  categoryBySlug,
  packSummary,
  statsForCategory,
} from "@/lib/samples/categories";
import { INTEROP } from "@/lib/samples/capability";
import { axesFor } from "@/lib/samples/datasets";
import { LICENSE, QUALIFIER } from "@/lib/samples/license";
import { SampleCatalog } from "../_sections/SampleCatalog";
import { AccessPaths } from "../_sections/AccessPaths";
import { C } from "../_sections/tokens";

/**
 * One category, on the skeleton `samples.tbrain.ai` already proved.
 *
 * That page's order is: a pack summary in one line, then what a preview is and
 * is not, then the clips, then the shelf story, then custom collection. It is
 * one modality done properly. This is the same order for any of them, so a
 * buyer who reads two learns the shape once.
 *
 * Static: five slugs, no data fetching, so this is prerendered like the rest of
 * the samples surface.
 */

export function generateStaticParams() {
  return CATEGORIES.filter((c) => !c.externalHref).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const c = categoryBySlug((await params).category);
  if (!c) return {};
  const title = `${c.name} data samples · Tbrain`;
  return {
    title,
    description: c.whatItIs,
    openGraph: { title, description: c.whatItIs, images: ["/samples/og.jpg"] },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const c = categoryBySlug((await params).category);
  if (!c || c.externalHref || !c.modality) notFound();

  const s = statsForCategory(c);
  const summary = packSummary(c);

  return (
    <div className="samples-scope" style={{ background: C.base }}>
      <Header />
      <main style={{ color: C.text }}>
        <section>
          <div className="mx-auto max-w-[1400px] px-4 pb-2 pt-32 md:pt-40 lg:px-10 xl:px-16">
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 text-[13px]"
              style={{ color: C.textMid }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All categories
            </Link>

            <h1
              className="mt-6 text-4xl font-medium tracking-tight md:text-6xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.02 }}
            >
              {c.name}
            </h1>

            {/* The sentence the chip could never carry. */}
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed" style={{ color: C.textMid }}>
              {c.whatItIs}
            </p>

            {c.shelf && (
              <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed" style={{ color: C.textDim }}>
                {c.shelf}
              </p>
            )}

            {/* samples.tbrain.ai opens with exactly this: nine figures, one
                line, before anything else. Derived, so it cannot drift. */}
            {summary && (
              <p
                className="mt-8 max-w-4xl font-mono text-[12px] leading-relaxed"
                style={{ color: C.value }}
              >
                In this category: {summary}.
              </p>
            )}

            {/* And then what a preview is and is not, before the first clip.
                That page says it because a downscaled browser preview beside a
                full-resolution delivery is the one thing a buyer could
                reasonably misread. */}
            <p className="mt-4 max-w-3xl text-[13px] leading-relaxed" style={{ color: C.textDim }}>
              These are web previews, not the data. Each clip is downscaled to play in a browser.
              The delivery files are full resolution and carry every stream the rig recorded.
            </p>
          </div>
        </section>

        {/* Datasets, facets, grid and the record layer, unchanged. They were
            never wrong, they were on the wrong page. */}
        <SampleCatalog modality={c.modality} />

        {/* Tiers AFTER the clips, which is the order samples.tbrain.ai uses:
            ten cards, then the shelf story. Above them this block put 3,417px
            between arriving and playing anything, on a page whose one advantage
            over every competitor is that it plays without a form. */}
        {s.tiers.length > 0 && (
          <section>
            <div className="mx-auto max-w-[1400px] px-4 pb-4 pt-14 lg:px-10 xl:px-16">
              <h2
                className="font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: C.textDim }}
              >
                What we run in this category
              </h2>

              {s.inFlight && (
                <p
                  className="mt-4 max-w-3xl px-4 py-3 text-[13px] leading-relaxed"
                  style={{ border: `1px solid ${C.hairline}`, background: C.band, color: C.textMid }}
                >
                  {s.inFlight}
                </p>
              )}

              {/* Diversity, moved down here with the rest of the shelf story.
                  Above the clips it was four numbers with nothing to anchor
                  them to. */}
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                {axesFor(c.line === "gaming" ? "gaming" : "robotics").map((a) => (
                  <div key={a.key}>
                    <dt
                      className="font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: C.textDim }}
                    >
                      {a.label}
                    </dt>
                    <dd
                      className="mt-1 font-mono text-2xl tracking-tight"
                      style={{ color: C.value, lineHeight: 1.1 }}
                    >
                      {a.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12px]" style={{ color: C.textDim }}>
                Measured across the samples published here, not the full shelf.
              </p>

              <div className="mt-10">
                {s.tiers.map((t) => (
                  <div
                    key={t.name}
                    className="grid gap-x-8 gap-y-2 py-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]"
                    style={{ borderTop: `1px solid ${C.hairline}` }}
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium">{t.name}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: C.textDim }}>
                        {t.rig}
                        {t.sensors ? ` · ${t.sensors}` : ""}
                      </p>
                    </div>
                    <p className="font-mono text-[11.5px] leading-relaxed" style={{ color: C.textMid }}>
                      Ready in {t.ramp}
                      <br />
                      Up to {t.ceiling}
                    </p>
                    <p className="font-mono text-[13px] md:text-right" style={{ color: C.value }}>
                      {t.price}
                    </p>
                  </div>
                ))}
              </div>

              <p
                className="mt-5 pt-4 font-mono text-[11px]"
                style={{ borderTop: `1px solid ${C.hairline}`, color: C.textDim }}
              >
                Delivered as {INTEROP}
              </p>
            </div>
          </section>
        )}

        {/* Licence, once per page rather than once per card, because it is the
            same for everything in the category. */}
        <section>
          <div className="mx-auto max-w-[1400px] px-4 pb-24 lg:px-10 xl:px-16">
            <h2
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: C.textDim }}
            >
              Licence
            </h2>
            <dl className="mt-5 grid gap-x-10 md:grid-cols-2">
              {LICENSE.map((t) => (
                <div
                  key={t.label}
                  className="grid grid-cols-[minmax(0,9rem)_1fr] items-baseline gap-x-5 py-2.5"
                  style={{ borderTop: `1px solid ${C.hairlineSoft}` }}
                >
                  <dt className="text-[12px]" style={{ color: C.textDim }}>
                    {t.label}
                  </dt>
                  <dd className="font-mono text-[12px] leading-relaxed" style={{ color: C.value }}>
                    {t.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[12px]" style={{ color: C.textDim }}>
              {QUALIFIER}
            </p>
          </div>
        </section>

        <AccessPaths />
      </main>
      <Footer />
    </div>
  );
}
