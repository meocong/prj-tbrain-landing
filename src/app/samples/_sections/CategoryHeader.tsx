"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { packStats, statsForCategory, type Category } from "@/lib/samples/categories";
import { HeroMosaic } from "./HeroMosaic";
import { C } from "./tokens";

/**
 * The category page's own hero.
 *
 * It was six stacked paragraphs on the page background: back link, h1,
 * what-it-is, the shelf hedge, a run-on mono line of nine figures, and the
 * preview caveat. Full-width body text, so the first thing a reader met on a
 * page selling video was 500px of prose and no video. A two-column version with
 * four posters beside the title was better and still read as a document.
 *
 * This is the same wall `/samples` opens with, scoped to one category: the
 * records in it, drifting, with the type printed over them. Two reasons that is
 * the right answer rather than a new invention.
 *
 * It is the site's own language. `/samples` already establishes that a hero
 * here is footage with type on it; a category page that opened some other way
 * would read as a different site one click in.
 *
 * And it is the one thing the competition cannot answer. `claru.ai/explore` and
 * `/explore/egocentric` both return zero `<img>` and zero `<video>`, read
 * 2026-09-09; `humanoidlayer.dev` prints format and licence per card and hosts
 * no player. A category header made of that category's own footage says what it
 * is before a word is read, and neither of them can copy it without the
 * footage.
 *
 * Shorter than the front door's, deliberately: `/samples` is allowed a full
 * viewport because the hero IS its opening claim, but this page has to reach
 * its clips. The nine figures come with it rather than sitting below, so the
 * scale claim lands on the footage that backs it.
 */

type Row = { slug: string; modality: string };
const ALL = samples as unknown as Row[];

export function CategoryHeader({ category: c }: { category: Category }) {
  const s = statsForCategory(c);
  const stats = packStats(c);
  const slugs = c.modality ? ALL.filter((r) => r.modality === c.modality).map((r) => r.slug) : [];

  const copy = (
    <>
      <Link
        href="/samples"
        className="inline-flex items-center gap-2 text-[13px]"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All categories
      </Link>

      <h1
        className="mt-6 text-balance text-5xl font-medium tracking-tight md:text-7xl"
        style={{
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.035em",
          lineHeight: 0.98,
          color: "#ffffff",
        }}
      >
        {c.name}
      </h1>

      <p
        className="mt-5 max-w-xl text-[15px] leading-relaxed md:text-base"
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        {c.whatItIs}
      </p>

      {c.shelf && (
        <p
          className="mt-3 max-w-xl text-[13px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.58)" }}
        >
          {c.shelf}
        </p>
      )}

      {stats.length > 0 && (
        /* On the footage rather than under it: the figures are a claim about
           what is in the wall behind them, and separating the two put a rule
           between a number and its evidence. */
        <dl
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 xl:grid-cols-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.16)", paddingTop: "1.25rem" }}
        >
          {stats.map((st) => (
            <div key={st.label}>
              <dd
                className="font-mono text-[24px] tracking-tight md:text-[30px]"
                style={{ color: "#ffffff", lineHeight: 1 }}
              >
                {st.value}
              </dd>
              <dt
                className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em]"
                style={{ color: "rgba(255,255,255,0.56)" }}
              >
                {st.label}
              </dt>
            </div>
          ))}
        </dl>
      )}
    </>
  );

  if (slugs.length > 0) {
    return (
      <section className="relative">
        <HeroMosaic slugs={slugs} heightClass="h-[76svh] min-h-[600px]">
          {copy}
        </HeroMosaic>
      </section>
    );
  }

  /* Nothing published. The wall would be a lie, so the band is a drawing:
     hatch, and the one figure that IS true about the category set large. Same
     height and same type so a reader moving between categories meets one
     header, not two. */
  return (
    <section
      className="relative flex min-h-[520px] w-full flex-col justify-center overflow-hidden"
      style={{
        background: `${C.band} repeating-linear-gradient(-45deg, ${C.hairline} 0 1px, transparent 1px 11px)`,
      }}
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 pb-10 pt-28 sm:px-8 lg:px-10 xl:px-16">
        <Link
          href="/samples"
          className="inline-flex items-center gap-2 text-[13px]"
          style={{ color: C.textMid }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All categories
        </Link>

        <h1
          className="mt-6 text-balance text-5xl font-medium tracking-tight md:text-7xl"
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.035em",
            lineHeight: 0.98,
            color: C.text,
          }}
        >
          {c.name}
        </h1>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed md:text-base" style={{ color: C.textMid }}>
          {c.whatItIs}
        </p>

        {c.held && (
          <div className="mt-10" style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: "1.25rem" }}>
            <p
              className="font-mono text-5xl tracking-tight md:text-6xl"
              style={{ color: C.value, lineHeight: 1 }}
            >
              {c.held.figure}
            </p>
            <p
              className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: C.textDim }}
            >
              {c.held.unit}
            </p>
          </div>
        )}

        {s.inFlight && (
          <p className="mt-8 max-w-2xl text-[13px] leading-relaxed" style={{ color: C.textMid }}>
            {s.inFlight}
          </p>
        )}
      </div>
    </section>
  );
}
