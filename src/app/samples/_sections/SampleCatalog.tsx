"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, Search, SlidersHorizontal, X } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { SKILL_GROUPS, JOBS, INDUSTRIES } from "@/lib/samples/taxonomy";
import { groupSpec, LONG_VALUE } from "@/lib/samples/spec-sections";
import { publicSpec } from "@/lib/samples/redact.mjs";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";
import { AccessStrip } from "./AccessActions";
import { LiveTelemetry } from "./LiveTelemetry";
import { C, OVER_MEDIA, PILL, type Sample } from "./tokens";
import { SampleModal } from "./SampleModal";

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

const DOMAINS = [
  { key: "robotics", label: "Robotics" },
  { key: "game", label: "Video game" },
  { key: "ots", label: "Off the shelf" },
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
  domain: string[];
  viewpoint: string[];
  skillGroup: string[];
  industry: string[];
  rig: string[];
  job: string;
  q: string;
}

const EMPTY: Filters = {
  domain: [],
  viewpoint: [],
  skillGroup: [],
  industry: [],
  rig: [],
  job: "all",
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
  if (on("domain") && f.domain.length && !f.domain.includes(s.domain)) return false;
  if (on("viewpoint") && f.viewpoint.length && !f.viewpoint.includes(s.viewpoint)) return false;
  if (on("skillGroup") && f.skillGroup.length && !(s.skillGroup && f.skillGroup.includes(s.skillGroup)))
    return false;
  if (on("industry") && f.industry.length && !(s.industry && f.industry.includes(s.industry)))
    return false;
  if (on("rig") && f.rig.length && !f.rig.includes(s.rig)) return false;
  if (on("job") && f.job !== "all" && s.job !== f.job) return false;
  if (on("q") && f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    const hay = `${s.title} ${s.label} ${s.environment} ${s.rig} ${s.skillGroup ?? ""} ${s.job ?? ""}`;
    if (!hay.toLowerCase().includes(q)) return false;
  }
  return true;
}

/**
 * One field of the shipped record.
 *
 * Values are left aligned under a fixed label column rather than pushed to the
 * right edge: a checksum that wraps reads as one block that way, and a column of
 * values with a common left edge can be scanned without reading each one. Long
 * values stack under their label and take the full measure, because a 64
 * character checksum beside a label leaves nothing to wrap into.
 */
function SpecRow({ label, value }: { label: string; value: string }) {
  const long = value.length > LONG_VALUE;
  // A checksum, uuid or path is one unbroken token and has to be split mid-word
  // to fit. A sentence must not be: `break-all` on prose gives "mag_mi ddle.db".
  const token = !/\s/.test(value);
  return (
    <div
      className={`py-[5px] ${long ? "" : "grid grid-cols-[minmax(6.5rem,auto)_1fr] items-baseline gap-x-4"}`}
      style={{ borderTop: `1px solid ${C.hairlineSoft}` }}
    >
      <dt className="text-[11.5px] leading-relaxed" style={{ color: C.textDim }}>
        {label}
      </dt>
      <dd
        className={`font-mono text-[12px] leading-relaxed ${long ? "mt-0.5" : ""} ${
          token ? "break-all" : "break-words"
        }`}
        style={{ color: C.value }}
      >
        {value}
      </dd>
    </div>
  );
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
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const dead = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dead}
      aria-pressed={active}
      data-active={active}
      className="sm-chip flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] disabled:opacity-30"
    >
      <span className="truncate">{label}</span>
      <span className="sm-chip-count shrink-0 font-mono text-[10px]">{count}</span>
    </button>
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

