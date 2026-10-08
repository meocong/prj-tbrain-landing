"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Play } from "lucide-react";
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
import { HAIRLINE_TOP, Lede, PageSection, SectionHead } from "./page-kit";
import { SAMPLES, pad2 } from "./page-data";

/**
 * #recordings: all of them, one row each, and a button that plays the row.
 *
 * A semantic table: readable by a screen reader, sortable by keyboard, copyable
 * into a spreadsheet. "Visualize" does not navigate; it opens the row in the
 * record dialog (`openRecord`, the channel every "open a sample" link on this
 * page uses, heard by `RecordModalHost`). Below 1024px each row is a card, because nine
 * columns do not survive a phone and a table that scrolls sideways is the worst
 * way to read one.
 *
 * What a bar says. Each hand's bar is the clip: solid is measured, hatched is
 * guessed, and what is left over is bridged or no 3D pose. The number beside it is
 * the 3D pose share (measured plus guessed).
 */

type SortKey = "n" | "title" | "skillGroup" | "seconds" | "frames" | "left" | "right" | "measured";
type Dir = "asc" | "desc";

interface Column {
  key: SortKey | null;
  label: string;
  first?: Dir;
  numeric?: boolean;
  width?: string;
}

const COLUMNS: Column[] = [
  { key: null, label: "Preview", width: "w-[4.5rem]" },
  { key: "n", label: "#", first: "asc", width: "w-9" },
  { key: "title", label: "Recording", first: "asc", width: "min-w-[8rem]" },
  { key: "skillGroup", label: "Skill group", first: "asc", width: "min-w-[8.5rem]" },
  { key: "seconds", label: "Duration", first: "desc", numeric: true, width: "w-[5.5rem]" },
  { key: "frames", label: "Frames", first: "desc", numeric: true, width: "w-[5rem]" },
  { key: "left", label: "Left, 3D pose", first: "desc", width: "min-w-[9.5rem]" },
  { key: "right", label: "Right, 3D pose", first: "desc", width: "min-w-[9.5rem]" },
  { key: "measured", label: "Measured, of delivered", first: "desc", numeric: true, width: "w-[7.5rem]" },
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
    case "measured":
      return s.measuredOfDeliveredPct;
  }
}

function Thumb({ s }: { s: HandPoseSample }) {
  const src = s.media.poster ?? s.media.still;
  return (
    <span
      aria-hidden
      className="relative block h-[42px] w-[56px] flex-none overflow-hidden"
      style={{ background: "#06080E", border: `1px solid ${C.hairline}` }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={56} height={42} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      )}
    </span>
  );
}

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
    <div className="flex min-w-[140px] items-center gap-2.5">
      <PoseBar hand={hand} stats={s[hand]} frames={s.frames} />
      <span className="w-[46px] flex-none text-right font-mono text-[12px]" style={{ color: C.value }}>
        {fmtPct(s[hand].posePct)}
      </span>
    </div>
  );
}

function Visualize({ s, from }: { s: HandPoseSample; from: string }) {
  return (
    <button
      type="button"
      aria-label={`Visualize recording ${pad2(s.n)}, ${s.title}`}
      onClick={() => {
        track("handpose_sample_open", { slug: s.slug, from });
        openRecord(s.slug);
      }}
      className="bp-mono inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[10px] transition-colors hover:border-(--sm-accent)!"
      style={{ border: `1px solid ${C.rule}`, color: C.text }}
    >
      <Play aria-hidden className="h-3 w-3" style={{ color: C.accent }} />
      Visualize
    </button>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: Dir }) {
  const cls = "mt-px h-3 w-3 flex-none";
  if (!active) return <ChevronsUpDown aria-hidden className={cls} />;
  return dir === "asc" ? <ArrowUp aria-hidden className={cls} /> : <ArrowDown aria-hidden className={cls} />;
}

