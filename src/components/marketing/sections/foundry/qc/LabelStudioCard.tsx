"use client";

/**
 * Label Studio task view · faithful mockup of the real annotator UX.
 * Uses real auto-label output shape from labels.json to make the fixture
 * concrete: verb-noun segment, MANO 21-kpt overlay, mask outline.
 */
import { Check, X, ArrowLeft, ArrowRight, Circle } from "lucide-react";

const TASK_QUEUE = [
  { id: 1247, cap: "pick_up_the_cup · 20260617T01", status: "in-review", reason: "manual sample" },
  { id: 1248, cap: "iron_product · 20260626T01", status: "assigned", reason: "kpt_outlier · L_wrist" },
  { id: 1249, cap: "sew_hem · 20260626T02", status: "assigned", reason: "hand_detect_rate · L=8%" },
  { id: 1250, cap: "arrange_fabric · 20260626T01", status: "queued", reason: "class_mapping · unknown noun" },
  { id: 1251, cap: "package_product · 20260626T02", status: "queued", reason: "action_seg · partial verb" },
];

const HAND_KPTS = [
  { x: 62, y: 68, label: "wrist" },
  { x: 60, y: 60, label: "thumb_cmc" },
  { x: 57, y: 52, label: "thumb_tip" },
  { x: 66, y: 55, label: "index_pip" },
  { x: 69, y: 48, label: "index_tip" },
  { x: 72, y: 55, label: "middle_pip" },
  { x: 75, y: 49, label: "middle_tip" },
  { x: 76, y: 58, label: "ring_pip" },
  { x: 79, y: 52, label: "ring_tip" },
  { x: 80, y: 62, label: "pinky_pip" },
  { x: 83, y: 56, label: "pinky_tip" },
];

const HAND_LINKS: [number, number][] = [
  [0, 1], [1, 2],
  [0, 3], [3, 4],
  [0, 5], [5, 6],
  [0, 7], [7, 8],
  [0, 9], [9, 10],
];

