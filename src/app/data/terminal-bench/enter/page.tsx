import { Suspense } from "react";
import { PasscodeForm } from "@/components/terminal-bench/auth/PasscodeForm";

export const metadata = {
  title: "Enter — Terminal Bench",
  description: "Passcode-gated Terminal Bench showcase access for approved Tbrain visitors.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function EnterPage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;

  return (
    <main className="container mx-auto max-w-md px-6 py-24 md:py-32">
      <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
        / terminal-bench
      </p>
      <h1 className="mt-4 text-4xl font-medium leading-tight text-[#0e1b2e] md:text-5xl">
        Enter <span className="gradient-text">showcase</span>
      </h1>
      <p className="mt-5 text-base text-[#78818f]">
        Paste the passcode our sales team sent you. Entries are rate-limited and each use is logged.
      </p>

      <div className="mt-10 rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-[#F3F4F6]" />}>
          <PasscodeForm siteKey={siteKey} />
        </Suspense>
      </div>
    </main>
  );
}
