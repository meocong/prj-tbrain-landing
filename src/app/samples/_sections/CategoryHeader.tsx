"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { packStats, statsForCategory, type Category } from "@/lib/samples/categories";
import { HeroReel } from "./HeroReel";
import { CategoryDiagram } from "./CategoryDiagram";
import { GRADIENT_TEXT } from "./HeroWash";
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
 * It is now a reel of this category's own records — one clip full frame,
 * running into the next — with the name and the nine figures printed on it.
 *
 * Not the mosaic `/samples` opens with, which was the version before this. A
 * drifting wall of thirty tiles is the right argument for a front door, where
 * the claim is "catalogue"; a category page makes a narrower claim about one
 * kind of capture, and at tile size nothing is legible, so the wall said "lots"
 * where this page has to say "this". Footage with type on it either way, so it
 * still reads as the same site one click in.
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

type Row = { slug: string; modality: string; title: string };
const ALL = samples as unknown as Row[];

export function CategoryHeader({ category: c }: { category: Category }) {
  const s = statsForCategory(c);
  const stats = packStats(c);
  const fromRecords = c.modality
    ? ALL.filter((r) => r.modality === c.modality).map((r) => ({ slug: r.slug, title: r.title }))
    : [];
  // Records first; a category with none can still name its own footage.
  const reel = fromRecords.length > 0 ? fromRecords : (c.reel ?? []);

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

      {/* The gradient goes here and not on the front door's h1 for the reason
          the reference gives by example: physical-ai sets its whole sentence in
          white and gradients the single word "humanoids." One word carrying it
          is emphasis; a paragraph carrying it is decoration. A category name is
          one word, so this is the closest thing on these pages to that shape.

          `pb-1` because the gradient is a background clipped to the glyphs, and
          the descender on "g" in "Egocentric" and "Teleoperation" is clipped by
          the line box at lineHeight 0.98 without it. */}
      <h1
        className="mt-6 text-balance pb-1 text-5xl font-medium tracking-tight md:text-7xl"
        style={{
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.035em",
          lineHeight: 0.98,
          ...GRADIENT_TEXT,
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

      {/* What it is FOR, directly under what it is. R15: a page that only says
          what a thing is leaves the buyer to work out whether it serves them,
          and all six said only that. Set at the same size, dimmer, because it
          is the second half of one thought rather than a new one. */}
      <p
        className="mt-3 max-w-xl text-[15px] leading-relaxed md:text-base"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {c.forWhat}
      </p>

      {c.shelf && (
        <p
          className="mt-3 max-w-xl text-[13px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.58)" }}
        >
          {c.shelf}
        </p>
      )}

      {/* Records first; a category with none still has a figure, and until now
          the reel branch simply printed nothing — teleoperation and mocap
          opened on a hero carrying no number at all. */}
      {stats.length === 0 && c.held && (
        <dl
          className="mt-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.16)", paddingTop: "1.25rem" }}
        >
          <dd
            className="font-mono text-[30px] tracking-tight md:text-[38px]"
            style={{ color: "#ffffff", lineHeight: 1 }}
          >
            {c.held.figure}
          </dd>
          <dt
            className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em]"
            style={{ color: "rgba(255,255,255,0.56)" }}
          >
            {c.held.unit}
          </dt>
        </dl>
      )}

      {stats.length > 0 && (
        /* On the footage rather than under it: the figures are a claim about
           the records playing behind them, and separating the two put a rule
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

  if (reel.length > 0) {
    return (
      <section className="relative">
        <HeroReel items={reel} heightClass="h-[76svh] min-h-[600px]">
          {copy}
        </HeroReel>
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
      {/* The drawing, large and to the right, where the reel's footage sits on
          a category that has any. Drawn rather than borrowed: egocentric
          footage on the mocap header would be a lie about what we can show, and
          a hatch with a number on it was the thing this page was rebuilt to
          stop doing. */}
      <CategoryDiagram
        slug={c.slug}
        className="pointer-events-none absolute right-0 top-1/2 hidden h-[62%] w-[46%] -translate-y-1/2 opacity-[0.5] lg:block"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-10 pt-28 sm:px-8 lg:px-10 xl:px-16">
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
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed md:text-base" style={{ color: C.textDim }}>
          {c.forWhat}
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
