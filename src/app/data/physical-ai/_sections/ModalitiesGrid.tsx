"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const GROUPS = [
  {
    label: "Motion",
    accent: "#10B981",
    items: [
      "Egocentric RGB video",
      "Stereo / multi-view video",
      "Optical motion capture (MOCAP)",
      "Full-body skeletal tracking",
    ],
  },
  {
    label: "Hand & Face",
    accent: "#A78BFA",
    items: [
      "3D hand pose tracking",
      "Finger articulation",
      "Facial rig (optional)",
      "Gaze vector",
    ],
  },
  {
    label: "Physics & Exports",
    accent: "#6C3CF4",
    items: [
      "IMU / inertial measurement",
      "Force & torque sensing",
      "Depth (LiDAR / structured light)",
      "Object 6DoF pose",
      "3D scene reconstruction",
      "Task & action annotations",
      "Gripper state & joint angles",
      "Sim-ready exports (URDF/USD)",
    ],
  },
];

export function ModalitiesGrid() {
  return (
    <section id="modalities" className="relative overflow-hidden py-24 md:py-32" style={{ background: "#020617", color: "white" }}>
      <div
        aria-hidden
        className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(108,60,244,0.18) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#A78BFA" }}>
              Data modalities
            </span>
            <h2
              className="text-3xl md:text-5xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Whatever your pipeline needs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm md:text-base" style={{ color: "rgba(226,232,240,0.6)" }}>
              Scoped per program. Mix modalities; tell us your training target, we&apos;ll ship the combination.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 md:grid-cols-3">
          {GROUPS.map((g, gi) => (
            <RevealOnScroll key={g.label} delay={gi * 0.1}>
              <div
                className="relative rounded-2xl p-6 h-full"
                style={{
                  background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: `linear-gradient(90deg, ${g.accent}, ${g.accent}00)` }}
                />
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: g.accent }}>
                  {g.label}
                </p>
                <StaggerContainer className="space-y-2" stagger={0.04}>
                  {g.items.map((it) => (
                    <motion.div
                      key={it}
                      variants={STAGGER_ITEM}
                      className="flex items-center gap-2.5 text-sm"
                      style={{ color: "rgba(226,232,240,0.78)" }}
                    >
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full shrink-0"
                        style={{ background: `${g.accent}22`, color: g.accent }}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      {it}
                    </motion.div>
                  ))}
                </StaggerContainer>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
