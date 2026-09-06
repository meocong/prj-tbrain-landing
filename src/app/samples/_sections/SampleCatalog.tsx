"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { C } from "./tokens";
import Link from "next/link";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";

/**
 * The catalog, not a gallery. Every card carries its delivery record: rig,
 * capture spec, streams and shipped formats are readable without interacting,
 * and the complete record expands in place. Filters narrow the set and the
 * readout above the grid always reports what is currently on screen.
 */

interface Sample {
  slug: string;
  domain: "robotics" | "game" | "ots";
  title: string;
  skill: string;
  environment: string;
  locale: string;
  rig: string;
  durationSec: number;
  resolution: string;
  fps: number;
  streams: string[];
  formats: string[];
  size: string;
  spec: [string, string][];
  orientation?: string;
}

const ALL = samples as unknown as Sample[];

const DOMAINS = [
  { key: "all", label: "Everything" },
  { key: "robotics", label: "Robotics" },
  { key: "game", label: "Video game" },
  { key: "ots", label: "Off the shelf" },
] as const;

type DomainKey = (typeof DOMAINS)[number]["key"];

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-1.5"
      style={{ borderTop: `1px solid ${C.hairlineSoft}` }}
    >
      <dt className="shrink-0 text-[11px]" style={{ color: C.textDim }}>
        {label}
      </dt>
      <dd className="text-right font-mono text-[11px]" style={{ color: "rgba(226,232,240,0.85)" }}>
        {value}
      </dd>
    </div>
  );
}

function Card({ sample }: { sample: Sample }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.paused) return;
    track("play_preview", { slug: sample.slug, domain: sample.domain });
    v.play().catch(() => undefined);
  }, [sample.slug, sample.domain]);
  const stop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  return (
    <article className="flex flex-col" style={{ borderTop: `1px solid ${C.hairline}` }}>
      <div
        className="group relative overflow-hidden"
        onMouseEnter={play}
        onMouseLeave={stop}
        onFocus={play}
        onBlur={stop}
        tabIndex={0}
      >
        <video
          ref={videoRef}
          className="aspect-[4/3] w-full object-cover"
          src={`/samples/clips/${sample.slug}.mp4`}
          poster={`/samples/posters/${sample.slug}.jpg`}
          muted
          loop
          playsInline
          preload="none"
          aria-label={sample.title}
        />
        <span
          className="pointer-events-none absolute right-3 top-3 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
          style={{ background: "rgba(7,9,15,0.78)", color: "rgba(255,255,255,0.82)" }}
        >
          {mmss(sample.durationSec)}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-6 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: C.accent }}>
          {sample.skill}
        </p>
        <h3
          className="mt-2 text-base font-medium leading-snug"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {sample.title}
        </h3>
        <p className="mt-1.5 text-[13px]" style={{ color: C.textMid }}>
          {sample.environment}. {sample.locale}.
        </p>

        <dl className="mt-4">
          <SpecRow label="Rig" value={sample.rig} />
          <SpecRow label="Capture" value={`${sample.resolution} at ${sample.fps} fps`} />
          <SpecRow label="Ships as" value={sample.formats.join("  ")} />
          <SpecRow label="Full file" value={sample.size} />
        </dl>

        <p
          className="mt-3 font-mono text-[10px] leading-relaxed"
          style={{ color: C.textDim }}
        >
          {sample.streams.join("  /  ")}
        </p>

        <button
          type="button"
          onClick={() => {
            if (!open) track("expand_record", { slug: sample.slug, domain: sample.domain });
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          className="mt-4 inline-flex items-center gap-1.5 self-start font-mono text-[10px] uppercase tracking-[0.16em] transition-colors"
          style={{ color: open ? C.text : C.textDim }}
        >
          {open ? "Hide record" : "Full record"}
          <ChevronDown
            className="h-3 w-3 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </button>

        {open && (
          <dl className="mt-3">
            {sample.spec.map(([k, v]) => (
              <SpecRow key={k} label={k} value={v} />
            ))}
          </dl>
        )}

        <Link
          href={requestUrl({ from: "card", sample: sample.slug, title: sample.title })}
          onClick={() => track("open_request_access", { from: "card", slug: sample.slug })}
          className="mt-4 inline-flex items-center gap-1.5 self-start text-[13px] font-medium underline decoration-1 underline-offset-[5px]"
          style={{ color: C.textMid, textDecorationColor: "rgba(255,255,255,0.22)" }}
        >
          Request this sample
        </Link>
      </div>
    </article>
  );
}