function Card({ s, className = "" }: { s: HandPoseSample; className?: string }) {
  const p = PILL.skill;
  return (
    <li className={`py-3.5 ${className}`} style={HAIRLINE_TOP}>
      <div className="flex items-center gap-3">
        <Thumb s={s} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium" style={{ color: C.text }}>
            <span className="mr-1.5 font-mono text-[11px] font-normal" style={{ color: C.textDim }}>
              {pad2(s.n)}
            </span>
            {s.title}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]" style={{ color: C.textMid }}>
            <span
              className="whitespace-nowrap rounded-full px-2 py-[3px] text-[10.5px] leading-none"
              style={{ background: p.bg, color: p.fg, border: `1px solid ${p.bd}` }}
            >
              {s.skillGroup}
            </span>
            <span className="font-mono">
              {mmss(s.seconds)} · {fmtCount(s.frames)} frames
            </span>
          </p>
        </div>
        <Visualize s={s} from="recordings_card" />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-x-4">
        {(["left", "right"] as Hand[]).map((hand) => (
          <div key={hand} className="flex items-center gap-2">
            <span aria-hidden className="w-3 flex-none font-mono text-[10px]" style={{ color: HAND_COLOR[hand] }}>
              {hand === "left" ? "L" : "R"}
            </span>
            <PoseBar hand={hand} stats={s[hand]} frames={s.frames} />
            <span className="w-[44px] flex-none text-right font-mono text-[11px]" style={{ color: C.value }}>
              {fmtPct(s[hand].posePct)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[11px]" style={{ color: C.textDim }}>
        Measured {fmtPct(s.measuredOfDeliveredPct)} of delivered
      </p>
    </li>
  );
}

export function RecordingsTable() {
  const [sort, setSort] = useState<{ key: SortKey; dir: Dir }>({ key: "n", dir: "asc" });
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...SAMPLES].sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      const c = typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      return c !== 0 ? c * sign : a.n - b.n;
    });
  }, [sort]);

  const onSort = (col: Column) => {
    if (!col.key) return;
    const dir: Dir = sort.key === col.key ? (sort.dir === "asc" ? "desc" : "asc") : (col.first ?? "asc");
    setSort({ key: col.key, dir });
    track("handpose_table_sort", { key: col.key, dir });
  };

  return (
    <PageSection id="recordings" tone="band" labelledBy="hp-recordings-title">
      <Reveal variant="rise">
        <SectionHead id="hp-recordings-title" eyebrow={`All ${SAMPLES.length} recordings`} lead="Every recording," dim="side by side">
          <Lede>
            Each bar is one hand across the whole clip: solid where it was measured, hatched where it was guessed, empty
            where it was bridged or had no 3D pose. Visualize opens a recording in the viewer.
          </Lede>
        </SectionHead>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 md:mt-7">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]" style={{ color: C.textMid }}>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="hp-lane-row inline-block h-2 w-[22px]" style={{ ["--hp-c" as string]: "currentColor" } as CSSProperties}>
                <span className="hp-run" data-state={1} style={{ left: 0, width: "100%" }} />
              </span>
              Measured
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="hp-lane-row inline-block h-2 w-[22px]" style={{ ["--hp-c" as string]: "currentColor" } as CSSProperties}>
                <span className="hp-run" data-state={2} style={{ left: 0, width: "100%" }} />
              </span>
              Guessed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block h-2 w-[22px] rounded-[2px]" style={{ background: C.wash, border: `1px solid ${C.hairline}` }} />
              Bridged or no 3D pose
            </span>
          </p>
          <a
            href={HANDPOSE_CSV}
            download
            onClick={() => track("handpose_csv", { from: "recordings_table" })}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-transform active:scale-[0.98]"
            style={{ border: `1px solid ${C.rule}`, color: C.text }}
          >
            <Download aria-hidden className="h-3.5 w-3.5" />
            Download table (CSV)
          </a>
        </div>

        <div
          className="bp-card mt-4 hidden overflow-x-auto px-4 pb-2 pt-[18px] lg:block"
          tabIndex={0}
          role="region"
          aria-label={`Table of all ${SAMPLES.length} recordings`}
        >
          <table className="w-full min-w-[960px] border-collapse text-[13px]">
            <caption className="sr-only">
              One row per recording. Left and right bars show measured and guessed frames as a share of all frames.
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
                      className={`bp-mono pb-3 pr-3 align-bottom text-[10px] font-normal leading-snug ${col.numeric ? "text-right" : "text-left"} ${col.width ?? ""}`}
                      style={{ color: active ? C.text : C.textDim, borderBottom: `1px solid ${C.rule}`, letterSpacing: "0.1em" }}
                    >
                      {col.key ? (
                        <button
                          type="button"
                          onClick={() => onSort(col)}
                          className={`bp-mono inline-flex min-w-6 items-start gap-1 py-1.5 text-[10px] leading-snug ${col.numeric ? "text-right" : "text-left"}`}
                          style={{ letterSpacing: "0.1em" }}
                        >
                          {col.label}
                          <SortIcon active={active} dir={sort.dir} />
                        </button>
                      ) : (
                        <span className="inline-block py-1.5">{col.label}</span>
                      )}
                    </th>
                  );
                })}
                <th scope="col" className="pb-3" style={{ borderBottom: `1px solid ${C.rule}` }}>
                  <span className="sr-only">Visualize</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.slug}
                  className="cursor-pointer transition-colors hover:bg-(--sm-wash)"
                  style={{ borderBottom: `1px solid ${C.hairline}` }}
                  /* The whole row is a target for a pointer; the button is the
                     control for everything else. */
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a,button")) return;
                    track("handpose_sample_open", { slug: s.slug, from: "recordings_row" });
                    openRecord(s.slug);
                  }}
                >
                  <td className="py-2 pr-3">
                    <Thumb s={s} />
                  </td>
                  <td className="w-9 py-2 pr-3 font-mono text-[11px]" style={{ color: C.textDim }}>
                    {pad2(s.n)}
                  </td>
                  <th scope="row" className="py-2 pr-3 text-left font-medium" style={{ color: C.text }}>
                    {s.title}
                  </th>
                  <td className="py-2 pr-3 text-[12px]" style={{ color: C.textMid }}>
                    {s.skillGroup}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-[12px]" style={{ color: C.value }}>
                    {mmss(s.seconds)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-[12px]" style={{ color: C.value }}>
                    {fmtCount(s.frames)}
                  </td>
                  <td className="py-2 pr-3">
                    <PoseCell hand="left" s={s} />
                  </td>
                  <td className="py-2 pr-3">
                    <PoseCell hand="right" s={s} />
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-[12px]" style={{ color: C.value }}>
                    {fmtPct(s.measuredOfDeliveredPct)}
                  </td>
                  <td className="py-2 text-right">
                    <Visualize s={s} from="recordings_table" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-4 grid md:grid-cols-2 md:gap-x-8 lg:hidden" aria-label={`All ${SAMPLES.length} recordings`}>
          {rows.map((s, i) => (
            <Card key={s.slug} s={s} className={!showAll && i >= 6 ? "max-md:hidden" : ""} />
          ))}
        </ul>
        {rows.length > 6 && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium md:hidden"
            style={{ border: `1px solid ${C.rule}`, color: C.text }}
          >
            {showAll ? "Show fewer" : `Show all ${rows.length}`}
          </button>
        )}

        <p className="mt-6 max-w-[46rem] text-[12px] leading-relaxed" style={{ color: C.textDim }}>
          3D pose is the share of a hand's frames with a measured or guessed pose; bridged frames are counted on their
          own. Measured, of delivered is how many of those poses were measured rather than guessed.
        </p>
      </Reveal>
    </PageSection>
  );
}
