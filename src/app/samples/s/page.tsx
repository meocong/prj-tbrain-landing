import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, Lock } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/terminal-bench/auth";
import { assetsFor, fullSet, humanBytes, downloadHref, FULL_SET_SLUG } from "@/lib/samples/downloads";
import samples from "@/lib/samples/samples.json";
import { HAND_POSE_ON } from "@/lib/samples/flags";
import type { Sample } from "../_sections/tokens";
import { C } from "../_sections/tokens";
import { Reveal } from "../_sections/Reveal";
import { HP_RECORDS } from "../_sections/handpose/records";

export const metadata: Metadata = {
  title: "Sample downloads · Tbrain",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* Hand pose lives in its own records file and joins the vault only where the
   category is published. A group with no rows renders nothing (below), so this
   is the whole of "off on production". */
const ALL = [...(samples as unknown as Sample[]), ...(HAND_POSE_ON ? HP_RECORDS : [])];

/** "hand-pose-13" -> 13. The number a buyer quotes back to us. */
const handPoseNo = (s: Sample) => Number(s.slug.replace(/^hand-pose-/, ""));

/** [13, 14] -> "samples 13 and 14", [13] -> "sample 13". */
function sampleNumbers(nos: number[]): string {
  if (nos.length === 1) return `sample ${nos[0]}`;
  return `samples ${nos.slice(0, -1).join(", ")} and ${nos[nos.length - 1]}`;
}

/** What the two downloadable assets are called on a row. */
const DEFAULT_LABELS = { preview: "Preview pack", metadata: ".metadata.json" };

/**
 * Grouped by modality, matching the rail on `/samples`.
 *
 * This used to split "Robotics" from an "Off-the-shelf pack" as if they were
 * different kinds of data. They are the same capture on the same rigs; off the
 * shelf is how you buy it, not what it is. A buyer downloading files wants them
 * grouped by what they contain.
 *
 * Modalities with no published records render nothing, so the three unpublished
 * lines cost an entry here and nothing on the page.
 */
const GROUPS: {
  key: Sample["modality"];
  title: string;
  /** A function where the sentence names the rows it is about. */
  blurb: string | ((rows: Sample[]) => string);
  /** The asset slots are the same three everywhere; what is in them is not. */
  labels?: { preview: string; metadata: string };
}[] = [
  {
    key: "egocentric",
    title: "Egocentric",
    blurb:
      "Head-mounted capture from live production floors, off the shelf and collected to spec alike: video, IMU, VIO and task annotation in one MCAP.",
  },
  {
    key: "gaming",
    title: "Gaming",
    blurb: "Screen capture with per-frame keystrokes, semantic actions and camera pose.",
  },
  { key: "teleoperation", title: "Teleoperation", blurb: "Bimanual robot episodes with joint state and action, as a LeRobot dataset." },
  { key: "exocentric", title: "Exocentric", blurb: "Third-person capture of the same work, seen from outside the body." },
  { key: "mocap", title: "Mocap", blurb: "Full-body inertial capture with per-finger hand pose." },
  {
    key: "handpose",
    title: "Hand pose",
    /* The slots are filled differently here: `preview` is the sample pack (a
       zip of joints, a 3D-only recording, metadata, README and checksums, not
       a clip) and `metadata` is the sample's metrics as JSON, so the
       buttons say so rather than carrying the footage samples' names. What is
       in the pack is `PACK_FILES` / `PACK_FIELDS` in handpose.ts. */
    blurb: (rows) =>
      `Sample packs for hand-pose ${sampleNumbers(rows.map(handPoseNo))}: 21 joints per hand in metres, one state per frame, the 2D-only flag, the view count and a confidence score, a 3D-only recording for Rerun, a README and checksums.`,
    labels: { preview: "Sample pack (zip)", metadata: "Metadata (JSON)" },
  },
];

export default async function SamplesVaultPage() {
  // The middleware already turns anonymous visitors away. Re-checking here
  // keeps the page correct if the matcher is ever edited, and gives us the
  // claims we want to show the visitor about their own session.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionJwt(token) : null;
  if (!claims || claims.project !== "samples") redirect("/samples/enter?redirect=%2Fsamples%2Fs");

  const expires = new Date(claims.exp * 1000);

  return (
    <div className="samples-scope bp-chrome min-h-screen" style={{ background: C.base, color: C.text }}>
      <Header />

      <main className="mx-auto w-full max-w-5xl px-6 pb-28 pt-32 md:pt-40">
        <Link
          href="/samples"
          className="inline-flex items-center gap-2 text-[13px] transition-colors"
          style={{ color: C.textMid }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the catalogue
        </Link>

        <h1
          className="mt-6 text-4xl font-medium tracking-tight md:text-5xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          Your downloads
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: C.textMid }}>
          Passcode accepted. Every link below is signed for five minutes at the moment you click it
          and streams straight from our bucket. This session stays open until{" "}
          <span style={{ color: C.value }}>
            {expires.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          .
        </p>

        {/* Every group arrives on scroll, like the rest of the samples
            surface. The archive page had none: it is the one route a buyer
            reaches after signing in, and it moved differently from the pages
            that sent them there. */}
        {fullSet && (
          <Reveal variant="rise">
          <section
            className="mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ border: `1px solid ${C.hairline}`, background: C.band }}
          >
            <div className="min-w-0">
              <h2 className="text-[15px] font-medium">Whole library, one archive</h2>
              <p className="mt-1.5 text-[13px]" style={{ color: C.textMid }}>
                All {fullSet.count} samples: preview clip, poster, metadata sidecar and telemetry
                track for each. {humanBytes(fullSet.bytes)}.
              </p>
            </div>
            <a
              href={downloadHref(FULL_SET_SLUG, "set")}
              className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
              style={{ background: C.accent, color: "var(--sm-on-accent)" }}
            >
              <Download className="h-4 w-4" />
              Download {humanBytes(fullSet.bytes)}
            </a>
          </section>
          </Reveal>
        )}

        {GROUPS.map((group) => {
          // Rows with something to download, not rows that exist: a group whose
          // records have no staged assets would otherwise print a heading and a
          // blurb over an empty list.
          const rows = ALL.filter((s) => s.modality === group.key && assetsFor(s.slug));
          if (rows.length === 0) return null;
          const labels = group.labels ?? DEFAULT_LABELS;
          const blurb = typeof group.blurb === "function" ? group.blurb(rows) : group.blurb;
          return (
            <Reveal key={group.key} variant="rise">
            <section className="mt-14">
              <h2 className="bp-mono text-[13px] font-medium" style={{ color: C.textDim }}>
                {group.title}
              </h2>
              <p className="mt-2 max-w-2xl text-[13px]" style={{ color: C.textMid }}>
                {blurb}
              </p>

              <ul className="mt-6" style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
                {rows.map((s) => {
                  const a = assetsFor(s.slug);
                  if (!a) return null;
                  return (
                    <li
                      key={s.slug}
                      className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between"
                      style={{ borderBottom: `1px solid ${C.hairlineSoft}` }}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px]" style={{ color: C.value }}>
                          {s.title}
                        </p>
                        <p className="mt-1 font-mono text-[11px]" style={{ color: C.textDim }}>
                          {/* No `s.rig`. This page is behind a passcode, not off
                              the site: it is the first thing a customer sees
                              after we hand them a code, and "Rig ko ghi tên"
                              has no gated exception. The configuration is what
                              a buyer can act on and it is already here. */}
                          {s.modality === "handpose"
                            ? `${s.slug} · 21 joints per hand · ${s.fps} fps`
                            : `${s.slug} · ${s.resolution} · ${s.fps} fps`}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <a
                          href={downloadHref(s.slug, "preview")}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px]"
                          style={{ border: `1px solid ${C.rule}`, color: C.text }}
                        >
                          <Download className="h-3.5 w-3.5" />
                          {labels.preview} · {humanBytes(a.preview.bytes)}
                        </a>
                        <a
                          href={downloadHref(s.slug, "metadata")}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px]"
                          style={{ border: `1px solid ${C.rule}`, color: C.textMid }}
                        >
                          {labels.metadata}
                        </a>
                        {a.full.object ? (
                          <a
                            href={downloadHref(s.slug, "full")}
                            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium"
                            style={{ background: C.accent, color: "var(--sm-on-accent)" }}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {a.full.filename} · {humanBytes(a.full.bytes)}
                          </a>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px]"
                            style={{ border: `1px dashed ${C.rule}`, color: C.textDim }}
                            title={a.full.note}
                          >
                            <Lock className="h-3.5 w-3.5" />
                            {a.full.filename} ·{" "}
                            {a.full.bytes == null ? "on request" : `${humanBytes(a.full.bytes)} on request`}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
            </Reveal>
          );
        })}

        <p className="mt-14 max-w-2xl text-[13px] leading-relaxed" style={{ color: C.textDim }}>
          Full delivery files marked <span style={{ color: C.textMid }}>on request</span> are staged
          per engagement rather than kept hot in the bucket. For the footage samples a single
          segment is 1.8 GB, and the raw footage goes through a face-blur pass before it leaves us.
          Reply to the thread you got this passcode on and we will stage them against this same
          code.
        </p>
      </main>

      <Footer />
    </div>
  );
}
