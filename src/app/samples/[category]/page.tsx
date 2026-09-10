import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/common/Header";
import { ScrollProgress } from "@/components/marketing/fx/ScrollProgress";
import Footer from "@/components/common/Footer";
import {
  CATEGORIES,
  categoryBySlug,
  statsForCategory,
  usesFolders,
  usesConfigFolders,
} from "@/lib/samples/categories";
import { INTEROP } from "@/lib/samples/capability";
import { axesFor } from "@/lib/samples/datasets";
import { LICENSE, QUALIFIER } from "@/lib/samples/license";
import { SkillFolders } from "../_sections/SkillFolders";
import { ConfigFolders } from "../_sections/ConfigFolders";
import { CapabilityTable } from "../_sections/CapabilityTable";
import { AdvancedAnnotation } from "../_sections/AdvancedAnnotation";
import { SampleCatalog } from "../_sections/SampleCatalog";
import { TwoRoutes } from "../_sections/TwoRoutes";
import { CoverageChart } from "../_sections/CoverageChart";
import { CategoryHeader } from "../_sections/CategoryHeader";
import { MocapDemo } from "../_sections/MocapDemo";
import { OtsShelf } from "../_sections/OtsShelf";
import { GamingSet } from "../_sections/GamingSet";
import { TeleopSet } from "../_sections/TeleopSet";
import { TelemetryStrip } from "../_sections/TelemetryStrip";
import { Evidence } from "../_sections/Evidence";
import { TeleopAnatomy } from "../_sections/TeleopAnatomy";
import { CaptureSpec } from "../_sections/CaptureSpec";
import { RigViews } from "../_sections/RigViews";
import { AccessPaths } from "../_sections/AccessPaths";
import { Reveal } from "../_sections/Reveal";
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

/**
 * Categories that stop after the catalogue.
 *
 * The tail of this page — coverage chart, the two purchase routes, the licence
 * table and the evidence strip — is the shelf story, and it is written for a
 * corpus sold by the hour off a capability sheet. Gaming is not sold that way
 * and mocap has no off-the-shelf shelf at all, so on both it was answering
 * questions nobody had asked about stock we do not hold.
 */
