/**
 * Licence posture — PROVISIONAL. Legal has not reviewed this file.
 *
 * Licence clarity is the heaviest-weighted thing a buyer scores a data vendor
 * on, and both catalogues we read print it on every card. We had nothing: a
 * grep of `samples.json` finds `license=0 rights=0 exclusive=0`, and only
 * `consent` appears at all.
 *
 * So this is a draft, built to be replaced rather than to be right. Two rules
 * kept it from becoming an invented legal claim on a page buyers procure from:
 *
 *  1. **Every term carries its grounding.** `documented` means the wording
 *     traces to a sentence already written down in the deck, the capability
 *     spreadsheet or the records themselves, and the source is quoted in the
 *     comment above it. `draft` means it is ordinary commercial practice that
 *     nothing of ours states, and it is the list legal should read first.
 *  2. **The page says the agreement governs.** `QUALIFIER` renders beside every
 *     licence block. An indicative term next to that sentence is a normal thing
 *     for a vendor to publish; the same term without it is a promise.
 *
 * Four of the eight terms are quotes. Four are drafts. Nothing here was chosen
 * to sound reassuring.
 */

export type Grounding = "documented" | "draft";

export interface LicenseTerm {
  label: string;
  value: string;
  grounding: Grounding;
  /** Where the wording comes from, or what assumption it rests on. */
  source: string;
}

export const LICENSE: LicenseTerm[] = [
  {
    label: "Commercial use",
    value: "Licensed for commercial use",
    grounding: "documented",
    source:
      'Capability catalogue, OTS sheet: "Ready-to-License Egocentric Data", "Pre-collected datasets for immediate licensing".',
  },
  {
    label: "Consent",
    value: "Recorded per session, on every episode",
    grounding: "documented",
    source: "samples.json: `Consent: recorded per session` on 118 of 118 records.",
  },
  {
    label: "Where it was filmed",
    value: "Operating businesses only. No private residences, no staged studios.",
    grounding: "documented",
    source:
      'Sales deck: "Commercial-only footprint - every one of the 70+ sites is an operating business... Never a private residence, never a staged studio."',
  },
  {
    label: "Scope",
    value: "Whole corpus as one pack, or single-skill licensing on request",
    grounding: "documented",
    source:
      'Capability catalogue, OTS sheet: "Full corpus available as single pack; partial single-skill licensing on request".',
  },
  {
    label: "Exclusivity",
    value: "Non-exclusive by default. Exclusive terms on request.",
    grounding: "draft",
    source:
      "Nothing of ours states this. It is how the marketplaces describe the norm - off-the-shelf is non-exclusive unless the buyer pays for exclusivity, bespoke collection can be exclusive by contract.",
  },
  {
    label: "Model training",
    value: "Permitted, including derived model weights",
    grounding: "draft",
    source:
      "The product is training data, so this is the assumption the whole catalogue rests on. It is still an assumption and legal should confirm the weights half of it explicitly.",
  },
  {
    label: "Redistribution",
    value: "Not permitted. Licensed to the buyer, not for resale.",
    grounding: "draft",
    source: "Ordinary practice for licensed data. Nothing of ours states it.",
  },
  {
    label: "Restricted subsets",
    value: "Some manufacturing-environment data is under NDA and is not published here",
    grounding: "documented",
    source:
      'Capability catalogue, OTS sheet note 2: "Additional datasets from manufacturing environments available under NDA - cannot be publicly shared."',
  },
];

/**
 * Rendered beside every licence block. Not a disclaimer bolted on: it is the
 * sentence that makes an indicative term publishable, and it stays true after
 * legal replaces the drafts above.
 */
export const QUALIFIER = "Indicative terms. The licence agreement governs.";

/** One line for a card, where a block does not fit. */
export const LICENSE_SHORT = "Commercial, non-exclusive · consent per session";

/** Terms legal has not seen. Kept as a list so the count is checkable. */
export const DRAFT_TERMS = LICENSE.filter((t) => t.grounding === "draft");
