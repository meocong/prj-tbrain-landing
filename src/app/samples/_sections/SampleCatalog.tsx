"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, Search, SlidersHorizontal, X } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { rigLayout } from "./rig-views";
import { inTier } from "@/lib/samples/tiers";
import { SKILL_GROUPS, JOBS, INDUSTRIES } from "@/lib/samples/taxonomy";
import { FacetPicker, SortPicker } from "./Fields";
import { PILL_KINDS_DROPPED, publicSpec } from "@/lib/samples/redact.mjs";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";
import { CAPABILITY, IN_FLIGHT, INTEROP } from "@/lib/samples/capability";
import { type LineKey } from "@/lib/samples/datasets";
import { OPEN_RECORD_EVENT, frameFromUrl, type OpenRecordDetail } from "@/lib/samples/open-record";
import { AccessStrip } from "./AccessActions";
import { LiveTelemetry } from "./LiveTelemetry";
import { C, OVER_MEDIA, PILL, type Sample } from "./tokens";
import { SampleModal } from "./SampleModal";
import { Reveal } from "./Reveal";

/**
 * Faceted catalog.
 *
 * Facets live in a left rail rather than a top bar: four controls already
 * filled the width, and search and sort had nowhere to go. They are multi
 * select, because a buyer wants "cleaning and food prep", not one or the
 * other. Counts are computed against the set filtered by every *other* facet,
 * so a chip showing a number can never lead to an empty grid.
 *
 * Jobs stay a select. 235 chips is a wall, not a filter.
 */

const ALL = samples as unknown as Sample[];

/* The staged views and the rig elevation moved to `rig-views.ts` when the
   record modal needed the same two things. One table, two surfaces. */

/* Hand pose is published on staging and not yet on production (HAND_POSE_ON,
   decided in `next.config.ts`). Its card and its metrics are loaded under that
   condition, and the condition is written out against `process.env` HERE
   rather than imported from `flags.ts`: a bundler can only drop the dead
   `require` when the condition sits in the same file as the call, and this
   component ships on every category page, so a static import would put the
   hand-pose metrics in production's JavaScript. `downloads.ts` does the same
   for the manifest. Keep the literal in step with `HAND_POSE_ON`. */
type HandPoseLib = typeof import("@/lib/samples/handpose");
const HP: HandPoseLib | null =
  process.env.HAND_POSE_ON === "1"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@/lib/samples/handpose")
    : null;
const HandPoseCard: typeof import("./handpose/HandPoseCard").HandPoseCard | null =
  process.env.HAND_POSE_ON === "1"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./handpose/HandPoseCard").HandPoseCard
    : null;

/** The metrics behind a hand-pose record: what its sorts and its tile counts read. */
const handPoseOf = (s: Sample) => HP?.handPoseSample(s.slug) ?? null;


/**
 * Cards revealed per step.
 *
 * Was 24, from when this grid WAS the category page and had to look like a
 * catalogue on arrival. A folder level now sits above it, so the reader has
 * already narrowed to one kind of work before they get here and twelve is a
 * full screen with a "Show more" one press away. Each card mounts a `<video>`,
 * so this number is the page's media budget more than it is a row count.
 *
 * It is the default. A catalogue that wants another asks with `pageSize`: hand
 * pose holds sixteen records, mounts two videos, and shows them on one page.
 */
const PAGE = 12;

/**
 * What a record IS. The rail used to offer "Robotics", "Video game" and "Off the
 * shelf" as one choice, which asked the reader to pick between a subject and a
 * purchase route: all 39 "off the shelf" records are robotics egocentric stereo,
 * captured on the same rigs as the 79 filed under "robotics". Picking one
 * excluded the other for no reason a buyer would recognise.
 *
 * The five values are the ones the catalogue is being rebuilt around. Three of
 * them hold nothing yet, and are listed anyway and left PRESSABLE at zero —
 * unlike every other facet, where zero means no such record. Here zero means
 * unpublished, not unavailable: pressing it returns the price sheet
 * (`CapabilityPanel`), which is what the spreadsheet this page replaces would
 * have answered.
 *
 * Teleoperation was held back while the only evidence for it was a spreadsheet
 * subtitle. There is now a dataset — 11 bimanual episodes in LeRobot v2.1 — so
 * it is a line, and the panel states what is in it rather than quoting a rig.
 */
const MODALITIES = [
  { key: "egocentric", label: "Egocentric" },
  { key: "exocentric", label: "Exocentric" },
  { key: "teleoperation", label: "Teleoperation" },
  { key: "mocap", label: "Mocap" },
] as const;

/** Where a record came from — the other half of the old `domain` field. */
const SOURCES = [
  { key: "ots", label: "Off the shelf" },
  { key: "custom", label: "Custom collection" },
] as const;

const VIEWPOINTS = [
  { key: "first-person", label: "First person" },
  { key: "third-person", label: "Third person" },
] as const;

const SORTS = [
  { key: "longest", label: "Longest source" },
  { key: "shortest", label: "Shortest source" },
  { key: "live", label: "Live data first" },
  { key: "title", label: "Title" },
] as const;

/**
 * Hand pose has no live data to put first, and one thing a buyer ranks by that
 * no other category has: how much of the clip carries a 3D pose. That one runs
 * HIGH TO LOW and says so in its label. The question is "which clips can I
 * evaluate on", so the best come first; it is the lower hand's share, because a
 * clip with one good hand and one that is mostly absent is not a good clip for
 * work with both. The preview sort leads because it is the default: the two
 * samples with a skeleton video are the ones a first visit should open.
 */
const HANDPOSE_SORTS = [
  { key: "preview", label: "Video preview first" },
  { key: "number", label: "Sample number" },
  { key: "pose", label: "3D pose share, lower hand, high to low" },
  { key: "longest", label: "Longest source" },
  { key: "shortest", label: "Shortest source" },
  { key: "title", label: "Title" },
] as const;

type SortKey = (typeof SORTS)[number]["key"] | (typeof HANDPOSE_SORTS)[number]["key"];

/** Every other category keeps exactly the four sorts and the default it always had. */
const sortsFor = (scope: string): readonly { key: SortKey; label: string }[] =>
  scope === "handpose" ? HANDPOSE_SORTS : SORTS;
const defaultSort = (scope: string): SortKey => (scope === "handpose" ? "preview" : "longest");

interface Filters {
  /** The category. Fixed by the route; never a facet on this page. */
  scope: string;
  modality: string[];
  /**
   * The capture configuration, keyed by `CapabilityTier["key"]`.
   *
   * This is the sub-category the catalogue never had. `/samples/egocentric`
   * sells five configurations and published records for exactly one of them, so
   * a buyer who came for wrist-camera data saw 118 stereo records and no sign
   * that the other four exist. The chips below stay pressable at zero for that
   * reason — see `Chip.quotable` and `emptyTier`.
   */
  tier: string[];
  provenance: string[];
  viewpoint: string[];
  skillGroup: string[];
  industry: string[];
  /**
   * Site type — the business, not the corner of it.
   *
   * R14 asks for an environment filter and there was none: `environment` was a
   * chart axis and nothing else, so a buyer could see that the catalogue holds
   * 31 site types and could not narrow to one. The raw field crosses two axes
   * ("Auto Repair, Service Bay"), so the facet takes the half before the comma
   * — 31 values instead of 78 compounds.
   */
  site: string[];
  job: string;
  /**
   * Facets that exist on one category and nowhere else, keyed by the `spec`
   * field they read.
   *
   * The rail was six fixed groups written for egocentric — Source, Viewpoint,
   * Skill group, Industry, Rig, Job — and every category got all six whether
   * its records carried them or not. Gaming has no trade, no industry and one
   * viewpoint, so a gaming buyer was handed five controls that could not narrow
   * anything and one that could. Its real axes are in `spec`: Title, Session
   * type, Stress category.
   */
  spec: Record<string, string[]>;
  q: string;
}

