"use client";

import Link from "next/link";
import { ArrowRight, Check, Download, KeyRound, Lock } from "lucide-react";
import { assetsFor, downloadHref, humanBytes } from "@/lib/samples/downloads";
import { requestUrl } from "@/lib/samples/request-link";
import { track } from "@/lib/samples/track";
import { C, type Sample } from "./tokens";
import { useUnlocked } from "./useUnlocked";

/**
 * Page-level state of the gate, printed above the grid.
 *
 * Locked, it is the first thing a passcode holder sees, which is the whole
 * point: Tam hands VIP customers a code before a call and they should not have
 * to scroll past twenty samples to find where to type it. Unlocked, it stops
 * being a pitch and becomes the route to the whole archive.
 */
export function AccessStrip() {
  const unlocked = useUnlocked();

  if (unlocked) {
    return (
      <div
        className="bp-card mt-10 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="flex items-center gap-2 text-[13px]" style={{ color: C.textMid }}>
          <Check className="h-4 w-4 shrink-0" style={{ color: C.positive }} />
          Passcode active. Download links are open on every sample below.
        </p>
        <Link
          href="/samples/s"
          onClick={() => track("download_full_set", { from: "strip" })}
          className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold"
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
        Downloads are gated. Use the passcode we sent you, or leave a contact and we will issue one.
      </p>
      <div className="flex shrink-0 flex-wrap items-center gap-4">
        <Link
          href={`/samples/enter?redirect=${encodeURIComponent("/samples/s")}`}
          onClick={() => track("open_passcode", { from: "strip" })}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium"
          style={{ border: `1px solid ${C.rule}`, color: C.text }}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Enter passcode
        </Link>
        <Link
          href={requestUrl({ from: "strip" })}
          onClick={() => track("open_request_access", { from: "strip" })}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold"
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

  if (unlocked && assets) {
    return (
      <>
        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: C.positive }} />
        <span className="text-[11.5px]" style={{ color: C.textDim }}>
          Passcode active
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <a
            href={downloadHref(sample.slug, "metadata")}
            onClick={() => track("download_asset", { slug: sample.slug, asset: "metadata", from })}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px]"
            style={{ border: `1px solid ${C.rule}`, color: C.textMid }}
          >
            .metadata.json
          </a>
          <a
            href={downloadHref(sample.slug, "preview")}
            onClick={() => track("download_asset", { slug: sample.slug, asset: "preview", from })}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px]"
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
      <span className="text-[11.5px]" style={{ color: C.textDim }}>
        {sample.downloads.map((d) => d.t).join("  ·  ")} behind access
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={`/samples/enter?redirect=${encodeURIComponent("/samples/s")}`}
          onClick={() => track("open_passcode", { from, slug: sample.slug })}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium underline decoration-1 underline-offset-[5px]"
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
