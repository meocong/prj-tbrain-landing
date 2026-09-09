"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, Search, SlidersHorizontal, X } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { SKILL_GROUPS, JOBS, INDUSTRIES } from "@/lib/samples/taxonomy";
import { FacetPicker, SortPicker } from "./Fields";
import { publicSpec } from "@/lib/samples/redact.mjs";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";
import { CAPABILITY, IN_FLIGHT, INTEROP } from "@/lib/samples/capability";
import { type LineKey } from "@/lib/samples/datasets";
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

/** Cards revealed per step. Eight rows at the widest three-column layout. */
const PAGE = 24;

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

type SortKey = (typeof SORTS)[number]["key"];

interface Filters {
  /** The category. Fixed by the route; never a facet on this page. */
  scope: string;
  modality: string[];
  provenance: string[];
  viewpoint: string[];
  skillGroup: string[];
  industry: string[];
  rig: string[];
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
const SPEC_FACETS: Record<string, { key: string; title: string; order?: string[] }[]> = {
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
};

const specCell = (s: Sample, key: string) => s.spec?.find((p) => p[0] === key)?.[1] ?? null;

const EMPTY: Filters = {
  scope: "egocentric",
  modality: [],
  provenance: [],
  viewpoint: [],
  skillGroup: [],
  industry: [],
  rig: [],
  site: [],
  job: "all",
  spec: {},
  q: "",
};

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Within a facet the selected values are OR-ed; across facets they are AND-ed. */
function matches(s: Sample, f: Filters, skip?: keyof Filters) {
  const on = (k: keyof Filters) => k !== skip;
  // Scope sits outside `skip`: it is the route, not a facet, so a facet count
  // is always computed WITHIN the category the reader opened.
  if (s.modality !== f.scope) return false;
  if (on("modality") && f.modality.length && !f.modality.includes(s.modality)) return false;
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
  if (on("rig") && f.rig.length && !f.rig.includes(s.rig)) return false;
  if (on("site") && f.site.length) {
    const site = (s.environment ?? "").split(",")[0]?.trim();
    if (!site || !f.site.includes(site)) return false;
  }
  if (on("job") && f.job !== "all" && s.job !== f.job) return false;
  if (on("spec")) {
    for (const [key, picked] of Object.entries(f.spec)) {
      if (!picked.length) continue;
      const v = specCell(s, key);
      if (!v || !picked.includes(v)) return false;
    }
  }
  if (on("q") && f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    const hay = `${s.title} ${s.label} ${s.environment} ${s.rig} ${s.skillGroup ?? ""} ${s.job ?? ""}`;
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
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors"
      style={{ border: `1px solid ${C.hairline}`, color: done ? C.accent : C.textMid }}
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {done ? "Copied" : "Copy JSON"}
    </button>
  );
}

function Card({ sample, onOpen }: { sample: Sample; onOpen: () => void }) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  // Hover-to-play is a browsing affordance, and at tile size it is the only way
  // to tell two sewing lines apart. The record layer owns the transport once it
  // is open; nothing here competes with it.
  const play = useCallback(() => {
    if (!video || !video.paused) return;
    track("play_preview", { slug: sample.slug, domain: sample.domain });
    video.play().catch(() => undefined);
  }, [video, sample.slug, sample.domain]);

  const stop = useCallback(() => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, [video]);

  const open = () => {
    track("expand_record", { slug: sample.slug, domain: sample.domain });
    onOpen();
  };