/**
 * The `spec` keys each category offers as facets.
 *
 * Egocentric's axes are typed fields on `Sample` and stay above; this is for
 * the ones that only exist inside `spec`, which differ per category by nature.
 */
interface SpecFacet {
  key: string;
  title: string;
  order?: string[];
  /**
   * Capitalise the chip label. On by default, because the source stores `hard`
   * and `combat`; off where the data already says what it means ("95% or more"
   * would print as "95% Or More").
   */
  caps?: boolean;
  /**
   * Count each chip against the OTHER spec facets as well. Off by default,
   * which is how egocentric and gaming have always counted: every spec facet is
   * lifted at once, so with two on, a chip's number ignores the other's pick
   * and can promise records the combination does not have. Hand pose has two,
   * and a count that leads to an empty grid is the one thing this rail is
   * written never to do.
   */
  cross?: boolean;
}

const SPEC_FACETS: Record<string, SpecFacet[]> = {
  egocentric: [
    // A scale, so the chips follow it. Sorted alphabetically they would read
    // easy, hard, medium — a difficulty scale that goes down and then up.
    // R3, R12 and R14 all ask for this and it was on no page at all.
    { key: "Difficulty", title: "Difficulty", order: ["easy", "medium", "hard"] },
  ],
  gaming: [
    { key: "Title", title: "Game" },
    { key: "Session type", title: "Session" },
    { key: "Stress category", title: "Stress" },
  ],
  /* Hand pose's two axes. Both are rows the records carry in `spec` (the
     builder writes them from the same metrics the cards draw), and both are
     scales or two-way splits, so the order is fixed rather than alphabetical:
     the lower-cased values are what `order` is matched against. */
  handpose: [
    {
      key: "Both hands with 3D pose",
      title: "Both hands with 3D pose",
      order: ["95% or more", "80 to 95%", "below 80%"],
      caps: false,
      cross: true,
    },
    {
      key: "Preview",
      title: "Preview",
      order: ["video preview", "preview on request"],
      caps: false,
      cross: true,
    },
  ],
};

const specCell = (s: Sample, key: string) => s.spec?.find((p) => p[0] === key)?.[1] ?? null;

const EMPTY: Filters = {
  scope: "egocentric",
  modality: [],
  tier: [],
  provenance: [],
  viewpoint: [],
  skillGroup: [],
  industry: [],
  site: [],
  job: "all",
  spec: {},
  q: "",
};

/**
 * Which page numbers to print, with gaps.
 *
 * A hundred and eighteen records at twelve a page is ten buttons, which is a
 * row of numbers rather than a control. This keeps the ends, the current page
 * and its neighbours, and returns `null` where a run was elided.
 */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const keep = new Set([0, total - 1, current, current - 1, current + 1]);
  const out: (number | null)[] = [];
  let gap = false;
  for (let i = 0; i < total; i++) {
    if (keep.has(i)) {
      out.push(i);
      gap = false;
    } else if (!gap) {
      out.push(null);
      gap = true;
    }
  }
  return out;
}

function PageButton({
  label,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className="bp-mono min-w-9 rounded-lg px-3 py-2 text-[11px] transition-colors disabled:opacity-40"
      style={{
        border: `1px solid ${active ? C.accent : C.hairline}`,
        background: active ? C.accentSoft : "transparent",
        color: active ? C.text : C.textMid,
      }}
    >
      {label}
    </button>
  );
}

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Within a facet the selected values are OR-ed; across facets they are AND-ed.
 *
 * `liftSpec` lifts ONE spec facet and keeps the rest, where `skip: "spec"`
 * lifts them all — see `SpecFacet.cross`.
 */
function matches(s: Sample, f: Filters, skip?: keyof Filters, liftSpec?: string) {
  const on = (k: keyof Filters) => k !== skip;
  // Scope sits outside `skip`: it is the route, not a facet, so a facet count
  // is always computed WITHIN the category the reader opened.
  if (s.modality !== f.scope) return false;
  if (on("modality") && f.modality.length && !f.modality.includes(s.modality)) return false;
  // `inTier`, not `s.tier`: a stereo capture from the multi-camera rig also
  // serves the 4-6 camera option, and must answer to either chip.
  if (on("tier") && f.tier.length && !f.tier.some((t) => inTier(s, t))) return false;
  // `provenance` is null on the game records: no game record states whether it
  // is off-the-shelf or custom, so narrowing to either has to exclude them
  // rather than quietly assign them a side.
  if (on("provenance") && f.provenance.length && !(s.provenance && f.provenance.includes(s.provenance)))
    return false;
  if (on("viewpoint") && f.viewpoint.length && !f.viewpoint.includes(s.viewpoint)) return false;
  if (on("skillGroup") && f.skillGroup.length && !(s.skillGroup && f.skillGroup.includes(s.skillGroup)))
    return false;
  if (on("industry") && f.industry.length && !(s.industry && f.industry.includes(s.industry)))
    return false;
  if (on("site") && f.site.length) {
    const site = (s.environment ?? "").split(",")[0]?.trim();
    if (!site || !f.site.includes(site)) return false;
  }
  if (on("job") && f.job !== "all" && s.job !== f.job) return false;
  if (on("spec")) {
    for (const [key, picked] of Object.entries(f.spec)) {
      if (!picked.length || key === liftSpec) continue;
      const v = specCell(s, key);
      if (!v || !picked.includes(v)) return false;
    }
  }
  if (on("q") && f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    // Not `s.rig`: the rig name is not printed anywhere on this page any more
    // (see redact.mjs), and leaving it in the haystack means typing a rig name
    // still returns its records — which is the same disclosure, one step later.
    const hay = `${s.title} ${s.label} ${s.environment} ${s.skillGroup ?? ""} ${s.job ?? ""}`;
    if (!hay.toLowerCase().includes(q)) return false;
  }
  return true;
}

/** Copies the record as JSON, which is the shape a buyer pastes into a ticket. */
function CopyRecord({ sample }: { sample: Sample }) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    const record = {
      slug: sample.slug,
      domain: sample.domain,
      title: sample.title,
      duration_sec: sample.durationSec,
      resolution: sample.resolution,
      fps: sample.fps,
      streams: sample.streams,
      formats: sample.formats,
      size: sample.size,
      // Same redaction the rendered record gets: this button exists so a buyer
      // can paste the record into a ticket, and a pasted record travels further
      // than the page does.
      ...Object.fromEntries(publicSpec(sample.spec)),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(record, null, 2));
      track("copy_record", { slug: sample.slug, domain: sample.domain });
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // Clipboard is blocked on insecure origins and in some embeds. The values
      // are selectable text either way, so there is nothing to recover from.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="bp-mono inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] transition-colors"
      style={{ border: `1px solid ${C.hairline}`, color: done ? C.accent : C.textMid }}
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {done ? "Copied" : "Copy JSON"}
    </button>
  );
}

