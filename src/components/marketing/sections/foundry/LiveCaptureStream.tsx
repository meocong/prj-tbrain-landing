"use client";

/**
 * LiveCaptureStream — horizontally scrolling ticker of "recent captures"
 * with pass/fail indicators. Real capture names + honest QC states.
 */
import { motion, useReducedMotion } from "framer-motion";

const CAPS = [
  { name: "pick_up_the_cup__20260617T01",   task: "pick",    op: "op mobile",   qc: "PASS",   color: "var(--bp-green)" },
  { name: "iron_product__20260626T01",       task: "iron",    op: "op mobile",   qc: "PARTIAL",color: "var(--bp-amber)" },
  { name: "sew_hem__20260626T01",            task: "sew",     op: "op mobile",   qc: "PASS",   color: "var(--bp-green)" },
  { name: "arrange_fabric__20260626T01",     task: "arrange", op: "op mobile",   qc: "PASS",   color: "var(--bp-green)" },
  { name: "package_product__20260626T02",    task: "package", op: "op mobile",   qc: "PASS",   color: "var(--bp-green)" },
  { name: "quality_check__20260626T01",      task: "inspect", op: "op mobile",   qc: "PASS",   color: "var(--bp-green)" },
  { name: "print_fabric_code__20260626T01",  task: "print",   op: "op mobile",   qc: "PASS",   color: "var(--bp-green)" },
  { name: "wiping_pantry_surface__20260617T01", task: "wipe", op: "op fixed",    qc: "PASS",   color: "var(--bp-green)" },
  { name: "open_and_close_door__20260617T01",task: "open",    op: "op fixed",    qc: "PASS",   color: "var(--bp-green)" },
  { name: "clean_workstation__20260617T01",  task: "clean",   op: "op fixed",    qc: "PASS",   color: "var(--bp-green)" },
  { name: "pick_up_item_from_fridge__20260617T01",task: "pick",op: "op fixed",   qc: "PASS",   color: "var(--bp-green)" },
  { name: "iron_product__20260626T02",       task: "iron",    op: "op mobile",   qc: "FAIL_LABEL", color: "var(--bp-red)" },
];

export function LiveCaptureStream() {
  const reduce = useReducedMotion();
  const items = reduce ? CAPS : [...CAPS, ...CAPS]; // duplicate only when scrolling
  return (
    <section className="relative overflow-hidden" style={{ borderTop: "1px solid var(--bp-line)", borderBottom: "1px solid var(--bp-line)", padding: "14px 0", background: "var(--bp-panel)" }}>
      <div className="container mx-auto flex items-center gap-4 px-5">
        <div className="flex items-center gap-2 bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.14em", textTransform: "uppercase", flexShrink: 0 }}>
          <motion.span animate={reduce ? {} : { opacity: [1, 0.15, 1] }} transition={reduce ? undefined : { duration: 1.1, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: 6, background: "var(--bp-red)" }} />
          Live capture stream
        </div>
        <div className="relative flex-1 overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)" }}>
          <motion.div
            className="flex items-center gap-3"
            animate={reduce ? undefined : { x: ["0%", "-50%"] }}
            transition={reduce ? undefined : { duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {items.map((c, i) => (
              <div key={`${c.name}-${i}`} className="flex items-center gap-2 bp-mono" style={{ padding: "5px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--bp-cyan) 6%, transparent)", border: "1px solid var(--bp-line)", whiteSpace: "nowrap", flexShrink: 0 }}>
                <span style={{ width: 5, height: 5, borderRadius: 5, background: c.color }} />
                <span style={{ fontSize: 10.5, color: "var(--bp-ink)" }}>{c.name}</span>
                <span style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>· {c.op}</span>
                <span style={{ fontSize: 10, color: c.color, fontWeight: 700, letterSpacing: "0.08em" }}>· {c.qc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
