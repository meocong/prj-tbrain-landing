"use client";

/**
 * Click-to-load Rerun iframe. Shows a poster with a "Load live scene" button.
 * On click, mounts an <iframe> pointing at app.rerun.io with the real .rrd URL.
 * Avoids the 44MB rrd being fetched on cold page load.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Maximize2 } from "lucide-react";

interface Props {
  rrdPath: string;         // e.g. /videos/rerun/pick_up_the_cup.rrd
  poster: string;
  rrdVersion?: string;     // rerun app version, default 0.24.0
  height?: number;
  cap?: string;
  frames?: number;
  rules?: string;
}

export function RerunIframeLoader({
  rrdPath,
  poster,
  rrdVersion = "0.24.0",
  height = 460,
  cap = "pick_up_the_cup",
  frames = 273,
  rules = "15/15 PASS",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [isLocal, setIsLocal] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      const h = window.location.hostname;
      setIsLocal(h === "localhost" || h === "127.0.0.1" || h.endsWith(".local"));
    }
  }, []);
  const embedHref = origin
    ? `https://app.rerun.io/version/${rrdVersion}/index.html?url=${encodeURIComponent(origin + rrdPath)}`
    : "";
  return (
    <div className="relative w-full overflow-hidden bp-card" style={{ borderRadius: 14, background: "#050a12" }}>
      <div className="bp-mono flex items-center justify-between" style={{ padding: "10px 14px", fontSize: 11, color: "#8fa0c8", borderBottom: "1px solid var(--bp-line)" }}>
        <span>
          <span style={{ color: "#4cb5ff" }}>Rerun ·</span> {cap}.rrd · v{rrdVersion}
        </span>
        <span>{frames} frames · {rules}</span>
      </div>
      <div className="relative w-full" style={{ height, background: "#050a12" }}>
        {!loaded && (
          <>
            <img
              src={poster}
              alt="Rerun scene poster"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
            />
            <div aria-hidden style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(76,181,255,0.18), transparent 65%), linear-gradient(180deg, rgba(5,10,18,0.35) 0%, rgba(5,10,18,0.85) 100%)",
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.button
                type="button"
                onClick={() => !isLocal && setLoaded(true)}
                disabled={isLocal}
                whileHover={!isLocal ? { scale: 1.03 } : {}}
                whileTap={!isLocal ? { scale: 0.98 } : {}}
                className="inline-flex items-center gap-2.5"
                style={{
                  padding: "12px 20px",
                  background: isLocal ? "rgba(143,160,200,0.2)" : "linear-gradient(100deg, #4cb5ff 0%, #00e5c7 100%)",
                  color: isLocal ? "#8fa0c8" : "#0b1220",
                  borderRadius: 999,
                  border: "none",
                  cursor: isLocal ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-heading)",
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: isLocal ? "none" : "0 12px 32px -12px rgba(0,229,199,0.55)",
                }}
              >
                <Play className="h-4 w-4" style={{ fill: isLocal ? "#8fa0c8" : "#0b1220" }} />
                {isLocal ? "Live scene · production only" : "Load live Rerun scene"}
              </motion.button>
              {isLocal ? (
                <div className="bp-mono text-center" style={{ fontSize: 10.5, color: "#ff9a4d", letterSpacing: "0.06em", maxWidth: 460, lineHeight: 1.5, border: "1px solid rgba(255,154,77,0.35)", padding: "10px 14px", borderRadius: 8, background: "rgba(255,154,77,0.08)" }}>
                  Dev-only: app.rerun.io cannot reach localhost.<br />Deploy to a public host (or run the Rerun desktop viewer) to stream the .rrd inline.
                </div>
              ) : (
                <div className="bp-mono text-center" style={{ fontSize: 10.5, color: "#8fa0c8", letterSpacing: "0.06em", maxWidth: 420, lineHeight: 1.5 }}>
                  44MB · streams RGB · depth · MANO 21-kpt · body 308-kpt ·<br />object masks + pose · SLAM trajectory · action_segments
                </div>
              )}
              {embedHref && (
                <a
                  href={embedHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bp-mono inline-flex items-center gap-1.5"
                  style={{ fontSize: 11, color: "#4cb5ff" }}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Or open in a new tab
                </a>
              )}
            </div>
          </>
        )}
        {loaded && embedHref && (
          <iframe
            src={embedHref}
            title={`Rerun scene · ${cap}`}
            allow="fullscreen"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", background: "#050a12" }}
          />
        )}
      </div>
    </div>
  );
}
