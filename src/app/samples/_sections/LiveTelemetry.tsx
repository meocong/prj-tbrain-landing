"use client";

import { useEffect, useRef, useState } from "react";
import { C } from "./tokens";

/**
 * The metadata panel that runs beside the clip, matching what Beacon shows in
 * review: as playback advances, the recorded row for that instant is printed.
 *
 * Two rules carried over from Beacon:
 *  - a field the capture did not record prints `null`, it is not hidden and it
 *    is never interpolated. Three of the eight game titles — `justcause3`,
 *    `snowrunner` and `outerworlds`, each with a null `axisConvention` — carry
 *    `p`, `yaw` and `pitch` as null for every row, and the panel says so.
 *  - values are written straight to the DOM from a rAF loop, so playback does
 *    not re-render React 60 times a second.
 *
 * The loop is bound to the transport rather than left free-running: it starts on
 * `play` and stops on `pause`, and a single pass runs on `seeked` so scrubbing a
 * paused clip still prints the row for the frame under the playhead. Several
 * cards can be open at once, and an idle one should cost nothing.
 *
 * Payloads are fetched on first expand, not bundled: 40 to 66 KB each.
 */

interface GameRow {
  t: number;
  k: string | null;
  a: string | null;
  b: string | null;
  dx: number;
  dy: number;
  p: [number, number, number] | null;
  yaw: number | null;
  pitch: number | null;
}
interface GamePayload {
  slug: string;
  offsetSec: number;
  axisConvention: string | null;
  rows: GameRow[];
}
interface ImuBucket { t: number; m: number; x: number; y: number; z: number }
interface EgoImuPayload {
  slug: string;
  offsetSec: number;
  rateHz: number;
  device: Record<string, string>;
  accLeft: ImuBucket[];
  gyroLeft: ImuBucket[];
  accRight: ImuBucket[];
  gyroRight: ImuBucket[];
}

const NULL = "null";

/**
 * `hint` names the components packed into a single value — "mag · x, y, z". The
 * panel used to give each component its own row under an "Accelerometer"
 * heading, which ran the media pane past its height and made it scroll under
 * its own sticky caption. One row per signal, with the shape spelled out beside
 * the label, says the same thing in a third of the space.
 */
function Row({ label, id, hint }: { label: string; id: string; hint?: string }) {
  return (
    <div
      className="grid grid-cols-[minmax(7.5rem,auto)_1fr] items-baseline gap-x-4 py-[3px]"
      style={{ borderTop: `1px solid ${C.hairlineSoft}` }}
    >
      <dt className="text-[11px] leading-tight" style={{ color: C.textDim }}>
        {label}
        {hint && (
          <span className="ml-1.5 font-mono text-[9px]" style={{ color: C.textDim, opacity: 0.7 }}>
            {hint}
          </span>
        )}
      </dt>
      <dd
        data-field={id}
        className="truncate font-mono text-[11px] tabular-nums"
        style={{ color: C.value }}
      >
        {NULL}
      </dd>
    </div>
  );
}

/** Nearest recorded row at or before `t`. */
function seek<T extends { t: number }>(rows: T[], t: number): T | undefined {
  let lo = 0;
  let hi = rows.length - 1;
  if (!rows.length || t < rows[0].t) return rows[0];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].t <= t) lo = mid + 1;
    else hi = mid - 1;
  }
  return rows[Math.max(0, lo - 1)];
}

