import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { PasscodeForm } from "./PasscodeForm";
import { C } from "../_sections/tokens";

export const metadata: Metadata = {
  title: "Enter a passcode",
  description: "Open the full Tbrain sample set with the passcode from your access email.",
  alternates: { canonical: "/samples/enter" },
  robots: { index: false, follow: false },
};

export default function SamplesEnterPage() {
  return (
    <div className="samples-scope" style={{ background: C.base }}>
      <Header />
      <main className="relative overflow-hidden" style={{ color: C.text }}>
        <section className="mx-auto max-w-[1400px] px-4 pb-28 pt-24 md:pb-36 lg:px-10 xl:px-16">
          <div className="max-w-xl">
            <Link
              href="/samples"
              className="text-sm underline underline-offset-4"
              style={{ color: C.textMid }}
            >
              Back to the sample library
            </Link>

            <h1
              className="mt-6 text-4xl font-medium tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em", lineHeight: 1.06 }}
            >
              Enter your passcode
            </h1>
            <p className="mt-4 text-base leading-relaxed" style={{ color: C.textMid }}>
              This opens the full resolution files, every camera the rig recorded, and the telemetry
              that ships beside them.
            </p>

            {/* The form reads `?redirect=`, which opts it out of static
                prerendering unless it sits behind a boundary. */}
            <Suspense fallback={<div className="mt-8 h-[168px] max-w-md" />}>
              <PasscodeForm />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
