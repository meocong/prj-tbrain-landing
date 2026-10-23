import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { RESEARCH_HERO } from "@/lib/landing/research";
import { BONES, HAND_COLORS, HAND_FLOATS, HANDS, STILL_T } from "@/lib/landing/research-hand";

/* The card a link to this page unfurls into. Same figure as the hero: both
   hands of one recorded demonstration drawn from the real joint track (a
   frame where both are measured), no camera pixels. */

export const alt = `${RESEARCH_HERO.program} — ${RESEARCH_HERO.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function skeleton(w: number, h: number) {
  const buf = await readFile(join(process.cwd(), "public/research/hand-13/joints.bin"));
  const meta = JSON.parse(await readFile(join(process.cwd(), "public/research/hand-13/joints.json"), "utf8")) as { count: number; fps: number };
  const i = Math.round(STILL_T * meta.fps);
  const raw = new Int16Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + meta.count * HANDS * HAND_FLOATS * 2));
  // Three-quarter view: rotate about y, tilt about x, then project.
  const ay = 0.22;
  const ax = 0.62;
  const pts: { x: number; y: number }[][] = [];
  for (let hand = 0; hand < HANDS; hand++) {
    const o = (i * HANDS + hand) * HAND_FLOATS;
    const p: { x: number; y: number }[] = [];
    for (let j = 0; j < 21; j++) {
      const x = raw[o + j * 3] / 1000;
      const y = raw[o + j * 3 + 1] / 1000;
      const z = raw[o + j * 3 + 2] / 1000;
      const x1 = x * Math.cos(ay) - z * Math.sin(ay);
      const z1 = x * Math.sin(ay) + z * Math.cos(ay);
      const y1 = y * Math.cos(ax) - z1 * Math.sin(ax);
      p.push({ x: x1, y: -y1 });
    }
    pts.push(p);
  }
  const all = pts.flat();
  const minX = Math.min(...all.map((q) => q.x));
  const maxX = Math.max(...all.map((q) => q.x));
  const minY = Math.min(...all.map((q) => q.y));
  const maxY = Math.max(...all.map((q) => q.y));
  const s = Math.min((w * 0.78) / (maxX - minX), (h * 0.78) / (maxY - minY));
  const ox = (w - (maxX - minX) * s) / 2 - minX * s;
  const oy = (h - (maxY - minY) * s) / 2 - minY * s;
  return pts.map((p) => p.map((q) => ({ x: q.x * s + ox, y: q.y * s + oy })));
}

export default async function OpengraphImage() {
  const W = 360;
  const H = 460;
  const hands = await skeleton(W, H);
  const colors = [HAND_COLORS.left, HAND_COLORS.right];
  const gridLine = "rgba(15,23,42,0.05)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FFFFFF",
          backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          padding: "64px 64px 56px",
          fontFamily: "sans-serif",
          color: "#0F172A",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#6C3CF4", letterSpacing: -1 }}>Tbrain</div>
            <div style={{ width: 1, height: 26, background: "rgba(20,22,30,0.2)" }} />
            <div style={{ fontSize: 18, color: "#5A2CE0", fontWeight: 600 }}>University Research Program</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 40, padding: "8px 16px 8px 12px", borderRadius: 999, background: "#FFFFFF", border: "1px solid rgba(20,22,30,0.12)", fontSize: 19, alignSelf: "flex-start" }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#16A34A" }} />
            {RESEARCH_HERO.status}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 70, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
            <span>An open invitation to</span>
            <span style={{ color: "#5A2CE0" }}>robotics researchers</span>
          </div>
          <div style={{ marginTop: "auto", display: "flex", fontSize: 22, lineHeight: 1.4, color: "#334155" }}>
            {RESEARCH_HERO.weBring} {RESEARCH_HERO.youBring}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, marginLeft: 48, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "100%", background: "#FFFFFF", border: "1px solid rgba(20,22,30,0.12)", borderRadius: 22, padding: 12, boxShadow: "0 18px 40px -20px rgba(16,17,28,0.35)" }}>
            <div style={{ display: "flex", position: "relative", width: "100%", height: H, borderRadius: 14, background: "#F8FAFC", overflow: "hidden" }}>
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
                {Array.from({ length: 10 }, (_, k) => (
                  <line key={`g${k}`} x1={0} y1={H * 0.55 + k * 24} x2={W} y2={H * 0.55 + k * 24 - 70} stroke="#E2E8F0" strokeWidth={1} />
                ))}
                {hands.map((p, hIdx) =>
                  BONES.map(([a, b], k) => (
                    <line key={`b${hIdx}-${k}`} x1={p[a].x} y1={p[a].y} x2={p[b].x} y2={p[b].y} stroke={colors[hIdx]} strokeWidth={4} strokeLinecap="round" />
                  )),
                )}
                {hands.map((p, hIdx) => p.map((q, j) => <circle key={`j${hIdx}-${j}`} cx={q.x} cy={q.y} r={j === 0 ? 7 : 5} fill={colors[hIdx]} />))}
              </svg>
            </div>
            <div style={{ display: "flex", marginTop: 12, padding: "0 4px 2px", fontSize: 14, letterSpacing: 2, color: "#64748B" }}>
              Figure 1 · 3D hand pose
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
