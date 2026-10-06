import type { Metadata } from "next";
import { HANDPOSE_PATH, HP_AGG } from "@/lib/samples/handpose";

/**
 * <head> for /samples/hand-pose.
 *
 * Its own function rather than the generic category branch, which would be
 * wrong for this page in three ways: it suffixes the title with "· Tbrain" and
 * the root layout's template then adds "| Tbrain" again; it describes the page
 * with the card's one-line blurb; and it sets no canonical, so the page would
 * inherit the site root's and tell search engines it is the home page. The
 * canonical is the path with no query: `?record=` and `&f=` open a record in
 * place and are not pages.
 *
 * Shaped like `/samples`' own metadata: title, description, canonical, Open
 * Graph with an explicit image and size, and a large Twitter card. The image is
 * a skeleton render and nothing else.
 */
const OG_IMAGE = "/samples/hand-pose/og.jpg";
const OG_ALT = "A camera frame with the 21 joints of both hands drawn over it, left hand blue, right hand orange.";

export function handPoseMetadata(): Metadata {
  const title = "Hand Pose Data Samples: 21 Joints per Hand in 3D";
  const description = `${HP_AGG.samples} hand-pose samples, ${HP_AGG.minutes.toFixed(1)} minutes: 21 joints per hand in metres from a stereo pair on a head-worn rig, with a state label on every frame.`;

  return {
    title,
    description,
    alternates: { canonical: HANDPOSE_PATH },
    openGraph: {
      title,
      description,
      url: HANDPOSE_PATH,
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
