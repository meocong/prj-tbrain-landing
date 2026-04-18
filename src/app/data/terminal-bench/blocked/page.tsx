import Link from "next/link";

export const metadata = {
  title: "Too many attempts · Terminal Bench",
};

export default function BlockedPage() {
  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 py-20 text-center">
      <p className="font-family_avt text-xs uppercase tracking-[0.2em] text-[#78818f]">
        / rate limited
      </p>
      <h1 className="mt-3 text-4xl font-medium text-[#0e1b2e] md:text-5xl">
        Too many attempts
      </h1>
      <p className="mt-5 text-base text-[#78818f]">
        We&apos;ve temporarily paused requests from your IP to protect the
        showcase. Please wait a few minutes and try again. If you believe this
        is a mistake, reach out to{" "}
        <a
          href="mailto:drake@tbrain.ai"
          className="text-[#6C3CF4] underline underline-offset-4"
        >
          drake@tbrain.ai
        </a>
        .
      </p>

      <div className="mt-10 flex justify-center gap-3">
        <Link
          href="/data/terminal-bench"
          className="rounded-xl border border-[#0e1b2e] px-5 py-3 text-sm font-semibold text-[#0e1b2e] transition-all hover:bg-[#0e1b2e] hover:text-white"
        >
          Back to overview
        </Link>
        <Link
          href="/data/terminal-bench/request-access"
          className="rounded-xl bg-[#6C3CF4] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5A2FE0]"
        >
          Request access
        </Link>
      </div>
    </main>
  );
}
