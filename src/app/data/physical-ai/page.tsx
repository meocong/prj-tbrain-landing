import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import {
  Bot,
  Hand,
  Home as HomeIcon,
  Factory,
  Camera,
  Gauge,
  ArrowRight,
  CheckCircle,
  Crosshair,
  Video,
  Layers,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Physical AI & Robotics Data",
  description:
    "Ground-truth human motion data for training humanoid control policies, imitation learning, and sim-to-real transfer. Lab-grade precision, not estimated from video.",
};

const WHY_FEATURES = [
  {
    num: "01",
    title: "Lab-grade precision",
    detail:
      "Optical motion capture, infrared tracking, and depth sensors — not estimated from monocular video. Real 3D MPJPE, peer-reviewed.",
    icon: Crosshair,
  },
  {
    num: "02",
    title: "Multi-modal coverage",
    detail:
      "Egocentric video, MOCAP, hand pose, IMU, force/torque, depth maps, and task annotations — whatever your pipeline needs.",
    icon: Layers,
  },
  {
    num: "03",
    title: "Scene-aware capture",
    detail:
      "Every object tracked, environment scanned and reconstructed in 3D. Context-rich data for world models and spatial reasoning.",
    icon: Camera,
  },
  {
    num: "04",
    title: "Validated at scale",
    detail:
      "Accuracy validated against published benchmarks (EgoDex, OpenEgo, EPIC-KITCHENS). Production pipelines, not one-off research captures.",
    icon: Shield,
  },
];

const USE_CASES = [
  {
    title: "Humanoid Whole-Body Control",
    description:
      "Full-body motion data for training humanoid locomotion, balance, and coordination policies.",
    icon: Bot,
  },
  {
    title: "Dexterous Manipulation",
    description:
      "High-precision hand and finger tracking for grasping, tool use, and fine motor tasks.",
    icon: Hand,
  },
  {
    title: "Household & Domestic Robotics",
    description:
      "Kitchen, cleaning, tidying, and everyday tasks — real homes, real complexity, real diversity.",
    icon: HomeIcon,
  },
  {
    title: "Commercial & Industrial",
    description:
      "Warehouse operations, retail, food service, manufacturing assembly, and logistics.",
    icon: Factory,
  },
  {
    title: "Imitation Learning Pipelines",
    description:
      "Demonstration data formatted for behavioral cloning, DAgger, and inverse RL workflows.",
    icon: Video,
  },
  {
    title: "Sim-to-Real Transfer",
    description:
      "Ground-truth trajectories for validating simulation fidelity and bridging the sim-to-real gap.",
    icon: Gauge,
  },
];

const DATA_MODALITIES = [
  "Egocentric RGB video",
  "Stereo / multi-view video",
  "Optical motion capture (MOCAP)",
  "Hand pose (21+ joints, 3D)",
  "Full-body skeletal tracking",
  "IMU / inertial measurement",
  "Force & torque sensing",
  "Depth maps (LiDAR / structured light)",
  "Object 6DoF pose",
  "Environment 3D reconstruction",
  "Task & action annotations",
  "Gripper state & joint angles",
];

const ACCURACY_TIERS = [
  {
    name: "Standard",
    accuracy: "5mm",
    description: "Suitable for locomotion, navigation, and general manipulation tasks",
    recommended: false,
  },
  {
    name: "High Precision",
    accuracy: "Sub-millimeter",
    description: "Fine manipulation, threading, assembly — validated against peer-reviewed benchmarks",
    recommended: true,
  },
];

const REFERENCE_DATASETS = [
  { name: "EgoDex", volume: "829 hours", quality: "21-joint hand (sub-mm)", useCase: "Dexterous manipulation" },
  { name: "OpenEgo", volume: "1,107 hours", quality: "21-joint unified", useCase: "Diverse egocentric tasks" },
  { name: "EPIC-KITCHENS", volume: "100 hours", quality: "Action labels", useCase: "Household activities" },
  { name: "UMI Community", volume: "1,400 hours", quality: "SLAM 6DoF", useCase: "Gripper manipulation" },
];

