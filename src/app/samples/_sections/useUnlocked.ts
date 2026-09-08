"use client";

import { useEffect, useState } from "react";

/**
 * Whether this browser is holding a redeemed sample passcode.
 *
 * The session lives in an httpOnly cookie, so the catalogue cannot read it and
 * has to ask the server. One request per page load, shared: the grid and every
 * modal opened afterwards read the same promise rather than each firing their
 * own probe.
 *
 * Returns `null` until the answer arrives, which callers render as the locked
 * state — showing a download button and then retracting it reads worse than
 * showing the request path and then upgrading it.
 */
let inflight: Promise<boolean> | null = null;

function probe(): Promise<boolean> {
  if (!inflight) {
    inflight = fetch("/samples/api/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { unlocked: false }))
      .then((d: { unlocked?: boolean }) => !!d.unlocked)
      .catch(() => false);
  }
  return inflight;
}

/** Drop the cache after a passcode is redeemed in this same tab. */
export function resetUnlocked() {
  inflight = null;
}

export function useUnlocked(): boolean | null {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    probe().then((v) => {
      if (alive) setUnlocked(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  return unlocked;
}
