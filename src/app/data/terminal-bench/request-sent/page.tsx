export const metadata = {
  title: "Request sent — Terminal Bench",
  robots: { index: false, follow: false },
};

export default function RequestSentPage() {
  return (
    <main className="container mx-auto max-w-xl px-6 py-28 text-center md:py-40">
      <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
        / terminal-bench
      </p>
      <h1 className="mt-4 text-4xl font-medium leading-tight text-[#0e1b2e] md:text-5xl">
        Request <span className="gradient-text">received</span>
      </h1>
      <p className="mx-auto mt-6 max-w-md text-base text-[#78818f]">
        Our sales team will review your request shortly. If approved, a 30-day passcode
        will arrive in your inbox — check spam if it hasn&apos;t landed within
        one business day.
      </p>
      <a
        href="/data/terminal-bench"
        className="mt-10 inline-flex items-center gap-2 rounded-xl border border-[#0e1b2e] px-6 py-3 text-sm font-semibold text-[#0e1b2e] transition-all hover:bg-[#0e1b2e] hover:text-white"
      >
        ← Back to overview
      </a>
    </main>
  );
}