  return (
    <article className="flex flex-col" style={{ borderTop: `1px solid ${C.hairline}` }}>
      {/* The rule above is the card's top edge, and this label was sitting on it
          with no padding at all. It also wraps to two lines on the longer
          preview strings, so a row mixing one- and two-line labels started its
          videos at different heights. Reserve two lines' worth either way and
          clamp at two, so every card in a row opens its media on the same
          baseline. */}
      <p
        className="line-clamp-2 min-h-[30px] pb-2.5 pt-3 font-mono text-[10px] uppercase leading-[1.5] tracking-[0.14em]"
        style={{ color: C.textDim }}
      >
        {sample.preview}
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
        <video
          ref={setVideo}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ background: "#000" }}
          src={`/samples/clips/${sample.slug}.mp4`}
          poster={`/samples/posters/${sample.slug}.jpg`}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={sample.title}
        />
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
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.accent }}>
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
        <p className="mt-2 text-[12.5px]" style={{ color: C.textMid }}>
          {sample.breadcrumb.map((b, i) => (
            <span key={`${b}-${i}`}>
              {i > 0 && <span style={{ color: C.textDim }}> › </span>}
              <span style={{ color: i === 0 ? C.value : C.textMid }}>{b}</span>
            </span>
          ))}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {sample.pills.map((pill) => {
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
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors"
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
      className={`sm-chip flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] disabled:opacity-30${caps ? " capitalize" : ""}`}
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
function CapabilityPanel({ modality, onClear }: { modality: string; onClear: () => void }) {
  const tiers = CAPABILITY[modality] ?? [];
  const running = IN_FLIGHT[modality];
  const name = MODALITIES.find((m) => m.key === modality)?.label ?? modality;

  return (
    <div className="py-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.accent }}>
        No published samples yet
      </p>
      <h3
        className="mt-2 text-2xl font-medium tracking-tight"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
      >
        {name} runs on the same pipeline.
      </h3>
      <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed" style={{ color: C.textMid }}>
        Nothing from this line is on the page yet. It is collected to spec. These are the same
        terms we would send in a quote.
      </p>

      {running && (
        <p
          className="mt-5 max-w-xl px-4 py-3 text-[12.5px] leading-relaxed"
          style={{ border: `1px solid ${C.hairline}`, background: C.band, color: C.textMid }}
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
              <p className="text-[13.5px] font-medium">{t.name}</p>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.textDim }}>
                {t.rig}
                {t.sensors ? ` · ${t.sensors}` : ""}
              </p>
            </div>
            {/* Ramp and ceiling, never `t.price` — see the comment on that
                field. A rate on a public page anchors a brief nobody has
                written yet. These two are what a buyer schedules around. */}
            <p
              className="font-mono text-[11.5px] leading-relaxed md:text-right"
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
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={first ? "pb-5 pt-6" : "py-5"}
      style={first ? undefined : { borderTop: `1px solid ${C.hairline}` }}
    >
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.textDim }}>
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
export function SampleCatalog({ modality }: { modality: string }) {
  const [active, setActive] = useState<Sample | null>(null);
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
    const found = ALL.find((s) => s.slug === slug);
    if (found) setActive(found);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (active) url.searchParams.set("record", active.slug);
    else url.searchParams.delete("record");
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }, [active]);
  const [f, setF] = useState<Filters>({ ...EMPTY, scope: modality });

  // The route is the source of truth for scope; a client nav between categories
  // remounts nothing, so the filter has to follow it.
  useEffect(() => {
    setF((p) => (p.scope === modality ? p : { ...EMPTY, scope: modality }));
  }, [modality]);

  /* Clear empties the facets and leaves the reader where they were. Scope is
     navigation, not narrowing: resetting it would teleport a gaming buyer back
     into the robotics grid for pressing "Clear". */
  const clear = () => setF({ ...EMPTY, scope: f.scope });

  /** Records in the reader's line, before any facet narrows them. */
  const inLine = useMemo(
    () => ALL.filter((s) => s.modality === f.scope).length,
    [f.scope],
  );

  const [sort, setSort] = useState<SortKey>("longest");
  // Six facet groups is a long scroll before the grid on a phone, so the rail
  // collapses below lg and is always open from lg up.
  const [railOpen, setRailOpen] = useState(false);

  const toggle = (
    key: "modality" | "provenance" | "viewpoint" | "skillGroup" | "industry" | "rig" | "site",
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
      ALL.filter((s) => matches(s, f, key)).filter((s) => pick(s) === v).length,
    [f],
  );

  const shown = useMemo(() => {
    const out = ALL.filter((s) => matches(s, f));
    const by: Record<SortKey, (a: Sample, b: Sample) => number> = {
      longest: (a, b) => b.durationSec - a.durationSec,
      shortest: (a, b) => a.durationSec - b.durationSec,
      live: (a, b) => Number(b.telemetry) - Number(a.telemetry) || a.title.localeCompare(b.title),
      title: (a, b) => a.title.localeCompare(b.title),
    };
    return [...out].sort(by[sort]);
  }, [f, sort]);

  /* Every facet's options come from the records IN THIS CATEGORY, never from
     the global taxonomy.
     The rail was listing SKILL_GROUPS and INDUSTRIES whole, so /samples/egocentric
     offered "Healthcare & Caregiving 0" and "Home Appliance Interaction 0" —
     rows that exist in the taxonomy and in no record here — and "Third person 0"
     under Viewpoint, on a category defined by being first-person. A greyed row
     reading zero is a control that cannot do anything, and six of them ahead of
     the ones that can is what made this rail long. */
  const scoped = useMemo(() => ALL.filter((s) => s.modality === f.scope), [f.scope]);
  const valuesOf = useCallback(
    (pick: (s: Sample) => string | null) =>
      Array.from(new Set(scoped.map(pick).filter(Boolean) as string[])).sort(),
    [scoped],
  );

  const rigs = useMemo(() => valuesOf((s) => s.rig), [valuesOf]);
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
      { value: "all", label: "Any job", count: ALL.filter((s) => matches(s, f, "job")).length },
      ...jobs.map((j) => ({ value: j, label: j, count: countFor("job", (s) => s.job, j) })),
    ],
    [jobs, f, countFor],
  );

  const dirty =
    f.modality.length + f.provenance.length + f.viewpoint.length + f.skillGroup.length +
      f.industry.length + f.rig.length + f.site.length >
      0 ||
    f.job !== "all" ||
    Object.values(f.spec).some((v) => v.length > 0) ||
    f.q.trim() !== "";

  const totals = useMemo(() => {
    const minutes = shown.reduce((a, s) => a + s.durationSec, 0) / 60;
    return { minutes: minutes.toFixed(1), live: shown.filter((s) => s.telemetry).length };
  }, [shown]);

  // The grid is capped and extended by a button rather than paged by number.
  // What costs something here is mounted <video> elements — every card holds one
  // and plays it on hover — not rows of markup, so the cap has to bound those.
  // A numbered pager would also throw away scroll position on every step and put
  // a second navigation model next to the facet rail, which already narrows.
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [f, sort]);
  const page = shown.slice(0, limit);
  const rest = shown.length - page.length;

  /* The modality to pitch when the grid comes back empty: exactly one selected,
     and it is one we can quote. Two selected is a combination the reader built,
     not a line they asked about, and pitching one of the two would be picking
     for them. */
  const emptyLine =
    f.modality.length === 1 && CAPABILITY[f.modality[0]] ? f.modality[0] : null;

  return (
    <>    <section id="deck" style={{ background: C.base, color: C.text }}>
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
          <aside className="lg:col-span-3">
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
                  placeholder="Search tasks, rigs, sites"
                  aria-label="Search samples"
                  className="w-full rounded-lg py-2 pl-9 pr-3 text-[13px] outline-none"
                  style={{ background: C.band, border: `1px solid ${C.hairline}`, color: C.text }}
                />
              </label>

              {/* Every group below renders only where this category has more
                  than one value for it. A facet with one value is not a facet,
                  and a facet with none is a row of zeroes. */}
              {sources.length > 1 && (
                <RailGroup title="Source" first>
                  {sources.map((p) => (
                    <Chip
                      key={p.key}
                      label={p.label}
                      active={f.provenance.includes(p.key)}
                      count={countFor("provenance", (s) => s.provenance, p.key)}
                      onClick={() => toggle("provenance", p.key)}
                    />
                  ))}
                </RailGroup>
              )}

              {viewpoints.length > 1 && (
                <RailGroup title="Viewpoint" first={sources.length <= 1}>
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
                <RailGroup title="Skill group">
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
                <RailGroup title="Industry">
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
                <RailGroup title="Site type">
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

              {rigs.length > 1 && (
                <RailGroup title="Rig">
                  {rigs.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      active={f.rig.includes(r)}
                      count={countFor("rig", (s) => s.rig, r)}
                      onClick={() => toggle("rig", r)}
                    />
                  ))}
                </RailGroup>
              )}

              {/* This category's own axes. Gaming's are Game, Session and
                  Stress; egocentric has none here because its axes are typed
                  fields and appear above. */}
              {specFacets.map((facet) => (
                <RailGroup key={facet.key} title={facet.title}>
                  {facet.values.map((v) => (
                    <Chip
                      key={v}
                      label={v}
                      caps
                      active={(f.spec[facet.key] ?? []).includes(v)}
                      count={countFor("spec", (s) => specCell(s, facet.key), v)}
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
                <RailGroup title="Job">
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
              <p className="font-mono text-[11px]" style={{ color: C.textDim }}>
                {/* Denominator is the category, not the whole file. It read
                    "118 of 126" on a page that only contains 118. */}
                {shown.length} of {inLine} samples
                <span className="mx-2">/</span>
                {totals.minutes} minutes of source
                <span className="mx-2">/</span>
                {totals.live} with live data
              </p>
              <div className="flex items-center gap-4">
                {dirty && (
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: C.textDim }}
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
                <span className="flex items-center gap-2 text-[12.5px]" style={{ color: C.textDim }}>
                  Sort
                  {/* Same trigger class as the Job picker, from the same file.
                      Two dropdowns on one screen styled apart is the drift this
                      page keeps having to undo. No `data-active`: a sort order
                      is always set, so "on" says nothing here. */}
                  <SortPicker
                    value={sort}
                    options={SORTS}
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
              emptyLine ? (
                <CapabilityPanel modality={emptyLine} onClear={() => setF(EMPTY)} />
              ) : (
                <div className="py-24 text-center">
                  <p className="text-sm" style={{ color: C.textMid }}>
                    Nothing matches that combination.
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-[13px]" style={{ color: C.textDim }}>
                    Game sessions carry no skill group, industry or job, so those three narrow to the
                    egocentric line.
                  </p>
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
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 2xl:grid-cols-3">
                  {page.map((s) => (
                    <Card key={s.slug} sample={s} onOpen={() => setActive(s)} />
                  ))}
                </div>

                {rest > 0 && (
                  <div className="mt-10 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLimit((n) => n + PAGE)}
                      className="rounded-full px-6 py-3 text-[13px] font-semibold transition-transform active:scale-[0.98]"
                      style={{ border: `1px solid ${C.rule}`, color: C.text }}
                    >
                      Show {Math.min(rest, PAGE)} more
                    </button>
                    <p className="font-mono text-[11px]" style={{ color: C.textDim }}>
                      {page.length} of {shown.length} shown
                    </p>
                  </div>
                )}
              </>
            )}

            {/* The gate sits under the grid now. It used to open the section,
                which asked a reader to think about passcodes before they had
                seen a single frame - and free playback with no form is the one
                thing this page has that the competitors do not. */}
            <AccessStrip />
          </div>
        </div>
        </Reveal>
      </div>
    </section>
      <SampleModal sample={active} onClose={() => setActive(null)} />
    </>
  );
}
