"use client";

import { useCallback, useEffect, useState } from "react";
import { loadJointTrack, type JointTrack } from "@/lib/samples/handpose-joints";

export type JointsState = { status: "loading" } | { status: "ready"; track: JointTrack } | { status: "error" };

/**
 * The sample's 3D joints, fetched in the browser and shared between the views that read them.
 * `slug` null: the sample has no 3D view (no camera video to clock it), so nothing is fetched.
 */
export function useJoints(slug: string | null) {
  const [state, setState] = useState<JointsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let live = true;
    loadJointTrack(slug)
      .then((track) => live && setState({ status: "ready", track }))
      .catch(() => live && setState({ status: "error" }));
    return () => {
      live = false;
    };
  }, [slug, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return [state, retry] as const;
}
