import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import {
  CATEGORIES,
  categoryBySlug,
  statsForCategory,
} from "@/lib/samples/categories";
import { INTEROP } from "@/lib/samples/capability";
import { axesFor } from "@/lib/samples/datasets";
import { LICENSE, QUALIFIER } from "@/lib/samples/license";
import { SampleCatalog } from "../_sections/SampleCatalog";
import { TwoRoutes } from "../_sections/TwoRoutes";
import { CoverageChart } from "../_sections/CoverageChart";
import { CategoryHeader } from "../_sections/CategoryHeader";
import { CaptureSpec } from "../_sections/CaptureSpec";
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

  return (
    <div className="samples-scope" style={{ background: C.base }}>
      <Header />
      <main style={{ color: C.text }}>
        <CategoryHeader category={c} />

        {/* The caveat now sits against the clips it qualifies rather than under
            the title, where it was the fifth paragraph before any footage — and
            only where there ARE clips. /samples/mocap was telling a reader that
            "these are web previews, not the data" on a page holding no preview
            at all. */}
        {s.episodes > 0 && (
        <section>
          <div className="mx-auto max-w-[1400px] px-4 pt-10 lg:px-10 xl:px-16">
            <p className="max-w-3xl text-[13px] leading-relaxed" style={{ color: C.textDim }}>
              These are web previews, not the data. Each clip is downscaled to play in a browser.
              The delivery files are full resolution and carry every stream the rig recorded.
            </p>
          </div>
        </section>
        )}

        {/* What records this category, before anything about what is in it.
            It is the first question a technical buyer asks, and it is the one
            block that makes this page not interchangeable with the next one. */}
        <CaptureSpec category={c} />

        {/* Datasets, facets, grid and the record layer, unchanged. They were
            never wrong, they were on the wrong page. */}
        <SampleCatalog modality={c.modality} />

        {/* The mix, AFTER the clips. humanoidlayer.dev prints its facet
            values on the page and we copied that literally, which on 118
            egocentric records meant 78 workplace strings in one alphabetical
            paragraph — their catalogue has eight datasets, ours needed the
            counts. Above the clips it also cost 750px: measured, the first
            playable clip sat at 3,211px, worse than the 3,417px this page was
            rebuilt to fix. It is shelf story, so it sits with the shelf story.
            CaptureSpec stays above because it is short and it is what makes
            this page not the next one. */}
        <CoverageChart modality={c.modality} />

        {/* R2, per category: the same two routes as the front door, with this
            category's own published count on one side and its own cheapest tier
            and ramp on the other. A reader who saw the front-door version reads
            the same two paragraphs here, so it is one offer stated twice with
            different numbers rather than two offers. */}
        <TwoRoutes category={c} />

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

              {/* Diversity, moved down here with the rest of the shelf story.
                  Above the clips it was four numbers with nothing to anchor
                  them to.

                  Only where the category HAS records. `axesFor` counts a whole
                  line, so /samples/mocap — which holds nothing — was printing
                  "31 workplaces · 106 distinct tasks · 32 operator jobs · 27%
                  graded hard", every figure of it egocentric's, directly under
                  a heading saying "in this category". */}
              {s.episodes > 0 && (
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
              )}
              {s.episodes > 0 && (
                <p className="mt-3 text-[12px]" style={{ color: C.textDim }}>
                  Measured across the samples published here, not the full shelf.
                </p>
              )}

              <div className="mt-10">
                {s.tiers.map((t) => (
                  <div
                    key={t.name}
                    className="grid gap-x-8 gap-y-2 py-5 md:grid-cols-[minmax(0,1.3fr)_auto]"
                    style={{ borderTop: `1px solid ${C.hairline}` }}
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium">{t.name}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: C.textDim }}>
                        {t.rig}
                        {t.sensors ? ` · ${t.sensors}` : ""}
                        {t.environment ? ` · ${t.environment}` : ""}
                      </p>
                      {/* The column the first transcription left behind, and
                          the one a technical buyer reads first. "Egocentric
                          stereo" is a label; `left.mp4 + right.mp4 + imu.csv`
                          is the thing they have to write a loader for. */}
                      {t.outputs && (
                        <p
                          className="mt-2 font-mono text-[11.5px] leading-relaxed"
                          style={{ color: C.value }}
                        >
                          {t.outputs}
                        </p>
                      )}
                      {t.demoHref && (
                        <a
                          href={t.demoHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block font-mono text-[11px] underline decoration-1 underline-offset-4"
                          style={{ color: C.accent }}
                        >
                          Open the live 3D demo
                        </a>
                      )}
                    </div>
                    {/* No `t.price` column — see the comment on that field.
                        `firstMonth` sits under the ceiling because quoting only
                        the ceiling to somebody scheduling a pilot overstates
                        month one by up to four times. */}
                    <p
                      className="font-mono text-[11.5px] leading-relaxed md:text-right"
                      style={{ color: C.textMid }}
                    >
                      Ready in {t.ramp}
                      <br />
                      Up to {t.ceiling}
                      {t.firstMonth && (
                        <>
                          <br />
                          <span style={{ color: C.textDim }}>{t.firstMonth}</span>
                        </>
                      )}
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
