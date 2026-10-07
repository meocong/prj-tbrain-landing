"use client";

import Link from "next/link";
import { ArrowRight, Check, Download, KeyRound, Lock, Package } from "lucide-react";
import { assetsFor, downloadHref, humanBytes, type AssetEntry, type AssetKey } from "@/lib/samples/downloads";
import { requestUrl } from "@/lib/samples/request-link";
import { track } from "@/lib/samples/track";
import { C, type Sample } from "./tokens";
import { useUnlocked } from "./useUnlocked";

/** Hand pose has one address, and the passcode form sends a reader back to it. */
const HANDPOSE_URL = "/samples/hand-pose";

/** "13", "13 and 14", "13, 14 and 15". */
function listNumbers(ns: number[]) {
  const s = ns.map(String);
  return s.length < 2 ? s.join("") : `${s.slice(0, -1).join(", ")} and ${s[s.length - 1]}`;
}

/**
 * Page-level state of the gate, printed above the grid.
 *
 * Locked, it is the first thing a passcode holder sees, which is the whole
 * point: Tam hands VIP customers a code before a call and they should not have
 * to scroll past twenty samples to find where to type it. Unlocked, it stops
 * being a pitch and becomes the route to the whole archive.
 *
 * Hand pose names the samples whose pack is behind the passcode, because "every
 * sample below" is not true there: two of sixteen have one. The numbers come
 * from the catalogue (`packSamples`), not from this file, so the sentence stays
 * true when a third pack is released.
 */