function Card({
  sample,
  onOpen,
  lensMode = "pair",
}: {
  sample: Sample;
  onOpen: () => void;
  /** See `rigLayout`: "all" only on the page selling the multi-lens option. */
  lensMode?: "pair" | "all";
}) {
  /**
   * Every view that is actually on disk for this record.
   *
   * See `scripts/samples/index-views.mjs` for why this is a generated list
   * rather than something the card works out: it is a client component and
   * cannot look at the filesystem, and 800 speculative HEAD requests is not a
   * way to find out which files exist.
   *
   * A six-camera record that is missing a lens — `garment-sewing` has five,
   * one file in the delivery will not decode — still lays out as the rig. The
   * hole is where that camera is, which is the honest picture of what shipped;
   * closing it up would draw a five-camera rig that does not exist.
   */
  const { cells: lenses, kind, band, cols } = rigLayout(sample.slug, lensMode);
  const sixUp = kind === "six";
  const bodyUp = kind === "body";
  const pair = kind === "pair";
  /* Two grid slots either way. Tam, 2026-09-10: "để nguyên 3 cột như này nó
     làm cho 2 cam kết hợp nhau bị nhỏ đi" — a multi-view card in a one-column
     slot gives each view a fraction of the width a single-view card gets, so
     the one card with more to show shows it smaller. */
  const wide = kind !== "single";

  /* The elements this card drives — one or two, and never in state.
     A ref, because the transport does not affect the render: nothing on this
     card looks different for having a video attached, so putting the elements
     in state buys a re-render per attach and no correctness.

     It also has to be a ref. `ref={(el) => …}` allocates a new closure on every
     render, so React detaches and reattaches on each pass; if that handler
     calls setState, the render it schedules produces another new handler and
     the card loops until React throws "Maximum update depth exceeded". Writing
     to `.current` schedules nothing, so the same reattach costs nothing. */
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  // Hover-to-play is a browsing affordance, and at tile size it is the only way
  // to tell two sewing lines apart. The record layer owns the transport once it
  // is open; nothing here competes with it.
  const play = useCallback(() => {
    const live = videos.current.filter((v): v is HTMLVideoElement => !!v);
    if (!live.length || live.every((v) => !v.paused)) return;
    track("play_preview", { slug: sample.slug, domain: sample.domain });
    /* Both eyes started from zero, not from wherever each happened to be. The
       whole point of showing the pair is that a reader can see the offset
       BETWEEN them; two clips a few frames out of step would fake a parallax
       that is not in the delivery. */
    for (const v of live) {
      v.currentTime = 0;
      v.play().catch(() => undefined);
    }
  }, [sample.slug, sample.domain]);

  const stop = useCallback(() => {
    for (const v of videos.current) {
      if (!v) continue;
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  const open = () => {
    track("expand_record", { slug: sample.slug, domain: sample.domain });
    onOpen();
  };

  /* The caption is generated into the record as "Preview · left eye of the
     stereo pair · 576 x 432", which stops being true the moment the card shows
     both. Overridden here rather than fixed in the data: which eyes are staged
     is a property of this deployment's `public/`, not of the record. */
  const caption = pair
    ? sample.preview.replace(/left eye of the stereo pair/i, "left and right eye, one instant")
    : sample.preview;

  const viewLabel = (v: string) => `${sample.title} — ${v}`;

  return (
    /* A pair takes two columns of the grid.
       Tam, 2026-09-10: "để nguyên 3 cột như này nó làm cho 2 cam kết hợp nhau
       bị nhỏ đi". Correct — a stereo card in a one-column slot gives each eye
       half the width a single-view card gets, so the one card that has more to
       show showed it smaller. Spanning two slots gives each eye roughly the
       width a single view had, which is the point.

       `sm:` scoped, because the base grid is ONE column: `span 2` there would
       make the grid invent a second column for this card alone and every other
       card would then sit in a half-width track. */
    <article
      className={`flex flex-col${wide ? " sm:[grid-column:span_2]" : ""}`}
      style={{ borderTop: `1px solid ${C.hairline}` }}
    >
      {/* The rule above is the card's top edge, and this label was sitting on it
          with no padding at all. It also wraps to two lines on the longer
          preview strings, so a row mixing one- and two-line labels started its
          videos at different heights. Reserve two lines' worth either way and
          clamp at two, so every card in a row opens its media on the same
          baseline. */}
      <p
        className="bp-mono line-clamp-2 min-h-[30px] pb-2.5 pt-3 text-[10px] leading-[1.5]"
        style={{ color: C.textDim }}
      >
        {caption}
      </p>

      {/* The whole tile opens the record. A tile that only responds on one small
          link makes the reader hunt for the hit area on every row. */}
      <button
        type="button"
        onClick={open}
        onMouseEnter={play}
        onMouseLeave={stop}
        onFocus={play}
        onBlur={stop}
        aria-haspopup="dialog"
        className="group relative block w-full overflow-hidden text-left"
      >
        {/* 4:3 per VIEW, not per card. A pair squeezed into a 4:3 band would
            crop each eye to 2:3 — a portrait slice of a landscape frame, which
            throws away the sides of the very thing the second view exists to
            show. So the band grows to hold whole frames instead: two side by
            side is 8:3, and the six-camera elevation is four columns over two
            rows, which is the same 8:3. */}
        <div
          className={`grid w-full gap-px transition-transform duration-500 group-hover:scale-[1.02] ${band} ${cols}`}
          style={{ background: "#000" }}
        >
          {lenses.map(
            ({ view, label, place }, i) => (
              <figure key={view || "base"} className={`relative m-0 overflow-hidden ${place}`}>
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  className="h-full w-full object-cover"
                  src={`/samples/clips/${sample.slug}${view ? `-${view}` : ""}.mp4`}
                  poster={`/samples/posters/${sample.slug}${view ? `-${view}` : ""}.jpg`}
                  muted
                  loop
                  playsInline
                  /* `none`, not `metadata`. A card shows its poster until the
                     pointer arrives, and the only thing `metadata` bought was
                     the clip's duration — which the record already carries as
                     `durationSec` and prints beside the tile. So it was 24
                     extra connections and about a megabyte to learn something
                     the page had already been told. */
                  preload="none"
                  aria-label={label ? viewLabel(label) : sample.title}
                />
                {/* On the six-up and the three-up. Two eyes read as two eyes;
                    six near identical frames of the same bench read as a repeat
                    until each one says which lens it is, and the same is true
                    of a head view beside two wrists — without the labels it is
                    three shots of one workbench. `truncate` because a cell is
                    about 200px on a two-column card and narrower on a phone. */}
                {(sixUp || bodyUp || kind === "depth") && (
                  <figcaption
                    className="bp-mono pointer-events-none absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] truncate px-1.5 py-0.5 text-[9px]"
                    style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
                  >
                    {label}
                  </figcaption>
                )}
              </figure>
            ),
          )}
        </div>
        <span
          className="pointer-events-none absolute left-3 top-3 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
          style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.textDim }}
        >
          {sample.viewpoint === "first-person" ? "1st person" : "3rd person"}
        </span>
        <span
          className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
          style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
        >
          {/* Fixed violet: this badge sits on footage, not on the page. */}
          {sample.telemetry && <span style={{ color: "#C4B5FD" }}>live</span>}
          {mmss(sample.durationSec)}
        </span>
      </button>

      <div className="flex flex-1 flex-col px-1 pb-6 pt-5">
        <p className="bp-mono text-[10px]" style={{ color: C.accent }}>
          {sample.label}
        </p>
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          className="mt-2 text-left text-base font-medium leading-snug transition-colors hover:opacity-80"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {sample.title}
        </button>
        <p className="mt-2 text-[12px]" style={{ color: C.textMid }}>
          {sample.breadcrumb.map((b, i) => (
            <span key={`${b}-${i}`}>
              {i > 0 && <span style={{ color: C.textDim }}> › </span>}
              <span style={{ color: i === 0 ? C.value : C.textMid }}>{b}</span>
            </span>
          ))}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {/* Filtered, not sliced: the `device` pill printed the rig name on
              every card face. Inline rather than through a helper in the .mjs so
              `pill.k` stays a `PillKind` and `PILL[pill.k]` stays checked. */}
          {sample.pills
            .filter((p) => !(PILL_KINDS_DROPPED as string[]).includes(p.k))
            .map((pill) => {
              const st = PILL[pill.k];
              return (
                <li
                  key={pill.t}
                  className="rounded-full px-2.5 py-1 text-[11px]"
                  style={{ background: st.bg, color: st.fg, border: `1px solid ${st.bd}` }}
                >
                  {pill.t}
                </li>
              );
            })}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            className="bp-mono inline-flex items-center gap-1.5 text-[10px] transition-colors"
            style={{ color: C.textDim }}
          >
            {sample.telemetry ? "Full metadata and live record" : "Full metadata"}
            <ChevronDown className="h-3 w-3 -rotate-90" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
  /**
   * Keep the chip live at zero. Only the modality group sets this: a line with
   * no published samples is still a line we sell, and disabling it puts the
   * price sheet behind a control the reader cannot press. Every other facet
   * stays disabled at zero, where the number really does mean "no such record".
   */
  quotable,
  /**
   * The source stores `hard`, not `Hard`. A rail reading Easy / Medium / hard
   * is a typo the reader blames on us, and title-casing the string in the data
   * would put presentation in the record.
   */
  caps,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  quotable?: boolean;
  caps?: boolean;
}) {
  const dead = count === 0 && !active && !quotable;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dead}
      aria-pressed={active}
      data-active={active}
      className={`sm-chip flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[12px] disabled:opacity-30${caps ? " capitalize" : ""}`}
    >
      <span className="truncate">{label}</span>
      <span className="sm-chip-count shrink-0 font-mono text-[10px]">{count}</span>
    </button>
  );
}

