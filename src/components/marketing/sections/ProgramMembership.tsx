import { InceptionBadge } from "@/components/marketing/InceptionBadge";

/**
 * "Program membership" — the NVIDIA Inception badge on the home page.
 * A quiet band before the closing call to action: member startups most often
 * show the badge in a membership block near the end of the page or in the
 * footer, and keep it out of the hero, where a third-party mark competes with
 * the headline. See InceptionBadge for the brand rules.
 */
export function ProgramMembership() {
  return (
    <section
      aria-labelledby="program-membership"
      className="py-12 md:py-14"
      style={{ background: "var(--bg-page)", borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="container mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 text-center md:flex-row md:justify-center md:gap-10 md:text-left">
        <InceptionBadge height={60} />
        <div className="max-w-md">
          <h2
            id="program-membership"
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted)" }}
          >
            Program membership
          </h2>
          <p className="mt-2 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Tbrain is a member of NVIDIA Inception, NVIDIA&apos;s program for startups building with AI.
          </p>
        </div>
      </div>
    </section>
  );
}