export default function PhysicalAIPage() {
  return (
    <div>
      <Header />
      <main className="pb-24 pt-32">
        {/* Hero */}
        <section className="container mx-auto px-3 text-center">
          <div className="mx-auto flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Bot className="h-5 w-5 text-[#0151FF]" />
            </div>
            <span className="text-sm font-medium text-[#0151FF]">
              Physical AI & Robotics
            </span>
          </div>
          <h1
            className="mt-6 text-4xl font-medium md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ground-truth motion data for{" "}
            <span className="gradient-text">Physical AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-[#78818f]">
            Multimodal datasets for humanoid control policies, imitation
            learning, and sim-to-real transfer. Lab-grade precision from optical
            capture systems — not estimated from video.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-xl bg-[#0151FF] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#003fcc] hover:shadow-lg"
            >
              Design your dataset
            </Link>
            <a
              href="#use-cases"
              className="rounded-xl border border-gray-300 px-8 py-3 text-base font-medium text-[#0e1b2e] transition-all hover:border-[#0151FF] hover:text-[#0151FF]"
            >
              See use cases
            </a>
          </div>
        </section>

        {/* Why Tbrain */}
        <section className="container mx-auto mt-24 px-3">
          <h2
            className="text-center text-3xl font-medium md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Why Tbrain for Robotics Data
          </h2>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {WHY_FEATURES.map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0151FF] text-sm font-bold text-white">
                  {f.num}
                </div>
                <div>
                  <h3 className="font-semibold text-[#0e1b2e]">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#78818f]">
                    {f.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="mt-24 bg-gradient-to-b from-gray-50 to-white py-24">
          <div className="container mx-auto px-3">
            <h2
              className="text-center text-3xl font-medium md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Built for Every Robotics Use Case
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[#78818f]">
              We design datasets tailored to your exact pipeline — from data
              structure and quality to format and scalability.
            </p>

            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((uc, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#0151FF]/30 hover:shadow-md"
                >
                  <uc.icon className="h-6 w-6 text-[#0151FF]" />
                  <h3 className="mt-3 font-semibold text-[#0e1b2e]" style={{ fontFamily: "var(--font-heading)" }}>
                    {uc.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#78818f]">
                    {uc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Modalities */}
        <section className="container mx-auto mt-24 px-3">
          <h2 className="text-center text-3xl font-medium md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Data Modalities We Capture
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#78818f]">
            Mix and match modalities based on your pipeline requirements.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-3">
            {DATA_MODALITIES.map((mod, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                <CheckCircle className="h-4 w-4 shrink-0 text-[#0151FF]" />
                <span className="text-[#0e1b2e]">{mod}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Accuracy Tiers */}
        <section className="container mx-auto mt-24 px-3">
          <h2 className="text-center text-3xl font-medium md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Accuracy That Meets Your Requirements
          </h2>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {ACCURACY_TIERS.map((t, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border-2 bg-white p-6 text-center ${
                  t.recommended ? "border-[#0151FF] shadow-md" : "border-gray-200"
                }`}
              >
                {t.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0151FF] px-3 py-0.5 text-xs font-medium text-white">
                    Recommended
                  </div>
                )}
                <div className="text-sm font-medium text-[#78818f]">{t.name}</div>
                <div className="mt-2 text-4xl font-bold text-[#0151FF]">{t.accuracy}</div>
                <p className="mt-3 text-sm text-[#78818f]">{t.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reference Datasets */}
        <section className="container mx-auto mt-24 px-3">
          <h2 className="text-center text-3xl font-medium md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Aligned with Gold-Standard Datasets
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#78818f]">
            Our pipelines produce data compatible with leading academic benchmarks.
          </p>
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Dataset</th>
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Volume</th>
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Quality</th>
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Application</th>
                </tr>
              </thead>
              <tbody>
                {REFERENCE_DATASETS.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-3 font-semibold text-[#0e1b2e]">{d.name}</td>
                    <td className="px-6 py-3 font-medium text-[#0151FF]">{d.volume}</td>
                    <td className="px-6 py-3 text-[#78818f]">{d.quality}</td>
                    <td className="px-6 py-3 text-[#78818f]">{d.useCase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto mt-24 px-3 text-center">
          <h2 className="text-3xl font-medium" style={{ fontFamily: "var(--font-heading)" }}>
            Need data designed for your specific pipeline?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-[#78818f]">
            We design datasets tailored to your exact workflow — from data
            structure and quality to format and scalability.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-xl bg-[#0151FF] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#003fcc]"
            >
              Design your dataset
            </Link>
            <Link
              href="/data/terminal-bench"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#0151FF]"
            >
              See Terminal Bench
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
