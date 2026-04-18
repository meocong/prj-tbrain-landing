import { RequestAccessForm } from "@/components/terminal-bench/auth/RequestAccessForm";

export const metadata = {
  title: "Request access — Terminal Bench",
};

export default function RequestAccessPage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;

  return (
    <main className="container mx-auto max-w-2xl px-6 py-24 md:py-32">
      <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
        / terminal-bench — request access
      </p>
      <h1 className="mt-4 text-4xl font-medium leading-tight text-[#0e1b2e] md:text-5xl">
        Tell us about <span className="gradient-text">your team</span>
      </h1>
      <p className="mt-5 text-base text-[#78818f]">
        Our sales team reviews every request — typically within one business
        day. Approved requests get a 30-day passcode by email.
      </p>

      <div className="mt-10 rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <RequestAccessForm siteKey={siteKey} />
      </div>
    </main>
  );
}
