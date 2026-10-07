"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Activity, Check, ChevronDown } from "lucide-react";
import { HAND_COLOR, fmtPct, mmss, type HandPoseSample } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { pad2 } from "./page-data";

/**
 * The workspace's sample picker: a select-only combobox (WAI-ARIA APG), drawn by
 * us rather than the browser so each option can show what the sample is — a
 * thumbnail, its number and title, the skill group, the 3D pose share per hand
 * and, where there is no video, what is published instead.
 *
 * Focus stays on the button; the highlighted option is `aria-activedescendant`.
 * Keys: ↓ ↑ Enter Space open; in the list ↓ ↑ Home End PageUp PageDown move,
 * Enter Space Tab choose, Escape closes, and typing jumps to a number or title.
 */

const TIER: Record<HandPoseSample["preview"], string> = { video: "Video", poster: "Still", lane: "Lane only" };

function Thumb({ s, size, load = true }: { s: HandPoseSample; size: "sm" | "md"; load?: boolean }) {
  const box = size === "sm" ? "h-9 w-12" : "h-11 w-[58px]";
  const src = s.media.poster ?? s.media.still;
  return src && load && s.preview !== "lane" ? (
    // A decorative picture of the option; its name is the text beside it.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" decoding="async" className={`${box} flex-none rounded-md object-cover`} style={{ border: `1px solid ${C.hairline}` }} />
  ) : (
    <span
      aria-hidden
      className={`${box} flex flex-none items-center justify-center rounded-md`}
      style={{ background: C.wash, border: `1px solid ${C.hairline}`, color: C.textDim }}
    >
      <Activity className="h-4 w-4" />
    </span>
  );
}

/** Only where something is missing: nearly every sample has a video, so a badge on each would be noise. */
function TierBadge({ s }: { s: HandPoseSample }) {
  if (s.preview === "video") return null;
  return (
    <span
      className="bp-mono flex-none rounded-full px-2 py-[3px] text-[9px]"
      style={{ color: C.textDim, border: `1px solid ${C.hairline}` }}
    >
      {TIER[s.preview]}
    </span>
  );
}

