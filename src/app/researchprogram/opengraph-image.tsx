import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { RESEARCH_HERO } from "@/lib/landing/research";

/* The card a link to this page unfurls into: the title block beside the
   page's Figure 1 — one recorded frame and three things derived from it. */

export const alt = `${RESEARCH_HERO.program} — ${RESEARCH_HERO.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PANELS = ["raw", "depth", "overlay", "annotated"] as const;

export default async function OpengraphImage() {
  const srcs = await Promise.all(
    PANELS.map(async (p) => `data:image/jpeg;base64,${(await readFile(join(process.cwd(), `public/research/fig2/${p}.jpg`))).toString("base64")}`)
  );
  const W = 236;
  const H = W / 2;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF", padding: "64px 56px 56px 64px", fontFamily: "sans-serif", color: "#0F172A" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#6C3CF4", letterSpacing: -1 }}>Tbrain</div>
            <div style={{ width: 1, height: 26, background: "rgba(15,23,42,0.2)" }} />
            <div style={{ fontSize: 18, color: "#5A2CE0", fontWeight: 600 }}>University Research Program</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 40, padding: "8px 16px 8px 12px", borderRadius: 999, background: "#F8FAFC", border: "1px solid #E2E8F0", fontSize: 19, alignSelf: "flex-start" }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#16A34A" }} />
            {RESEARCH_HERO.status}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 60, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>
            <span>An open invitation to</span>
            <span style={{ color: "#5A2CE0" }}>robotics researchers</span>
          </div>
          <div style={{ marginTop: "auto", display: "flex", fontSize: 22, lineHeight: 1.4, color: "#334155" }}>
            {RESEARCH_HERO.weBring} {RESEARCH_HERO.youBring}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginLeft: 40, justifyContent: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: W * 2 + 8, gap: 8 }}>
            {srcs.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" width={W} height={H} style={{ width: W, height: H, objectFit: "cover", borderRadius: 8, border: "1px solid #E2E8F0" }} />
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 15, color: "#64748B" }}>Figure 1 · one frame, four outputs</div>
        </div>
      </div>
    ),
    size
  );
}