export function AccessStrip({
  variant,
  packSamples = [],
}: {
  variant?: "handpose";
  /** Sample numbers with a sample pack behind the passcode. Hand pose only. */
  packSamples?: number[];
}) {
  const unlocked = useUnlocked();
  // Inline flag, so a production bundle drops the hand-pose branches.
  const handPose = process.env.HAND_POSE_ON === "1" && variant === "handpose";
  const packs = packSamples.length
    ? `for ${packSamples.length === 1 ? "sample" : "samples"} ${listNumbers(packSamples)}`
    : "";

  if (unlocked) {
    return (
      <div
        className="bp-card mt-10 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="flex items-center gap-2 text-[13px]" style={{ color: C.textMid }}>
          <Check className="h-4 w-4 shrink-0" style={{ color: C.positive }} />
          {handPose
            ? packSamples.length
              ? `Passcode active. Sample packs are open on ${packSamples.length === 1 ? "sample" : "samples"} ${listNumbers(packSamples)}.`
              : "Passcode active. Sample packs are open where a sample has one."
            : "Passcode active. Download links are open on every sample below."}
        </p>
        <Link
          href="/samples/s"
          onClick={() => track("download_full_set", { from: "strip" })}
          className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold"
          style={{ background: C.accent, color: "var(--sm-on-accent)" }}
        >
          All downloads
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="bp-card mt-10 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-center gap-2 text-[13px]" style={{ color: C.textMid }}>
        <Lock className="h-4 w-4 shrink-0" style={{ color: C.textDim }} />
        {handPose
          ? `Sample packs${packs ? ` ${packs}` : ""} are behind a passcode. Use the one we sent you, or request access and we will issue one.`
          : "Downloads are gated. Use the passcode we sent you, or leave a contact and we will issue one."}
      </p>
      <div className="flex shrink-0 flex-wrap items-center gap-4">
        <Link
          /* A hand-pose reader came for this page's packs; send them back to it,
             as the record footer does, rather than to the vault. */
          href={`/samples/enter?redirect=${encodeURIComponent(handPose ? HANDPOSE_URL : "/samples/s")}`}
          onClick={() => track("open_passcode", { from: handPose ? "hand-pose-strip" : "strip" })}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium"
          style={{ border: `1px solid ${C.rule}`, color: C.text }}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Enter passcode
        </Link>
        <Link
          href={requestUrl({ from: handPose ? "hand-pose-strip" : "strip" })}
          onClick={() => {
            track("open_request_access", { from: handPose ? "hand-pose-strip" : "strip" });
            if (handPose) track("handpose_request_click", { from: "hand-pose-strip" });
          }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold"
          style={{ background: C.accent, color: "var(--sm-on-accent)" }}
        >
          Request access
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * The record footer for a hand-pose sample.
 *
 * It is its own bar rather than the library's with a few labels swapped,
 * because the library's makes three claims that are false here. Its locked
 * state names what is behind access from `sample.downloads`, which is empty for
 * the fourteen samples that have no pack and would print " behind access" with
 * no noun. Its unlocked state offers a "Preview pack" and a "Stage the full N"
 * button, and what hand pose has is a sample pack (joints, states, a recording
 * for Rerun, checksums), and a full delivery that is not a download at all: it
 * is agreed with us and sent by signed link. And its passcode link returns a
 * reader to the vault, where a hand-pose visitor was looking at one sample.
 *
 * Three states, by what the sample has and what the reader holds:
 *   pack staged, no passcode   behind access: enter one, or ask for the sample
 *   pack staged, passcode      download it, or ask for the full delivery
 *   no pack                    on request, whatever the reader holds
 *
 * Nothing here prices or times anything: a promise of a turnaround is one the
 * page cannot keep for us.
 */
function HandPoseActions({
  sample,
  from,
  unlocked,
  assets,
}: {
  sample: Sample;
  from: string;
  unlocked: boolean | null;
  assets: Record<AssetKey, AssetEntry> | null;
}) {
  const request = requestUrl({ from, sample: sample.slug, title: sample.title });
  // The library-wide event stays, so the sitewide request funnel still counts
  // hand pose; the second one is the category's own.
  const onRequest = () => {
    track("open_request_access", { from, slug: sample.slug });
    track("handpose_request_click", { from, slug: sample.slug });
  };
  const onDownload = (asset: AssetKey) => {
    track("download_asset", { slug: sample.slug, asset, from });
    if (asset === "preview") track("handpose_pack_download", { slug: sample.slug, from });
  };

  // Only where there is a preview video to speak of: the record's "Preview" spec row.
  const hasVideo = sample.spec?.some(([k, v]) => k === "Preview" && v === "Video preview") ?? false;
  const note = hasVideo ? (
    /* Not on a phone, where the pinned footer is height the lane needs; the
       viewer's own caption says the same thing above the media. */
    <span className="hidden text-[11px] sm:inline" style={{ color: C.textDim }}>
      Faces and bystanders in the preview video are blurred.
    </span>
  ) : null;
  const requestClass =
    "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-transform active:scale-[0.98]";

  if (unlocked && assets) {
    return (
      <>
        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: C.positive }} />
        <span className="text-[11px]" style={{ color: C.textDim }}>
          Passcode active
        </span>
        {note}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <a
            href={downloadHref(sample.slug, "preview")}
            onClick={() => onDownload("preview")}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px]"
            style={{ border: `1px solid ${C.rule}`, color: C.text }}
          >
            <Download className="h-3.5 w-3.5" />
            Sample pack · {humanBytes(assets.preview.bytes)}
          </a>
          <a
            href={downloadHref(sample.slug, "metadata")}
            onClick={() => onDownload("metadata")}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px]"
            style={{ border: `1px solid ${C.rule}`, color: C.textMid }}
          >
            Metadata (JSON)
          </a>
          <Link
            href={request}
            onClick={onRequest}
            className={requestClass}
            style={{ background: C.accent, color: "var(--sm-on-accent)" }}
          >
            Request the full delivery
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </>
    );
  }

  if (assets) {
    return (
      <>
        <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: C.textDim }} />
        <span className="text-[11px]" style={{ color: C.textDim }}>
          Sample pack behind access
        </span>
        {note}

        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            // Back to this sample, not to the vault: the reader came here to
            // open this pack, and the page they return to has it in the footer.
            href={`/samples/enter?redirect=${encodeURIComponent(`${HANDPOSE_URL}?record=${sample.slug}`)}`}
            onClick={() => track("open_passcode", { from, slug: sample.slug })}
            className="inline-flex min-h-6 items-center gap-1.5 text-[12px] font-medium underline decoration-1 underline-offset-[5px]"
            style={{ color: C.textMid, textDecorationColor: C.rule }}
          >
            <KeyRound className="h-3.5 w-3.5" />
            I have a passcode
          </Link>

          <Link
            href={request}
            onClick={onRequest}
            className={requestClass}
            style={{ background: C.accent, color: "var(--sm-on-accent)" }}
          >
            Request this sample
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Package className="h-3.5 w-3.5 shrink-0" style={{ color: C.textDim }} />
      <span className="text-[11px]" style={{ color: C.textDim }}>
        Sample pack on request
      </span>
      {note}

      <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={request}
          onClick={onRequest}
          className={requestClass}
          style={{ background: C.accent, color: "var(--sm-on-accent)" }}
        >
          Request the full delivery
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </>
  );
}

