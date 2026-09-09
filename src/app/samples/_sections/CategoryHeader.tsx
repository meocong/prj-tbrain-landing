import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  facesFor,
  packStats,
  posterSrc,
  statsForCategory,
  type Category,
} from "@/lib/samples/categories";
import { C } from "./tokens";

/**
 * The top of a category page.
 *
 * It was six stacked paragraphs: back link, h1, what-it-is, the shelf hedge, a
 * run-on mono line carrying nine figures, and the preview caveat. Every one of
 * them full-width body text, so the first thing a reader met on a page selling
 * video was 500px of prose and no video.
 *
 * Three changes, in order of how much they matter:
 *
 * - **Footage in the header.** Four frames from four skill groups, the same
 *   round-robin the chooser card uses, so the page shows its subject before it
 *   describes it. The three categories with nothing published keep the figure
 *   they already carry rather than borrowing a neighbour's frames.
 * - **The nine figures become numerals.** They were a mono sentence in body
 *   type; none of them was findable and the whole line read as a caption. A
 *   figure set at display size with its own label is the one thing on this page
 *   that can be scanned rather than read.
 * - **Two columns.** The prose stops being full-bleed, which is what made it a
 *   wall — a 1,200px measure is unreadable regardless of what it says.
 *
 * The preview caveat stays, and stays last: it qualifies the clips, so it
 * belongs against them rather than under the title.
 */
export function CategoryHeader({ category: c }: { category: Category }) {
  const s = statsForCategory(c);
  const stats = packStats(c);
  const faces = facesFor(c, 4);

  return (
    <section>
      <div className="mx-auto max-w-[1400px] px-4 pt-32 md:pt-40 lg:px-10 xl:px-16">
        <Link
          href="/samples"
          className="inline-flex items-center gap-2 text-[13px]"
          style={{ color: C.textMid }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All categories
        </Link>

        <div className="mt-6 grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          <div className="min-w-0">
            <h1
              className="text-4xl font-medium tracking-tight md:text-6xl"
              style={{
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
              }}
            >
              {c.name}
            </h1>

            {/* The sentence the chip could never carry. Measured, not full-bleed. */}
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed" style={{ color: C.textMid }}>
              {c.whatItIs}
            </p>

            {c.shelf && (
              <p
                className="mt-3 max-w-xl text-[13.5px] leading-relaxed"
                style={{ color: C.textDim }}
              >
                {c.shelf}
              </p>
            )}
          </div>

          {faces.length > 0 ? (
            <div className="grid grid-cols-2 gap-[2px]" style={{ background: C.wash }}>
              {faces.map((slug) => (
                <span key={slug} className="relative block" style={{ aspectRatio: "4 / 3" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterSrc(slug)}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </span>
              ))}
            </div>
          ) : (
            c.held && (
              <div
                className="flex flex-col justify-end p-6"
                style={{
                  minHeight: "220px",
                  background: `repeating-linear-gradient(-45deg, ${C.hairlineSoft} 0 1px, transparent 1px 9px)`,
                }}
              >
                <span
                  className="font-mono text-4xl tracking-tight md:text-5xl"
                  style={{ color: C.value, lineHeight: 1 }}
                >
                  {c.held.figure}
                </span>
                <span
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: C.textDim }}
                >
                  {c.held.unit}
                </span>
              </div>
            )
          )}
        </div>

        {stats.length > 0 && (
          <dl
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 xl:grid-cols-8"
            style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: "1.5rem" }}
          >
            {stats.map((st) => (
              <div key={st.label}>
                <dd
                  className="font-mono text-[26px] tracking-tight md:text-[32px]"
                  style={{ color: C.value, lineHeight: 1 }}
                >
                  {st.value}
                </dd>
                <dt
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: C.textDim }}
                >
                  {st.label}
                </dt>
              </div>
            ))}
          </dl>
        )}

        {s.inFlight && (
          <p
            className="mt-10 max-w-3xl px-4 py-3 text-[13px] leading-relaxed"
            style={{ border: `1px solid ${C.hairline}`, background: C.band, color: C.textMid }}
          >
            {s.inFlight}
          </p>
        )}
      </div>
    </section>
  );
}
