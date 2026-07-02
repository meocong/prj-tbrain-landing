/**
 * Blueprint UI kit — the "living engineering blueprint" primitives shared by
 * the Foundry homepage and /data/physical-ai. Presentational + server-safe
 * (no hooks), styled via theme-aware tokens in src/app/blueprint.css so they
 * render in both light (default) and dark.
 */
import type { ReactNode, CSSProperties } from "react";

/* ── FIG.0X mono label ────────────────────────────────────────────── */
export function FigLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bp-fig inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden style={{ width: 18, height: 1, background: "var(--bp-cyan)", opacity: 0.8 }} />
      {children}
    </div>
  );
}

/* ── Isometric axis indicator ─────────────────────────────────────── */
export function IsoAxis({ className = "" }: { className?: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 58 58" aria-hidden className={`${className} bp-axis`} style={{ color: "var(--bp-ink-faint)" }}>
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="29" y1="30" x2="29" y2="6" />
        <line x1="29" y1="30" x2="9" y2="42" />
        <line x1="29" y1="30" x2="49" y2="42" />
      </g>
      <text x="29" y="5" fontSize="8" fill="currentColor" textAnchor="middle" fontFamily="var(--font-mono)">Z</text>
      <text x="5" y="46" fontSize="8" fill="currentColor" fontFamily="var(--font-mono)">Y</text>
      <text x="51" y="46" fontSize="8" fill="currentColor" fontFamily="var(--font-mono)">X</text>
    </svg>
  );
}

/* ── Engineering title block ──────────────────────────────────────── */
export function TitleBlock({
  unit, title, dwg, scale, sheet, className = "",
}: { unit: string; title: string; dwg: string; scale: string; sheet: string; className?: string }) {
  const rows = [["UNIT", unit], ["TITLE", title], ["DWG NO.", dwg], ["SCALE", scale], ["SHEET", sheet]];
  return (
    <div className={`bp-card ${className}`} style={{ fontFamily: "var(--font-mono)", minWidth: 230, borderRadius: 8 }}>
      <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)", padding: "5px 10px", borderBottom: "1px solid var(--bp-line)" }}>DRAWING</div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex" style={{ borderTop: "1px solid var(--bp-line)" }}>
          <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)", padding: "5px 10px", width: 78, borderRight: "1px solid var(--bp-line)" }}>{k}</div>
          <div style={{ fontSize: 11, color: "var(--bp-ink)", padding: "5px 10px", letterSpacing: "0.04em" }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Bill of Materials panel ──────────────────────────────────────── */
export interface BomRow { num: string; part: string; status?: "STBY" | "MOV" | "SEP" }

export function BillOfMaterials({ rows, count, className = "" }: { rows: BomRow[]; count?: string; className?: string }) {
  return (
    <div className={`bp-card ${className}`} style={{ minWidth: 240 }}>
      <div className="bp-mono flex items-center justify-between" style={{ fontSize: 9, color: "var(--bp-ink-faint)", padding: "7px 12px", borderBottom: "1px solid var(--bp-line)" }}>
        <span>Bill of Materials</span><span style={{ color: "var(--bp-cyan)" }}>{count ?? `${rows.length} / ${rows.length}`}</span>
      </div>
      {rows.map((r) => (
        <div key={r.num} className="flex items-center justify-between" style={{ borderTop: "1px solid var(--bp-line)", padding: "6px 12px" }}>
          <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
            <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>{r.num}</span>
            <span style={{ fontSize: 12, color: "var(--bp-ink-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.part}</span>
          </div>
          <span className={`bp-status bp-status-${(r.status ?? "STBY").toLowerCase()}`}>{r.status ?? "STBY"}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Callout annotation (leader + label) ──────────────────────────── */
export function Annotation({ index, label, sub, className = "" }: { index: string; label: string; sub?: string; className?: string }) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>{index}</span>
      <span aria-hidden style={{ marginTop: 7, width: 22, height: 1, background: "var(--bp-line-strong)" }} />
      <div>
        <div style={{ fontSize: 13, color: "var(--bp-ink)", fontWeight: 600 }}>{label}</div>
        {sub && <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Buttons ──────────────────────────────────────────────────────── */
export function BlueprintButton({
  children, variant = "solid", style, ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "solid" | "ghost" }) {
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 8,
    fontSize: 14, fontWeight: 700, fontFamily: "var(--font-heading)", textDecoration: "none",
    transition: "transform .2s ease, box-shadow .2s ease",
  };
  const solid: CSSProperties = { background: "var(--bp-cyan)", color: "var(--bp-on-cyan)", boxShadow: "0 8px 22px -12px var(--bp-cyan)" };
  const ghost: CSSProperties = { background: "transparent", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" };
  return <a {...props} style={{ ...base, ...(variant === "solid" ? solid : ghost), ...style }}>{children}</a>;
}

/* ── Sheet wrapper — a single drawing sheet ───────────────────────── */
export function Sheet({
  id, fig, children, axis = true, titleBlock, className = "", contentClassName = "", style,
}: {
  id?: string; fig?: string; children: ReactNode; axis?: boolean;
  titleBlock?: { unit: string; title: string; dwg: string; scale: string; sheet: string };
  className?: string; contentClassName?: string; style?: CSSProperties;
}) {
  return (
    <section id={id} className={`bp-grid bp-frame relative overflow-hidden ${className}`} style={{ color: "var(--bp-ink)", paddingTop: "clamp(44px, 7vw, 84px)", paddingBottom: "clamp(44px, 7vw, 84px)", ...style }}>
      <div aria-hidden className="bp-aurora" />
      <div className={`container relative z-10 mx-auto px-5 ${contentClassName}`}>
        {fig && (
          <div className="mb-8 flex items-start justify-between">
            <FigLabel>{fig}</FigLabel>
            {axis && <IsoAxis className="-mt-2 hidden sm:block" />}
          </div>
        )}
        {children}
      </div>
      {titleBlock && <TitleBlock {...titleBlock} className="absolute bottom-6 right-6 z-10 hidden lg:block" />}
    </section>
  );
}

/* ── Section heading helper ───────────────────────────────────────── */
export function SheetHeading({ title, lead, className = "" }: { title: string; lead?: string; className?: string }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <h2 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1.08, color: "var(--bp-ink)", letterSpacing: "-0.01em" }}>{title}</h2>
      {lead && <p className="mt-5" style={{ fontSize: 17, lineHeight: 1.7, color: "var(--bp-ink-dim)" }}>{lead}</p>}
    </div>
  );
}
