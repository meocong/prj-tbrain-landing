import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/landing/case-studies";
import { notFound } from "next/navigation";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);

  if (!study) {
    return { title: "Case Study" };
  }

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
      <main className="pt-28">
        <section className="container mx-auto max-w-6xl px-4 pb-20">
          <Link
            href="/casestudy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6C3CF4]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to case studies
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C3CF4]">
                Case study
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
                {study.title}
              </h1>
              <p className="mt-5 text-xl font-medium text-[#6C3CF4]">
                {study.shortDescription}
              </p>
              <p className="mt-6 text-lg leading-relaxed text-[#78818f]">
                {study.description}
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="relative aspect-[4/3]">
                <Image
                  src={study.image}
                  alt={study.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {study.metrics.length > 0 && (
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {study.metrics.map((metric, index) => (
                <div key={index} className="rounded-2xl bg-white p-6 text-center shadow-md">
                  <div className="text-3xl font-bold text-[#6C3CF4]">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-sm text-[#78818f]">{metric.label}</div>
                </div>
              ))}
            </div>
          )}

          <section className="mt-14 rounded-3xl bg-white p-8 shadow-lg md:p-10">
            <h2 className="text-3xl font-semibold">Project snapshot</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                "Outcome-driven delivery with clear success metrics.",
                "Expert review workflow designed for auditability.",
                "Reusable operating model for follow-on data programs.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-[#6C3CF4]" />
                  <p className="text-base leading-relaxed text-[#78818f]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-16">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">More case studies</h2>
                <Link href="/casestudy" className="text-sm font-semibold text-[#6C3CF4]">
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
