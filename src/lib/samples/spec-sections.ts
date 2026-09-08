/**
 * Grouping for the flat `spec` array on a sample.
 *
 * The published pack at samples.tbrain.ai prints the shipped record under six
 * headings — task, environment, device, operator, streams, file — and that is
 * the order a buyer reads it in: what was done, where, with what, by whom, how
 * well it was synced, and what lands on disk. `spec` is a flat list of pairs,
 * so the heading has to be recovered from the label.
 *
 * A label with no entry here falls into "Record" at the end rather than being
 * dropped. That is deliberate: the game and robotics lines carry keys the
 * off-the-shelf line does not, and a new key should still be visible the day it
 * is added, just unsorted.
 */

import { publicSpec } from "./redact.mjs";

export const SECTION_ORDER = [
  "Task",
  "Environment",
  "Device",
  "Operator",
  "Streams and sync",
  "File",
  "Record",
] as const;

export type SectionTitle = (typeof SECTION_ORDER)[number];

const SECTION_BY_LABEL: Record<string, SectionTitle> = {
  // Task
  "Task id": "Task",
  Description: "Task",
  "Skill group": "Task",
  Difficulty: "Task",
  Title: "Task",
  "Session type": "Task",
  "Stress category": "Task",

  // Environment
  Industry: "Environment",
  Workplace: "Environment",
  Station: "Environment",
  NAICS: "Environment",
  Business: "Environment",
  Site: "Environment",
  Geohash: "Environment",
  "Environment id": "Environment",
  "Business id": "Environment",

  // Device
  Device: "Device",
  "Device id": "Device",
  Kit: "Device",
  Shutter: "Device",
  Calibration: "Device",
  Rig: "Device",

  // Operator
  Operator: "Operator",
  Consent: "Operator",

  // Streams and sync
  Capture: "Streams and sync",
  "IMU rate": "Streams and sync",
  Streams: "Streams and sync",
  "Video streams": "Streams and sync",
  "Each stream": "Streams and sync",
  Sensors: "Streams and sync",
  Codec: "Streams and sync",
  Frames: "Streams and sync",
  "Telemetry columns": "Streams and sync",
  "Camera pose": "Streams and sync",
  "Input record": "Streams and sync",
  "Clock drift": "Streams and sync",
  "Clock offset": "Streams and sync",
  // Named for what the delivered sidecar actually reports,
  // `sync.max_alignment_error_ms`. The old label said "Stereo alignment" and
  // printed the value in px, which the source never measured in.
  "Alignment error": "Streams and sync",
  "Sync check": "Streams and sync",

  // File
  Session: "File",
  "Session layout": "File",
  "Shared session": "File",
  "Episode uuid": "File",
  File: "File",
  "SHA-256": "File",
  "Delivered size": "File",
  "Member file size": "File",
  "Per-segment size": "File",
  "Segment length": "File",
  "Second viewport": "File",
  Shown: "File",
};

export interface SpecSection {
  title: SectionTitle;
  rows: [string, string][];
}

/**
 * Sections in reading order, with empty ones dropped. Row order is preserved.
 *
 * Redaction happens here rather than at each call site so a new surface that
 * renders a record cannot forget it.
 */
export function groupSpec(spec: [string, string][]): SpecSection[] {
  const buckets = new Map<SectionTitle, [string, string][]>();
  for (const row of publicSpec(spec) as [string, string][]) {
    const title = SECTION_BY_LABEL[row[0]] ?? "Record";
    const bucket = buckets.get(title);
    if (bucket) bucket.push(row);
    else buckets.set(title, [row]);
  }
  return SECTION_ORDER.filter((t) => buckets.has(t)).map((title) => ({
    title,
    rows: buckets.get(title)!,
  }));
}

/**
 * A value long enough that a label beside it leaves no usable measure. Checksums,
 * uuids and file paths cross it; "pass" and "60 fps" do not. Those rows stack the
 * label above the value and take the full column instead.
 */
export const LONG_VALUE = 42;
