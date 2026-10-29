import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { bindDash } from "./ui";

/* The card a link to /careers or a posting unfurls into, drawn in the page's
   own terms: the real logo, Inter, white ground, an ink rule, chips; violet
   only in the logo, green only on the open dot.

   Inter is the static TTF set in src/assets/fonts (OFL, licence beside
   it): next/og cannot read the woff2 the site serves, and without a font it
   falls back to a regular-weight face. The logo is src/assets/images/logo.svg
   rasterised once (public/images/og/tbrain-logo.png); the SVG carries a
   7,674px embedded bitmap, too heavy to hand to the renderer. */

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#0F172A";
const INK_2 = "#334155";
const MUTED = "#64748B";
const LINE = "#E2E8F0";

const toArrayBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;

/* Every path below is a literal on purpose. The build traces which files a
   route reads from what it can see in the code; a path passed in as a
   variable makes it give up and ship the whole project (700 MB of
   public/videos) with the route, past Vercel's function limit. */
export async function ogOptions() {
  const [regular, semibold] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Inter-Regular.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Inter-SemiBold.ttf")),
  ]).then((bufs) => bufs.map(toArrayBuffer));
  return {
    ...OG_SIZE,
    fonts: [
      { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
      { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
    ],
  };
}

export async function ogLogo() {
  const png = await readFile(join(process.cwd(), "public/images/og/tbrain-logo.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

export function OgFrame({ logo, children }: { logo: string; children: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#FFFFFF", padding: "56px 72px 60px", fontFamily: "Inter", color: INK }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={176} height={44} style={{ width: 176, height: 44 }} />
        <div style={{ width: 1.5, height: 30, background: "rgba(15,23,42,0.2)" }} />
        <div style={{ fontSize: 24, fontWeight: 600, color: INK_2 }}>Careers</div>
      </div>
      {children}
    </div>
  );
}

export function OgTitle({ size, children }: { size: number; children: string }) {
  return (
    <div style={{ display: "flex", marginTop: 52, fontSize: size, fontWeight: 600, lineHeight: 1.06, letterSpacing: -0.035 * size, maxWidth: 1056 }}>
      {bindDash(children)}
    </div>
  );
}

/** The green-dot status line, under the title as on /researchprogram. */
export function OgStatus({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, fontSize: 25, color: INK_2 }}>
      <div style={{ width: 11, height: 11, borderRadius: 999, background: "#16A34A" }} />
      {children}
    </div>
  );
}

export function OgChips({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {items.map((m) => (
        <div key={m} style={{ display: "flex", padding: "9px 20px", borderRadius: 999, background: "#F8FAFC", border: `1px solid ${LINE}`, fontSize: 23, color: INK_2 }}>
          {m}
        </div>
      ))}
    </div>
  );
}

/** One role as a ruled row: title, then its terms. */
export function OgRole({ title, meta, first }: { title: string; meta: string; first: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", paddingTop: first ? 22 : 16, paddingBottom: 16, borderTop: first ? `3px solid ${INK}` : `1px solid ${LINE}` }}>
      <div style={{ display: "flex", fontSize: 36, fontWeight: 600, letterSpacing: -0.9 }}>{bindDash(title)}</div>
      <div style={{ display: "flex", marginTop: 8, fontSize: 23, color: MUTED }}>{meta}</div>
    </div>
  );
}

export const OG_MUTED = MUTED;
export const OG_INK = INK;