export function SampleCatalog() {
  const [domain, setDomain] = useState<DomainKey>("all");
  const [rig, setRig] = useState<string>("all");

  const rigs = useMemo(() => {
    const pool = domain === "all" ? ALL : ALL.filter((s) => s.domain === domain);
    return Array.from(new Set(pool.map((s) => s.rig))).sort();
  }, [domain]);

  const shown = useMemo(
    () =>
      ALL.filter((s) => domain === "all" || s.domain === domain).filter(
        (s) => rig === "all" || s.rig === rig,
      ),
    [domain, rig],
  );

  const counts = useMemo(() => {
    const minutes = shown.reduce((a, s) => a + s.durationSec, 0) / 60;
    return {
      n: shown.length,
      minutes: minutes.toFixed(1),
      skills: new Set(shown.map((s) => s.skill)).size,
      rigs: new Set(shown.map((s) => s.rig)).size,
    };
  }, [shown]);

  const selectDomain = (key: DomainKey) => {
    track("filter_domain", { domain: key });
    setDomain(key);
    setRig("all");
  };

  return (
    <section id="deck" style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pt-24 md:pt-28 lg:px-10 xl:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            className="text-3xl font-medium tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
          >
            {ALL.length} delivery files,{" "}
            <span style={{ color: C.textDim }}>pulled unmodified</span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: C.textMid }}>
            Previews are downscaled to 640 x 480 so a first look never waits on a download. The
            delivered files carry every lens, every stream and the full record below each clip.
          </p>
        </div>

        <div
          className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-3 pb-5"
          style={{ borderBottom: `1px solid ${C.hairline}` }}
        >
          {DOMAINS.map((d) => {
            const active = d.key === domain;
            const n = d.key === "all" ? ALL.length : ALL.filter((s) => s.domain === d.key).length;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => selectDomain(d.key)}
                aria-pressed={active}
                className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
                style={
                  active
                    ? { background: C.text, color: C.base }
                    : { border: `1px solid ${C.hairline}`, color: C.textMid }
                }
              >
                {d.label}
                <span className="ml-2 font-mono text-[11px] opacity-60">{n}</span>
              </button>
            );
          })}

          <label className="ml-auto flex items-center gap-2 text-[13px]" style={{ color: C.textDim }}>
            Rig
            <select
              value={rig}
              onChange={(e) => {
                track("filter_rig", { rig: e.target.value, domain });
                setRig(e.target.value);
              }}
              className="rounded-full px-3 py-1.5 text-[13px] outline-none"
              style={{ background: C.band, border: `1px solid ${C.hairline}`, color: C.text }}
            >
              <option value="all">All rigs</option>
              {rigs.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 font-mono text-[11px]" style={{ color: C.textDim }}>
          {counts.n} samples
          <span className="mx-2">/</span>
          {counts.minutes} minutes of source
          <span className="mx-2">/</span>
          {counts.skills} categories
          <span className="mx-2">/</span>
          {counts.rigs} rigs
        </p>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-24 lg:px-10 xl:px-16">
        {shown.length === 0 ? (
          <p
            className="mt-16 py-20 text-center text-sm"
            style={{ color: C.textDim, borderTop: `1px solid ${C.hairline}` }}
          >
            No samples match that combination. Reset the rig filter to see the rest.
          </p>
        ) : (
          <div className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => (
              <Card key={s.slug} sample={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
