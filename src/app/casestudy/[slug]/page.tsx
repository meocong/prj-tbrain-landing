import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/landing/case-studies";
import { PdfDownloadGate } from "@/components/casestudy/PdfDownloadGate";
import { notFound } from "next/navigation";

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

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();

  const related = (await getCaseStudies())
    .filter((item) => item.slug !== study.slug)
    .slice(0, 3);

  return (
    <div>
      <Header />
      <main className="pt-24 pb-24">
        <section className="container mx-auto max-w-[1128px] px-4">
          <Link
            href="/casestudy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6C3CF4]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to case studies
          </Link>

          {/* Hero */}
          <header className="mt-10 mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C3CF4] mb-3">
              Case study
            </p>
            <h1 className="text-[#222222] text-4xl lg:text-5xl font-semibold leading-[1.1]">
              {study.title}
            </h1>
            {study.shortDescription && (
              <p className="mt-4 text-lg text-[#78818f] italic">
                {study.shortDescription}
              </p>
            )}
            {(study.clientName || study.industry || study.engagementLength) && (
              <dl className="mt-6 grid grid-cols-3 gap-4 max-w-2xl">
                {study.clientName && (
                  <MetaCell label="Client" value={study.clientName} />
                )}
                {study.industry && (
                  <MetaCell label="Industry" value={study.industry} />
                )}
                {study.engagementLength && (
                  <MetaCell label="Engagement" value={study.engagementLength} />
                )}
              </dl>
            )}
            {study.pdfGcsObject && (
              <div className="mt-6">
                <PdfDownloadGate slug={study.slug} title={study.title} />
              </div>
            )}
          </header>

          {/* Hero image */}
          {study.image && (
            <div className="mb-14 overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="relative aspect-[16/7]">
                <Image
                  src={study.image}
                  alt={study.title}
                  fill
                  priority
                  sizes="(min-width: 1128px) 1100px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Stat banner */}
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

          {/* Body — extended content rendered with the legacy visual language */}
          {study.extendedContent ? (
            <article
              className="case-study-body"
              dangerouslySetInnerHTML={{ __html: study.extendedContent }}
            />
          ) : (
            <article className="case-study-body">
              <h2>Project snapshot</h2>
              <p>{study.description}</p>
            </article>
          )}

          {/* CTA */}
          <section className="mt-16 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-10 text-center shadow-md">
            <h2 className="text-3xl font-bold text-[#222222]">
              Ready to run a similar program?
            </h2>
            <p className="mt-3 text-lg text-[#78818f]">
              Let&apos;s scope a pilot in days, not months.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6C3CF4] px-7 py-3 text-base font-semibold text-white transition hover:bg-[#5a2fd3]"
            >
              Talk to an expert <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-[#222222]">
                  More case studies
                </h2>
                <Link
                  href="/casestudy"
                  className="text-sm font-semibold text-[#6C3CF4]"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/casestudy/${item.slug}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="relative h-40">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-[#78818f]">
                        {item.shortDescription}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#6C3CF4]">
                        Read more <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
