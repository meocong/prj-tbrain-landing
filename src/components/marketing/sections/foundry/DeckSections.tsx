"use client";

/**
 * DeckSections — homepage sections aligned to the Tbrain Robotics Offerings deck.
 *   Catalog          — "Six modules, one delivery pipeline" (A–F + statuses)
 *   EngagementLadder — "Enter anywhere: license, pilot, produce, retain"
 * Theme-aware (var(--bp-*)), responsive (1-col mobile base), subtle reveals.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Video, Boxes, Grip, Cpu, Activity, ShieldCheck } from "lucide-react";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

/* status → color */
const STATUS = {
  now: { label: "Available now", c: "var(--bp-cyan)" },
  all: { label: "All deliveries", c: "var(--bp-cyan)" },
  pilot: { label: "Pilot", c: "var(--bp-purple)" },
  roadmap: { label: "Roadmap", c: "var(--bp-amber)" },
  soon: { label: "Coming soon", c: "var(--bp-amber)" },
} as const;

/* Modality tiles — playback video when on disk, else fall back to still.
   `origin`: OWN = Tbrain capture, PARTNER = validated partner profile. */
const MODULES = [
  { id: "A", icon: Video,       name: "Egocentric Video",  sub: "VLA · world-model",  status: "now"  as const, img: "/images/real-captures/pick_up_the_cup-loop.jpg", video: "/videos/real-captures/pick_up_the_cup.webm", origin: "OWN"     as const },
  { id: "B", icon: Boxes,       name: "Spatial Capture",   sub: "RGB-D · stereo · IMU", status: "soon" as const, img: "/images/modalities/spatial.jpg",   video: undefined,                              origin: "OWN"     as const },
  { id: "C", icon: Grip,        name: "UMI / Gripper",     sub: "handheld manipulation", status: "now"  as const, img: "/images/modalities/umi.jpg",       video: undefined,                              origin: "PARTNER" as const },
  { id: "D", icon: Cpu,         name: "Teleoperation",     sub: "robot-arm demos",    status: "now"  as const, img: "/images/modalities/teleop.jpg",    video: "/videos/deliverables/aloha-4cam.mp4",  origin: "PARTNER" as const },
  { id: "E", icon: Activity,    name: "Mocap / Motion",    sub: "humanoid · retarget · exo throwing", status: "now"  as const, img: "/images/modalities/exo-mocap.jpg", video: "/videos/modalities/exo-mocap.webm",    origin: "PARTNER" as const },
  { id: "F", icon: ShieldCheck, name: "Annotation / QA",   sub: "formatting · cleanup", status: "all"  as const, img: "/images/modalities/qa.jpg",        video: undefined,                              origin: "OWN"     as const },
];

/* Video-first card w/ graceful fallback: video → image → icon. Origin chip labels OWN vs PARTNER. */
function ModuleCard({ m }: { m: (typeof MODULES)[number] }) {
  const [imgOk, setImgOk] = useState(true);
  const [videoOk, setVideoOk] = useState<boolean | null>(null);
  const st = STATUS[m.status];
  const showVideo = !!m.video && videoOk !== false;
  const showImg = !showVideo && !!m.img && imgOk;
  const originTone = m.origin === "OWN"
    ? { c: "var(--bp-cyan)",  label: "OWN · TBRAIN" }
    : { c: "var(--bp-purple)", label: "PARTNER PROFILE" };
  return (
    <motion.div variants={STAGGER_ITEM} className="bp-card bp-card-hover group relative overflow-hidden transition-[transform,box-shadow] duration-300 will-change-transform hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(0,229,199,0.45)]" style={{ padding: 0 }}>
      <div className="relative" style={{ aspectRatio: "16 / 10", overflow: "hidden", background: "var(--bp-surface-2)" }}>
        {showVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={m.video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={m.img}
            onError={() => setVideoOk(false)}
            onLoadedData={() => setVideoOk(true)}
            className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
          />
        ) : showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.img} alt={m.name} loading="lazy" onError={() => setImgOk(false)} className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: "color-mix(in srgb, var(--bp-cyan) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--bp-cyan) 28%, transparent)" }}>
              <m.icon className="h-6 w-6" style={{ color: "var(--bp-cyan)" }} />
            </span>
          </div>
        )}
        {(showVideo || showImg) && <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-95" style={{ background: "linear-gradient(to top, rgba(5,5,12,0.9), rgba(5,5,12,0.12) 58%, transparent)" }} />}
        {(showVideo || showImg) && <div aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 opacity-0 transition-all duration-700 ease-out group-hover:left-[115%] group-hover:opacity-100" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--bp-cyan) 50%, transparent)" }} />

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="bp-mono rounded px-1.5 py-0.5" style={{ fontSize: 9, color: showVideo || showImg ? "#fff" : "var(--bp-ink-faint)", background: showVideo || showImg ? "rgba(0,0,0,0.42)" : "transparent" }}>MODULE {m.id}</span>
          <span className="bp-mono rounded px-1.5 py-0.5" style={{ fontSize: 8.5, letterSpacing: "0.06em", color: originTone.c, background: `color-mix(in srgb, ${originTone.c} 18%, transparent)` }}>{originTone.label}</span>
        </div>
        <span className="bp-mono absolute right-2 top-2 rounded-full px-2 py-0.5" style={{ fontSize: 9, color: st.c, background: `color-mix(in srgb, ${st.c} 16%, transparent)`, border: `1px solid color-mix(in srgb, ${st.c} 34%, transparent)`, backdropFilter: showVideo || showImg ? "blur(4px)" : undefined }}>{st.label}</span>
        <div className="absolute inset-x-0 bottom-0 p-3.5 transition-transform duration-300 group-hover:-translate-y-0.5">
          <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: showVideo || showImg ? "#fff" : "var(--bp-ink)" }}>{m.name}</div>
          <div className="bp-mono mt-0.5" style={{ fontSize: 10.5, color: showVideo || showImg ? "rgba(255,255,255,0.75)" : "var(--bp-ink-dim)" }}>{m.sub}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function Catalog() {
  return (
    <Sheet fig="FIG.13 — TEN MODALITIES · ONE EXPORT">
      <RevealOnScroll>
        <SheetHeading title="Ten modalities. One export contract." lead="Egocentric · spatial · UMI · teleop · mocap · annotation — sourced from an expansive industrial network (not only Vietnam) of factories and workshops, every modality exports to the same LeRobot v2 schema. Nothing about your training loop changes when you swap sources." />
      </RevealOnScroll>
      <div className="relative mt-12">
        <motion.div aria-hidden className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0"
          animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(ellipse 55% 45% at 50% 22%, color-mix(in srgb, var(--bp-cyan) 9%, transparent), transparent 70%)" }} />
        <StaggerContainer className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => <ModuleCard key={m.id} m={m} />)}
        </StaggerContainer>
      </div>
    </Sheet>
  );
}

