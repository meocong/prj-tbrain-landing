import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { posterSrc, skillFolders, type Category } from "@/lib/samples/categories";
import { C } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * The folder level: what a configuration holds, before any of it plays.
 *
 * This replaced `SampleCatalog` on the category page, and the reason is a
 * measurement. The flat grid opened with 24 cards, each mounting a `<video>`,
 * on a page whose modality holds 118 records — so arriving at
 * `/samples/egocentric` meant asking for two dozen media elements before
 * knowing whether any of them was the kind of work you came for.
 *
 * Tam's reference does the opposite: `claru.ai/explore/egocentric/processed`
 * is folders with a couple of stills each and an "Open folder", and nothing
 * plays until you have chosen. That is the shape here.
 *
 * The hard rule for this file: **no `<video>`**. Two posters per card at ~55 KB
 * is the entire media budget of the level, and it is what lets the page hold
 * sixteen folders for less than the old grid spent on four cards. The catalogue
 * still exists, one click down, with its facet rail intact.
 */
export function SkillFolders({ category }: { category: Category }) {
  if (!category.modality) return null;
  const folders = skillFolders(category.modality);
  if (folders.length === 0) return null;

  const total = folders.reduce((a, f) => a + f.count, 0);

  return (
    <section className="bp-grid bp-frame relative" style={{ color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:py-20 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="bp-mono text-[10px]" style={{ color: C.textDim }}>
            Browse the set
          </h2>
          <p
            className="mt-4 max-w-2xl text-3xl font-medium tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em", lineHeight: 1.06 }}
          >
            {folders.length} groups, {total} records.
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: C.textMid }}>
            Open one to play its clips and read the capture metadata. Every group ships the same
            way; what changes is the work in front of the camera.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((f, i) => (
            <Reveal key={f.slug} variant="rise" delay={Math.min(i, 5) * 0.04}>
              <Link
                href={`/samples/${category.slug}/${f.slug}`}
                className="bp-card bp-card-hover group block overflow-hidden"
              >
                {/* Two stills, side by side. Enough to say what the work looks
                    like; few enough that sixteen cards stay affordable. */}
                <div className="grid grid-cols-2 gap-px" style={{ background: C.hairline }}>
                  {f.faces.map((slug) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={slug}
                      src={posterSrc(slug)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-4/3 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ))}
                  {/* A folder holding a single record still needs both cells
                      filled, or the card goes ragged against its neighbours. */}
                  {f.faces.length === 1 && (
                    <div className="aspect-4/3 w-full" style={{ background: C.wash }} />
                  )}
                </div>

                <div className="p-4" style={{ borderTop: `1px solid ${C.hairline}` }}>
                  <span className="flex items-baseline justify-between gap-3">
                    <span
                      className="text-[15px] font-medium"
                      style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.01em" }}
                    >
                      {f.name}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: C.textDim }}
                    />
                  </span>
                  <span className="bp-mono mt-2 block text-[10px]" style={{ color: C.accent }}>
                    {f.count} {f.count === 1 ? "record" : "records"} · {f.minutes.toFixed(1)} min
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
