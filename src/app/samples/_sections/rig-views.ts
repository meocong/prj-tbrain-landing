import stagedViews from "@/lib/samples/views.json";

/**
 * Which views a record has staged, and where each one sits.
 *
 * Lived in `SampleCatalog` until the modal needed it too. Thạch, 2026-09-11:
 * "bạn mới sửa bên ngoài còn bên trong modal ấy, 6 cam mở ra vẫn chỉ có 1 cam."
 * The card grew a six-up and the record modal — the surface a reader opens
 * BECAUSE they want a closer look — kept playing one lens. Copying the table
 * into the modal would have left two of them to drift, so it moved here and
 * both import it.
 *
 * Generated half: `node scripts/samples/index-views.mjs`. A plain object at
 * module scope so a 135-card grid does one O(1) lookup per card rather than
 * scanning an array on every render of every tile.
 */
export const VIEWS = stagedViews as Record<string, string[] | undefined>;

export interface ViewPlace {
  /** Suffix on the clip and poster. Empty string is the base file. */
  view: string;
  label: string;
  /** Tailwind placement, `sm:`-scoped so the grid reflows on a phone. */
  place: string;
}

/**
 * Where each lens of the six-camera rig sits.
 *
 * The same front elevation `RigViews` draws, and for the same reason given at
 * length there: one camera at the outer left, a pair, a pair, one at the outer
 * right, read left to right as the rig is worn.
 *
 *     outer-left   primary-left  primary-right   outer-right
 *                  mid-left      mid-right
 *
 * A reader who has met that diagram on the configuration page should be able
 * to point at a tile here and know which lens took it, so the two layouts are
 * the same layout rather than two arrangements of the same six files.
 *
 * The outer two span both rows and centre themselves, which keeps every tile
 * showing a 4:3 frame at its own aspect — stretching one to fill two rows
 * would make it the only cell in the picture that is not.
 *
 * Below `sm` the placements do not apply and the six fall into a two-column
 * grid in DOM order, which is why that order is primary, mid, outer: on a
 * phone each pair still lands beside its own partner.
 */
export const LENS_PLACES: ViewPlace[] = [
  { view: "", label: "primary · left", place: "sm:[grid-column:2] sm:[grid-row:1]" },
  { view: "primary-right", label: "primary · right", place: "sm:[grid-column:3] sm:[grid-row:1]" },
  { view: "mid-left", label: "mid · left", place: "sm:[grid-column:2] sm:[grid-row:2]" },
  { view: "mid-right", label: "mid · right", place: "sm:[grid-column:3] sm:[grid-row:2]" },
  {
    view: "outer-left",
    label: "outer · left",
    place: "sm:[grid-column:1] sm:[grid-row:1/span_2] sm:self-center",
  },
  {
    view: "outer-right",
    label: "outer · right",
    place: "sm:[grid-column:4] sm:[grid-row:1/span_2] sm:self-center",
  },
];

/**
 * The kit delivery's three body-worn cameras: a head view and two wrists.
 *
 * Not a rig elevation like `LENS_PLACES`, because there is no geometry to draw
 * — the cameras are on a person, not on a bar — so they sit in a plain row with
 * the head first. The head leads because it is the view that shows the task;
 * the wrists are what this configuration ADDS, and they read as additions.
 *
 * Both wrists are labelled "wrist" and neither says which arm. The delivery
 * does not know: `role` on every `.calib.json` is the camera's own index, and
 * `missing_streams` names `wrist_left.mp4` and `wrist_right.mp4` on all 85
 * sessions including the three-camera ones, so it is a profile template and not
 * a record of what was worn. Two tiles reading "wrist" is the true version.
 */
export const BODY_PLACES: ViewPlace[] = [
  { view: "", label: "head", place: "" },
  { view: "view-2", label: "wrist", place: "" },
  { view: "view-3", label: "wrist", place: "" },
];

const PAIR_PLACES: ViewPlace[] = [
  { view: "", label: "left eye", place: "" },
  { view: "right", label: "right eye", place: "" },
];

const SINGLE_PLACES: ViewPlace[] = [{ view: "", label: "", place: "" }];

export interface RigLayout {
  /** The cells to render, in DOM order. The first is always the base clip. */
  cells: ViewPlace[];
  kind: "single" | "pair" | "body" | "six";
  /** Tailwind columns for the grid. */
  cols: string;
  /**
   * Band aspect.
   *
   * 4:3 per VIEW, not per card. A pair squeezed into a 4:3 band would crop
   * each eye to 2:3 — a portrait slice of a landscape frame, which throws away
   * the sides of the very thing the second view exists to show. So the band
   * grows to hold whole frames instead: two side by side is 8:3, and the
   * six-camera elevation is four columns over two rows, which is the same 8:3.
   * Below `sm` the six reflow to two columns and three rows, which is 8:9.
   */
  band: string;
}

/**
 * What to draw for a record.
 *
 * A six-camera record missing a lens — `garment-sewing` has five, one file in
 * the delivery will not decode — still lays out as the rig. The hole is where
 * that camera is, which is the honest picture of what shipped; closing it up
 * would draw a five-camera rig that does not exist.
 */
export function rigLayout(slug: string): RigLayout {
  const extra = VIEWS[slug] ?? [];
  const lenses = LENS_PLACES.filter((l) => !l.view || extra.includes(l.view));
  if (lenses.length > 2) {
    return {
      cells: lenses,
      kind: "six",
      cols: "grid-cols-2 sm:grid-cols-4",
      band: "aspect-[8/9] sm:aspect-[8/3]",
    };
  }
  /* Three body-worn cameras, checked before the pair: a wrist record stages
     `-view-2` and `-view-3` and no `-right`, so the pair test would miss it and
     the card would play the head camera alone — an advertisement for the mono
     configuration on the card selling the three-camera one.

     Three 4:3 frames in a row is 4:1. Below `sm` they stack into one column,
     which is 4:9 — the same shape the six-up takes on a phone, so a row mixing
     the two still lines up. */
  const body = BODY_PLACES.filter((l) => !l.view || extra.includes(l.view));
  if (body.length > 1) {
    return {
      cells: body,
      kind: "body",
      cols: "grid-cols-1 sm:grid-cols-3",
      band: "aspect-[4/9] sm:aspect-[4/1]",
    };
  }
  if (extra.includes("right")) {
    return { cells: PAIR_PLACES, kind: "pair", cols: "grid-cols-2", band: "aspect-[8/3]" };
  }
  return { cells: SINGLE_PLACES, kind: "single", cols: "grid-cols-1", band: "aspect-[4/3]" };
}

export const clipSrc = (slug: string, view: string) =>
  `/samples/clips/${slug}${view ? `-${view}` : ""}.mp4`;

export const posterSrc = (slug: string, view: string) =>
  `/samples/posters/${slug}${view ? `-${view}` : ""}.jpg`;