const ENGAGE = [
  { tag: "ENTRY", name: "License Inventory", v: "Access pre-collected egocentric data quickly.", meta: ["access", "fast"], c: "var(--bp-cyan)" },
  { tag: "VALIDATE", name: "Pilot Collection", v: "Validate task protocol, hardware, workflow & output format.", meta: ["scope", "short pilot"], c: "var(--bp-purple)" },
  { tag: "HARVEST", name: "Production Program", v: "Collect large-scale data across targeted environments.", meta: ["runtime", "scaled program"], c: "var(--bp-purple)" },
  { tag: "REFINE", name: "Retainer", v: "Monthly data flywheel for continuous model refinement.", meta: ["cadence", "monthly"], c: "var(--bp-amber)" },
];

const GOVERNANCE = [
  { k: "Private programs", v: "by buyer spec" },
  { k: "QA report", v: "every delivery" },
  { k: "Consent & usage rights", v: "per project scope & SOW" },
  { k: "DPA / security", v: "on pilot & procurement" },
];

export function EngagementLadder() {
  return (
    <Sheet fig="FIG.17 — HOW TO ENGAGE">
      <RevealOnScroll>
        <SheetHeading title="Enter anywhere: license, pilot, produce, retain" lead="There's no big upfront commitment. Most buyers begin with inventory or a low-risk pilot, then scale into production and a retainer." />
      </RevealOnScroll>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ENGAGE.map((e, i) => (
          <RevealOnScroll key={e.tag} delay={i * 0.06}>
            <div className="bp-card relative flex h-full flex-col p-5">
              <span className="bp-mono inline-flex w-fit rounded px-2 py-0.5" style={{ fontSize: 9, color: e.c, background: `color-mix(in srgb, ${e.c} 12%, transparent)` }}>{e.tag}</span>
              <div className="mt-3 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--bp-ink)" }}>{e.name}</div>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed" style={{ color: "var(--bp-ink-dim)" }}>{e.v}</p>
              <div className="mt-3 flex items-center justify-between border-t pt-2" style={{ borderColor: "var(--bp-line)" }}>
                <span className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{e.meta[0]}</span>
                <span className="bp-mono" style={{ fontSize: 10, color: e.c }}>{e.meta[1]}</span>
              </div>
              {i < ENGAGE.length - 1 && (
                <ArrowRight className="absolute -right-3 top-8 hidden h-5 w-5 lg:block" style={{ color: "var(--bp-ink-faint)" }} />
              )}
            </div>
          </RevealOnScroll>
        ))}
      </div>
      <RevealOnScroll delay={0.08}>
        <div className="mt-6 rounded-xl p-5 bp-card">
          <div className="bp-mono mb-3" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--bp-ink-faint)" }}>DATA GOVERNANCE · PROCUREMENT-READY</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GOVERNANCE.map((g) => (
              <div key={g.k} className="border-t pt-3" style={{ borderColor: "var(--bp-line)" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--bp-ink)" }}>{g.k}</div>
                <div className="bp-mono mt-0.5" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{g.v}</div>
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>
      <RevealOnScroll delay={0.1}>
        <div className="mt-6 flex flex-col items-start gap-4 rounded-xl p-6 bp-card sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--bp-cyan)" }}>
          <p style={{ fontSize: 15, color: "var(--bp-ink)" }}>Enter at any point — license-ready inventory today, custom collection to your spec, or a continuous program.</p>
          <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)" }}>
            Talk to us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </RevealOnScroll>
    </Sheet>
  );
}
