"use client";

/**
 * Rerun captured card · faithful multi-track scene layout that mirrors the
 * Rerun viewer (blueprint tree + main viewport + timeline). Real .rrd link
 * lives in the CTA button.
 */
import { motion } from "framer-motion";
import { RERUN_EMBED } from "@/lib/landing/physical-ai";

const TRACK_TREE: { path: string; kind: string; color: string }[] = [
  { path: "camera/rgb",              kind: "video",   color: "#4cb5ff" },
  { path: "camera/depth",            kind: "video",   color: "#4cb5ff" },
  { path: "camera/trajectory",       kind: "line3d",  color: "#a78bfa" },
  { path: "hand/left · MANO 21-kpt", kind: "points2d", color: "#00e5c7" },
  { path: "hand/right · MANO 21-kpt",kind: "points2d", color: "#00e5c7" },
  { path: "body/dense · 308-kpt",    kind: "points2d", color: "#ff9a4d" },
  { path: "object/mask · track_id",  kind: "mask",    color: "#f0a2ff" },
  { path: "object/pose · 6-DoF",     kind: "transform", color: "#f0a2ff" },
  { path: "action_segments",         kind: "log",     color: "#5ee08a" },
];

const TIMELINE_EVENTS = [
  { at: 0.05, verb: "pick",   noun: "cup" },
  { at: 0.37, verb: "hold",   noun: "cup" },
  { at: 0.60, verb: "place",  noun: "cup" },
  { at: 0.82, verb: "release", noun: "cup" },
];

export function RerunCapturedCard() {
  const rerunHref = `${RERUN_EMBED.externalHrefPrefix}${encodeURIComponent("https://www.tbrain.ai/videos/rerun/pick_up_the_cup.rrd")}`;
  return (
    <div className="bp-card overflow-hidden" style={{ borderRadius: 14, background: "#050a12", color: "#e8ecf5" }}>
      {/* Chrome */}
      <div className="flex items-center gap-2 bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", borderBottom: "1px solid var(--bp-line)" }}>
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ff5f57" }} />
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ffbd2e" }} />
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#28c840" }} />
        <span style={{ marginLeft: 10, color: "#4cb5ff" }}>Rerun · pick_up_the_cup.rrd</span>
        <span style={{ marginLeft: "auto" }}>9 tracks · 273 frames · with manifest</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "220px 1fr", minHeight: 380 }}>
        {/* Blueprint tree */}
        <div style={{ borderRight: "1px solid var(--bp-line)" }}>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid var(--bp-line)" }}>
            Blueprint
          </div>
          <ul style={{ margin: 0, padding: "8px 0", listStyle: "none" }}>
            {TRACK_TREE.map((t) => (
              <li key={t.path} className="bp-mono flex items-center gap-2" style={{ padding: "6px 14px", fontSize: 11 }}>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                <span style={{ color: "#e8ecf5" }}>{t.path}</span>
                <span style={{ marginLeft: "auto", fontSize: 9, color: "#8fa0c8" }}>{t.kind}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Main viewport */}
        <div style={{ position: "relative" }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", height: "100%" }}>
            <div style={{ position: "relative", borderRight: "1px solid var(--bp-line)" }}>
              <img src="/images/real-captures/pick_up_the_cup-loop.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}  loading="lazy" />
              <div className="bp-mono absolute left-2 top-2" style={{ fontSize: 9, color: "#4cb5ff", background: "rgba(5,10,18,0.9)", padding: "3px 6px", borderRadius: 4 }}>
                camera/rgb
              </div>
            </div>
            <div style={{ position: "relative", background: "linear-gradient(135deg, #1a2a4a 0%, #0f1a2f 100%)" }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                {/* fake depth heatmap */}
                <defs>
                  <linearGradient id="depth" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#3f00ff" />
                    <stop offset=".5" stopColor="#00e5c7" />
                    <stop offset="1" stopColor="#ffbb00" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#depth)" opacity="0.65" />
                {/* fake pointcloud */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const x = (i * 17) % 100;
                  const y = (i * 23) % 100;
                  return <circle key={i} cx={x} cy={y} r={0.4} fill="white" opacity={0.5} />;
                })}
              </svg>
              <div className="bp-mono absolute left-2 top-2" style={{ fontSize: 9, color: "#4cb5ff", background: "rgba(5,10,18,0.9)", padding: "3px 6px", borderRadius: 4 }}>
                camera/depth + trajectory
              </div>
            </div>
          </div>
          {/* Timeline */}
          <div className="absolute bottom-0 left-0 right-0" style={{ background: "rgba(5,10,18,0.92)", borderTop: "1px solid var(--bp-line)", padding: "10px 14px 12px" }}>
            <div className="bp-mono" style={{ fontSize: 9.5, color: "#8fa0c8", marginBottom: 6, letterSpacing: "0.06em" }}>action_segments · verb-noun timeline</div>
            <div style={{ position: "relative", height: 22 }}>
              <div style={{ position: "absolute", inset: 0, top: 9, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 3 }} />
              {TIMELINE_EVENTS.map((e, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bp-mono"
                  style={{ position: "absolute", left: `${e.at * 100}%`, top: 0, transform: "translateX(-50%)", fontSize: 9.5, color: "#5ee08a" }}>
                  <div style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(94,224,138,0.14)", border: "1px solid rgba(94,224,138,0.4)", whiteSpace: "nowrap" }}>{e.verb} · {e.noun}</div>
                  <div style={{ width: 1, height: 8, background: "#5ee08a", margin: "0 auto" }} />
                </motion.div>
              ))}
              <div style={{ position: "absolute", top: 8, left: "36%", width: 8, height: 8, borderRadius: 4, background: "#4cb5ff", boxShadow: "0 0 8px #4cb5ff" }} />
            </div>
            <div className="bp-mono mt-3 flex items-center justify-between" style={{ fontSize: 10, color: "#8fa0c8" }}>
              <span>frame 136 / 273 · t = 9.06s</span>
              <a href={rerunHref} target="_blank" rel="noopener noreferrer" style={{ color: "#4cb5ff", textDecoration: "none" }}>
                Open live scene in Rerun ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
