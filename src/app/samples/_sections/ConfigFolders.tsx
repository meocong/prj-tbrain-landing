"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { CAPABILITY } from "@/lib/samples/capability";
import { clipSrc, posterSrc, type Category } from "@/lib/samples/categories";
import { C, EASE, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";

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

export function ConfigFolders({ category }: { category: Category }) {
  const reduce = useReducedMotion();
  if (!category.modality) return null;

  const tiers = (CAPABILITY[category.modality] ?? []).filter((t) => SHOWN.includes(t.key));
  if (tiers.length === 0) return null;

  const cards = tiers.map((t) => {
    const rows = ALL.filter((r) => r.modality === category.modality && r.tier === t.key);
    return {
      tier: t,
      count: rows.length,
      hours: rows.reduce((a, r) => a + r.durationSec, 0) / 3600,
      face: rows[0]?.slug ?? STANDIN[t.key] ?? null,
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
              rig={c.tier.rig}
              pitch={c.tier.pitch ?? c.tier.when ?? ""}
              state={
                c.count > 0
                  ? `${c.count} playable · ${c.hours.toFixed(1)} h`
                  : `Collected to spec · first delivery in ${c.tier.ramp}`
              }
              face={c.face}
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
  rig,
  pitch,
  state,
  face,
  index,
  reduce,
}: {
  href: string;
  name: string;
  rig: string;
  pitch: string;
  state: string;
  face: string | null;
  index: number;
  reduce: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const video = useRef<HTMLVideoElement | null>(null);

  const enter = () => {
    if (reduce || !face) return;
    setArmed(true);
    video.current?.play().catch(() => {});
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
        onMouseLeave={() => video.current?.pause()}
      >
        <div className="relative aspect-16/10 w-full overflow-hidden" style={{ background: C.wash }}>
          {face ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterSrc(face)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {armed && (
                <video
                  ref={video}
                  src={clipSrc(face)}
                  poster={posterSrc(face)}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </>
          ) : (
            /* Nothing shot on this rig yet, and no honest frame to borrow. */
            <div
              className="h-full w-full"
              style={{
                background: `repeating-linear-gradient(-45deg, ${C.hairlineSoft} 0 1px, transparent 1px 10px)`,
              }}
            />
          )}
        </div>

        {face && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: OVER_MEDIA.wash }}
          />
        )}

        {/* Type sits on the footage where there is footage and on the card
            surface where there is not — white on a light hatch is unreadable. */}
        <div
          className={`flex flex-col p-5 md:p-6 ${face ? "pointer-events-none absolute inset-0 justify-end" : ""}`}
          style={face ? undefined : { borderTop: `1px solid ${C.hairline}` }}
        >
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
            className="bp-mono mt-2 block text-[10px]"
            style={{ color: face ? OVER_MEDIA.textDim : C.textDim }}
          >
            {rig}
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
      </Link>
    </motion.div>
  );
}
