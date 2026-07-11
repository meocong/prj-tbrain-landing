"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { REAL_SAMPLES, type QcState, type RealSample, type SampleGroup } from "@/lib/landing/physical-ai";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { motion, useReducedMotion } from "framer-motion";
import { QcChip } from "./QcChip";

const BORDER_BY_STATE: Record<QcState, string | undefined> = {
  PASS: undefined,
  PARTIAL: "rgba(255,189,46,0.35)",
  FAIL_LABEL: "rgba(255,95,87,0.45)",
  PARTNER: "rgba(150,100,255,0.35)",
  LABELING: "rgba(76,181,255,0.35)",
};

// Ordering: PASS → PARTIAL → LABELING → FAIL_LABEL
const STATE_ORDER: Record<QcState, number> = { PASS: 0, PARTIAL: 1, LABELING: 2, FAIL_LABEL: 3, PARTNER: 4 };

const GROUP_ORDER: SampleGroup[] = ["KITCHEN", "TEXTILE"];

export function CapturesGallery() {
  const grouped = useMemo(() => {
    const map: Record<SampleGroup, RealSample[]> = { KITCHEN: [], TEXTILE: [] };
    for (const s of REAL_SAMPLES.items) map[s.group].push(s);
    for (const g of GROUP_ORDER) map[g].sort((a, b) => STATE_ORDER[a.qc.state] - STATE_ORDER[b.qc.state]);
    return map;
  }, []);

  return (
    <Sheet id="captures-gallery" fig={REAL_SAMPLES.fig} axis={false}>
      <SheetHeading title={REAL_SAMPLES.title} lead={REAL_SAMPLES.lead} />

      {GROUP_ORDER.map((g) => (
        <div key={g} className="mt-8">
          <GroupHeader group={g} count={grouped[g].length} />
          <StaggerContainer className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {grouped[g].map((c) => <CaptureCard key={c.skill} c={c} />)}
          </StaggerContainer>
        </div>
      ))}
    </Sheet>
  );
}

function GroupHeader({ group, count }: { group: SampleGroup; count: number }) {
  const g = REAL_SAMPLES.groups[group];
  const accent = group === "KITCHEN" ? "var(--bp-cyan)" : "var(--bp-blue)";
  return (
    <div className="flex items-baseline justify-between gap-3 flex-wrap" style={{ borderBottom: "1px solid var(--bp-line)", paddingBottom: 8 }}>
      <div className="flex items-baseline gap-3">
        <span className="bp-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: accent, fontWeight: 700 }}>
          {group}
        </span>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "var(--bp-ink)" }}>
          {g.label}
        </span>
        <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>· {count} entries</span>
      </div>
      <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>{g.note}</span>
    </div>
  );
}

function CaptureCard({ c }: { c: RealSample }) {
  const hasVideo = Boolean(c.video);
  return (
    <motion.article
      variants={STAGGER_ITEM}
      className="bp-card group relative"
      style={{
        padding: 0,
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--bp-panel)",
        borderColor: BORDER_BY_STATE[c.qc.state],
      }}
    >
      {hasVideo ? (
        <CaptureLoop src={c.video} poster={c.poster} alt={c.name} />
      ) : (
        <StaticPoster src={c.poster} alt={c.name} />
      )}

      <span className="absolute top-2 left-2" style={{ zIndex: 2 }}>
        <QcChip qc={c.qc} defect={c.defect} inline />
      </span>

      {c.takes && c.takes > 1 && (
        <span
          className="bp-mono absolute top-2 right-2"
          style={{
            fontSize: 9,
            padding: "3px 6px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            letterSpacing: "0.05em",
            zIndex: 2,
          }}
        >
          {c.takes} TAKES
        </span>
      )}

      {/* Card chrome is theme-aware (var(--bp-panel)); the video sub-container
          below keeps its own dark bg (#0b1220) so footage still pops. */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--bp-line)" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 600, color: "var(--bp-ink)", lineHeight: 1.25 }}>
          {c.name}
        </div>
        <div className="bp-mono flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-1.5" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>
          {c.frames ? <span>{c.frames.toLocaleString()}f</span> : null}
          {c.seconds ? <><span style={{ opacity: 0.4 }}>·</span><span>{c.seconds}s</span></> : null}
          {c.sensor ? <><span style={{ opacity: 0.4 }}>·</span><span>{c.sensor}</span></> : null}
        </div>
        {c.note && (
          <div style={{ fontSize: 11, color: "var(--bp-ink-dim)", marginTop: 6, lineHeight: 1.4 }}>{c.note}</div>
        )}
      </div>
    </motion.article>
  );
}

function StaticPoster({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "4 / 3", background: "#050a12" }}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" style={{ opacity: 0.55 }} unoptimized />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bp-mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--bp-amber)", padding: "6px 10px", background: "rgba(0,0,0,0.55)", borderRadius: 4 }}>
          NO VIDEO · POSTER ONLY
        </span>
      </div>
    </div>
  );
}

function CaptureLoop({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || shouldReduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldReduce]);

  if (shouldReduce) {
    return (
      <div className="relative w-full" style={{ aspectRatio: "4 / 3", background: "#0b1220" }}>
        <Image src={poster} alt={alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: "4 / 3", background: "#0b1220" }}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
