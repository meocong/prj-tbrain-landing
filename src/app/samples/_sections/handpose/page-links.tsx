"use client";

import Link from "next/link";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion-pref";
import { openRecord, recordHref } from "@/lib/samples/open-record";
import { track, type SampleEvent } from "@/lib/samples/track";

/**
 * The three kinds of link the category page is made of, each a real anchor
 * first and a script enhancement second.
 *
 * Opening a sample, jumping to a section and leaving for the contact form all
 * work without JavaScript and in a new tab. The handlers below only take over
 * a plain left click, so ctrl/cmd-click, middle-click and "open in new tab"
 * keep doing what the reader asked.
 */

/** A plain primary-button click, not one the browser means to handle itself. */
const isPlainClick = (e: MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented;

interface LinkStyle {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Open a sample's record in the catalogue's dialog without leaving the page.
 *
 * The `href` is `?record=<slug>#samples`, which `SampleCatalog` reads on mount,
 * so the link still works with scripts off, in a new tab and as a pasted URL;
 * the click handler dispatches `openRecord` instead and cancels the
 * navigation, because a same-page query change does not remount the catalogue.
 *
 * `from` says which control opened it, for the funnel: the catalogue's own
 * cards report themselves as "card", and the open event carries no source, so
 * every other way in has to name itself here or it is invisible in analytics.
 */
export function OpenRecordLink({
  slug,
  frame,
  from,
  className,
  style,
  children,
  "aria-label": ariaLabel,
}: LinkStyle & { slug: string; frame?: number; from: string; "aria-label"?: string }) {
  return (
    <a
      href={recordHref(slug, frame)}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        e.preventDefault();
        track("handpose_sample_open", { slug, from });
        openRecord(slug, frame);
      }}
    >
      {children}
    </a>
  );
}

/**
 * Scroll to a section, move focus to it and record the hash.
 *
 * `"instant"` rather than `"auto"` under reduced motion: `auto` defers to the
 * root's `scroll-behavior: smooth`, which the header's pause switch does not
 * reach, so `auto` would still glide. Focus follows so the next Tab starts from
 * the section the reader asked for rather than from the link they pressed, which
 * is what a native fragment jump does and `scrollIntoView` alone does not.
 */
export function jumpTo(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth", block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  // A section is not a control, so it takes focus without drawing a ring round
  // the whole band. Inline, because the global ring is unlayered and a utility
  // class cannot override it.
  el.style.outline = "none";
  el.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
  return true;
}

/** An in-page link: `#legend`, `#compare`. A plain anchor if the target is not there. */
export function HashLink({ id, className, style, children }: LinkStyle & { id: string }) {
  return (
    <a
      href={`#${id}`}
      className={className}
      style={style}
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        if (jumpTo(id)) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}

/** A route link that reports itself: "Request access", "Enter passcode". */
export function TrackedLink({
  href,
  event,
  params,
  className,
  style,
  children,
}: LinkStyle & { href: string; event?: SampleEvent; params?: Record<string, unknown> }) {
  return (
    <Link
      href={href}
      className={className}
      style={style}
      onClick={event ? () => track(event, params) : undefined}
    >
      {children}
    </Link>
  );
}
