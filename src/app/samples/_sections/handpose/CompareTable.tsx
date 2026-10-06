"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronRight, ChevronsUpDown, Download } from "lucide-react";
import {
  HANDPOSE_CSV,
  HAND_COLOR,
  HAND_LABEL,
  fmtCount,
  fmtPct,
  mmss,
  type Hand,
  type HandPoseSample,
  type HandStats,
} from "@/lib/samples/handpose";
import { openRecord } from "@/lib/samples/open-record";
import { track } from "@/lib/samples/track";
import { C, PILL } from "../tokens";
import { Reveal } from "../Reveal";
import { LaneSwatch } from "./glyphs";
import { HAIRLINE_TOP, Lede, NEUTRAL_INK, PageSection, SectionHead } from "./page-kit";
import { SAMPLES, pad2, previewLabel } from "./page-data";
import { HashLink, OpenRecordLink } from "./page-links";

/**
 * #compare: every sample on one row, weak ones included.
 *
 * A semantic table, so it can be read by a screen reader, sorted by keyboard
 * and copied into a spreadsheet; below 640px each row becomes a card, because
 * eleven columns do not survive a phone and sideways scrolling a table is the
 * worst way to read one.
 *
 * What the bars say. Each hand's bar is the clip: solid is measured, hatched is
 * guessed, and what is left over is bridged or no 3D pose. The number beside
 * it is the 3D pose share (measured plus guessed). Missed is the pipeline's own
 * figure and its definition is still being confirmed, so it lives in this table
 * and the viewer only, labelled as reported, with the footnote. Never a tile.
 */

type SortKey = "n" | "title" | "skillGroup" | "seconds" | "frames" | "left" | "right" | "guessed" | "missed";
type Dir = "asc" | "desc";
type FilterKey = "both95" | "below50";

interface Column {
  key: SortKey | null;
  label: string;
  /** What a first press on the header does: text and numbers run opposite ways. */
  first?: Dir;
  numeric?: boolean;
  /**
   * Width, as whole Tailwind classes. The table is `auto`-laid-out and its
   * headers wrap, so these only say where the room goes: to the two bars and
   * the title, not to the numbers.
   */
  width: string;
  /** Said on hover, where the printed header is a fragment. */
  hint?: string;
}

const COLUMNS: Column[] = [
  { key: "n", label: "#", first: "asc", width: "w-9" },
  { key: "title", label: "Sample", first: "asc", width: "min-w-[7.5rem]" },
  { key: "skillGroup", label: "Skill group", first: "asc", width: "min-w-[8.5rem]" },
  { key: "seconds", label: "Duration", first: "desc", numeric: true, width: "w-[5.5rem]" },
  { key: "frames", label: "Frames", first: "desc", numeric: true, width: "w-[5rem]" },
  { key: "left", label: "Left, 3D pose", first: "desc", width: "min-w-[10rem]" },
  { key: "right", label: "Right, 3D pose", first: "desc", width: "min-w-[10rem]" },
  { key: "guessed", label: "Guessed, of delivered", first: "desc", numeric: true, width: "w-[7.5rem]" },
  {
    key: "missed",
    label: "Missed, as reported (L / R)*",
    first: "desc",
    numeric: true,
    width: "w-[9.5rem]",
    hint: "Sorts by the higher of the two hands",
  },
  { key: null, label: "Preview", width: "w-[4.5rem]" },
];

function sortValue(s: HandPoseSample, key: SortKey): number | string {
  switch (key) {
    case "n":
      return s.n;
    case "title":
      return s.title;
    case "skillGroup":
      return s.skillGroup;
    case "seconds":
      return s.seconds;
    case "frames":
      return s.frames;
    case "left":
      return s.left.posePct;
    case "right":
      return s.right.posePct;
    case "guessed":
      return s.guessedOfDeliveredPct;
    case "missed":
      return Math.max(s.left.missedPct, s.right.missedPct);
  }
}

/** Cards shown on a phone before "Show all". */
const PHONE_ROWS = 5;

const FILTERS: Record<FilterKey, (s: HandPoseSample) => boolean> = {
  both95: (s) => s.minPosePct >= 95,
  below50: (s) => s.minPosePct < 50,
};