const TAIL_CUT = new Set(["gaming", "mocap"]);

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
    <div className="samples-scope bp-chrome" style={{ background: C.base }}>
      <ScrollProgress />
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


        {/* Mocap first: its product IS the explorer, and a pose stream behind
            a spec table is an instrument filed as a document. Every other
            category's samples sit below their spec because their samples are
            footage; this one's are the reading. */}
        {c.slug === "mocap" && <MocapDemo />}

        {/* What records this category, before anything about what is in it.
            It is the first question a technical buyer asks, and it is the one
            block that makes this page not interchangeable with the next one. */}
        <CaptureSpec category={c} />

        {/* Directly under the block that CLAIMS six cameras in three stereo
            pairs, because until now the page made that claim and then showed a
            single 576x432 eye. Egocentric only: the clips are cut from an
            egocentric delivery file and nothing else in the catalogue is a
            six-camera capture. */}
        {c.slug === "egocentric" && <RigViews />}

        {/* The tiers, ABOVE the clips.
            They were below, moved there when the header was five paragraphs of
            prose and this block put 3,417px between arriving and playing
            anything. The header is footage now, so that cost is gone — and
            measured on the page as it stood, the answer to "what kinds of
            egocentric are there" sat at 11,929px of a 14,051px page, last
            before the licence.

            Both competitors introduce before they sample. claru.ai/data-catalog
            runs hero, then "Two ways to get the data you need", then "What's in
            the catalog", and only then "Browse the catalog";
            /explore/egocentric names Processed and Not processed before it
            shows a folder. R1 is this block, and R1 is a question a reader has
            before they look, not after.

            It sits under "How this is captured" because the two are the same
            subject from two sides: that block is the rig behind the records
            below, this one is every configuration we run. */
        }
        {s.tiers.length > 0 && (
          <section>
            <div className="mx-auto max-w-[1400px] px-4 pb-4 pt-14 lg:px-10 xl:px-16">
              <Reveal variant="rise">
                <h2
                  className="bp-mono text-[10px]"
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
                        className="bp-mono text-[10px]"
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

                {/* Was five stacked blocks of about eighty words each. Tam,
                    2026-09-10: "em bảo Claude làm sao bố trí cho nó visual + đẹp
                    dễ nhìn, ko quá nhiều chữ." Now a four-column matrix.

                    `showWhen` only where there are no configuration cards above
                    to carry the guidance — on egocentric that copy is the
                    `pitch` on each ConfigFolders card. */}
                <CapabilityTable tiers={s.tiers} showWhen={!usesConfigFolders(c.modality)} />


                <p
                  className="mt-5 pt-4 font-mono text-[11px]"
                  style={{ borderTop: `1px solid ${C.hairline}`, color: C.textDim }}
                >
                  Delivered as {INTEROP}
                </p>

              </Reveal>
            </div>
          </section>
        )}


        {/* The per-category set, AFTER the two blocks that introduce it.
            It was before them, which meant teleoperation opened "play the set"
            above "how this is captured" — show, then explain. Both competitors
            do the reverse and so does every other category here now: the rig
            and the configurations answer questions a reader has before they
            look, and the set answers the one they have after. */}
        {/* Teleoperation's product is three synchronised cameras plus a joint
            stream, so it gets a three-up on one transport rather than a grid of
            single clips. Same place the clips sit on every other category. */}
        {c.slug === "teleoperation" && <TeleopSet />}

        {/* And the row a policy actually reads. The set above is what a person
            watches; this is the sixteen numbers under it. */}
        {c.slug === "teleoperation" && <TeleopAnatomy />}

        {/* Gaming's product is the input stream and the camera pose, not the
            footage, and the page said that in a facet rail and nowhere else.
            R8 and R16. */}
        {/* F2, Tam: "phần kia nếu nó dành cho Video games thì em để thêm ở
            phần click vào video games." TelemetryStrip decimates Watch Dogs 2
            input state and a two-player GTA V session — it is as game-specific
            as anything on the site, and it was on the front door, where five of
            six categories have no use for it.

            Above GamingSet rather than below: it argues why the input stream
            is the product, and GamingSet is the eight titles that carry one. */}
        {c.slug === "gaming" && <TelemetryStrip />}
        {c.slug === "gaming" && <GamingSet />}

        {/* Folders where they earn the click, the grid where they do not.

            The grid opened with 24 mounted <video> elements on a modality
            holding 118 records — every visit paid for two dozen media elements
            before the reader knew whether any of them was the work they came
            for. Folders fix that, and one level down at
            /samples/<category>/<group> the catalogue is unchanged, facet rail
            and all.

            But gaming carries no skill groups — its axes are the game and the
            session type, which live in `spec` — so the folder view came back
            empty and took the catalogue with it: eight records and no way to
            open one. `usesFolders` is that check. */}
        {usesConfigFolders(c.modality) ? (
          <ConfigFolders category={c} />
        ) : usesFolders(c.modality) ? (
          <SkillFolders category={c} />
        ) : (
          <SampleCatalog modality={c.modality} />
        )}

        {/* Tam, 2026-09-10: "chị nghĩ cho Egocentric nó có đoạn trên nói về
            phần video, các thể loại video khác nhau. Xong ở dưới còn thêm ý
            Advanced annotation." So it sits under the configurations and their
            samples — a reader has seen what the footage looks like by the time
            this says what rides with it. */}
        {c.slug === "egocentric" && <AdvancedAnnotation />}

        {/* The other purchase route, with footage. Everything in the grid
            above is a stereo rig delivery — the custom side — and "Off the
            shelf" was a paragraph about 12,900 episodes nobody could see a
            frame of. The capability sheet had a Sample Link per skill all
            along. */}
        {c.slug === "egocentric" && <OtsShelf />}

        {/* The mix, AFTER the clips. humanoidlayer.dev prints its facet
            values on the page and we copied that literally, which on 118
            egocentric records meant 78 workplace strings in one alphabetical
            paragraph — their catalogue has eight datasets, ours needed the
            counts. Above the clips it also cost 750px: measured, the first
            playable clip sat at 3,211px, worse than the 3,417px this page was
            rebuilt to fix. It is shelf story, so it sits with the shelf story.
            CaptureSpec stays above because it is short and it is what makes
            this page not the next one. */}
        {/* Tam, 2026-09-10: "Trang game, toàn bộ đoạn dưới của nó ko cần em
            nhé. Trang Mocap đoạn dưới cũng cắt hết, từ Off The Shelf trở đi vì
            mình ko có."

            Gated rather than deleted — the other categories still want it. What
            follows is the shelf story: coverage, the two purchase routes, the
            licence and the evidence strip. On gaming it argued about a corpus
            the page does not sell that way, and on mocap it described an
            off-the-shelf shelf that does not exist. */}
        {!TAIL_CUT.has(c.slug) && (
          <>
        <CoverageChart modality={c.modality} />

        {/* R2, per category: the same two routes as the front door, with this
            category's own published count on one side and its own cheapest tier
            and ramp on the other. A reader who saw the front-door version reads
            the same two paragraphs here, so it is one offer stated twice with
            different numbers rather than two offers. */}
        <TwoRoutes category={c} />

        {/* Licence, once per page rather than once per card, because it is the
            same for everything in the category. */}
        <section>
          <div className="mx-auto max-w-[1400px] px-4 pb-24 lg:px-10 xl:px-16">
              <Reveal variant="rise">
              <h2
                className="bp-mono text-[10px]"
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

              </Reveal>
          </div>
        </section>

        {/* Has it shipped before, and may I train on it. Moved off the front
            door (F1) to sit against the licence table, which answers the second
            half — the two were a page apart there and are one thought. */}
        <Evidence line={c.line} />
          </>
        )}

        <AccessPaths />
      </main>
      <Footer />
    </div>
  );
}
