"use client";

/**
 * LabelStudioCard — annotator UI simulation. Live synthetic reviewer cursor
 * moves through 4 keypoints; right-side pills flip drift → OK in sync as the
 * cursor lands on each. Feels alive without pretending to be a real screencap.
 */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, X, ArrowLeft, ArrowRight, Circle, ChevronDown, Command } from "lucide-react";

const TASK_QUEUE = [
  { id: 1247, cap: "pick_up_the_cup · 20260617T01", reason: "manual sample" },
  { id: 1248, cap: "iron_product · 20260626T01", reason: "kpt_outlier · L_wrist" },
  { id: 1249, cap: "sew_hem · 20260626T02", reason: "hand_detect_rate · L=8%" },
  { id: 1250, cap: "arrange_fabric · 20260626T01", reason: "class_mapping" },
  { id: 1251, cap: "package_product · 20260626T02", reason: "action_seg" },
];

/* 4 correction targets · percent coords over the center video panel */
const KPTS = [
  { x: 62, y: 55, label: "wrist",       diff: "+2px" },
  { x: 70, y: 46, label: "middle tip",  diff: "+3px" },
  { x: 66, y: 68, label: "index pip",   diff: "+1px" },
  { x: 74, y: 62, label: "thumb tip",   diff: "-2px" },
];

const HOLD_MS = 2400;
const MOVE_MS = 700;

