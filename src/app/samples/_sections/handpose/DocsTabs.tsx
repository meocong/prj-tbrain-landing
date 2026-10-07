"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { C } from "../tokens";
import { WRAP } from "./page-kit";
import { REVEAL_EVENT } from "./page-links";

/**
 * The documentation, one tab at a time.
 *
 * The page used to run five long sections under its table; here they are panels
 * of one tablist, so the viewer and the table are not followed by a wall. Every
 * panel is in the document (the inactive ones are `hidden`), so the text is
 * there for search and for a reader who prints it, and so a link to any of it
 * has something to land on.
 *
 * Links. `jumpTo` announces its target (`REVEAL_EVENT`) before it scrolls, and
 * a hash in the address does the same on load: if the target lives in a closed
 * panel, that panel opens first.
 *
 * Keys are the tabs pattern's: arrows, Home and End move between tabs and
 * select as they go; only the selected tab is in the tab order.
 */

export interface DocsTab {
  id: string;
  label: string;
  panel: ReactNode;
}

export function DocsTabs({ tabs, title, id }: { tabs: DocsTab[]; title: string; id: string }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  const reveal = useCallback(
    (targetId: string, now = false) => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const at = panels.current.findIndex((p) => p?.contains(el));
      if (at < 0) return;
      if (now) flushSync(() => setActive(at));
      else setActive(at);
    },
    [],
  );

  useEffect(() => {
    const onReveal = (e: Event) => reveal(String((e as CustomEvent<string>).detail), true);
    window.addEventListener(REVEAL_EVENT, onReveal);
    // A hash on arrival: the browser tried to scroll before this panel was open.
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      const at = panels.current.findIndex((p) => p?.contains(el ?? null));
      if (at > 0) {
        setActive(at);
        requestAnimationFrame(() => el?.scrollIntoView({ block: "start" }));
      }
    }
    return () => window.removeEventListener(REVEAL_EVENT, onReveal);
  }, [reveal]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = (active + 1) % tabs.length;
        break;
      case "ArrowLeft":
        next = (active - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <section id={id} aria-labelledby={`${base}-title`} className="relative scroll-mt-20" style={{ color: C.text }}>
      <div style={{ background: C.band, borderTop: `1px solid ${C.hairline}` }}>
        <div className={`${WRAP} pb-0 pt-9 md:pt-14`}>
          <h2
            id={`${base}-title`}
            className="bp-mono text-[10px]"
            style={{ color: C.textDim, fontWeight: 400, letterSpacing: "0.16em" }}
          >
            {title}
          </h2>
          <div
            role="tablist"
            aria-label={title}
            onKeyDown={onKeyDown}
            className="-mx-1 mt-4 flex gap-1 overflow-x-auto px-1 pb-0.5"
          >
            {tabs.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`${base}-tab-${t.id}`}
                  aria-selected={on}
                  aria-controls={`${base}-panel-${t.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors"
                  style={{
                    background: on ? C.text : "transparent",
                    color: on ? C.base : C.textMid,
                    border: `1px solid ${on ? C.text : C.hairline}`,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          ref={(el) => {
            panels.current[i] = el;
          }}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={i !== active}
        >
          {t.panel}
        </div>
      ))}
    </section>
  );
}
