"use client";

import { PUBLIC_DATASETS } from "@/lib/landing/physical-ai";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { motion } from "framer-motion";

export function PublicDatasetWall() {
  return (
    <Sheet id="public-datasets" fig={PUBLIC_DATASETS.fig} axis={false}>
      <SheetHeading title={PUBLIC_DATASETS.title} lead={PUBLIC_DATASETS.lead} />

      <StaggerContainer className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {PUBLIC_DATASETS.items.map((d, i) => (
          <motion.a
            key={d.name}
            href={d.href}
            target="_blank"
            rel="noreferrer"
            variants={STAGGER_ITEM}
            className="bp-card group flex items-center justify-between gap-3"
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
              transition: "border-color .2s ease, transform .2s ease",
              background: `linear-gradient(135deg, rgba(0, 229, 199, ${0.05 + i * 0.015}) 0%, rgba(150, 100, 255, ${0.025 + i * 0.008}) 100%)`,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div className="flex items-center gap-1.5 bp-mono" style={{ fontSize: 8.5, color: "var(--bp-cyan)", letterSpacing: "0.08em" }}>
                <span style={{ width: 5, height: 5, borderRadius: 5, background: "var(--bp-cyan)" }} />
                PUBLIC
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 13.5, fontWeight: 600, color: "var(--bp-ink)", marginTop: 2, lineHeight: 1.2 }}>
                {d.name}
              </div>
              <div className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.org}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "var(--bp-ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {d.hours}
              </div>
              <div className="bp-mono" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)", marginTop: 3, letterSpacing: "0.05em" }}>
                {d.domain.split("·")[0].trim()}
              </div>
            </div>
          </motion.a>
        ))}
      </StaggerContainer>

      <p className="mt-3 bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>
        {PUBLIC_DATASETS.disclosure}
      </p>
    </Sheet>
  );
}
