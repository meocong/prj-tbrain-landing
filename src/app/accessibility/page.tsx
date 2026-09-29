import { Metadata } from "next";
import Link from "next/link";
import post_bg from "@/assets/images/post_bg.png";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Tbrain's commitment to an accessible website: the standard we work to (WCAG 2.1 AA), what we have done, known limitations, and how to reach us about a barrier.",
  alternates: { canonical: "/accessibility" },
};

/**
 * Accessibility statement. Say only what is true of the site: every measure
 * listed here is in the code (see the a11y commits of 2026-09-29), and the
 * limitations are the ones known. Update the date and the lists when either
 * changes.
 */
export default function Page() {
  return (
    <div>
      <Header />
      <main style={{ backgroundImage: `url(${post_bg?.src})` }} className="bg-center bg-no-repeat bg-cover">
        <section className="container relative mx-auto max-w-4xl px-4 pb-24 pt-32">
          <h1
            className="text-4xl font-semibold tracking-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            Accessibility Statement
          </h1>
          <p className="mb-8 mt-4 italic" style={{ color: "var(--text-muted)" }}>
            Last Updated: Sep 29, 2026
          </p>

          <div className="space-y-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <p>
              Tbrain LLC wants everyone to be able to use tbrain.ai, including people who use a screen reader,
              a keyboard or switch instead of a mouse, magnification, or reduced-motion settings.
            </p>

            <h2 className="pt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Our standard
            </h2>
            <p>
              We work to the{" "}
              <a
                href="https://www.w3.org/TR/WCAG21/"
                className="underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                Web Content Accessibility Guidelines (WCAG) 2.1
              </a>{" "}
              at Level AA, and check against WCAG 2.2 AA where it adds criteria. We consider the site partially
              conformant: most of it meets the standard, and the exceptions we know of are listed below.
            </p>

            <h2 className="pt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              What we have done
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Text and controls meet the 4.5:1 contrast ratio in both the light and the dark theme.</li>
              <li>Every form field has a visible label tied to it, and keyboard focus is always visible.</li>
              <li>A &ldquo;Skip to main content&rdquo; link is the first stop for the Tab key on every page.</li>
              <li>
                A pause button in the header stops the site&apos;s animations and background video. The site
                also follows your system&apos;s &ldquo;reduce motion&rdquo; setting.
              </li>
              <li>Dialogs keep keyboard focus inside them, close with Escape, and return focus when closed.</li>
              <li>Images that carry meaning have text alternatives; the page language is declared.</li>
              <li>
                We test with automated checks (axe-core, WCAG 2.x A and AA rules) on every page, in both themes
                and at desktop and mobile widths, and by hand with the keyboard.
              </li>
            </ul>

            <h2 className="pt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Known limitations
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                The interactive 3D sample viewer draws to a canvas that screen readers cannot read. Each view
                carries a written description, and the same capture plays as ordinary video in the sample window.
              </li>
              <li>
                Sample and background videos have no audio track and no captions; they show data captures and
                carry no spoken content.
              </li>
              <li>
                Some features come from third parties (Cloudflare Turnstile bot protection and embedded
                viewers). We choose accessible options where we can but do not control their code.
              </li>
            </ul>

            <h2 className="pt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Tell us about a barrier
            </h2>
            <p>
              If something on this site is hard or impossible for you to use, please email{" "}
              <a href="mailto:info@tbrain.ai?subject=Accessibility" className="underline underline-offset-4">
                info@tbrain.ai
              </a>{" "}
              with &ldquo;Accessibility&rdquo; in the subject, the page address, and what went wrong. We will
              reply, and where we cannot fix it quickly we will get you the information another way. You can also
              reach us through the{" "}
              <Link href="/contact" className="underline underline-offset-4">
                contact form
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