export function SampleSelect({
  samples,
  value,
  onChange,
  label = "Sample",
}: {
  samples: HandPoseSample[];
  value: string;
  onChange: (slug: string) => void;
  label?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const optId = (i: number) => `${id}-opt-${i}`;
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // The list stays in the DOM to animate; its pictures load on the first open, not with the page.
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (open) setOpened(true);
  }, [open]);
  const selected = Math.max(0, samples.findIndex((s) => s.slug === value));
  const [active, setActive] = useState(selected);
  const typed = useRef({ text: "", at: 0 });
  const current = samples[selected];

  const show = useCallback(
    (at = selected) => {
      setActive(at);
      setOpen(true);
    },
    [selected],
  );
  const choose = (i: number) => {
    setOpen(false);
    if (samples[i] && samples[i].slug !== value) onChange(samples[i].slug);
  };

  // Outside press closes without choosing.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // The highlighted option stays in view as it moves.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  /** Type-to-find: a number ("13") or the start of a title. */
  const find = (key: string) => {
    const now = Date.now();
    const t = now - typed.current.at > 700 ? key : typed.current.text + key;
    typed.current = { text: t, at: now };
    const q = t.toLowerCase();
    const i = samples.findIndex((s) => String(s.n) === q || pad2(s.n) === q || s.title.toLowerCase().startsWith(q));
    if (i >= 0) {
      if (open) setActive(i);
      else show(i);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = samples.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        show(e.key === "Home" ? 0 : last);
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        find(e.key);
      }
      return;
    }
    const move = (to: number) => {
      e.preventDefault();
      setActive(Math.min(last, Math.max(0, to)));
    };
    switch (e.key) {
      case "ArrowDown":
        return move(e.altKey ? active : active + 1);
      case "ArrowUp":
        if (e.altKey) {
          e.preventDefault();
          return choose(active);
        }
        return move(active - 1);
      case "Home":
        return move(0);
      case "End":
        return move(last);
      case "PageDown":
        return move(active + 5);
      case "PageUp":
        return move(active - 5);
      case "Enter":
      case " ":
        e.preventDefault();
        return choose(active);
      case "Tab":
        return choose(active);
      case "Escape":
        e.preventDefault();
        return setOpen(false);
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) find(e.key);
    }
  };

  return (
    <div ref={root} className="relative flex flex-col gap-1.5">
      <span id={labelId} className="bp-mono text-[10px]" style={{ color: C.textDim }}>
        {label}
      </span>
      <button
        type="button"
        role="combobox"
        aria-labelledby={`${labelId} ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optId(active) : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        className="group flex w-full min-w-0 items-center gap-3 rounded-2xl py-2 pl-2 pr-3.5 text-left transition-colors sm:w-[22rem]"
        style={{
          background: C.wash,
          border: `1px solid ${open ? C.accent : C.rule}`,
          boxShadow: open ? `0 0 0 3px ${C.accentSoft}` : undefined,
        }}
      >
        {current && <Thumb s={current} size="md" />}
        <span id={`${id}-value`} className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium" style={{ color: C.text }}>
            <span className="bp-mono mr-1.5 text-[11px]" style={{ color: C.textDim }}>
              #{current ? pad2(current.n) : ""}
            </span>
            {current?.title}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px]" style={{ color: C.textDim }}>
            {current ? `${current.skillGroup} · ${mmss(current.seconds)}` : ""}
          </span>
        </span>
        {current && <TierBadge s={current} />}
        <ChevronDown
          aria-hidden
          className="h-4 w-4 flex-none transition-transform"
          style={{ color: open ? C.accent : C.textDim, transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        tabIndex={-1}
        // Kept in the DOM so it can animate; `invisible` takes it out of the
        // accessibility tree and the tab order while closed, as `hidden` did.
        data-open={open}
        className={[
          "absolute right-0 top-full z-40 mt-2 max-h-[min(440px,60svh)] w-[min(30rem,calc(100vw-2rem))] origin-top-right overflow-y-auto overscroll-contain rounded-2xl p-1.5",
          "transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          open ? "visible translate-y-0 scale-100 opacity-100" : "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0",
        ].join(" ")}
        style={{
          background: C.base,
          border: `1px solid ${C.rule}`,
          boxShadow: "0 24px 60px -12px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {samples.map((s, i) => {
            const isSel = i === selected;
            const isActive = i === active;
            return (
              <li
                key={s.slug}
                id={optId(i)}
                role="option"
                aria-selected={isSel}
                // Keep focus on the button: a press on an option must not blur it.
                onPointerDown={(e) => e.preventDefault()}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(i)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2"
                style={{ background: isActive ? C.accentSoft : "transparent" }}
              >
                <Thumb s={s} size="sm" load={opened} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]" style={{ color: C.text, fontWeight: isSel ? 600 : 500 }}>
                    <span className="bp-mono mr-1.5 text-[10.5px]" style={{ color: C.textDim }}>
                      #{pad2(s.n)}
                    </span>
                    {s.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 truncate text-[11px]" style={{ color: C.textDim }}>
                    <span className="truncate">{s.skillGroup}</span>
                    <span aria-hidden>·</span>
                    <span className="bp-mono flex-none text-[10px]">
                      <span className="sr-only">3D pose, left </span>
                      <span style={{ color: HAND_COLOR.left }}>L {fmtPct(s.left.posePct)}</span>
                      <span aria-hidden> / </span>
                      <span className="sr-only">, right </span>
                      <span style={{ color: HAND_COLOR.right }}>R {fmtPct(s.right.posePct)}</span>
                    </span>
                  </span>
                </span>
                <TierBadge s={s} />
                <Check aria-hidden className="h-4 w-4 flex-none" style={{ color: C.accent, opacity: isSel ? 1 : 0 }} />
              </li>
            );
          })}
      </ul>
    </div>
  );
}