/**
 * What we run on a line we have not published samples for.
 *
 * Every figure is quoted from `capability.ts`, which is a transcription of the
 * spreadsheet sales attaches to emails — the attachment this page exists to
 * replace. Nothing here is derived, averaged or reconciled against the deck,
 * which counts a different corpus.
 */
function CapabilityPanel({
  modality,
  /**
   * One configuration rather than the whole line.
   *
   * Pressing "Egocentric + wrist" in the rail is a narrower question than
   * filtering to a whole unpublished modality, and answering it with all five
   * egocentric tiers makes the reader find their row again in a table they did
   * not ask for. With a key set, the panel quotes that row and nothing else.
   */
  tierKey,
  onClear,
}: {
  modality: string;
  tierKey?: string;
  onClear: () => void;
}) {
  const all = CAPABILITY[modality] ?? [];
  const tiers = tierKey ? all.filter((t) => t.key === tierKey) : all;
  // `IN_FLIGHT` is a fact about the whole line, not about one configuration, so
  // it only belongs here when the whole line is what was asked about. Printing
  // "20 hours in collection" under a single tier would attribute the collection
  // to that tier, which nothing in the record supports.
  const running = tierKey ? undefined : IN_FLIGHT[modality];
  const name = tierKey
    ? (tiers[0]?.name ?? tierKey)
    : (MODALITIES.find((m) => m.key === modality)?.label ?? modality);

  return (
    <div className="py-10">
      <p className="bp-mono text-[10px]" style={{ color: C.accent }}>
        No published samples yet
      </p>
      <h3
        className="mt-2 text-2xl font-medium tracking-tight"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
      >
        {name} runs on the same pipeline.
      </h3>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: C.textMid }}>
        {tierKey
          ? "No sample of this configuration is on the page yet. It is collected to spec, on the rig below. These are the same terms we would send in a quote."
          : "Nothing from this line is on the page yet. It is collected to spec. These are the same terms we would send in a quote."}
      </p>

      {running && (
        <p
          className="bp-card mt-5 max-w-xl px-4 py-3 text-[12px] leading-relaxed"
          style={{ color: C.textMid }}
        >
          {running}
        </p>
      )}

      <div className="mt-7">
        {tiers.map((t) => (
          <div
            key={t.name}
            className="grid gap-x-8 gap-y-2 py-4 md:grid-cols-[minmax(0,1.4fr)_auto]"
            style={{ borderTop: `1px solid ${C.hairline}` }}
          >
            <div className="min-w-0">
              <p className="text-[13px] font-medium">{t.name}</p>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.textDim }}>
                {t.rig}
                {t.sensors ? ` · ${t.sensors}` : ""}
              </p>
            </div>
            {/* Ramp and ceiling, never `t.price` — see the comment on that
                field. A rate on a public page anchors a brief nobody has
                written yet. These two are what a buyer schedules around. */}
            <p
              className="font-mono text-[11px] leading-relaxed md:text-right"
              style={{ color: C.textMid }}
            >
              Ready in {t.ramp}
              <br />
              Up to {t.ceiling}
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

      <div className="mt-7 flex flex-wrap items-center gap-5">
        <Link
          href={requestUrl({ from: `capability-${modality}` })}
          onClick={() => track("open_request_access", { from: `capability-${modality}` })}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
          style={{ background: C.accent, color: "var(--sm-on-accent)" }}
        >
          Scope a collection
        </Link>
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] underline decoration-1 underline-offset-4"
          style={{ color: C.textDim }}
        >
          Back to everything published
        </button>
      </div>
    </div>
  );
}

/**
 * `first` drops the rule above the topmost group. The rail sits beside the grid
 * toolbar, and the two rules landed 15px apart — close enough to read as one
 * divider that had been broken, rather than as two columns each with their own.
 * The search field above it is already a closed box; it needs no second edge.
 */
function RailGroup({
  title,
  first,
  grouped,
  children,
}: {
  title: string;
  first?: boolean;
  /**
   * Name the chips as a group: `role="group"` labelled by the title. A set of
   * toggle buttons with no group announces each chip alone ("95% or more,
   * toggle button") and never says what it is a choice of. Hand pose only; the
   * other categories' rails are left as they were.
   */
  grouped?: boolean;
  children: React.ReactNode;
}) {
  const titleId = useId();
  return (
    <div
      className={first ? "pb-5 pt-6" : "py-5"}
      style={first ? undefined : { borderTop: `1px solid ${C.hairline}` }}
      role={grouped ? "group" : undefined}
      aria-labelledby={grouped ? titleId : undefined}
    >
      <p id={grouped ? titleId : undefined} className="bp-mono mb-2 text-[10px]" style={{ color: C.textDim }}>
        {title}
      </p>
      <div className="-mx-2.5 space-y-0.5">{children}</div>
    </div>
  );
}

