"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion-pref";
import { ArrowRight } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { CAPABILITY } from "@/lib/samples/capability";
import { type Category } from "@/lib/samples/categories";
import { clipSrc, posterSrc, rigLayout, type ViewPlace } from "./rig-views";
import { C, EASE, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";
import { inTier, sharedInto } from "@/lib/samples/tiers";

/**
 * Egocentric, filed by camera configuration.
 *
 * The grouping the doc asks for and the one this page kept not having. Tam,
 * 2026-09-10: "Ego là mục lớn, trong ego có các mục nhỏ như trong doc chị ghi",
 * and on the skill grouping that was here instead: "chị đã phân theo group nói
 * từ hôm qua mà".
 *
 * It wears the SAME card as the front door — a clip with the name and one line
 * printed white on it — because Tam asked for exactly that: "chị muốn vào Ego
 * nó sẽ ra các category như em vào samples em thấy có 6 cái". The first version
 * of this file was a pair of posters over a block of grey type, which is the
 * "hơi random, ko có title của group" the page was already being told off for.
 *
 * The four come from `CAPABILITY.egocentric`, not from a list here: that is the
 * sheet sales quotes from, and a second copy would drift from it.
 *
 * **Configurations with no published samples still get a card.** Showing what we
 * run is the point — a buyer who needs wrist data should see that we shoot it.
 * Those cards say the ramp instead of a count, and lead to the catalogue's own
 * empty state, which answers with the capability panel.
 */

interface Row {
  modality: string;
  tier: string;
  alsoTiers?: string[];
  slug: string;
  durationSec: number;
}

const ALL = samples as unknown as Row[];

/** The doc's four, in its order. `rgbd` and `umi` are priced in the sheet but
    are not among them, so they stay in the price table and off this page. */
const SHOWN = ["mono", "stereo", "stereo6", "wrist"];

/**
 * The face for a configuration with no records of its own.
 *
 * Only the six-camera rig has one. Its footage is on the page already — the
 * same delivery `RigViews` cuts its six cells from — so the card can show the
 * real thing rather than a hatch. Nothing else gets a borrowed frame: putting
 * stereo footage on the wrist card would be a lie about what we can show.
 */
const STANDIN: Record<string, string> = { stereo6: "rig-six" };

/**
 * The card face shows as many lenses as the configuration is named for.
 *
 * Thạch, 2026-09-25: "nếu mà ghi stereo thì phải hiện 2, 4-6 phải hiện 4 hoặc 6,
 * còn wrist cam thì phải hiện 3". A single frame on the stereo card sold it as
 * the mono configuration. The lenses come from the same `rigLayout` the
 * catalogue and the record modal use — the pair on the stereo card, every
 * staged lens on the multi-camera one — laid out as the rig is worn.
 */
const lensMode = (tier: string) => (tier === "stereo6" ? "all" : "pair");

function pickFace(rows: Row[], tier: string) {
  let best: string | null = null;
  let most = 0;
  for (const r of rows) {
    const n = rigLayout(r.slug, lensMode(tier)).cells.length;
    if (n > most) {
      best = r.slug;
      most = n;
    }
  }
  return best;
}

/** Card-sized placement: [column, row, row span], keyed by the lens's place on
    the rig (its label), not by its file — a mirrored capture plays the other
    side's file in each place. See MIRRORED in rig-views.ts. */
const SIX_AT: Record<string, [number, number, number]> = {
  "outer · left": [1, 1, 2],
  "primary · left": [2, 1, 1],
  "primary · right": [3, 1, 1],
  "mid · left": [2, 2, 1],
  "mid · right": [3, 2, 1],
  "outer · right": [4, 1, 2],
};

function faceGrid(slug: string, tier: string) {
  const rig = rigLayout(slug, lensMode(tier));
  const cells = rig.cells;
  if (rig.kind === "six") {
    const hasOuter = cells.some((c) => c.label.startsWith("outer"));
    const at = (c: ViewPlace): [number, number, number] => {
      const [col, row, span] = SIX_AT[c.label] ?? [2, 1, 1];
      return [hasOuter ? col : col - 1, row, span];
    };
    return { cells, cols: hasOuter ? 4 : 2, rows: 2, at };
  }
  if (rig.kind === "body") {
    // The head camera large, the two wrists stacked beside it.
    return { cells, cols: 3, rows: 2, colSpan0: 2, at: (_c: ViewPlace, i: number): [number, number, number] =>
      i === 0 ? [1, 1, 2] : [3, i, 1] };
  }
  return { cells, cols: cells.length, rows: 1, at: (_c: ViewPlace, i: number): [number, number, number] => [i + 1, 1, 1] };
}

export function ConfigFolders({ category }: { category: Category }) {
  const reduce = useReducedMotion();
  if (!category.modality) return null;

  const tiers = (CAPABILITY[category.modality] ?? []).filter((t) => SHOWN.includes(t.key));
  if (tiers.length === 0) return null;

  const cards = tiers.map((t) => {
    const rows = ALL.filter((r) => r.modality === category.modality && inTier(r, t.key));
    const own = rows.filter((r) => !sharedInto(r, t.key));
    return {
      tier: t,
      count: rows.length,
      /* Records borrowed from another tier — the stereo captures that also
         carry the extra lenses — are counted apart from the tier's own, so the
         card never reads as one bigger pile than the catalogue holds. */
      own: own.length,
      ownHours: own.reduce((a, r) => a + r.durationSec, 0) / 3600,
      borrowed: rows.length - own.length,
      hours: rows.reduce((a, r) => a + r.durationSec, 0) / 3600,
      // A tier's own capture fronts its card; a borrowed one only if it has none.
      // Among its own, the one that shows the most lenses: the 4-6 camera card
      // must not be fronted by a hand-pose capture that stages two.
      face: pickFace(own.length ? own : rows, t.key) ?? STANDIN[t.key] ?? null,
    };
  });

  return (
    <section className="bp-grid bp-frame relative" style={{ color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:py-20 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="bp-mono text-[10px]" style={{ color: C.textDim }}>
            Camera configurations
          </h2>
          <p
            className="mt-4 max-w-2xl text-3xl font-medium tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em", lineHeight: 1.06 }}
          >
            Four rigs, one delivery pipeline.
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: C.textMid }}>
            Every configuration covers the same spread of trades, workplaces and difficulty —
            what changes is how much geometry ships with the picture. Off the shelf or collected
            to your spec, and convertible to any format you work in: MCAP, LeRobot, RLDS, HDF5.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
          {cards.map((c, i) => (
            <ConfigCard
              key={c.tier.key}
              href={`/samples/${category.slug}/${c.tier.key}`}
              name={c.tier.name}
              pitch={c.tier.pitch ?? c.tier.when ?? ""}
              state={
                c.own > 0 && c.borrowed > 0
                  ? `${c.own} playable · ${c.ownHours.toFixed(1)} h · + the ${c.borrowed} stereo captures on every lens`
                  : c.borrowed > 0
                  ? `Option · the same ${c.borrowed} captures, every lens`
                  : c.count > 0
                  ? `${c.count} playable · ${c.hours.toFixed(1)} h`
                  : `Collected to spec · first delivery in ${c.tier.ramp}`
              }
              face={c.face}
              tier={c.tier.key}
              index={i}
              reduce={Boolean(reduce)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ConfigCard({
  href,
  name,
  pitch,
  state,
  face,
  tier,
  index,
  reduce,
}: {
  href: string;
  name: string;
  pitch: string;
  state: string;
  face: string | null;
  tier: string;
  index: number;
  reduce: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const grid = face ? faceGrid(face, tier) : null;

  const enter = () => {
    if (reduce || !face) return;
    setArmed(true);
    for (const v of videos.current) v?.play().catch(() => {});
  };
  const leave = () => {
    for (const v of videos.current) v?.pause();
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: EASE }}
    >
      <Link
        href={href}
        className="bp-card bp-card-hover group relative block overflow-hidden"
        onMouseEnter={enter}
        onMouseLeave={leave}
      >
        {/* One box, whatever is in it.

            A card with no footage used to draw a 16:10 hatch and then put its
            type in a white block UNDERNEATH, so it stood twice as tall as a
            card with a clip and left a large empty rectangle above the words.
            Four cards in a grid, two of them double height around a blank.

            Now every card is the same 16:10 frame with the type laid on it. The
            backdrop is footage where there is footage and a drawing hatch where
            there is not, and the type sits at the foot of both. */}
        <div className="relative aspect-16/10 w-full overflow-hidden" style={{ background: C.wash }}>
          {face && grid ? (
            <div
              className="grid h-full w-full gap-px transition-transform duration-500 group-hover:scale-[1.03]"
              style={{
                gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
                background: C.base,
              }}
            >
              {grid.cells.map((cell, i) => {
                const [col, row, span] = grid.at(cell, i);
                return (
                  <div
                    key={cell.view || "base"}
                    className="relative min-h-0 overflow-hidden"
                    style={{
                      gridColumn: i === 0 && "colSpan0" in grid ? `${col} / span ${grid.colSpan0}` : col,
                      gridRow: `${row} / span ${span}`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterSrc(face, cell.view)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    {armed && (
                      <video
                        ref={(el) => {
                          videos.current[i] = el;
                        }}
                        src={clipSrc(face, cell.view)}
                        poster={posterSrc(face, cell.view)}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="none"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Nothing shot on this rig yet, and no honest frame to borrow —
               putting stereo footage on the wrist card would be a lie about
               what we can show. A hatch says "not footage" and says it at the
               same size as the cards that are. */
            <div
              className="h-full w-full"
              style={{
                background: `repeating-linear-gradient(-45deg, ${C.hairlineSoft} 0 1px, transparent 1px 10px)`,
              }}
            />
          )}

          {/* The wash under the type. Dark over footage so white reads; a pale
              one over the hatch so ink does. Either way it is bottom-weighted,
              so the top of the frame is never dimmed for two lines at its
              foot. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: face
                ? OVER_MEDIA.wash
                : `linear-gradient(180deg, transparent 0%, ${C.base} 62%, ${C.base} 100%)`,
            }}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-5 md:p-6">
            <span className="flex items-baseline justify-between gap-4">
              <span
                className="text-xl font-medium tracking-tight md:text-2xl"
                style={{
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "-0.02em",
                  color: face ? OVER_MEDIA.title : C.text,
                }}
              >
                {name}
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: face ? OVER_MEDIA.text : C.textDim }}
              />
            </span>

            <span
              className="mt-2 line-clamp-2 max-w-xl text-[13px] leading-relaxed"
              style={{ color: face ? OVER_MEDIA.text : C.textMid }}
            >
              {pitch}
            </span>

            <span
              className="bp-mono mt-3 block text-[10px]"
              style={{ color: face ? OVER_MEDIA.textDim : C.accent }}
            >
              {state}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
