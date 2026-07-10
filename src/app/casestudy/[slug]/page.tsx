import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getCaseStudyBySlug } from "@/lib/landing/case-studies";
import { getCaseStudyBlocks } from "@/lib/landing/case-study-blocks";
import { CaseStudyWidgetRenderer, LegacyCta, MetricsGrid } from "@/components/case-studies/CaseStudyWidgetRenderer";
import { PdfDownloadGate } from "@/components/casestudy/PdfDownloadGate";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const db = supabaseAdmin();
    const { data } = await db
      .from("case_studies")
      .select("slug")
      .eq("is_active", true);
    return (data ?? []).map((c: { slug: string }) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

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

const SECTION_TOKENS = ["var(--bp-cyan)", "var(--bp-purple)", "var(--bp-amber)", "var(--bp-cyan-strong)", "var(--bp-cyan)", "var(--bp-purple)"];

export default async function CaseStudyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ pdf?: string }>;
}) {
  const { slug } = await params;
  const isPdfRender = (await searchParams)?.pdf === "1";
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

  const baseUrl = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
  const studyUrl = `${baseUrl}/casestudy/${study.slug}`;
  const studyImage = study.image?.startsWith("http") ? study.image : `${baseUrl}${study.image}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.shortDescription || study.description,
    image: study.image ? [studyImage] : undefined,
    author: [{ "@type": "Organization", name: "Tbrain" }],
    publisher: {
      "@type": "Organization",
      name: "Tbrain",
      logo: { "@type": "ImageObject", url: `${baseUrl}/favicon.ico` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": studyUrl },
    articleSection: study.industry || "Case Study",
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: "Case Studies", item: `${baseUrl}/casestudy` },
      { "@type": "ListItem", position: 3, name: study.title, item: studyUrl },
    ],
  };

  return (
    <div>
      {!isPdfRender && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
        </>
      )}
      {!isPdfRender && <Header />}
      <main
        className={`pb-24 ${isPdfRender ? "pt-0" : "pt-32"}`}
        style={{ background: isPdfRender ? undefined : "var(--bp-bg)" }}
      >
        <section className="container mx-auto max-w-[1128px] px-5">
          <header className="mb-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                {(study.industry || "Case study") && (
                  <div className="bp-mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--bp-cyan)" }}>
                    {study.industry || "Case study"}
                  </div>
                )}
                <h1 className="mt-3" style={{ fontFamily: "var(--font-heading)", fontWeight: 300, fontSize: "clamp(36px,5.4vw,64px)", lineHeight: 1.0, letterSpacing: "-0.03em", color: "var(--bp-ink)" }}>
                  {study.title}
                </h1>
                {study.shortDescription && (
                  <p className="mt-5 max-w-2xl" style={{ fontSize: 18, lineHeight: 1.55, color: "var(--bp-ink-dim)" }}>
                    {study.shortDescription}
                  </p>
                )}
              </div>
              {study.pdfGcsObject && !isPdfRender && (
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
      {!isPdfRender && <Footer />}
    </div>
  );
}

type CaseSection = { title: string; body: string };

function LegacySection({ section, index }: { section: CaseSection; index: number }) {
  const accent = SECTION_TOKENS[index % SECTION_TOKENS.length];
  return (
    <section className="bp-card" style={{ padding: "clamp(24px,3vw,40px)", borderRadius: 16 }}>
      <h2 className="mb-6 flex items-center" style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-0.02em", color: "var(--bp-ink)" }}>
        <span style={{ marginRight: 14, height: 26, width: 3, borderRadius: 3, background: accent, flexShrink: 0 }} />
        {section.title}
      </h2>
      <div
        className="case-study-body"
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
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
