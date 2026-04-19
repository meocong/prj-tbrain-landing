"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FEATURED_CASE_STUDIES } from "@/lib/constants/marketing";

export function CaseStudyContent() {
  const studies = FEATURED_CASE_STUDIES;
  const featured = studies[0];
  const rest = studies.slice(1);

  return (
    <>
      {/* Featured */}
      {featured && (
        <div className="mb-16 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="h-64 overflow-hidden md:h-80">
            <img
              src={featured.image}
              alt={featured.title}
              className="h-full w-full object-cover"
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
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {rest.map((study, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-lg"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={study.image}
                alt={study.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
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
            </div>
          </div>
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
