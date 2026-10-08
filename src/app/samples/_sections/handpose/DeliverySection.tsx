import { FINGERS, HP_AGG, HP_FPS, JOINTS, PACK_FIELDS, PACK_FILES } from "@/lib/samples/handpose";
import { C, PILL } from "../tokens";
import { Reveal } from "../Reveal";
import { PageDisclosure } from "./PageDisclosure";
import { HAIRLINE_TOP, PageSection, SectionHead, TH_CLASS } from "./page-kit";
import { JOINTS_PER_HAND, SAMPLES, joinAnd, pad2 } from "./page-data";

/**
 * #delivery: what a buyer receives, tier by tier, before they ask.
 *
 * Three tiers and the file list under each. Open: the metrics table, the lanes
 * and the camera video with the hand pose drawn over it. Passcode: the sample
 * pack, for the samples whose operator consented. On request: everything else, by signed
 * link, after the licence is agreed.
 *
 * Every description of the pack is read from `PACK_FILES` and `PACK_FIELDS` in
 * `handpose.ts`, which the pack builder keeps in step with what it writes, so
 * this page cannot promise a field the file lacks. The pack has no 2D joints
 * and no per-flag frame arrays: arrays run the whole clip, one row per frame.
 */

type Tier = "open" | "passcode" | "request";

const TIER_LABEL: Record<Tier, string> = { open: "Open", passcode: "Passcode", request: "On request" };
/** Green for open, violet for passcode, grey for on request. The blue "device" pill is dropped everywhere. */
const TIER_PILL: Record<Tier, keyof typeof PILL> = { open: "quality", passcode: "skill", request: "muted" };

function TierPill({ tier }: { tier: Tier }) {
  const p = PILL[TIER_PILL[tier]];
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px]"
      style={{ background: p.bg, color: p.fg, border: `1px solid ${p.bd}` }}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

/**
 * The lane files' size bound, stated rather than measured here: a `statSync`
 * on run-time paths made Next's output tracing copy all of public/samples into
 * the page's serverless function, past Vercel's size limit. The bound is
 * asserted against the files by scripts/samples/check-handpose-data.mjs in
 * prebuild, so it cannot drift.
 */
export const LANE_MAX_KB = 8;
const laneSizeLabel = () => `.json, under ${LANE_MAX_KB} KB each`;

interface Row {
  what: string;
  contents: string;
  format: string;
  tier: Tier;
  /** Who it covers, or what governs it. */
  note?: string;
}

function rows(): Row[] {
  const packSamples = SAMPLES.filter((s) => s.pack).map((s) => s.n);
  const forPack = packSamples.length ? `samples ${joinAnd(packSamples)}` : undefined;
  const videoSamples = SAMPLES.filter((s) => s.preview === "video").map((s) => s.n);
  // "every sample", or "every sample except 04" when only a few are missing, before a long list.
  const missing = SAMPLES.filter((s) => s.preview !== "video").map((s) => pad2(s.n));
  const forVideo = !videoSamples.length
    ? undefined
    : !missing.length
      ? "every sample"
      : missing.length <= 3
        ? `every sample except ${joinAnd(missing)}`
        : `samples ${joinAnd(videoSamples)}`;
  return [
    {
      what: `Metrics (CSV, ${HP_AGG.samples} rows)`,
      contents:
        "The per-sample numbers behind this page: frames, 3D pose share, measured, guessed, bridged, no 3D pose, missed (as reported), longest run without a 3D pose.",
      format: ".csv",
      tier: "open",
    },
    {
      what: "Lanes (state per frame)",
      contents:
        "Measured, guessed, bridged or no 3D pose for each hand on each frame. No pixels and no hand geometry.",
      format: laneSizeLabel(),
      tier: "open",
    },
    {
      what: "Preview video",
      contents: `The camera video with the 2D hand pose drawn over it, 540 x 540, ${HP_FPS} fps. Faces blurred; the scene is left sharp.`,
      format: ".mp4",
      tier: "open",
      note: forVideo,
    },
    {
      what: "3D view joints",
      contents: `What the 3D view on this page plays: ${JOINTS_PER_HAND} joints per hand at ${HP_FPS / 2} fps, rounded to 2 mm, axes from the wearer's view, with the state per frame. For looking, not training.`,
      format: ".bin",
      tier: "open",
      note: "every sample",
    },
    {
      // An earlier draft titled this "…with state and 2D". The pack carries no
      // 2D joints, only the 2D-only flag, so the title says what is in it.
      what: `Joints at ${HP_FPS} fps with state`,
      contents: `${JOINTS_PER_HAND} joints per hand in metres, one state per frame, the 2D-only flag, the view count and a confidence score, with a README and checksums. Size shown on the download button.`,
      format: ".npz",
      tier: "passcode",
      note: forPack,
    },
    {
      what: "3D-only recording",
      contents: "Both hands in 3D for Rerun, no camera pixels.",
      format: ".rrd",
      tier: "passcode",
      note: forPack,
    },
    {
      what: "Renders, per-frame model output, calibration and raw files",
      contents:
        `Overlay and 3D preview renders, the full per-frame model output with mesh vertices, calibration, and the raw files (six 1080p H.265 camera streams, .mcap, IMU). Delivered by signed link after the licence is agreed. About 14 GB for the ${HP_AGG.samples} samples.`,
      format: ".mp4 .npz .mcap .csv",
      tier: "request",
      note: "Licence terms are confirmed before delivery.",
    },
  ];
}

