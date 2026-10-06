import { HP_AGG, HP_FPS, HANDPOSE_CSV, fmtCount } from "@/lib/samples/handpose";
import { JOINTS_PER_HAND, capitalise, numberWord } from "./page-data";

/**
 * schema.org `Dataset` for the page, and nothing else.
 *
 * Dataset only: a `FAQPage` block earns no rich result on a commercial site, so
 * the FAQ is left to the visible page. No `spatialCoverage`, no
 * `temporalCoverage`, and nothing that places where or when anyone was
 * recorded. `license` points at the page's own licence block rather than
 * naming a licence, because none has been decided for the public CSV and lanes
 * and a formal-looking value would say otherwise.
 *
 * Figures are the page's own, from the aggregates, so the structured data and
 * the text cannot disagree. Written inline as the site's other pages do
 * (blog, physical-ai); the base URL follows `PUBLIC_BASE_URL` for the same
 * reason theirs does.
 */
export function DatasetJsonLd({ path }: { path: string }) {
  const baseUrl = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
  const a = HP_AGG;

  const data = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Tbrain hand pose samples",
    description:
      `${capitalise(numberWord(a.samples))} short first-person clips (${a.minutes.toFixed(1)} minutes, ${fmtCount(a.frames)} frames at ${HP_FPS} fps) ` +
      `with ${JOINTS_PER_HAND} joints per hand in metres, triangulated from the stereo pair of a six-camera head-worn rig. ` +
      "Every frame of every hand carries one state: measured, guessed, bridged or no 3D pose. " +
      "The metrics table is public; sample packs and full delivery are licensed.",
    url: `${baseUrl}${path}`,
    creator: { "@type": "Organization", name: "Tbrain", url: baseUrl },
    license: `${baseUrl}${path}#access`,
    keywords: ["hand pose", "3D hand joints", "egocentric", "stereo triangulation", "robotics"],
    variableMeasured: [
      `3D position of ${JOINTS_PER_HAND} joints per hand, in metres, in the head-rig frame`,
      "State per frame and hand: measured, guessed, bridged or no 3D pose",
      "Share of frames with a 3D pose, per hand (percent)",
      "Guessed share of delivered hand-frames (percent)",
      "Missed, as reported by the pipeline (percent)",
    ],
    measurementTechnique:
      "Stereo triangulation of 2D hand detections from two calibrated cameras of a six-camera head-worn rig, with single-camera estimates and bridged gaps flagged per frame.",
    distribution: [
      {
        "@type": "DataDownload",
        name: `Per-sample metrics (${a.samples} rows)`,
        encodingFormat: "text/csv",
        contentUrl: `${baseUrl}${HANDPOSE_CSV}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // `<` escaped so no string in the data can close the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
