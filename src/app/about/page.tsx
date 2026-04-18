import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Image from "next/image";
import Link from "next/link";
import { LEADERSHIP, EXPERTS } from "@/lib/constants/marketing";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Tbrain — AI training data experts across 17+ countries with 48K+ professionals.",
};

export default function AboutPage() {
  return (
    <div>
      <Header />
      <main className="pb-24 pt-32">
        {/* Hero */}
        <section className="container mx-auto px-3 text-center">
          <h1
            className="text-4xl font-medium md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Building the{" "}
            <span className="gradient-text">improvement layer</span> for AI
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#78818f]">
            Tbrain is a full-service AI training data company. We provide
            expert-validated environments and data to measure and improve agent
            performance — fast, scalable, and reliable.
          </p>
        </section>

        {/* Stats */}
        <section className="container mx-auto mt-20 px-3">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "48K+", label: "AI Training Experts" },
              { value: "250+", label: "Projects Delivered" },
              { value: "17+", label: "Countries" },
              { value: "15+", label: "Years Combined Leadership" },
            ].map((s, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-[#6C3CF4]">{s.value}</div>
                <div className="mt-1 text-sm text-[#78818f]">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Leadership */}
        <section className="container mx-auto mt-24 px-3">
          <h2 className="text-center text-3xl font-medium md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Leadership
          </h2>
          <div className="mx-auto mt-12 grid max-w-screen-lg grid-cols-1 gap-6 md:grid-cols-2">
            {LEADERSHIP.map((leader, i) => (
              <div key={i} className="glass-card p-8">
                <Image
                  src={leader.avatar}
                  width={88}
                  height={88}
                  alt={leader.name}
                  className="rounded-full"
                />
                <h3 className="mt-6 text-3xl font-medium">{leader.name}</h3>
                <p className="mt-3 min-h-[130px] text-base font-normal text-[#78818f]">
                  {leader.bio}
                </p>
                <div className="mt-4 flex gap-4">
                  {leader.logos.map((logo, j) => (
                    <Image
                      key={j}
                      src={`/icons/${logo}`}
                      alt=""
                      width={40}
                      height={40}
                      className="aspect-square shrink-0 rounded-[28px]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experts preview */}
        <section className="container mx-auto mt-24 px-3">
          <h2 className="text-center text-3xl font-medium md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="gradient-text">Sample Experts</span>
          </h2>
          <div className="mx-auto mt-12 grid max-w-screen-lg grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERTS.map((expert, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <Image
                  src={expert.avatar}
                  width={200}
                  height={200}
                  alt={expert.name}
                  className="rounded-full"
                />
                <h4 className="mt-4 text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  {expert.name}
                </h4>
                <p className="mt-2 text-sm text-[#78818f] whitespace-pre-line">
                  {expert.bio}
                </p>
                <div className="mt-auto pt-3">
                  <span className="rounded-full bg-[#6C3CF4] px-4 py-1 text-sm text-white">
                    {expert.domain}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto mt-24 px-3 text-center">
          <h2 className="text-3xl font-medium" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to work with us?
          </h2>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3]"
          >
            Contact Us
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
