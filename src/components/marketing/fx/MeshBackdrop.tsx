"use client";

/**
 * MeshBackdrop — animated conic + radial gradient mesh + subtle grid overlay.
 * Placed inside a wrapper with `position:relative`; renders absolutely behind
 * content. Uses CSS animations only (GPU-cheap, respects prefers-reduced-motion).
 */
export function MeshBackdrop({
  variant = "cyan",
  gridOpacity = 0.06,
}: { variant?: "cyan" | "violet" | "amber" | "aurora"; gridOpacity?: number }) {
  const PALETTES: Record<string, { a: string; b: string; c: string; d: string }> = {
    cyan:   { a: "#4cb5ff", b: "#00e5c7", c: "#a78bfa", d: "#0b1220" },
    violet: { a: "#a78bfa", b: "#f0a2ff", c: "#4cb5ff", d: "#0b1220" },
    amber:  { a: "#ff9a4d", b: "#ffbd2e", c: "#f0a2ff", d: "#0b1220" },
    aurora: { a: "#00e5c7", b: "#4cb5ff", c: "#a78bfa", d: "#0b1220" },
  };
  const p = PALETTES[variant] ?? PALETTES.cyan;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base */}
      <div
        className="absolute inset-0"
        style={{
          background: p.d,
        }}
      />
      {/* blob 1 — top-left */}
      <div
        className="absolute mesh-blob mesh-blob-a"
        style={{
          top: "-20%",
          left: "-10%",
          width: "70%",
          height: "70%",
          background: `radial-gradient(closest-side, ${p.a}55, ${p.a}00 70%)`,
          filter: "blur(60px)",
        }}
      />
      {/* blob 2 — bottom-right */}
      <div
        className="absolute mesh-blob mesh-blob-b"
        style={{
          bottom: "-25%",
          right: "-10%",
          width: "75%",
          height: "75%",
          background: `radial-gradient(closest-side, ${p.b}50, ${p.b}00 70%)`,
          filter: "blur(70px)",
        }}
      />
      {/* blob 3 — mid */}
      <div
        className="absolute mesh-blob mesh-blob-c"
        style={{
          top: "30%",
          left: "40%",
          width: "40%",
          height: "40%",
          background: `radial-gradient(closest-side, ${p.c}45, ${p.c}00 70%)`,
          filter: "blur(50px)",
        }}
      />
      {/* grid overlay */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ opacity: gridOpacity }}
      >
        <defs>
          <pattern id="mesh-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c8d3f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh-grid)" />
      </svg>
      {/* noise film */}
      <div
        className="absolute inset-0"
        style={{
          mixBlendMode: "overlay",
          opacity: 0.14,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* top → bottom darkening for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(11,18,32,0.15) 0%, rgba(11,18,32,0.55) 100%)",
        }}
      />
      <style>{`
        @keyframes mesh-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6%, 8%) scale(1.06); } }
        @keyframes mesh-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8%, -5%) scale(1.08); } }
        @keyframes mesh-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-4%, 6%) scale(1.05); } }
        .mesh-blob-a { animation: mesh-a 18s ease-in-out infinite; }
        .mesh-blob-b { animation: mesh-b 22s ease-in-out infinite; }
        .mesh-blob-c { animation: mesh-c 14s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mesh-blob { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