export function SampleCatalog() {
  const [active, setActive] = useState<Sample | null>(null);
  const [f, setF] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<SortKey>("longest");
  // Six facet groups is a long scroll before the grid on a phone, so the rail
  // collapses below lg and is always open from lg up.
  const [railOpen, setRailOpen] = useState(false);

  const toggle = (key: "domain" | "viewpoint" | "skillGroup" | "industry" | "rig", v: string) => {
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

  const rigs = useMemo(() => Array.from(new Set(ALL.map((s) => s.rig))).sort(), []);
  const jobs = useMemo(
    () => JOBS.filter((j) => ALL.some((s) => s.job === j)),
    [],
  );

  const dirty =
    f.domain.length + f.viewpoint.length + f.skillGroup.length + f.industry.length + f.rig.length > 0 ||
    f.job !== "all" ||
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

  return (
    <>    <section id="deck" style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pt-24 md:pt-28 lg:px-10 xl:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            className="text-3xl font-medium tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
          >
            {ALL.length} files{" "}
            <span style={{ color: C.textDim }}>from real deliveries</span>
          </h2>
          {/* One sentence, and only the part a reader cannot work out by
              looking. Two more used to sit here — open a record for its
              metadata, telemetry runs beside the clip — but the hero says both
              a screen earlier, the cards are visibly clickable, and the access
              strip directly below owns everything about getting the files. All
              three together read as a paragraph to skip.

              The resolution used to be stated here as "640 x 480", which held
              for 18 of the 131 clips; the other 113 encode at 576 x 432. Each
              card already prints its own preview size, measured per file, so
              the one figure that cannot be right for every clip is gone.

              `max-w-md` is wide enough that what is left sets on one line
              (405px of it) rather than wrapping to two. The cap was `sm` to
              stop three sentences running the width of the header; with one
              sentence the same cap is what forces the wrap. */}
          <p className="max-w-md text-sm leading-relaxed" style={{ color: C.textMid }}>
            Previews are 8-second cuts, downscaled from the delivery file.
          </p>
        </div>

        <AccessStrip />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-10 lg:px-10 xl:px-16">
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

              <RailGroup title="Line" first>
                {DOMAINS.map((d) => (
                  <Chip
                    key={d.key}
                    label={d.label}
                    active={f.domain.includes(d.key)}
                    count={countFor("domain", (s) => s.domain, d.key)}
                    onClick={() => toggle("domain", d.key)}
                  />
                ))}
              </RailGroup>

              <RailGroup title="Viewpoint">
                {VIEWPOINTS.map((v) => (
                  <Chip
                    key={v.key}
                    label={v.label}
                    active={f.viewpoint.includes(v.key)}
                    count={countFor("viewpoint", (s) => s.viewpoint, v.key)}
                    onClick={() => toggle("viewpoint", v.key)}
                  />
                ))}
              </RailGroup>

              <RailGroup title="Skill group">
                {SKILL_GROUPS.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    active={f.skillGroup.includes(g)}
                    count={countFor("skillGroup", (s) => s.skillGroup, g)}
                    onClick={() => toggle("skillGroup", g)}
                  />
                ))}
              </RailGroup>

              <RailGroup title="Industry">
                {INDUSTRIES.map((i) => (
                  <Chip
                    key={i}
                    label={i}
                    active={f.industry.includes(i)}
                    count={countFor("industry", (s) => s.industry, i)}
                    onClick={() => toggle("industry", i)}
                  />
                ))}
              </RailGroup>

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

              <RailGroup title="Job">
                {/* `px-2.5` cancels RailGroup's `-mx-2.5` the same way a chip's
                    own padding does. It used to be `mx-2.5 w-[calc(100%-1.25rem)]`
                    on the select itself — arithmetic that had to be redone by
                    hand every time that inset changed. */}
                <div className="relative px-2.5">
                  <select
                    value={f.job}
                    onChange={(e) => setF((p) => ({ ...p, job: e.target.value }))}
                    aria-label="Filter by job"
                    data-active={f.job !== "all"}
                    className="sm-select w-full appearance-none rounded-lg py-1.5 pl-2.5 pr-8 text-[12.5px]"
                  >
                    {/* Counts, because every other control in this rail has
                        them: a chip says how many samples it would leave and
                        greys itself out at zero. Without them the one facet
                        that hides its options behind a click was also the only
                        one you had to pick blind. Each is counted with the job
                        facet lifted, so the numbers stay reachable — same rule
                        as `countFor` everywhere else. */}
                    {/* Not `shown.length`: that is the count AFTER this facet
                        has narrowed, so picking Cook made the reset option read
                        "Any job (17)" — the number it is there to escape. Every
                        count in this control answers the same question, "how
                        many if I pick this", so this one lifts the job facet
                        exactly as `countFor` does for the rows below. */}
                    <option value="all">
                      Any job ({ALL.filter((s) => matches(s, f, "job")).length})
                    </option>
                    {jobs.map((j) => (
                      <option key={j} value={j}>
                        {j} ({countFor("job", (s) => s.job, j)})
                      </option>
                    ))}
                  </select>
                  {/* The native control's own indicator is a macOS double
                      caret in a raised box — the one piece of system chrome on
                      a page that draws every other edge as a hairline.
                      `appearance-none` drops it; this is the same lucide
                      chevron the mobile Filters toggle and the modal already
                      use. `pr-8` above reserves its column so a long job title
                      truncates before it reaches the icon. */}
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                    style={{ color: C.textDim }}
                  />
                </div>
              </RailGroup>
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
                {shown.length} of {ALL.length} samples
                <span className="mx-2">/</span>
                {totals.minutes} minutes of source
                <span className="mx-2">/</span>
                {totals.live} with live data
              </p>
              <div className="flex items-center gap-4">
                {dirty && (
                  <button
                    type="button"
                    onClick={() => setF(EMPTY)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: C.textDim }}
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
                <label className="flex items-center gap-2 text-[12.5px]" style={{ color: C.textDim }}>
                  Sort
                  {/* Same treatment as the Job select, from the same class.
                      Two selects on one screen styled apart is the drift this
                      page keeps having to undo. No `data-active`: a sort order
                      is always set, so "on" says nothing here. */}
                  <span className="relative inline-flex">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="sm-select appearance-none rounded-lg py-1.5 pl-2.5 pr-8 text-[12.5px]"
                    >
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                      style={{ color: C.textDim }}
                    />
                  </span>
                </label>
              </div>
            </div>

            {shown.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-sm" style={{ color: C.textMid }}>
                  Nothing matches that combination.
                </p>
                <p className="mx-auto mt-2 max-w-md text-[13px]" style={{ color: C.textDim }}>
                  Game sessions carry no skill group, industry or job, so those three narrow to the
                  robotics and off-the-shelf lines.
                </p>
                <button
                  type="button"
                  onClick={() => setF(EMPTY)}
                  className="mt-6 rounded-full px-5 py-2 text-[13px] font-semibold"
                  style={{ background: C.text, color: C.base }}
                >
                  Clear filters
                </button>
              </div>
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
          </div>
        </div>
      </div>
    </section>
      <SampleModal sample={active} onClose={() => setActive(null)} />
    </>
  );
}