/** One hand's bar: measured solid, guessed hatched, painted with the lane's own classes. */
function PoseBar({ hand, stats, frames }: { hand: Hand; stats: HandStats; frames: number }) {
  const measured = (stats.measured / frames) * 100;
  const guessed = (stats.guessed / frames) * 100;
  return (
    <span
      role="img"
      aria-label={`${HAND_LABEL[hand]} hand: ${fmtCount(stats.measured)} measured and ${fmtCount(stats.guessed)} guessed of ${fmtCount(frames)} frames`}
      className="hp-lane-row h-2 min-w-0 flex-1 rounded-[2px]"
      style={{ ["--hp-c" as string]: HAND_COLOR[hand], background: C.wash, border: `1px solid ${C.hairline}` } as CSSProperties}
    >
      <span className="hp-run" data-state={1} style={{ left: 0, width: `${measured}%` }} />
      {stats.guessed > 0 && (
        <span className="hp-run" data-state={2} style={{ left: `${measured}%`, width: `max(${guessed}%, 2px)` }} />
      )}
    </span>
  );
}

function PoseCell({ hand, s }: { hand: Hand; s: HandPoseSample }) {
  return (
    <div className="flex min-w-[150px] items-center gap-2.5">
      <PoseBar hand={hand} stats={s[hand]} frames={s.frames} />
      <span className="w-[46px] flex-none text-right font-mono text-[12px]" style={{ color: C.value }}>
        {fmtPct(s[hand].posePct)}
      </span>
    </div>
  );
}

function PreviewMark({ s }: { s: HandPoseSample }) {
  return s.preview === "video" ? (
    <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: C.positive }}>
      <Check aria-hidden strokeWidth={2.4} className="h-3.5 w-3.5" />
      <span className="sr-only">{previewLabel(s)} available</span>
    </span>
  ) : (
    <span style={{ color: C.textDim }} title={previewLabel(s)}>
      <span aria-hidden>&mdash;</span>
      <span className="sr-only">{previewLabel(s)}</span>
    </span>
  );
}

const OPEN_CLASS = "bp-mono inline-flex items-center gap-1 whitespace-nowrap py-1.5 text-[10px]";

function Pill({ kind, children }: { kind: keyof typeof PILL; children: ReactNode }) {
  const p = PILL[kind];
  return (
    <span
      className="whitespace-nowrap rounded-full px-2 py-[3px] text-[10.5px] leading-none"
      style={{ background: p.bg, color: p.fg, border: `1px solid ${p.bd}` }}
    >
      {children}
    </span>
  );
}

function SampleCard({ s, className = "" }: { s: HandPoseSample; className?: string }) {
  return (
    <li className={`py-3.5 ${className}`} style={HAIRLINE_TOP}>
      <div className="flex items-baseline gap-2.5">
        <p className="min-w-0 truncate text-[14px] font-medium" style={{ color: C.text }}>
          <span className="mr-1.5 font-mono text-[11px] font-normal" style={{ color: C.textDim }}>
            {pad2(s.n)}
          </span>
          {s.title}
        </p>
        <span className="flex-none font-mono text-[11px]" style={{ color: C.textDim }}>
          {mmss(s.seconds)}
        </span>
        <OpenRecordLink
          slug={s.slug}
          from="compare_card"
          aria-label={`Open sample ${pad2(s.n)}, ${s.title}`}
          className={`${OPEN_CLASS} ml-auto flex-none`}
          style={{ color: C.accent }}
        >
          Open <ChevronRight aria-hidden className="h-3 w-3" />
        </OpenRecordLink>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <Pill kind="skill">{s.skillGroup}</Pill>
        <Pill kind="file">{fmtCount(s.frames)} frames</Pill>
        <Pill kind="file">guessed {fmtPct(s.guessedOfDeliveredPct)} of delivered</Pill>
        <Pill kind="file">
          missed {s.left.missedPct.toFixed(1)} / {s.right.missedPct.toFixed(1)} (reported)
        </Pill>
        {s.preview === "video" && <Pill kind="quality">preview</Pill>}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-x-4">
        {(["left", "right"] as Hand[]).map((hand) => (
          <div key={hand} className="flex items-center gap-2">
            <span aria-hidden className="w-3 flex-none font-mono text-[10px]" style={{ color: C.textMid }}>
              {hand === "left" ? "L" : "R"}
            </span>
            <PoseBar hand={hand} stats={s[hand]} frames={s.frames} />
            <span className="w-[44px] flex-none text-right font-mono text-[11px]" style={{ color: C.value }}>
              {fmtPct(s[hand].posePct)}
            </span>
          </div>
        ))}
      </div>
    </li>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: Dir }) {
  const cls = "mt-px h-3 w-3 flex-none";
  if (!active) return <ChevronsUpDown aria-hidden className={cls} />;
  return dir === "asc" ? <ArrowUp aria-hidden className={cls} /> : <ArrowDown aria-hidden className={cls} />;
}

