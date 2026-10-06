"use client";

import { C } from "../tokens";
import { OpenRecordLink } from "./page-links";

/**
 * "Start here": four samples worth opening first, each a link into its record.
 *
 * Client only for the click: the chip is a real `?record=` link that opens the
 * catalogue's dialog in place (`OpenRecordLink`), and everything it prints is
 * decided on the server by `startHere()` and passed in as plain strings.
 */

export interface StartHereChip {
  label: string;
  slug: string;
  /** "#08". */
  no: string;
  title: string;
  /** The figure that earned the sample its place. */
  sub: string;
}

export function StartHere({ chips }: { chips: StartHereChip[] }) {
  if (chips.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
      <p id="hp-start-label" className="bp-mono w-full text-[10px] sm:w-auto" style={{ color: C.textDim }}>
        Start here
      </p>
      <ul aria-labelledby="hp-start-label" className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-2.5">
        {chips.map((c) => (
          <li key={c.slug} className="min-w-0">
            <OpenRecordLink
              slug={c.slug}
              from="start_here"
              /* Border inline, hover `!important`: globals.css colours every
                 border on `*` outside a layer, which beats a utility class. */
              className="flex h-full flex-col rounded-xl px-3.5 py-2.5 text-left transition-colors hover:border-(--sm-accent)! sm:min-w-[15rem]"
              style={{ background: C.wash, border: `1px solid ${C.hairline}` }}
            >
              <span className="bp-mono text-[9px]" style={{ color: C.accent }}>
                {c.label}
              </span>
              <span className="mt-1.5 text-[13px] font-semibold leading-snug" style={{ color: C.text }}>
                {c.no} {c.title}
              </span>
              <span className="mt-0.5 text-[12px] leading-snug" style={{ color: C.textMid }}>
                {c.sub}
              </span>
            </OpenRecordLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
