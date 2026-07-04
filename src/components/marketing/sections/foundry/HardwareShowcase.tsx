"use client";

import Image from "next/image";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { RevealOnScroll } from "@/components/marketing/fx/RevealOnScroll";

const PACK_CALLOUTS = [
  { k: "Head unit", v: "Stereo camera + IMU · 25–35° down-tilt · quick-release" },
  { k: "Forearm × 2", v: "RGB camera + IMU · captures hand · tool · object" },
  { k: "Waist pack", v: "1.8 cm · Wi-Fi 6 / 5G · long battery · industrial-grade" },
  { k: "Wearability", v: "Hidden cable routing · full 8–10 h shift · plug-and-play" },
];

const APP_CALLOUTS = [
  { k: "Login · biometric", v: "Signed operator, consent captured with the session" },
  { k: "Session · REC", v: "Live REC/STOP · battery · storage · sync queue" },
  { k: "Task list", v: "Assigned skills, scenes, per-take checklist" },
  { k: "Review · QR", v: "Handoff scan, packaging dock, batch sign-off" },
];

export function HardwareShowcase() {
  return (
    <Sheet id="hardware-showcase" fig="FIG.07 — THE RIG + THE APP" axis={false}>
      <SheetHeading
        title="The rig and the app"
        lead="Two views of one collection machine — the wearable pack and the operator's task console. Purpose-built so 500 operators capture the same schema, same QC gate, same bucket."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Hardware pack */}
        <RevealOnScroll>
          <article className="bp-card" style={{ padding: 0, borderRadius: 14, overflow: "hidden" }}>
            <div className="flex items-center justify-between bp-mono" style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span>CAPTURE PACK · MK-001 · REV A</span>
              <span style={{ color: "var(--bp-cyan)" }}>ISO · downward view</span>
            </div>
            <div className="relative w-full" style={{ aspectRatio: "16 / 10", background: "#050a12" }}>
              <Image
                src="/images/pack/hardware-pack.png"
                alt="Tbrain capture pack — head unit + forearm units + waist pack"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {PACK_CALLOUTS.map((c, i) => (
                <li
                  key={c.k}
                  className="grid items-baseline gap-3"
                  style={{
                    gridTemplateColumns: "160px 1fr",
                    padding: "12px 16px",
                    borderTop: i === 0 ? "1px solid var(--bp-line)" : "1px solid var(--bp-line)",
                  }}
                >
                  <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.k}</span>
                  <span style={{ fontSize: 13, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{c.v}</span>
                </li>
              ))}
            </ul>
          </article>
        </RevealOnScroll>

        {/* Operator app */}
        <RevealOnScroll delay={0.08}>
          <article className="bp-card" style={{ padding: 0, borderRadius: 14, overflow: "hidden" }}>
            <div className="flex items-center justify-between bp-mono" style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span>OPERATOR APP · ANDROID · VI</span>
              <span style={{ color: "var(--bp-cyan)" }}>8 screens · reference session</span>
            </div>
            <div className="relative w-full" style={{ aspectRatio: "16 / 10", background: "#0b0a1f" }}>
              <Image
                src="/images/pack/operator-app.png"
                alt="Tbrain operator app screens — login, capture, task list, review"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {APP_CALLOUTS.map((c) => (
                <li
                  key={c.k}
                  className="grid items-baseline gap-3"
                  style={{ gridTemplateColumns: "160px 1fr", padding: "12px 16px", borderTop: "1px solid var(--bp-line)" }}
                >
                  <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.k}</span>
                  <span style={{ fontSize: 13, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{c.v}</span>
                </li>
              ))}
            </ul>
          </article>
        </RevealOnScroll>
      </div>
    </Sheet>
  );
}
