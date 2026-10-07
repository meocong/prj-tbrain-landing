"use client";

import { useCallback, useEffect, useState } from "react";
import { OPEN_RECORD_EVENT, frameFromUrl, type OpenRecordDetail } from "@/lib/samples/open-record";
import type { Sample } from "../tokens";
import { SampleModal } from "../SampleModal";
import { HP_RECORDS } from "./records";

/**
 * The record dialog on /samples/hand-pose: "Visualize", a link to a sample and
 * `?record=hand-pose-NN&f=N` all open one recording in `SampleModal`, whose body
 * for hand pose is the full player (`HandPoseViewer`). The workspace under the
 * hero is a demo of one sample; this is where any of the sixteen is examined.
 *
 * Same contract as the catalogue's dialog (`SampleCatalog`): state is the source
 * of truth and the address follows it with `replaceState`, so a copied link
 * reopens the record; `f` is read once into `initialFrame` and then dropped, so
 * it cannot seek the next record opened.
 */
export function RecordModalHost() {
  const [active, setActive] = useState<Sample | null>(null);
  const [initialFrame, setInitialFrame] = useState<number | null>(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("record");
    const found = slug ? HP_RECORDS.find((s) => s.slug === slug) : undefined;
    if (!found) return;
    setInitialFrame(frameFromUrl());
    setActive(found);
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const { slug, frame } = (e as CustomEvent<OpenRecordDetail>).detail ?? {};
      const found = slug ? HP_RECORDS.find((s) => s.slug === slug) : undefined;
      if (!found) return;
      setInitialFrame(typeof frame === "number" && Number.isFinite(frame) && frame >= 0 ? Math.floor(frame) : null);
      setActive(found);
    };
    window.addEventListener(OPEN_RECORD_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_RECORD_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (active) url.searchParams.set("record", active.slug);
    else url.searchParams.delete("record");
    url.searchParams.delete("f");
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }, [active]);

  // Stable, so the dialog does not re-focus its root on every render of the page.
  const close = useCallback(() => {
    setActive(null);
    setInitialFrame(null);
  }, []);

  return <SampleModal sample={active} onClose={close} initialFrame={initialFrame} />;
}
