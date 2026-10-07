"use client";

import { useCallback, useEffect, useState } from "react";
import type { HandPoseLane } from "@/lib/samples/handpose";

export type LaneState = { status: "loading" } | { status: "ready"; lane: HandPoseLane } | { status: "error" };

const isLane = (j: unknown): j is HandPoseLane => {
  const l = j as Partial<HandPoseLane> | null;
  return !!l && typeof l.frames === "number" && l.frames > 0 && Array.isArray(l.left) && Array.isArray(l.right);
};

/** The lane JSON is a few KB, fetched when the record opens rather than shipped in the bundle. */
export function useLane(url: string) {
  const [state, setState] = useState<LaneState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    fetch(url, { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: unknown) => {
        if (!isLane(json)) throw new Error("not a lane");
        setState({ status: "ready", lane: json });
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ status: "error" });
      });
    return () => abort.abort();
  }, [url, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return [state, retry] as const;
}