/**
 * The catalogue for ONE category. It used to own the line switch and render the
 * whole shelf; the chooser at `/samples` owns that choice now, and this mounts
 * on `/samples/[category]` already scoped. The facets, the grid, the dataset
 * band and the record layer are unchanged - they were never the problem, they
 * were on the wrong page.
 */
export function SampleCatalog({
  modality,
  skillGroup,
  tier,
  records = ALL,
  pageSize = PAGE,
}: {
  modality: string;
  /**
   * The folder the reader arrived through, seeded into the filters.
   *
   * Seeded rather than enforced: the rail stays live and the chip is
   * deselectable, so someone who opened "Tool Use" and then wants the whole
   * configuration does not have to go back up a level to get it. The folder is
   * a starting point, not a cage.
   */
  skillGroup?: string;
  /** The camera configuration the reader arrived through. Seeded like
      `skillGroup` and just as deselectable. */
  tier?: string;
  /**
   * The records this catalogue lists, and the only ones a deep link, an
   * `OPEN_RECORD_EVENT` or a facet count can reach. Defaults to `samples.json`,
   * which holds every category but hand pose: those sixteen live in
   * `handpose-records.json` so no site-wide count moves, and the hand-pose page
   * passes them in. A record outside this list cannot open here, so a hand-pose
   * slug in the URL of another category's page opens nothing.
   */
  records?: Sample[];
  /** Cards per page. The category pages keep twelve; hand pose shows all sixteen. */
  pageSize?: number;
}) {
  const all = records;
  const [active, setActive] = useState<Sample | null>(null);
  /* `&f=`: the frame the record opens at. It is state rather than a read of the
     URL inside the modal because this component deletes `f` from the address
     whenever the open record changes (below), and the modal opens after that. */
  const [initialFrame, setInitialFrame] = useState<number | null>(null);

  /* The card opens a record with no frame: an `&f=` or an event's frame belongs
     to the open that carried it, and must not seek the next record. */
  const open = useCallback((s: Sample) => {
    setInitialFrame(null);
    setActive(s);
  }, []);

  /* Memoised, so the modal is handed the same function on every render of this
     catalogue. It re-focused its own root whenever this changed, which pulled
     focus off a lane or a video inside the record at every keystroke in the
     search box behind it and every facet count. */
  const close = useCallback(() => {
    setActive(null);
    setInitialFrame(null);
  }, []);

  // Every lens only where the reader came to buy the multi-lens option.
  const lensMode: "pair" | "all" = tier === "stereo6" ? "all" : "pair";
  /* A record is addressable: `/samples?record=<slug>`.
   *
   * This page exists so a salesperson can send a link instead of an
   * attachment, and until now the only way to reach one sample was to open the
   * catalogue and find it again — the deep link was the missing half of the
   * premise. The state stays the source of truth and the URL follows it, rather
   * than the other way round: reading state from the URL on every render would
   * put a router subscription in the middle of a grid that re-filters on every
   * keystroke.
   *
   * `replaceState`, not `pushState`. Opening and closing five records while
   * browsing should not bury the previous page under five history entries, and
   * the modal already closes on Escape and on outside press.
   */
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("record");
    if (!slug) return;
    const found = all.find((s) => s.slug === slug);
    if (!found) return;
    // Read before the effect below drops `f` from the address.
    setInitialFrame(frameFromUrl());
    setActive(found);
  }, []);

  /* A link elsewhere on the page — a hero button, a "Start here" chip, a row of
     the comparison table — opens a record through `openRecord()`. Changing only
     the query string would not do it: a soft navigation to the same page does
     not remount this component, so the `?record=` read above never runs. */
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { slug, frame } = (e as CustomEvent<OpenRecordDetail>).detail ?? {};
      const found = slug ? all.find((s) => s.slug === slug) : undefined;
      if (!found) return;
      setInitialFrame(typeof frame === "number" && Number.isFinite(frame) && frame >= 0 ? Math.floor(frame) : null);
      setActive(found);
    };
    window.addEventListener(OPEN_RECORD_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_RECORD_EVENT, onOpen);
  }, [all]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (active) url.searchParams.set("record", active.slug);
    else url.searchParams.delete("record");
    // `f` belongs to one open record and has already been read into
    // `initialFrame`; one left over from the last record must not seek the
    // next. A link to a frame comes from the viewer's "Copy link to this frame".
    url.searchParams.delete("f");
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }, [active]);
  const [f, setF] = useState<Filters>({
    ...EMPTY,
    scope: modality,
    skillGroup: skillGroup ? [skillGroup] : [],
    tier: tier ? [tier] : [],
  });

  // The route is the source of truth for scope; a client nav between categories
  // remounts nothing, so the filter has to follow it.
  useEffect(() => {
    setF((p) =>
      p.scope === modality
        ? p
        : {
            ...EMPTY,
            scope: modality,
            // The seed belongs to the route as much as the scope does. Dropping
            // it on a client nav landed the reader on an unfiltered grid at a
            // URL that names a folder.
            skillGroup: skillGroup ? [skillGroup] : [],
            tier: tier ? [tier] : [],
          },
    );
  }, [modality]);

  /* Clear empties the facets and leaves the reader where they were. Scope is
     navigation, not narrowing: resetting it would teleport a gaming buyer back
     into the robotics grid for pressing "Clear". */
  const clear = () => setF({ ...EMPTY, scope: f.scope });

  /** Records in the reader's line, before any facet narrows them. */
  const inLine = useMemo(
    () => all.filter((s) => s.modality === f.scope).length,
    [all, f.scope],
  );

  /** Hand pose: the same catalogue, with its own sorts, strings and card. */
  const isHandPose = f.scope === "handpose";

  const [sort, setSort] = useState<SortKey>(() => defaultSort(modality));
  /* The sorts a category offers differ (hand pose has its own), and a client
     navigation between categories keeps this state. A sort the new category
     does not offer falls back to that category's default rather than leaving
     the picker showing nothing selected. For every other category the two
     lists are the same one, so this is `sort` unchanged. */
  const sorts = sortsFor(f.scope);
  const activeSort = sorts.some((s) => s.key === sort) ? sort : defaultSort(f.scope);
  // Six facet groups is a long scroll before the grid on a phone, so the rail
  // collapses below lg and is always open from lg up.
  const [railOpen, setRailOpen] = useState(false);

  const toggle = (
    key: "modality" | "tier" | "provenance" | "viewpoint" | "skillGroup" | "industry" | "site",
    v: string,
  ) => {
    track("filter_rig", { facet: key, value: v });
    setF((p) => {
      const list = p[key];
      return { ...p, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    });
  };

  /** Count a value as if that facet were not applied, so numbers stay reachable. */
  const countFor = useCallback(
    (key: keyof Filters, pick: (s: Sample) => string | null, v: string) =>
      all.filter((s) => matches(s, f, key)).filter((s) => pick(s) === v).length,
    [all, f],
  );

  /** A spec chip's count with only ITS OWN facet lifted — see `SpecFacet.cross`. */
  const countSpecCross = useCallback(
    (facetKey: string, v: string) =>
      all.filter((s) => matches(s, f, undefined, facetKey)).filter((s) => specCell(s, facetKey) === v).length,
    [all, f],
  );

  /** The tier chip's count. A record can sit in two tiers, so `countFor`'s
      single-valued pick would drop it from its second one. */
  const countTier = useCallback(
    (key: string) => all.filter((s) => matches(s, f, "tier") && inTier(s, key)).length,
    [all, f],
  );

  const shown = useMemo(() => {
    const out = all.filter((s) => matches(s, f));
    // Hand-pose comparators. A record with no metrics sorts last on each, and
    // ties fall back to the sample number so the order is always the same one.
    const no = (s: Sample) => handPoseOf(s)?.n ?? 99;
    const noVideo = (s: Sample) => Number(handPoseOf(s)?.preview !== "video");
    const by: Record<SortKey, (a: Sample, b: Sample) => number> = {
      longest: (a, b) => b.durationSec - a.durationSec,
      shortest: (a, b) => a.durationSec - b.durationSec,
      live: (a, b) => Number(b.telemetry) - Number(a.telemetry) || a.title.localeCompare(b.title),
      title: (a, b) => a.title.localeCompare(b.title),
      preview: (a, b) => noVideo(a) - noVideo(b) || no(a) - no(b),
      number: (a, b) => no(a) - no(b),
      pose: (a, b) => (handPoseOf(b)?.minPosePct ?? -1) - (handPoseOf(a)?.minPosePct ?? -1) || no(a) - no(b),
    };
    return [...out].sort(by[activeSort]);
  }, [all, f, activeSort]);

  /* Every facet's options come from the records IN THIS CATEGORY, never from
     the global taxonomy.
     The rail was listing SKILL_GROUPS and INDUSTRIES whole, so /samples/egocentric
     offered "Healthcare & Caregiving 0" and "Home Appliance Interaction 0" —
     rows that exist in the taxonomy and in no record here — and "Third person 0"
     under Viewpoint, on a category defined by being first-person. A greyed row
     reading zero is a control that cannot do anything, and six of them ahead of
     the ones that can is what made this rail long. */
  const scoped = useMemo(() => all.filter((s) => s.modality === f.scope), [all, f.scope]);
  const valuesOf = useCallback(
    (pick: (s: Sample) => string | null) =>
      Array.from(new Set(scoped.map(pick).filter(Boolean) as string[])).sort(),
    [scoped],
  );

  const sites = useMemo(
    () => valuesOf((s) => (s.environment ?? "").split(",")[0]?.trim() || null),
    [valuesOf],
  );
  const jobs = useMemo(() => JOBS.filter((j) => scoped.some((s) => s.job === j)), [scoped]);
  const skillGroups = useMemo(
    () => SKILL_GROUPS.filter((g) => scoped.some((s) => s.skillGroup === g)),
    [scoped],
  );
  const industries = useMemo(
    () => INDUSTRIES.filter((i) => scoped.some((s) => s.industry === i)),
    [scoped],
  );
  const viewpoints = useMemo(
    () => VIEWPOINTS.filter((v) => scoped.some((s) => s.viewpoint === v.key)),
    [scoped],
  );
  const sources = useMemo(
    () => SOURCES.filter((p) => scoped.some((s) => s.provenance === p.key)),
    [scoped],
  );

  /**
   * The configurations this category is sold in — from the capability sheet,
   * NOT from the records.
   *
   * Every other group in this rail is built from `scoped`, because a chip that
   * cannot narrow anything is a control that does nothing. This one inverts
   * that on purpose: egocentric holds records for one of its five tiers, so
   * building it from the records would produce a single chip reading 118 and
   * the four configurations a buyer might actually be shopping for would stay
   * invisible — which is the state this page was in.
   *
   * Zero here does not mean no such capture. It means we have not published one
   * yet, and the sheet says what it costs and how long it takes. So the chips
   * stay pressable at zero and press through to `CapabilityPanel`.
   */
  const tiers = useMemo(() => CAPABILITY[f.scope] ?? [], [f.scope]);

  /** This category's own spec facets, with their values, in config order. */
  const specFacets = useMemo(
    () =>
      (SPEC_FACETS[f.scope] ?? [])
        .map((cfg) => {
          const values = valuesOf((s) => specCell(s, cfg.key));
          return {
            ...cfg,
            values: cfg.order
              ? [...values].sort(
                  (a, b) =>
                    (cfg.order!.indexOf(a.toLowerCase()) + 1 || 99) -
                    (cfg.order!.indexOf(b.toLowerCase()) + 1 || 99),
                )
              : values,
          };
        })
        // A facet with one value cannot narrow anything.
        .filter((x) => x.values.length > 1),
    [f.scope, valuesOf],
  );

  /* Counts, because every other control in this rail has them: a chip says how
     many samples it would leave and greys itself out at zero, so the one facet
     that hides its options behind a click was also the only one you had to pick
     blind. Each is counted with the job facet lifted, which is what keeps the
     numbers reachable — `countFor`'s rule, applied to the reset row too. That
     row used `shown.length` at first, the count AFTER this facet narrows, so
     picking Cook made it read "Any job (17)": the number it exists to escape. */
  const jobOptions = useMemo(
    () => [
      { value: "all", label: "Any job", count: all.filter((s) => matches(s, f, "job")).length },
      ...jobs.map((j) => ({ value: j, label: j, count: countFor("job", (s) => s.job, j) })),
    ],
    [all, jobs, f, countFor],
  );

  const dirty =
    f.modality.length + f.tier.length + f.provenance.length + f.viewpoint.length +
      f.skillGroup.length + f.industry.length + f.site.length >
      0 ||
    f.job !== "all" ||
    Object.values(f.spec).some((v) => v.length > 0) ||
    f.q.trim() !== "";

  /** The sample numbers whose sample pack is released under a passcode, for the access strip's copy. */
  const packSamples = useMemo(
    () =>
      isHandPose
        ? all.flatMap((s) => {
            const hp = handPoseOf(s);
            return hp?.pack ? [hp.n] : [];
          })
        : [],
    [all, isHandPose],
  );

  const totals = useMemo(() => {
    const minutes = shown.reduce((a, s) => a + s.durationSec, 0) / 60;
    return {
      minutes: minutes.toFixed(1),
      live: shown.filter((s) => s.telemetry).length,
      // What the toolbar counts in place of live data on hand pose.
      skeleton: shown.filter((s) => handPoseOf(s)?.preview === "video").length,
    };
  }, [shown]);

  /* Paged by number, not extended by a button.
   *
   * It was "Show more", on the argument that a numbered pager throws away scroll
   * position and adds a second navigation model beside the facet rail. Both are
   * true and both were outweighed: "Show more" only ever grows the page, so a
   * reader twelve presses in is holding 144 mounted <video> elements and cannot
   * get back to a smaller page without reloading. Tam, 2026-09-10: "chị nghĩ để
   * nó render dần dần, hoặc render vài cái, xong để next page được ko".
   *
   * A page swaps rather than accumulates, so the ceiling on mounted media is
   * PAGE and not PAGE × presses. The scroll-position objection is answered by
   * scrolling back to the grid on every step, which is where the reader was
   * looking anyway.
   */
  const [pageIndex, setPageIndex] = useState(0);
  const gridTop = useRef<HTMLDivElement | null>(null);
  useEffect(() => setPageIndex(0), [f, sort]);

  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize));
  // A facet can shrink the result set under the current page while the reader is
  // on it; clamping here keeps the grid from rendering an empty page.
  const current = Math.min(pageIndex, pageCount - 1);
  const page = shown.slice(current * pageSize, current * pageSize + pageSize);

  const goToPage = useCallback((n: number) => {
    setPageIndex(n);
    // `auto`, not `smooth`: the grid under the pager has already swapped by the
    // time a smooth scroll finishes, so the reader watches the new page slide
    // past on the way to the top of it.
    gridTop.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);

  /* The modality to pitch when the grid comes back empty: exactly one selected,
     and it is one we can quote. Two selected is a combination the reader built,
     not a line they asked about, and pitching one of the two would be picking
     for them. */
  const emptyLine =
    f.modality.length === 1 && CAPABILITY[f.modality[0]] ? f.modality[0] : null;

  /* Same rule one level down, and it takes precedence: a reader who pressed
     "Egocentric + wrist" asked about a configuration, and answering with the
     whole egocentric line would be answering a question they did not ask.
     Only fires when the tier is the ONLY thing narrowing — with a skill group
     or a search term also on, the empty grid is the combination's doing and a
     price sheet is not the answer to it. */
  const emptyTier =
    f.tier.length === 1 && tiers.some((t) => t.key === f.tier[0]) ? f.tier[0] : null;

  return (
    <>
    {/* On hand pose this section is a named region of its own, under the page's
        `#samples` wrapper and after the intro that carries the heading. The
        other categories' sections have no name and keep none. */}
    <section
      id="deck"
      className="bp-grid bp-frame relative"
      style={{ color: C.text }}
      aria-label={isHandPose ? "Sample catalogue" : undefined}
    >
      {/* No heading, and no dataset strip. The heading went because the
          category page above already states the name, what the category is and
          the figures. The strip went because it was the third control for one
          job: it grouped the 16 skill groups into 9 poster cards, the facet
          rail filters on skill group, and CoverageChart ranks them. Three ways
          to do one thing is worse than one way, and it was 470px of scroll
          before the grid it was narrowing. */}

      <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-10 lg:px-10 xl:px-16">
        {/* The rail and the grid arrive together. Individual cards are not
            staggered here — twenty-four tiles fading in one after another is
            a page that will not settle. */}
        <Reveal variant="rise">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-3" aria-label={isHandPose ? "Filter samples" : undefined}>
            <button
              type="button"
              onClick={() => setRailOpen((v) => !v)}
              aria-expanded={railOpen}
              className="mb-4 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] lg:hidden"
              style={{ background: C.band, border: `1px solid ${C.hairline}`, color: C.text }}
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </span>
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform"
                style={{ transform: railOpen ? "rotate(180deg)" : undefined }}
              />
            </button>

            <div className={`${railOpen ? "block" : "hidden"} lg:sticky lg:top-24 lg:block`}>
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                  style={{ color: C.textDim }}
                />
                <input
                  value={f.q}
                  onChange={(e) => setF((p) => ({ ...p, q: e.target.value }))}
                  placeholder={isHandPose ? "Search tasks and skills" : "Search tasks, workplaces, trades"}
                  aria-label="Search samples"
                  className="w-full rounded-lg py-2 pl-9 pr-3 text-[13px] outline-none"
                  style={{ background: C.band, border: `1px solid ${C.hairline}`, color: C.text }}
                />
              </label>

              {/* First, and above Source, because it is the coarsest cut this
                  page makes inside a category: what the rig was. Everything
                  under it — trade, industry, site — describes work that was
                  filmed, and this describes what filmed it.

                  `quotable` on every chip, not just the empty ones: the rule is
                  about the facet, not about today's counts. When wrist records
                  land, that chip stops being quotable by having a number, and
                  nothing here has to change. */}
              {tiers.length > 1 && (
                <RailGroup title="Configuration" first grouped={isHandPose}>
                  {tiers.map((t) => (
                    <Chip
                      key={t.key}
                      label={t.name}
                      quotable
                      active={f.tier.includes(t.key)}
                      count={countTier(t.key)}
                      onClick={() => toggle("tier", t.key)}
                    />
                  ))}
                </RailGroup>
              )}

              {/* Every group below renders only where this category has more
                  than one value for it. A facet with one value is not a facet,
                  and a facet with none is a row of zeroes. */}
              {/* The Source facet — "Off the shelf 39 / Custom collection 79" —
                  is gone. Tam, 2026-09-10: "cái này ko cần". It split the grid
                  on a purchase route rather than on anything about the footage,
                  and both routes deliver the same files off the same rigs, so
                  picking one hid half the catalogue for no reason a buyer would
                  recognise. The distinction still lives where it belongs, in
                  `TwoRoutes`, which explains it instead of filtering on it.

                  `sources` and `SOURCES` stay: `provenance` is still a field on
                  the record and still printed in the detail view. */}

              {viewpoints.length > 1 && (
                <RailGroup title="Viewpoint" first={tiers.length <= 1} grouped={isHandPose}>
                  {viewpoints.map((v) => (
                    <Chip
                      key={v.key}
                      label={v.label}
                      active={f.viewpoint.includes(v.key)}
                      count={countFor("viewpoint", (s) => s.viewpoint, v.key)}
                      onClick={() => toggle("viewpoint", v.key)}
                    />
                  ))}
                </RailGroup>
              )}

              {skillGroups.length > 1 && (
                <RailGroup title="Skill group" grouped={isHandPose}>
                  {skillGroups.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      active={f.skillGroup.includes(g)}
                      count={countFor("skillGroup", (s) => s.skillGroup, g)}
                      onClick={() => toggle("skillGroup", g)}
                    />
                  ))}
                </RailGroup>
              )}

              {industries.length > 1 && (
                <RailGroup title="Industry" grouped={isHandPose}>
                  {industries.map((i) => (
                    <Chip
                      key={i}
                      label={i}
                      active={f.industry.includes(i)}
                      count={countFor("industry", (s) => s.industry, i)}
                      onClick={() => toggle("industry", i)}
                    />
                  ))}
                </RailGroup>
              )}

              {sites.length > 1 && (
                <RailGroup title="Site type" grouped={isHandPose}>
                  {sites.map((v) => (
                    <Chip
                      key={v}
                      label={v}
                      active={f.site.includes(v)}
                      count={countFor("site", (s) => (s.environment ?? "").split(",")[0]?.trim() || null, v)}
                      onClick={() => toggle("site", v)}
                    />
                  ))}
                </RailGroup>
              )}

              {/* No Rig group. It listed our four internal rig names on a
                  public page, against Tam's "Rig ko ghi tên" — and the three
                  egocentric ones are one published configuration under three
                  names, so the group narrowed nothing even before that.
                  Relabelling the chips would have produced a facet with a single
                  value; see redact.mjs. */}

              {/* This category's own axes. Gaming's are Game, Session and
                  Stress; egocentric has none here because its axes are typed
                  fields and appear above. */}
              {specFacets.map((facet) => (
                <RailGroup key={facet.key} title={facet.title} grouped={isHandPose}>
                  {facet.values.map((v) => (
                    <Chip
                      key={v}
                      label={v}
                      caps={facet.caps !== false}
                      active={(f.spec[facet.key] ?? []).includes(v)}
                      count={
                        facet.cross
                          ? countSpecCross(facet.key, v)
                          : countFor("spec", (s) => specCell(s, facet.key), v)
                      }
                      onClick={() =>
                        setF((p) => {
                          const cur = p.spec[facet.key] ?? [];
                          const next = cur.includes(v)
                            ? cur.filter((x) => x !== v)
                            : [...cur, v];
                          return { ...p, spec: { ...p.spec, [facet.key]: next } };
                        })
                      }
                    />
                  ))}
                </RailGroup>
              ))}

              {jobs.length > 1 && (
                <RailGroup title="Job" grouped={isHandPose}>
                  {/* `px-2.5` cancels RailGroup's `-mx-2.5` the same way a chip's
                      own padding does. */}
                  <div className="px-2.5">
                    <FacetPicker
                      value={f.job}
                      options={jobOptions}
                      onChange={(job) => setF((p) => ({ ...p, job }))}
                      ariaLabel="Filter by job"
                      searchPlaceholder="Search jobs"
                      emptyText="No job matches that."
                    />
                  </div>
                </RailGroup>
              )}
            </div>
          </aside>

          <div className="lg:col-span-9">
            {/* No rule under the toolbar. Every card already draws one above
                itself, and the first row of them lands on exactly the same
                pixel — four 1px lines at one y, doubling in weight where they
                overlapped and dropping to a single line across the 32px column
                gaps, which read as a broken divider. The card rules are the
                divider, and they stay consistent with every row below. */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
              {/* On hand pose this is a status line: it is the only thing on the
                  page that says what a facet press did to the grid, and a
                  reader using a screen reader would otherwise hear nothing. */}
              <p
                className="font-mono text-[11px]"
                style={{ color: C.textDim }}
                role={isHandPose ? "status" : undefined}
              >
                {/* Denominator is the category, not the whole file. It read
                    "118 of 126" on a page that only contains 118. */}
                {shown.length} of {inLine} samples
                <span className="mx-2" aria-hidden={isHandPose || undefined}>/</span>
                {totals.minutes} minutes of source
                <span className="mx-2" aria-hidden={isHandPose || undefined}>/</span>
                {/* Hand pose has no live data to count; what a reader asks of
                    it is how many samples they can watch. */}
                {isHandPose ? (
                  <>{totals.skeleton} with a video preview</>
                ) : (
                  <>{totals.live} with live data</>
                )}
              </p>
              <div className="flex items-center gap-4">
                {dirty && (
                  <button
                    type="button"
                    onClick={clear}
                    className="bp-mono inline-flex items-center gap-1 text-[10px]"
                    style={{ color: C.textDim }}
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
                <span className="flex items-center gap-2 text-[12px]" style={{ color: C.textDim }}>
                  Sort
                  {/* Same trigger class as the Job picker, from the same file.
                      Two dropdowns on one screen styled apart is the drift this
                      page keeps having to undo. No `data-active`: a sort order
                      is always set, so "on" says nothing here. */}
                  <SortPicker
                    value={activeSort}
                    options={sorts}
                    onChange={setSort}
                    ariaLabel="Sort samples"
                  />
                </span>
              </div>
            </div>

            {shown.length === 0 ? (
              /* A reader who filters to Exocentric or Mocap has told us exactly
                 what they came for. "Nothing matches" is true and throws that
                 away; the line is unpublished, not unavailable, and the
                 spreadsheet this page replaces answers it with a price and a
                 lead time. So does this. */
              emptyTier ? (
                /* Narrower question first — see `emptyTier`. Clearing returns
                   to this category rather than to `EMPTY`, whose scope is
                   egocentric: a gaming reader who cleared here used to land in
                   the robotics grid. */
                <CapabilityPanel
                  modality={f.scope}
                  tierKey={emptyTier}
                  onClear={() => setF({ ...EMPTY, scope: f.scope })}
                />
              ) : emptyLine ? (
                <CapabilityPanel modality={emptyLine} onClear={() => setF(EMPTY)} />
              ) : (
                <div className="py-24 text-center">
                  <p className="text-sm" style={{ color: C.textMid }}>
                    Nothing matches that combination.
                  </p>
                  {/* The sentence about game sessions is true of the gaming line
                      and printed under every other category's empty grid; hand
                      pose says only what happened. */}
                  {!isHandPose && (
                    <p className="mx-auto mt-2 max-w-md text-[13px]" style={{ color: C.textDim }}>
                      Game sessions carry no skill group, industry or job, so those three narrow to the
                      egocentric line.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={clear}
                    className="mt-6 rounded-full px-5 py-2 text-[13px] font-semibold"
                    style={{ background: C.text, color: C.base }}
                  >
                    Clear filters
                  </button>
                </div>
              )
            ) : (
              <>
                <div
                  ref={gridTop}
                  className="grid gap-x-8 gap-y-2 sm:grid-cols-2 2xl:grid-cols-3"
                  style={{ scrollMarginTop: "88px" }}
                >
                  {page.map((s) =>
                    s.modality === "handpose" && HandPoseCard ? (
                      <HandPoseCard key={s.slug} sample={s} onOpen={() => open(s)} />
                    ) : (
                      <Card key={s.slug} sample={s} onOpen={() => open(s)} lensMode={lensMode} />
                    ),
                  )}
                </div>

                {pageCount > 1 && (
                  <nav
                    aria-label="Sample pages"
                    className="mt-10 flex flex-col items-center gap-3"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <PageButton
                        label="Previous"
                        disabled={current === 0}
                        onClick={() => goToPage(current - 1)}
                      />
                      {pageNumbers(current, pageCount).map((n, i) =>
                        n === null ? (
                          <span
                            key={`gap-${i}`}
                            className="bp-mono px-1 text-[10px]"
                            style={{ color: C.textDim }}
                          >
                            ···
                          </span>
                        ) : (
                          <PageButton
                            key={n}
                            label={String(n + 1)}
                            active={n === current}
                            onClick={() => goToPage(n)}
                          />
                        ),
                      )}
                      <PageButton
                        label="Next"
                        disabled={current === pageCount - 1}
                        onClick={() => goToPage(current + 1)}
                      />
                    </div>
                    <p className="font-mono text-[11px]" style={{ color: C.textDim }}>
                      {current * pageSize + 1}–{current * pageSize + page.length} of {shown.length}
                    </p>
                  </nav>
                )}
              </>
            )}

            {/* The gate sits under the grid now. It used to open the section,
                which asked a reader to think about passcodes before they had
                seen a single frame - and free playback with no form is the one
                thing this page has that the competitors do not. */}
            <AccessStrip variant={isHandPose ? "handpose" : undefined} packSamples={packSamples} />
          </div>
        </div>
        </Reveal>
      </div>
    </section>
      <SampleModal
        sample={active}
        onClose={close}
        lensMode={lensMode}
        // Only a hand-pose record has a lane to seek along; an `&f=` on any
        // other category's address is not a frame of anything.
        initialFrame={active?.modality === "handpose" ? initialFrame : null}
      />
    </>
  );
}
