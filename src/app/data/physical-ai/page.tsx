import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import {
  PHYSICAL_AI_PROBLEMS,
  PHYSICAL_AI_TIERS,
  PHYSICAL_AI_DATASETS,
} from "@/lib/constants/marketing";
import {
  Bot,
  Hand,
  Home as HomeIcon,
  Factory,
  Camera,
  Gauge,
  ArrowRight,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Physical AI Training Data",
  description:
    "High-fidelity egocentric video and hand pose data for robot training. 3-tier hardware framework with peer-reviewed accuracy from 5mm to sub-millimeter.",
  openGraph: {
    title: "Physical AI Training Data — Tbrain",
    description:
      "Production-grade Physical AI data: 6 problem categories, 0.8mm accuracy, validated against peer-reviewed benchmarks.",
  },
};

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
            <span className="text-sm font-medium text-[#0151FF]">Physical AI Data</span>
          </div>
          <h1
            className="mt-6 text-4xl font-medium md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Robot Training Data with{" "}
            <span className="gradient-text">Sub-Millimeter Accuracy</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-[#78818f]">
            High-fidelity egocentric video and 3D hand pose data for robot
            learning. Peer-reviewed accuracy, not marketing claims. From
            household tasks to commercial robotics.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-xl bg-[#0151FF] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#003fcc] hover:shadow-lg"
            >
              Request a Pilot
            </Link>
            <a
              href="#tiers"
              className="rounded-xl border border-gray-300 px-8 py-3 text-base font-medium text-[#0e1b2e] transition-all hover:border-[#0151FF] hover:text-[#0151FF]"
            >
              View Hardware Tiers
            </a>
          </div>
        </section>

        {/* Problem Categories */}
        <section className="container mx-auto mt-24 px-3">
          <h2
            className="text-center text-3xl font-medium md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            6 Problem Categories
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#78818f]">
            Covering the full spectrum of physical AI data needs — from fine
            manipulation to commercial-scale operations.
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PHYSICAL_AI_PROBLEMS.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#0151FF]/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0e1b2e]" style={{ fontFamily: "var(--font-heading)" }}>
                    {p.title}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                      p.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#78818f]">{p.description}</p>
                <div className="mt-4 flex gap-3 text-xs">
                  <span className="rounded-lg bg-blue-50 px-2 py-1 font-medium text-[#0151FF]">
                    {p.accuracy}
                  </span>
                  <span className="rounded-lg bg-gray-50 px-2 py-1 font-medium text-gray-600">
                    {p.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hardware Tiers */}
        <section id="tiers" className="mt-24 bg-gradient-to-b from-gray-50 to-white py-24">
          <div className="container mx-auto px-3">
            <h2
              className="text-center text-3xl font-medium md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              3-Tier Hardware Framework
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[#78818f]">
              Peer-reviewed accuracy validated against published benchmarks.
              Real-world 3D MPJPE measurements, not lab-only PA-MPJPE.
            </p>

            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
              {PHYSICAL_AI_TIERS.map((t, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl border-2 bg-white p-6 shadow-sm ${
                    t.recommended
                      ? "border-[#0151FF] shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  {t.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0151FF] px-3 py-0.5 text-xs font-medium text-white">
                      Recommended
                    </div>
                  )}
                  <div className="text-center">
                    <span className="text-sm font-medium text-[#78818f]">{t.tier}</span>
                    <h3 className="mt-1 text-xl font-semibold text-[#0e1b2e]" style={{ fontFamily: "var(--font-heading)" }}>
                      {t.name}
                    </h3>
                  </div>
                  <div className="mt-6 space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-[#0e1b2e]">Hardware:</span>
                      <p className="mt-0.5 text-[#78818f]">{t.hardware}</p>
                    </div>
                    <div>
                      <span className="font-medium text-[#0e1b2e]">Accuracy:</span>
                      <p className="mt-0.5 text-2xl font-bold text-[#0151FF]">{t.accuracy}</p>
                    </div>
                    <div>
                      <span className="font-medium text-[#0e1b2e]">Cost/Setup:</span>
                      <p className="mt-0.5 text-[#78818f]">{t.cost}</p>
                    </div>
                    <div>
                      <span className="font-medium text-[#0e1b2e]">Source:</span>
                      <p className="mt-0.5 text-xs text-[#78818f]">{t.source}</p>
                    </div>
                    <div>
                      <span className="font-medium text-[#0e1b2e]">Best For:</span>
                      <p className="mt-0.5 text-[#78818f]">{t.bestFor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What works / doesn't */}
        <section className="container mx-auto mt-24 px-3">
          <h2
            className="text-center text-3xl font-medium md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Validated Technology Choices
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-green-700">
                <CheckCircle className="h-5 w-5" /> What Works
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-green-800">
                <li>Leap Motion 2 headmount: 5mm, bare-hand compliant, proven with robot ground truth</li>
                <li>Apple Vision Pro: sub-mm (0.8mm), 98.7% frame consistency, EgoDex 829h validated</li>
                <li>Stereo GoPro: 15-20mm, fully wireless, suitable for budget scenarios</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700">
                <XCircle className="h-5 w-5" /> What We Rejected
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-red-800">
                <li>Quest 3: 17.3mm accuracy, no public IMU API, decoder bugs</li>
                <li>Single-view MediaPipe/HaMeR: 25-35mm on real egocentric — fails all tiers</li>
                <li>Manus gloves / Rokoko: violate bare-hand natural requirement</li>
                <li>Studio systems (OptiTrack, Vicon): not portable, research-only</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Reference Datasets */}
        <section className="container mx-auto mt-24 px-3">
          <h2
            className="text-center text-3xl font-medium md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Gold-Standard Reference Datasets
          </h2>
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Dataset</th>
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Volume</th>
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Quality</th>
                  <th className="px-6 py-3 text-left font-medium text-[#78818f]">Use Case</th>
                </tr>
              </thead>
              <tbody>
                {PHYSICAL_AI_DATASETS.map((d, i) => (
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
            Ready to build your Physical AI dataset?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-[#78818f]">
            Start with a 5-task pilot — we handle hardware, calibration, and
            validation. You get production-grade data.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-xl bg-[#0151FF] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#003fcc]"
            >
              Request a Pilot
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