/**
 * The two ways to get a file, side by side.
 *
 * Tam's rule for the library: a visitor either has a passcode we handed them
 * before a call, or they leave a contact and we hand them one. Both have to be
 * offered at the moment someone reaches for a download — the passcode used to
 * live only in a band at the very bottom of the page, which meant a customer
 * holding a code had no way in from the sample they were actually looking at.
 *
 * Once a passcode is redeemed the same bar turns into real signed links.
 */
export function AccessActions({ sample, from }: { sample: Sample; from: string }) {
  const unlocked = useUnlocked();
  const assets = assetsFor(sample.slug);

  // Inline flag, so a production bundle drops HandPoseActions.
  if (process.env.HAND_POSE_ON === "1" && sample.modality === "handpose") {
    return <HandPoseActions sample={sample} from={from} unlocked={unlocked} assets={assets} />;
  }

  if (unlocked && assets) {
    return (
      <>
        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: C.positive }} />
        <span className="text-[11px]" style={{ color: C.textDim }}>
          Passcode active
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <a
            href={downloadHref(sample.slug, "metadata")}
            onClick={() => track("download_asset", { slug: sample.slug, asset: "metadata", from })}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px]"
            style={{ border: `1px solid ${C.rule}`, color: C.textMid }}
          >
            .metadata.json
          </a>
          <a
            href={downloadHref(sample.slug, "preview")}
            onClick={() => track("download_asset", { slug: sample.slug, asset: "preview", from })}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px]"
            style={{ border: `1px solid ${C.rule}`, color: C.text }}
          >
            <Download className="h-3.5 w-3.5" />
            Preview pack · {humanBytes(assets.preview.bytes)}
          </a>
          {assets.full.object ? (
            <a
              href={downloadHref(sample.slug, "full")}
              onClick={() => track("download_asset", { slug: sample.slug, asset: "full", from })}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
              style={{ background: C.accent, color: "var(--sm-on-accent)" }}
            >
              <Download className="h-4 w-4" />
              {assets.full.filename} · {humanBytes(assets.full.bytes)}
            </a>
          ) : (
            <Link
              href={requestUrl({ from, sample: sample.slug, title: sample.title })}
              onClick={() => track("open_request_access", { from, slug: sample.slug, reason: "not_staged" })}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
              style={{ background: C.accent, color: "var(--sm-on-accent)" }}
              title={assets.full.note}
            >
              Stage the full {humanBytes(assets.full.bytes)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: C.textDim }} />
      <span className="text-[11px]" style={{ color: C.textDim }}>
        {sample.downloads.map((d) => d.t).join("  ·  ")} behind access
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={`/samples/enter?redirect=${encodeURIComponent("/samples/s")}`}
          onClick={() => track("open_passcode", { from, slug: sample.slug })}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium underline decoration-1 underline-offset-[5px]"
          style={{ color: C.textMid, textDecorationColor: C.rule }}
        >
          <KeyRound className="h-3.5 w-3.5" />
          I have a passcode
        </Link>

        <Link
          href={requestUrl({ from, sample: sample.slug, title: sample.title })}
          onClick={() => track("open_request_access", { from, slug: sample.slug })}
          className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-transform active:scale-[0.98]"
          style={{ background: C.accent, color: "var(--sm-on-accent)" }}
        >
          Request this sample
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </>
  );
}
