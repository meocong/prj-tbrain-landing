"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { CaseStudy } from "@/lib/landing/case-studies";

export function CaseStudyContent({ studies }: { studies: CaseStudy[] }) {
  const featured = studies[0];
  const rest = studies.slice(1);

  return (
    <>
      {/* Featured */}
      {featured && (
        <Link
          href={`/casestudy/${featured.slug}`}
          className="group mb-16 block overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="relative h-64 overflow-hidden md:h-80">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="(min-width: 1024px) 1100px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="p-8">
            <h2
              className="text-2xl font-semibold md:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {featured.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-[#6C3CF4]">
              {featured.shortDescription}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#78818f]">
              {featured.description}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {featured.metrics.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-4 text-center"
                >
                  <div className="text-2xl font-bold text-[#6C3CF4]">
                    {m.value}
                  </div>
                  <div className="mt-1 text-xs text-[#78818f]">{m.label}</div>
                </div>
              ))}
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6C3CF4]">
              View case study <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {rest.map((study, i) => (
          <Link
            key={study.id ?? i}
            href={`/casestudy/${study.slug}`}
            className="overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-lg"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={study.image}
                alt={study.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h3
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {study.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#6C3CF4]">
                {study.shortDescription}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#78818f]">
                {study.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {study.metrics.map((m, j) => (
                  <div
                    key={j}
                    className="rounded-lg bg-gray-50 p-2 text-center"
                  >
                    <div className="text-lg font-bold text-[#6C3CF4]">
                      {m.value}
                    </div>
                    <div className="text-[10px] text-[#78818f]">{m.label}</div>
                  </div>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6C3CF4]">
                View detail <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h3
          className="text-2xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Have a similar challenge?
        </h3>
        <p className="mt-2 text-[#78818f]">
          Let&apos;s discuss how we can help with your specific data needs.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3]"
        >
          Talk to an expert
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
