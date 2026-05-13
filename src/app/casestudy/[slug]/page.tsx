import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getCaseStudyBySlug } from "@/lib/landing/case-studies";
import { getCaseStudyBlocks } from "@/lib/landing/case-study-blocks";
import { CaseStudyWidgetRenderer, LegacyCta, MetricsGrid } from "@/components/case-studies/CaseStudyWidgetRenderer";
import { PdfDownloadGate } from "@/components/casestudy/PdfDownloadGate";
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

  const blocks = study.id ? await getCaseStudyBlocks(study.id) : [];
  const hasWidgetLayout = blocks.length > 0;
  const sections = !hasWidgetLayout && study.extendedContent
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-[#222222] text-4xl lg:text-5xl font-semibold leading-[1.1]">
                  {study.title}
                </h1>
                {study.shortDescription && (
                  <p className="mt-4 text-lg text-[#78818f] italic">
                    {study.shortDescription}
                  </p>
                )}
              </div>
              {study.pdfGcsObject && (
                <div className="shrink-0">
                  <PdfDownloadGate slug={study.slug} title={study.title} />
                </div>
              )}
            </div>
          </header>

          {hasWidgetLayout ? (
            <CaseStudyWidgetRenderer blocks={blocks} fallbackMetrics={study.metrics} />
          ) : (
            <>
              <MetricsGrid metrics={study.metrics} />
              <div className="space-y-12">
                {sections.map((section, index) => (
                  <LegacySection key={`${section.title}-${index}`} section={section} index={index} />
                ))}
              </div>
              <LegacyCta title={ctaTitle} subtitle="Let Tbrain deliver precision-engineered data solutions on enterprise timelines" />
            </>
          )}
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
