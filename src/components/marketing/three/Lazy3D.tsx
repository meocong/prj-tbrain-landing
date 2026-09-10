"use client";

/**
 * Lazy, capability-gated wrappers for the WebGL scenes.
 *
 * Canvases are:
 *  - code-split (next/dynamic, ssr:false),
 *  - mounted only when scrolled into view (IntersectionObserver),
 *  - skipped entirely on reduced-motion, small screens, or no-WebGL —
 *    where the caller's static `fallback` (a blueprint poster) shows instead.
 *
 * This keeps the page light and honours the project's documented WebGL-perf
 * constraints (no more than ~1 canvas active, never on low-end/mobile).
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

const EgoKitPack3D = dynamic(() => import("./EgoKitPack3D"), { ssr: false });
const FactoryLine3D = dynamic(() => import("./FactoryLine3D"), { ssr: false });

function useCanRender3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.matchMedia("(max-width: 820px)").matches;
      const c = document.createElement("canvas");
      const webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
      setOk(!reduce && !small && webgl);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

function useInView(ref: RefObject<Element | null>, rootMargin = "300px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, rootMargin]);
  return seen;
}

export function EgoKitPack3DLazy({
  sectionRef, interactive = false, fallback, className,
}: {
  sectionRef?: RefObject<HTMLElement | null>;
  interactive?: boolean;
  fallback?: ReactNode;
  className?: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const can = useCanRender3D();
  const inView = useInView(holder);
  return (
    <div ref={holder} className={className} style={{ width: "100%", height: "100%" }}>
      {can && inView ? <EgoKitPack3D sectionRef={sectionRef} interactive={interactive} /> : fallback}
    </div>
  );
}

export function FactoryLine3DLazy({ fallback, className }: { fallback?: ReactNode; className?: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const can = useCanRender3D();
  const inView = useInView(holder);
  return (
    <div ref={holder} className={className} style={{ width: "100%", height: "100%" }}>
      {can && inView ? <FactoryLine3D /> : fallback}
    </div>
  );
}