export function LabelStudioCard() {
  return (
    <div className="bp-card overflow-hidden" style={{ borderRadius: 14, background: "#0d1524" }}>
      {/* Chrome */}
      <div className="flex items-center gap-2 bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", borderBottom: "1px solid var(--bp-line)" }}>
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ff5f57" }} />
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ffbd2e" }} />
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#28c840" }} />
        <span style={{ marginLeft: 10 }}>Label Studio · project: physical_ai/textile_v2 · task 1247/1892</span>
        <span style={{ marginLeft: "auto", color: "#00e5c7" }}>schema_v3 · pre-populated</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "220px 1fr 260px", minHeight: 420 }}>
        {/* Left · task queue */}
        <div style={{ borderRight: "1px solid var(--bp-line)", padding: 0 }}>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid var(--bp-line)" }}>
            Queue · 5 open
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {TASK_QUEUE.map((t, i) => {
              const active = i === 0;
              return (
                <li key={t.id} style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: active ? "rgba(76,181,255,0.09)" : "transparent" }}>
                  <div className="bp-mono" style={{ fontSize: 10.5, color: active ? "#4cb5ff" : "#c8d3f0" }}>#{t.id}</div>
                  <div style={{ fontSize: 11.5, color: "#e8ecf5", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.cap}</div>
                  <div className="bp-mono" style={{ fontSize: 9.5, color: "#8fa0c8", marginTop: 3 }}>{t.reason}</div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Center · frame view + overlays */}
        <div style={{ position: "relative", background: "#050a12", minHeight: 420 }}>
          {/* Frame poster */}
          <img
            src="/images/real-captures/pick_up_the_cup-loop.jpg"
            alt="Task frame preview"
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, opacity: 0.9 }}
          />
          {/* SVG overlay · MANO kpts + link skeleton */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {HAND_LINKS.map(([a, b], i) => (
              <line key={i} x1={HAND_KPTS[a].x} y1={HAND_KPTS[a].y} x2={HAND_KPTS[b].x} y2={HAND_KPTS[b].y}
                stroke="#00e5c7" strokeWidth={0.35} vectorEffect="non-scaling-stroke" strokeOpacity={0.9} />
            ))}
            {HAND_KPTS.map((k, i) => (
              <circle key={i} cx={k.x} cy={k.y} r={0.7} fill="#4cb5ff" stroke="white" strokeWidth={0.15} vectorEffect="non-scaling-stroke" />
            ))}
            {/* mask outline mock */}
            <path d="M 52,58 Q 48,68 55,74 Q 65,78 72,72 Q 76,64 68,58 Q 60,54 52,58 Z"
              fill="none" stroke="#f0a2ff" strokeWidth={0.35} strokeDasharray="1.2 0.8" vectorEffect="non-scaling-stroke" />
            <text x="72" y="76" fontSize="2" fill="#f0a2ff" fontFamily="var(--font-mono, monospace)">obj/cup · track_id=3</text>
          </svg>
          {/* HUD */}
          <div className="bp-mono absolute left-3 top-3" style={{ fontSize: 10, color: "#4cb5ff", background: "rgba(11,18,32,0.85)", padding: "5px 8px", borderRadius: 6 }}>
            frame 136 / 273 · 15 fps
          </div>
          <div className="bp-mono absolute right-3 top-3" style={{ fontSize: 10, color: "#00e5c7", background: "rgba(11,18,32,0.85)", padding: "5px 8px", borderRadius: 6 }}>
            hand/right · pre-populated · MANO 21-kpt
          </div>
          {/* Scrubbing bar */}
          <div className="absolute bottom-0 left-0 right-0" style={{ background: "rgba(11,18,32,0.92)", borderTop: "1px solid var(--bp-line)", padding: "10px 14px" }}>
            <div className="bp-mono flex items-center gap-3" style={{ fontSize: 10.5, color: "#8fa0c8" }}>
              <ArrowLeft className="h-3.5 w-3.5" />
              <div className="flex-1" style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 3, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, width: "50%", background: "linear-gradient(90deg, #4cb5ff, #00e5c7)", borderRadius: 3 }} />
                <div style={{ position: "absolute", left: "50%", top: "-3px", width: 10, height: 10, borderRadius: 5, background: "#4cb5ff", boxShadow: "0 0 8px #4cb5ff" }} />
              </div>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>00:09.06 / 00:18.20</span>
            </div>
          </div>
        </div>

        {/* Right · annotation form */}
        <div style={{ borderLeft: "1px solid var(--bp-line)" }}>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid var(--bp-line)" }}>
            Correction form
          </div>
          <div style={{ padding: 14 }}>
            <div className="bp-mono" style={{ fontSize: 10, color: "#8fa0c8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Segment 1 · verb / noun</div>
            <div className="mt-1 flex gap-2">
              <span className="bp-mono" style={{ padding: "5px 10px", background: "#4cb5ff", color: "#0b1220", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>pick</span>
              <span className="bp-mono" style={{ padding: "5px 10px", background: "#4cb5ff", color: "#0b1220", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>cup</span>
              <span className="bp-mono" style={{ padding: "5px 10px", background: "rgba(0,229,199,0.14)", color: "#00e5c7", borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>conf 0.90</span>
            </div>

            <div className="bp-mono mt-5" style={{ fontSize: 10, color: "#8fa0c8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hand kpts · pre-populated</div>
            <ul className="bp-mono mt-2 space-y-1" style={{ fontSize: 11, color: "#c8d3f0", lineHeight: 1.5 }}>
              <li>· wrist · <span style={{ color: "#4cb5ff" }}>OK</span></li>
              <li>· thumb tip · <span style={{ color: "#4cb5ff" }}>OK</span></li>
              <li>· index tip · <span style={{ color: "#4cb5ff" }}>OK</span></li>
              <li>· middle tip · <span style={{ color: "#ff9a4d" }}>drift 3px</span></li>
              <li>· ring tip · <span style={{ color: "#4cb5ff" }}>OK</span></li>
            </ul>

            <div className="bp-mono mt-5" style={{ fontSize: 10, color: "#8fa0c8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Object mask · SAM3</div>
            <div className="mt-1 flex items-center gap-2">
              <Circle className="h-3 w-3" style={{ color: "#f0a2ff" }} />
              <span className="bp-mono" style={{ fontSize: 11, color: "#e8ecf5" }}>cup · track_id 3</span>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="bp-mono flex-1 rounded-md px-3 py-2 font-semibold" style={{ fontSize: 11, background: "#4cb5ff", color: "#0b1220", border: "none" }}>
                <Check className="mr-1 inline h-3.5 w-3.5" />Accept · save diff
              </button>
              <button className="bp-mono rounded-md px-3 py-2" style={{ fontSize: 11, background: "transparent", color: "#ff9a4d", border: "1px solid #ff9a4d" }}>
                <X className="mr-1 inline h-3.5 w-3.5" />Reject
              </button>
            </div>
            <div className="bp-mono mt-3" style={{ fontSize: 10, color: "#8fa0c8" }}>
              Every fix writes back to labels.json.models.action.overrides · schema_v3.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
