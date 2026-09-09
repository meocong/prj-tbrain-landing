"use client";

import type { Variants } from "framer-motion";
import type { ReactNode } from "react";
import { RevealOnScroll } from "@/components/marketing/fx/RevealOnScroll";

/**
 * Scroll reveal for the samples pages.
 *
 * B3, Tam: "em có thể dùng các templates có sẵn ở trong landing page, ko cần
 * invent ra cái mới". This used to be its own `motion.div` — a second scroll
 * reveal on a site that already had one. It is now an adapter over
 * `RevealOnScroll`, so there is one implementation of this motion and these
 * pages configure it rather than repeat it.
 *
 * What the adapter keeps, and why it is not simply `RevealOnScroll` at every
 * call site. Its default is `y: 40` with an 8px blur over 0.7s at `amount
 * 0.25`, which is right for a marketing section and wrong for two things here:
 *
 *  - **22px, not 40.** The category headers carry eight-column stat rows. Eight
 *    numbers travelling 40px in step read as a curtain dropping rather than as
 *    content settling.
 *  - **`amount: "some"`, not a fraction.** This is the important one, and it is
 *    a fix rather than a preference.
 *
 * A numeric `amount` is a fraction OF THE ELEMENT, not of the viewport. The
 * catalogue grid on /samples/egocentric measures 7,367px at 1440 wide, so
 * `amount: 0.2` asked for 1,473px of it to be visible at once — more than any
 * laptop viewport has. The threshold could never be met, so the wrapper stayed
 * at `opacity: 0` permanently and the entire 118-record catalogue, the main
 * content of the page, never appeared. `0.2` was itself an attempt to fix this
 * for merely tall blocks; it does not scale, and no fraction does.
 *
 * `"some"` fires as soon as any part of the block enters, which is height-
 * independent and is the right trigger for a block that starts below the fold
 * regardless.
 *
 * The duration, easing and `once` come from `RevealOnScroll` untouched, which
 * is the point: swapping the implementation and then re-specifying every value
 * would be the same component with extra steps.
 *
 * The two variants were measured off `claru.ai/data-catalog` on 2026-09-09
 * rather than invented: copy blocks rise, media cards come up from a slight
 * scale, and two variants is the whole system there.
 */

/** Copy, tables and figures. */
const RISE: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

/** Anything with a frame in it. */
const ZOOM: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export function Reveal({
  children,
  variant = "rise",
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** `rise` for copy and data, `zoom` for anything with a frame in it. */
  variant?: "rise" | "zoom";
  /** Seconds. Use for stagger within a group, never above ~0.3. */
  delay?: number;
  className?: string;
}) {
  return (
    <RevealOnScroll
      className={className}
      delay={delay}
      amount="some"
      variants={variant === "zoom" ? ZOOM : RISE}
    >
      {children}
    </RevealOnScroll>
  );
}
