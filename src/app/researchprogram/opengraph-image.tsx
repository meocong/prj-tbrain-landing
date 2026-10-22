import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { RESEARCH_HERO } from "@/lib/landing/research";

/* The card a link to this page unfurls into — in a lab Slack, an email
   client, LinkedIn. Same paper, teal and footage as the page itself. */

export const alt = `${RESEARCH_HERO.program} — ${RESEARCH_HERO.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const still = await readFile(join(process.cwd(), "public/images/research/iron_01-annotated.jpg"));
  const stillSrc = `data:image/jpeg;base64,${still.toString("base64")}`;
  const gridLine = "rgba(20,22,30,0.06)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F6F6F2",
          backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          padding: "64px 64px 56px",
          fontFamily: "sans-serif",
          color: "#16171C",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#6C3CF4", letterSpacing: -1 }}>Tbrain</div>
            <div style={{ width: 1, height: 26, background: "rgba(20,22,30,0.2)" }} />
            <div style={{ fontSize: 16, letterSpacing: 3, color: "#05655B", textTransform: "uppercase" }}>University Research Program</div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 40,
              padding: "8px 16px 8px 12px",
              borderRadius: 999,
              background: "#FFFFFF",
              border: "1px solid rgba(20,22,30,0.12)",
              fontSize: 19,
              alignSelf: "flex-start",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#146030" }} />
            {RESEARCH_HERO.status}
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 70, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2.6 }}>
            <span>An open invitation to</span>
            <span style={{ color: "#05655B" }}>robotics researchers</span>
          </div>

          <div style={{ marginTop: "auto", display: "flex", fontSize: 22, lineHeight: 1.4, color: "#4B4F5A" }}>
            {RESEARCH_HERO.weBring} {RESEARCH_HERO.youBring}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, marginLeft: 48, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              background: "#FFFFFF",
              border: "1px solid rgba(20,22,30,0.12)",
              borderRadius: 22,
              padding: 12,
              boxShadow: "0 18px 40px -20px rgba(16,17,28,0.35)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stillSrc} alt="" width={420} height={440} style={{ width: "100%", height: 440, objectFit: "cover", borderRadius: 14 }} />
            <div style={{ display: "flex", marginTop: 12, padding: "0 4px 2px", fontSize: 14, letterSpacing: 2, color: "#656A72", textTransform: "uppercase" }}>
              FIG.01 · 3D hands + object mask
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
