import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import { getServices, getExpertiseAreas } from "@/lib/landing/services";
import {
  Brain,
  Tags,
  BarChart3,
  Database,
  ShieldCheck,
  Users,
  Bot,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI training data services — RLHF, SFT, data annotation, evaluation, custom datasets, and expert teams.",
};

export const revalidate = 300;

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Tags,
  BarChart3,
  Database,
  ShieldCheck,
  Users,
  Bot,
};

export default async function ServicesPage() {
  const [services, expertise] = await Promise.all([
    getServices(),
    getExpertiseAreas(),
  ]);

  return (
    <div>
      <Header />
      <main className="pb-24 pt-32">
        {/* Hero */}
        <section className="container mx-auto px-3 text-center">
          <h1
            className="text-4xl font-semibold md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#78818f]">
            End-to-end AI training data solutions, from data collection and
            annotation to model evaluation and benchmarking.
          </p>
        </section>

        {/* Services grid */}
        <section className="container mx-auto mt-20 px-3">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => {
              const Icon = (ICON_MAP[svc.icon] || Database) as React.ComponentType<{ className?: string }>;
              return (
                <div
                  key={i}
                  className="glass-card-hover p-6"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(108, 60, 244, 0.08)" }}
                  >
                    <Icon className="h-6 w-6 text-[#6C3CF4]" />
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {svc.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#78818f]">{svc.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Expertise */}
        <section className="container mx-auto mt-24 px-3">
          <div className="mx-auto max-w-3xl">
            <div className="glass-card p-8 md:p-12">
              <h2
                className="text-center text-3xl font-medium gradient-text"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Deep Technical Expertise
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {expertise.map((area, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#6C3CF4]" />
                    <p className="text-base">
                      <span className="gradient-text font-medium">{area.label}</span>{" "}
                      {area.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto mt-24 px-3 text-center">
          <h2
            className="text-3xl font-medium"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Need a custom solution?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-[#78818f]">
            Our team will work with you to design the perfect data strategy
            for your AI project.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3]"
          >
            Get Started
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
