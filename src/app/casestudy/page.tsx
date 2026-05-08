import React from "react";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import Header from "@/components/common/Header";
import post_bg from "@/assets/images/post_bg.png";
import Footer from "@/components/common/Footer";
import { CaseStudyContent } from "@/components/casestudy/CaseStudyContent";
import { getCaseStudies } from "@/lib/landing/case-studies";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "How leading AI teams ship better models with Tbrain — RLHF datasets, evaluation harnesses, and expert annotation at scale.",
  alternates: { canonical: "/casestudy" },
  openGraph: {
    title: "Case Studies — Tbrain",
    description:
      "How leading AI teams ship better models with Tbrain — RLHF datasets, evaluation, and expert annotation at scale.",
    url: "/casestudy",
  },
};

export default async function Page() {
  const studies = await getCaseStudies();

  return (
    <div>
      <Header />

      {/* Main */}
      <main
        style={{ backgroundImage: `url(${post_bg?.src})` }}
        className="bg-center bg-no-repeat bg-cover">
        <div className="wrap !fixed top-[400px] w-full">
          <div className="one top-0 left-0 h-80 w-80"></div>
          <div className="two top-0 right-0 h-80 w-80"></div>
        </div>

        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[60%] left-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[60%] right-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        <section
          id="casestudy"
          className="container mx-auto max-w-6xl px-4 pt-24 pb-24 relative"
        >
          {/* Page Title */}
          <div className="relative mb-12">
            <div className="absolute -top-4 right-[15%] hidden md:block animate-bounce">
              <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
            </div>
            <h1
              className="text-4xl font-semibold tracking-tight md:text-6xl"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
            >
              Case Studies
            </h1>
            <p
              className="mt-4 max-w-2xl text-lg leading-relaxed md:text-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              How Tbrain&apos;s expert pods turn high-stakes data into measurable model improvement.
            </p>
          </div>

          {/* Case Study Content */}
          <CaseStudyContent studies={studies} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
