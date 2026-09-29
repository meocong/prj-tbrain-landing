/**
 * The NVIDIA Inception Program member badge, as NVIDIA supplies it.
 *
 * Two files from NVIDIA's badge kit (public/images/partners/), used unaltered:
 * `rgb-for-screen` (white box) on the light theme and `-negative` (dark box)
 * on the dark theme. Do not recolour, crop into, stretch or restyle them;
 * size them only by height so the ratio holds, and leave clear space around
 * them — NVIDIA's brand rules. The CSS swaps the two with the theme, so there
 * is no flash of the wrong one.
 *
 * Placement follows what member startups most often do (research of
 * 2026-09-29): a small "program membership" line near the end of the home
 * page, and the badge in the footer — not in the hero.
 */

export const INCEPTION_URL = "https://www.nvidia.com/en-us/startups/";

const LIGHT = "/images/partners/nvidia-inception-program-badge-rgb-for-screen.svg";
const DARK = "/images/partners/nvidia-inception-program-badge-rgb-for-screen-negative.svg";
const RATIO = 450 / 166; // the kit artwork's aspect ratio

export function InceptionBadge({ height = 56, className = "" }: { height?: number; className?: string }) {
  const width = Math.round(height * RATIO);
  return (
    <a
      href={INCEPTION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 ${className}`}
      title="NVIDIA Inception Program"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG as supplied, no optimisation wanted */}
      <img src={LIGHT} width={width} height={height} alt="NVIDIA Inception Program member" className="block dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={DARK} width={width} height={height} alt="NVIDIA Inception Program member" className="hidden dark:block" />
    </a>
  );
}