export function LiveTelemetry({
  slug,
  video,
}: {
  slug: string;
  video: HTMLVideoElement | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [payload, setPayload] = useState<GamePayload | EgoImuPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    fetch(`/samples/telemetry/${slug}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        if (!alive) return;
        setPayload(j);
        setState("ready");
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!payload || !video || !hostRef.current) return;
    const host = hostRef.current;
    // Resolved once. The rows are static for the life of the panel, so the loop
    // should not pay for a selector per field per frame.
    const fields = new Map<string, HTMLElement>();
    host.querySelectorAll<HTMLElement>("[data-field]").forEach((el) => {
      fields.set(el.dataset.field!, el);
    });
    const put = (id: string, v: string) => {
      const el = fields.get(id);
      if (el && el.textContent !== v) el.textContent = v;
    };
    const f3 = (n: number | null | undefined) => (n == null ? NULL : n.toFixed(3));

    let raf = 0;
    const render = () => {
      const t = video.currentTime;
      if ("rows" in payload) {
        const r = seek(payload.rows, t);
        if (r) {
          put("time", `${Math.round(t * 1000)} ms`);
          put("keys", r.k ?? NULL);
          put("actions", r.a ?? NULL);
          put("mouse", `${r.b ?? NULL}  ·  ${r.dx}, ${r.dy}`);
          put("pos", r.p ? `${f3(r.p[0])}, ${f3(r.p[1])}, ${f3(r.p[2])}` : NULL);
          put(
            "dir",
            r.yaw == null && r.pitch == null
              ? NULL
              : `${r.yaw == null ? NULL : `${r.yaw.toFixed(2)}°`}  /  ${
                  r.pitch == null ? NULL : `${r.pitch.toFixed(2)}°`
                }`,
          );
        }
      } else {
        const al = seek(payload.accLeft, t);
        const ar = seek(payload.accRight, t);
        const gl = seek(payload.gyroLeft, t);
        const gr = seek(payload.gyroRight, t);
        put("time", `${Math.round(t * 1000)} ms`);
        put("accL", al ? `${al.m}  ·  ${al.x}, ${al.y}, ${al.z}` : NULL);
        put("accR", ar ? `${ar.m}` : NULL);
        put("gyroL", gl ? `${gl.m}  ·  ${gl.x}, ${gl.y}, ${gl.z}` : NULL);
        put("gyroR", gr ? `${gr.m}` : NULL);
      }
    };

    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      render();
    };

    video.addEventListener("play", start);
    video.addEventListener("pause", stop);
    video.addEventListener("seeked", render);
    video.addEventListener("loadedmetadata", render);

    render();
    if (!video.paused) start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener("play", start);
      video.removeEventListener("pause", stop);
      video.removeEventListener("seeked", render);
      video.removeEventListener("loadedmetadata", render);
    };
  }, [payload, video]);

  if (state === "loading") {
    return (
      <div className="mt-4 space-y-1.5" aria-busy>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-full animate-pulse rounded"
            style={{ background: C.wash }}
          />
        ))}
      </div>
    );
  }

  if (state === "error" || !payload) {
    return (
      <p className="mt-4 text-[11px]" style={{ color: C.danger }}>
        Telemetry for this sample could not be loaded.
      </p>
    );
  }

  const isGame = "rows" in payload;
  const posed = isGame && (payload as GamePayload).rows.some((r) => r.p);

  return (
    <div ref={hostRef} className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="bp-mono text-[10px]" style={{ color: C.accent }}>
          Live record
        </p>
        <p className="font-mono text-[10px]" style={{ color: C.textDim }}>
          from {payload.offsetSec.toFixed(0)}s of the source
        </p>
      </div>

      <dl className="mt-2">
        <Row label="Time" id="time" />
        {isGame ? (
          <>
            <Row label="Keys" id="keys" />
            <Row label="Actions" id="actions" />
            <Row label="Mouse" id="mouse" hint="buttons · dx, dy" />
            <Row label="Position" id="pos" hint="x, y, z" />
            <Row label="Direction" id="dir" hint="yaw / pitch" />
          </>
        ) : (
          <>
            <Row label="Acc left" id="accL" hint="mag · x, y, z" />
            <Row label="Acc right" id="accR" hint="mag" />
            <Row label="Gyro left" id="gyroL" hint="mag · x, y, z" />
            <Row label="Gyro right" id="gyroR" hint="mag" />
          </>
        )}
      </dl>

      {isGame && !posed && (
        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: C.textDim }}>
          The pose columns exist in this title&apos;s table but were not populated at capture, so
          they read null rather than being filled in.
        </p>
      )}
      {!isGame && (
        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: C.textDim }}>
          {(payload as EgoImuPayload).device.imu} at {(payload as EgoImuPayload).rateHz} Hz, two
          units. Values are raw sensor counts, as recorded.
        </p>
      )}
    </div>
  );
}