export function LabelStudioCard() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [fixed, setFixed] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    if (reduce) {
      setFixed([true, true, true, true]);
      return;
    }
    const t = setInterval(() => {
      setFixed((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
      setIdx((i) => {
        const ni = (i + 1) % KPTS.length;
        if (ni === 0) {
          // full cycle done — reset drift after a beat
          setTimeout(() => setFixed([false, false, false, false]), 900);
        }
        return ni;
      });
    }, HOLD_MS);
    return () => clearInterval(t);
  }, [idx, reduce]);

  const cursor = KPTS[idx];

  return (
    <div className="bp-card overflow-hidden" style={{ borderRadius: 14, background: "#0d1524" }}>
      {/* Chrome */}
      <div className="flex items-center gap-2 bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", borderBottom: "1px solid var(--bp-line)" }}>
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ff5f57" }} />
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ffbd2e" }} />
        <span style={{ width: 8, height: 8, borderRadius: 8, background: "#28c840" }} />
        <span style={{ marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
          project: physical_ai/textile_v2 <ChevronDown className="h-3 w-3" />
        </span>
        <span style={{ marginLeft: 10 }}>task 1247 / 1892</span>
        <span style={{ marginLeft: "auto", color: "#00e5c7" }}>auto-label · pre-populated</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "220px 1fr 260px", minHeight: 440 }}>
        {/* Left · task queue */}
        <div style={{ borderRight: "1px solid var(--bp-line)", padding: 0 }}>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid var(--bp-line)" }}>
            Queue · 5 open
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {TASK_QUEUE.map((t, i) => {
              const active = i === 0;
              return (
                <li key={t.id} style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: active ? "rgba(76,181,255,0.09)" : "transparent", position: "relative" }}>
                  {active && (
                    <motion.span
                      aria-hidden
                      animate={reduce ? {} : { opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#4cb5ff", boxShadow: "0 0 6px #4cb5ff" }}
                    />
                  )}
                  <div className="bp-mono" style={{ fontSize: 10.5, color: active ? "#4cb5ff" : "#c8d3f0" }}>#{t.id}</div>
                  <div style={{ fontSize: 11.5, color: "#e8ecf5", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.cap}</div>
                  <div className="bp-mono" style={{ fontSize: 9.5, color: "#8fa0c8", marginTop: 3 }}>{t.reason}</div>
                </li>
              );
            })}
          </ul>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 9.5, color: "#8fa0c8", borderTop: "1px solid var(--bp-line)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            reviewer · nguyen.t
          </div>
        </div>

        {/* Center · real annotated burn + synthetic reviewer cursor */}
        <div style={{ position: "relative", background: "#050a12" }}>
          <video
            src="/videos/textile-annotated/iron_01.webm"
            poster="/images/textile-annotated/iron_01.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
          />

          {/* Live cursor */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
            transition={{ duration: MOVE_MS / 1000, ease: [0.4, 0.02, 0.2, 1] }}
            style={{ position: "absolute", pointerEvents: "none", transform: "translate(-50%, -50%)", zIndex: 4 }}
          >
            <div style={{ position: "relative" }}>
              <motion.div
                animate={reduce ? {} : { scale: [1, 1.9, 1], opacity: [0.9, 0, 0.9] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{ position: "absolute", left: -14, top: -14, width: 28, height: 28, borderRadius: 14, border: "2px solid #22e3c8" }}
              />
              <div style={{ width: 12, height: 12, borderRadius: 12, background: "#22e3c8", boxShadow: "0 0 10px #22e3c8" }} />
              <div className="bp-mono" style={{ position: "absolute", left: 16, top: -4, whiteSpace: "nowrap", fontSize: 10, padding: "3px 7px", borderRadius: 4, background: "rgba(11,18,32,0.92)", color: "#22e3c8", border: "1px solid #22e3c8" }}>
                {cursor.label} {cursor.diff}
              </div>
            </div>
          </motion.div>

          {/* HUD */}
          <div className="bp-mono absolute left-3 top-3" style={{ fontSize: 10, color: "#4cb5ff", background: "rgba(11,18,32,0.85)", padding: "5px 8px", borderRadius: 6 }}>
            frame 136 / 273 · 15 fps
          </div>
          <div className="bp-mono absolute right-3 top-3" style={{ fontSize: 10, color: "#00e5c7", background: "rgba(11,18,32,0.85)", padding: "5px 8px", borderRadius: 6 }}>
            auto-label burn · MANO 21-kpt overlay
          </div>
          <div className="bp-mono absolute left-3 bottom-16" style={{ fontSize: 9.5, color: "#8fa0c8", background: "rgba(11,18,32,0.85)", padding: "4px 7px", borderRadius: 4 }}>
            avg 2.3 min · this task
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

        {/* Right · annotation form · live pill flip */}
        <div style={{ borderLeft: "1px solid var(--bp-line)", display: "flex", flexDirection: "column" }}>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid var(--bp-line)" }}>
            Correction form
          </div>
          <div style={{ padding: 14, flex: 1 }}>
            <div className="bp-mono" style={{ fontSize: 10, color: "#8fa0c8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Segment 1 · verb / noun</div>
            <div className="mt-1 flex gap-2">
              <span className="bp-mono" style={{ padding: "5px 10px", background: "#4cb5ff", color: "#0b1220", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>pick</span>
              <span className="bp-mono" style={{ padding: "5px 10px", background: "#4cb5ff", color: "#0b1220", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>cup</span>
              <span className="bp-mono" style={{ padding: "5px 10px", background: "rgba(0,229,199,0.14)", color: "#00e5c7", borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>conf 0.90</span>
            </div>

            <div className="bp-mono mt-5" style={{ fontSize: 10, color: "#8fa0c8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hand kpts · pre-populated</div>
            <ul className="bp-mono mt-2 space-y-1" style={{ fontSize: 11, color: "#c8d3f0", lineHeight: 1.5 }}>
              {KPTS.map((k, i) => {
                const isFixed = fixed[i];
                const isActive = idx === i && !isFixed;
                return (
                  <motion.li
                    key={k.label}
                    animate={isActive ? { backgroundColor: "rgba(34,227,200,0.12)" } : { backgroundColor: "rgba(0,0,0,0)" }}
                    transition={{ duration: 0.35 }}
                    style={{ padding: "3px 6px", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <span>· {k.label}</span>
                    <motion.span
                      key={isFixed ? "ok" : "drift"}
                      initial={{ opacity: 0.4, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      style={{ color: isFixed ? "#22e3c8" : "#ff9a4d", fontWeight: 700 }}
                    >
                      {isFixed ? "OK" : `drift ${k.diff.replace(/[+-]/, "")}`}
                    </motion.span>
                  </motion.li>
                );
              })}
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
          </div>

          {/* Keyboard shortcut hints */}
          <div className="bp-mono flex items-center gap-3" style={{ padding: "8px 14px", fontSize: 9.5, color: "#8fa0c8", borderTop: "1px solid var(--bp-line)", background: "rgba(0,0,0,0.25)", letterSpacing: "0.06em" }}>
            <Command className="h-3 w-3" />
            <span><kbd style={{ padding: "1px 4px", background: "rgba(255,255,255,0.08)", borderRadius: 3, fontSize: 9 }}>1</kbd> accept</span>
            <span><kbd style={{ padding: "1px 4px", background: "rgba(255,255,255,0.08)", borderRadius: 3, fontSize: 9 }}>2</kbd> reject</span>
            <span><kbd style={{ padding: "1px 4px", background: "rgba(255,255,255,0.08)", borderRadius: 3, fontSize: 9 }}>f</kbd> flag</span>
            <span style={{ marginLeft: "auto", fontStyle: "italic" }}>demo · not a live annotator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