export function CompareTable() {
  const [sort, setSort] = useState<{ key: SortKey; dir: Dir }>({ key: "n", dir: "asc" });
  const [filter, setFilter] = useState<FilterKey | null>(null);
  // Phones only: the cards are the same sixteen samples the catalogue above
  // already shows, so they start at the first few and the rest are a press away.
  const [showAll, setShowAll] = useState(false);

  const counts = useMemo(
    () => ({
      both95: SAMPLES.filter(FILTERS.both95).length,
      below50: SAMPLES.filter(FILTERS.below50).length,
    }),
    [],
  );

  const rows = useMemo(() => {
    const sign = sort.dir === "asc" ? 1 : -1;
    return SAMPLES.filter((s) => (filter ? FILTERS[filter](s) : true)).sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      const c = typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      // Ties fall back to sample number, ascending, whichever way the column runs.
      return c !== 0 ? c * sign : a.n - b.n;
    });
  }, [sort, filter]);

  const onSort = (col: Column) => {
    if (!col.key) return;
    const dir: Dir = sort.key === col.key ? (sort.dir === "asc" ? "desc" : "asc") : (col.first ?? "asc");
    setSort({ key: col.key, dir });
    track("handpose_table_sort", { key: col.key, dir });
  };

  const toggle = (k: FilterKey) => setFilter((f) => (f === k ? null : k));

  const chip = (k: FilterKey, label: string, count: string) => (
    <button
      type="button"
      aria-pressed={filter === k}
      data-active={filter === k}
      onClick={() => toggle(k)}
      className="sm-chip inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px]"
      style={{ borderColor: filter === k ? C.accent : C.hairline }}
    >
      {label}
      <span className="sm-chip-count font-mono text-[10px]">{count}</span>
    </button>
  );

  return (
    <PageSection id="compare" tone="paper" labelledBy="hp-compare-title">
      <Reveal variant="rise">
        <SectionHead
          id="hp-compare-title"
          eyebrow={`Compare all ${SAMPLES.length}`}
          lead="Every sample,"
          dim="weak rows included"
        >
          <Lede>
            One row per sample. Bars show measured (solid) plus guessed (hatched) as a share of all frames; the rest of
            each bar is bridged or No 3D pose. Open a row to see its frame-by-frame lane.
          </Lede>
        </SectionHead>

        <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-3 md:mt-7">
          <div role="group" aria-label="Filter the table" className="flex flex-wrap gap-2.5">
            {chip("both95", "Both hands 95% or more", String(counts.both95))}
            {chip("below50", "Any hand below 50%", `${counts.below50} samples`)}
          </div>
          <p role="status" className="font-mono text-[11px]" style={{ color: C.textDim }}>
            {rows.length} of {SAMPLES.length} samples
          </p>
          <span className="hidden flex-1 sm:block" />
          <div className="flex flex-wrap gap-2">
            <a
              href={HANDPOSE_CSV}
              download
              onClick={() => track("handpose_csv", { from: "compare_table" })}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-transform active:scale-[0.98]"
              style={{ border: `1px solid ${C.rule}`, color: C.text }}
            >
              <Download aria-hidden className="h-3.5 w-3.5" />
              Download table (CSV)
            </a>
            <HashLink
              id="legend"
              className="inline-flex items-center rounded-full px-4 py-2 text-[12px] font-medium transition-transform active:scale-[0.98]"
              style={{ border: `1px solid ${C.rule}`, color: C.text }}
            >
              How to read this
            </HashLink>
          </div>
        </div>

        {/* What a bar is made of, once, where the eye is before it reaches 32 of them. */}
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]" style={{ color: C.textMid }}>
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: NEUTRAL_INK }}>
              <LaneSwatch state="measured" width={22} height={8} />
            </span>
            Measured
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: NEUTRAL_INK }}>
              <LaneSwatch state="guessed" width={22} height={8} />
            </span>
            Guessed
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ color: C.textMid }}>
            <span
              aria-hidden
              className="inline-block h-2 w-[22px] rounded-[2px]"
              style={{ background: C.wash, border: `1px solid ${C.hairline}` }}
            />
            Bridged or no 3D pose
          </span>
        </p>

        {/* From 1280px: the table. Below it eleven columns would scroll sideways
            on a tablet or a small laptop, which is the worst way to read one,
            so those widths get the cards. The scroller is still a focusable
            region, for zoomed text and anything else that makes it overflow. */}
        <div
          className="bp-card mt-4 hidden overflow-x-auto px-4 pb-2 pt-[18px] xl:block"
          tabIndex={0}
          role="region"
          aria-label={`Comparison table of all ${SAMPLES.length} samples`}
        >
          <table className="w-full min-w-[960px] border-collapse text-[13px]">
            <caption className="sr-only">
              One row per sample. Left and right bars show measured and guessed frames as a share of all frames.
            </caption>
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const active = col.key !== null && sort.key === col.key;
                  return (
                    <th
                      key={col.label}
                      scope="col"
                      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                      className={`bp-mono pb-3 pr-3 align-bottom text-[10px] font-normal leading-snug ${col.numeric ? "text-right" : "text-left"} ${col.width}`}
                      style={{ color: active ? C.text : C.textDim, borderBottom: `1px solid ${C.rule}`, letterSpacing: "0.1em" }}
                    >
                      {col.key ? (
                        <button
                          type="button"
                          onClick={() => onSort(col)}
                          title={col.hint}
                          className={`bp-mono inline-flex min-w-6 items-start gap-1 py-1.5 text-[10px] leading-snug ${col.numeric ? "text-right" : "text-left"}`}
                          style={{ letterSpacing: "0.1em" }}
                        >
                          {col.label}
                          <SortIcon active={active} dir={sort.dir} />
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
                <th scope="col" className="pb-3" style={{ borderBottom: `1px solid ${C.rule}` }}>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.slug}
                  className="cursor-pointer transition-colors hover:bg-(--sm-wash)"
                  style={{ borderBottom: `1px solid ${C.hairline}` }}
                  /* The whole row is a target for a pointer; the Open link is the
                     control for everything else. */
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a,button")) return;
                    track("handpose_sample_open", { slug: s.slug, from: "compare_row" });
                    openRecord(s.slug);
                  }}
                >
                  <td className="w-9 py-2.5 pr-3 font-mono text-[11px]" style={{ color: C.textDim }}>
                    {pad2(s.n)}
                  </td>
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium" style={{ color: C.text }}>
                    {s.title}
                  </th>
                  <td className="py-2.5 pr-3 text-[12px]" style={{ color: C.textMid }}>
                    {s.skillGroup}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-[12px]" style={{ color: C.value }}>
                    {mmss(s.seconds)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-[12px]" style={{ color: C.value }}>
                    {fmtCount(s.frames)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <PoseCell hand="left" s={s} />
                  </td>
                  <td className="py-2.5 pr-3">
                    <PoseCell hand="right" s={s} />
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-[12px]" style={{ color: C.value }}>
                    {fmtPct(s.guessedOfDeliveredPct)}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-right font-mono text-[12px]" style={{ color: C.value }}>
                    {s.left.missedPct.toFixed(1)} / {s.right.missedPct.toFixed(1)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <PreviewMark s={s} />
                  </td>
                  <td className="py-2.5 text-right">
                    <OpenRecordLink
                      slug={s.slug}
                      from="compare_table"
                      aria-label={`Open sample ${pad2(s.n)}, ${s.title}`}
                      className={OPEN_CLASS}
                      style={{ color: C.accent }}
                    >
                      Open <ChevronRight aria-hidden className="h-3 w-3" />
                    </OpenRecordLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Under 1280px: one card per row, same order, same filters. Two across
            from 640px. On a phone only the first few show until "Show all". */}
        <ul
          className="mt-4 grid sm:grid-cols-2 sm:gap-x-8 xl:hidden"
          aria-label={`Comparison of all ${SAMPLES.length} samples`}
        >
          {rows.map((s, i) => (
            <SampleCard key={s.slug} s={s} className={!showAll && i >= PHONE_ROWS ? "max-sm:hidden" : ""} />
          ))}
        </ul>
        {rows.length > PHONE_ROWS && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium sm:hidden"
            style={{ border: `1px solid ${C.rule}`, color: C.text }}
          >
            {showAll ? "Show fewer" : `Show all ${rows.length}`}
            <ChevronDown
              aria-hidden
              className="h-3.5 w-3.5 transition-transform"
              style={{ transform: showAll ? "rotate(180deg)" : undefined, color: C.textDim }}
            />
          </button>
        )}

        <p className="mt-6 max-w-[46rem] text-[12px] leading-relaxed" style={{ color: C.textDim }}>
          3D pose = measured plus guessed frames as a share of all frames; bridged frames are counted separately.
          Guessed, of delivered = guessed frames as a share of measured plus guessed. *Missed is the pipeline&apos;s own
          figure: frames where a hand is clearly visible in a camera but no 3D hand is delivered, as a share of visible
          frames. Its exact definition is being confirmed. Percentages to one decimal, counts exact.
        </p>
      </Reveal>
    </PageSection>
  );
}
