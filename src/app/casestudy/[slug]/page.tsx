import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getCaseStudyBySlug } from "@/lib/landing/case-studies";
import { notFound } from "next/navigation";
import post_bg from "@/assets/images/post_bg.png";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) return { title: "Case Study" };
  return {
    title: study.title,
    description: study.shortDescription || study.description,
    alternates: { canonical: `/casestudy/${slug}` },
    openGraph: {
      title: `${study.title} — Tbrain`,
      description: study.shortDescription || study.description,
      url: `/casestudy/${slug}`,
      images: study.image ? [{ url: study.image }] : undefined,
    },
  };
}

// Cycle of accent colors for the stat cards. Mirrors the legacy static layout
// (emerald → blue → purple → pink) so the page feels familiar even though it's
// CMS-driven.
const METRIC_ACCENTS = [
  { border: "border-emerald-600", text: "text-emerald-600" },
  { border: "border-blue-600", text: "text-blue-600" },
  { border: "border-purple-600", text: "text-purple-600" },
  { border: "border-pink-600", text: "text-pink-600" },
];

const SECTION_ACCENTS = [
  { bar: "bg-blue-600", shell: "bg-gradient-to-br from-blue-50/80 to-indigo-50/80", border: "border-blue-500" },
  { bar: "bg-indigo-600", shell: "", border: "border-indigo-500" },
  { bar: "bg-red-600", shell: "", border: "border-red-500" },
  { bar: "bg-indigo-600", shell: "bg-gradient-to-br from-indigo-50/80 to-purple-50/80", border: "border-indigo-500" },
  { bar: "bg-green-600", shell: "bg-gradient-to-br from-green-50/80 to-emerald-50/80", border: "border-green-500" },
  { bar: "bg-blue-600", shell: "", border: "border-blue-500" },
];

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();

  const sections = study.extendedContent
    ? splitCaseStudySections(study.extendedContent)
    : [{ title: "Project snapshot", body: `<p>${escapeHtml(study.description)}</p>` }];
  const ctaTitle = study.slug === "manufacturing"
    ? "Need Expert CAD Annotation Services?"
    : "Need Expert Data Services?";

  return (
    <div>
      <Header />
      <main
        className="bg-center bg-no-repeat bg-cover pt-24 pb-24"
        style={{ backgroundImage: `url(${post_bg.src})` }}
      >
        <div className="wrap !fixed top-[400px] w-full">
          <div className="one top-0 left-0 h-80 w-80"></div>
          <div className="two top-0 right-0 h-80 w-80"></div>
        </div>
        <section className="container mx-auto max-w-[1128px] px-4">
          <header className="mb-12">
            <h1 className="text-[#222222] text-4xl lg:text-5xl font-semibold leading-[1.1]">
              {study.title}
            </h1>
            {study.shortDescription && (
              <p className="mt-4 text-lg text-[#78818f] italic">
                {study.shortDescription}
              </p>
            )}
          </header>

          {study.metrics.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {study.metrics.slice(0, 4).map((metric, i) => {
                const a = METRIC_ACCENTS[i % METRIC_ACCENTS.length];
                return (
                  <div
                    key={i}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 ${a.border} hover:shadow-xl transition-all`}
                  >
                    <div className={`text-5xl font-bold ${a.text} mb-2`}>
                      {metric.value}
                    </div>
                    <div className="text-gray-600 text-sm font-medium">
                      {metric.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-12">
            {sections.map((section, index) => (
              <LegacySection key={`${section.title}-${index}`} section={section} index={index} />
            ))}
          </div>

          <section className="mt-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-700 p-8 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold">
              {ctaTitle}
            </h2>
            <p className="mt-4 text-xl text-emerald-100">
              Let Tbrain deliver precision-engineered data solutions on enterprise timelines
            </p>
            <Link
              href="https://www.linkedin.com/company/tbrain-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-3 rounded-lg bg-white px-8 py-3 font-bold text-emerald-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-50 hover:shadow-xl"
            >
              <span>Connect Us Today</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

type CaseSection = { title: string; body: string };

function LegacySection({ section, index }: { section: CaseSection; index: number }) {
  const accent = SECTION_ACCENTS[index % SECTION_ACCENTS.length];
  const isChallenge = /challenge/i.test(section.title);
  const isOutcome = /outcome|result/i.test(section.title);
  const isSolution = /solution|approach|framework/i.test(section.title);
  const shellClass = accent.shell || "bg-white/80";

  return (
    <section
      className={`${shellClass} rounded-2xl p-8 shadow-md backdrop-blur-sm ${isChallenge ? "case-study-challenge" : ""} ${isOutcome ? "case-study-outcome" : ""} ${isSolution ? "case-study-solution" : ""}`}
    >
      <h2 className="mb-6 flex items-center text-3xl font-bold text-[#222222]">
        <span className={`mr-4 h-8 w-2 rounded-full ${accent.bar}`} />
        {section.title}
      </h2>
      <div
        className={`case-study-body case-study-body--legacy ${accent.border}`}
        dangerouslySetInnerHTML={{ __html: section.body }}
      />
    </section>
  );
}

function splitCaseStudySections(html: string): CaseSection[] {
  const sections: CaseSection[] = [];
  const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const matches = Array.from(html.matchAll(h2Pattern));

  if (matches.length === 0) {
    return [{ title: "Project snapshot", body: html }];
  }

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const next = matches[i + 1];
    const start = (match.index ?? 0) + match[0].length;
    const end = next?.index ?? html.length;
    sections.push({
      title: stripTags(match[1]).trim(),
      body: html.slice(start, end).trim(),
    });
  }

  return sections.filter((section) => section.title && section.body);
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