const LOADER = `import numpy as np, matplotlib.pyplot as plt
z = np.load("joints.npz")
i = list(z["joint_names"]).index("wrist")
wrist = z["left_joints"][:, i]            # (N, 3) metres, NaN where state is 0
state, t = z["left_state"], np.arange(len(wrist)) / z["fps"]
for s, name in enumerate(["no 3D pose", "measured", "guessed", "bridged"]):
    m = state == s
    print(f"{name}: {m.sum()} frames")
    plt.scatter(t[m], wrist[m, 0], s=4, label=name)   # left wrist x over time
plt.legend(); plt.show()`;

/* ── The joint table ──────────────────────────────────────────────────────── */

function JointTable() {
  const groups = ["wrist", ...FINGERS] as const;
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Joint table: index and key for each of the 21 joints">
      <table className="w-full min-w-[19rem] border-collapse text-left">
        <caption className="sr-only">
          The {JOINTS_PER_HAND} joints of a hand: index and key, grouped by finger, numbered outwards from the wrist.
        </caption>
        <thead>
          <tr>
            <th scope="col" className={`${TH_CLASS} pb-2 pr-2`} style={{ color: C.textDim, borderBottom: `1px solid ${C.rule}` }}>
              Group
            </th>
            {[1, 2, 3, 4].map((p) => (
              <th key={p} scope="col" className={`${TH_CLASS} pb-2 pr-2`} style={{ color: C.textDim, borderBottom: `1px solid ${C.rule}` }}>
                Joint {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const joints = JOINTS.filter((j) => j.finger === g);
            return (
              <tr key={g} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                <th scope="row" className="py-2 pr-2 text-left font-mono text-[11px] font-normal" style={{ color: C.textMid }}>
                  {g}
                </th>
                {g === "wrist" ? (
                  <td colSpan={4} className="py-2 pr-2">
                    <span className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-[11px]">
                      <span style={{ color: C.textDim }}>{joints[0].index}</span>
                      <span style={{ color: C.value }}>{joints[0].key}</span>
                    </span>
                  </td>
                ) : (
                  joints.map((j) => (
                    <td key={j.key} className="py-2 pr-2">
                      <span className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-[11px]">
                        <span style={{ color: C.textDim }}>{j.index}</span>
                        <span style={{ color: C.value }}>{j.key}</span>
                      </span>
                    </td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FieldTable() {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Fields in the sample pack">
      <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
        <caption className="sr-only">
          Fields in the sample pack: name, shape, data type, unit and meaning. N is the number of frames in the clip.
        </caption>
        <thead>
          <tr>
            {["Name", "Shape", "Dtype", "Unit", "Meaning"].map((h) => (
              <th key={h} scope="col" className={`${TH_CLASS} pb-2.5 pr-3`} style={{ color: C.textDim, borderBottom: `1px solid ${C.rule}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PACK_FIELDS.map((f) => (
            <tr key={f.name} className="align-top" style={{ borderBottom: `1px solid ${C.hairline}` }}>
              <th scope="row" className="py-2.5 pr-3 text-left font-mono text-[11px] font-normal" style={{ color: C.value }}>
                {f.name}
              </th>
              <td className="whitespace-nowrap py-2.5 pr-3 font-mono text-[11px]" style={{ color: C.textMid }}>
                {f.shape}
              </td>
              <td className="py-2.5 pr-3 font-mono text-[11px]" style={{ color: C.textMid }}>
                {f.dtype}
              </td>
              <td className="py-2.5 pr-3 font-mono text-[11px]" style={{ color: C.textMid }}>
                {f.unit}
              </td>
              <td className="py-2.5 leading-[1.55]" style={{ color: C.textMid }}>
                {f.meaning}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DeliverySection() {
  const all = rows();
  return (
    <PageSection id="delivery" tone="paper" labelledBy="hp-delivery-title">
      <Reveal variant="rise">
        <SectionHead id="hp-delivery-title" eyebrow="What you receive" lead="Three tiers," dim="and what is in each" />

        {/* From lg: the table. Below it the access column would be cut off on a
            tablet, so those widths get the list. */}
        <div
          className="mt-8 hidden overflow-x-auto lg:block"
          tabIndex={0}
          role="region"
          aria-label="What you receive, by access tier"
        >
          <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
            <caption className="sr-only">
              What each tier contains: the item, its contents, its file format and who can get it.
            </caption>
            <thead>
              <tr>
                {["What", "Contents", "Format", "Access"].map((h) => (
                  <th key={h} scope="col" className={`${TH_CLASS} pb-3 pr-4 ${h === "Format" ? "w-[10.5rem]" : ""}`} style={{ color: C.textDim, borderBottom: `1px solid ${C.rule}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map((r) => (
                <tr key={r.what} className="align-top" style={{ borderBottom: `1px solid ${C.hairline}` }}>
                  <th scope="row" className="w-1/4 py-3.5 pr-4 text-left font-medium leading-[1.55]" style={{ color: C.text }}>
                    {r.what}
                  </th>
                  <td className="py-3.5 pr-4 leading-[1.55]" style={{ color: C.textMid }}>
                    {r.contents}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[11px] leading-[1.55]" style={{ color: C.value }}>
                    {r.format}
                  </td>
                  <td className="py-3.5">
                    <TierPill tier={r.tier} />
                    {r.note && (
                      <span className="mt-1.5 block text-[12px] leading-snug" style={{ color: C.textMid }}>
                        {r.note}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Below lg: one block per row, same order, two across from 640px. */}
        <ul className="mt-6 sm:grid sm:grid-cols-2 sm:gap-x-8 lg:hidden" aria-label="What you receive, by access tier">
          {all.map((r) => (
            <li key={r.what} className="py-4" style={HAIRLINE_TOP}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-medium leading-snug" style={{ color: C.text }}>
                  {r.what}
                </p>
                <TierPill tier={r.tier} />
              </div>
              <p className="mt-1.5 text-[13px] leading-[1.55]" style={{ color: C.textMid }}>
                {r.contents}
              </p>
              <p className="mt-2 font-mono text-[11px]" style={{ color: C.value }}>
                {r.format}
                {r.note ? <span style={{ color: C.textMid }}>{` · ${r.note}`}</span> : null}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-9 md:mt-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <h3 className="text-[15px]" style={{ color: C.text }}>
              Coordinate frame
            </h3>
            <p className="mt-2.5 text-[13px] leading-[1.65]" style={{ color: C.textMid }}>
              Joints are in metres in the head-rig frame, the frame of the wearer&apos;s own camera rig, not a room or
              world frame. The axes are fixed to the rig; their directions come with the full delivery, not the sample
              pack. Joint order is in the table below.
            </p>

            <h3 className="mt-7 text-[15px]" style={{ color: C.text }}>
              Joint order
            </h3>
            <PageDisclosure label="Show the joint table" openLabel="Hide the joint table" below="md" className="mt-3">
              <JointTable />
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.textDim }}>
                Same {JOINTS_PER_HAND}-point layout as the OpenPose and MediaPipe hand models: the wrist, then thumb,
                index, middle, ring and little, four joints each, numbered outwards from the wrist. Joint 1 of each
                finger is nearest the wrist and joint 4 is the fingertip.
              </p>
            </PageDisclosure>
          </div>

          <div className="lg:col-span-8">
            <h3 className="text-[15px]" style={{ color: C.text }}>
              In the sample pack
            </h3>
            {/* The file list and the field table are one block of reference
                material, so on a phone they share one disclosure. */}
            <PageDisclosure label="Show the files and fields" openLabel="Hide the files and fields" below="md" className="mt-3">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {PACK_FILES.map((f) => (
                  <div key={f.name} className="py-2" style={HAIRLINE_TOP}>
                    <dt className="font-mono text-[11px]" style={{ color: C.value }}>
                      {f.name}
                    </dt>
                    <dd className="mt-0.5 text-[12px] leading-snug" style={{ color: C.textMid }}>
                      {f.what}
                    </dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-7 text-[15px]" style={{ color: C.text }}>
                Fields in the sample pack
              </h3>
              <div className="mt-3">
                <FieldTable />
              </div>

              <h3 className="mt-7 text-[15px]" style={{ color: C.text }}>
                Load it in Python
              </h3>
              <p className="mt-2 text-[12px] leading-[1.55]" style={{ color: C.textMid }}>
                Reads the pack&apos;s <span className="font-mono">joints.npz</span> and plots the left wrist over time,
                one colour per state.
              </p>
              <pre
                tabIndex={0}
                aria-label="Python: load joints.npz and plot the left wrist by state"
                className="mt-3 font-mono"
                style={{
                  margin: 0,
                  padding: "14px 16px",
                  fontSize: 11,
                  lineHeight: 1.65,
                  color: "var(--bp-code-ink)",
                  background: "var(--bp-code-panel)",
                  border: `1px solid ${C.hairline}`,
                  borderRadius: 10,
                  overflowX: "auto",
                }}
              >
                {LOADER}
              </pre>
            </PageDisclosure>
          </div>
        </div>
      </Reveal>
    </PageSection>
  );
}
