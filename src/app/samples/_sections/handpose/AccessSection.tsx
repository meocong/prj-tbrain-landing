import { ArrowRight } from "lucide-react";
import { categoryBySlug } from "@/lib/samples/categories";
import { HP_FPS } from "@/lib/samples/handpose";
import { requestUrl } from "@/lib/samples/request-link";
import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { HAIRLINE_TOP, PageSection, SectionHead } from "./page-kit";
import { FEATURED, SAMPLES, joinAnd } from "./page-data";
import { OpenRecordLink, TrackedLink } from "./page-links";

/**
 * #access: the licence in five plain rows, and the three ways in.
 *
 * Not the shared `AccessPaths`, which promises a reply time and describes
 * telemetry these samples do not carry; and not the shared `LICENSE` rows,
 * which state a consent process and a filming policy that nobody has verified
 * for this set. The rows here say only what is true of this page: what is
 * free, what takes a passcode, what is by agreement.
 *
 * "Indicative terms" because the licence agreement governs, and because the
 * licence for the public metrics and lanes, and commercial use, are decisions
 * for the people who sign them, not for this file.
 */

const PRIMARY = "group inline-flex flex-none items-center gap-2 self-start whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition-transform active:scale-[0.98]";

function Arrow() {
  return <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />;
}

export function AccessSection() {
  const packSamples = joinAnd(SAMPLES.filter((s) => s.pack).map((s) => s.n));

  const licence = [
    { label: "Preview", value: "Free to view, no login. Skeleton renders only." },
    { label: "Evaluation", value: `Passcode sample pack for samples ${packSamples}, 7-day session.` },
    { label: "Full delivery", value: "Signed links after the licence is agreed." },
    { label: "Commercial use", value: "On request." },
    { label: "Captured in", value: "Vietnam" },
  ];

  const filled = { background: C.text, color: C.base } as const;
  const ghost = { border: `1px solid ${C.rule}`, color: C.text } as const;

  const related = [
    categoryBySlug("mocap") ? { label: "Mocap", href: "/samples/mocap" } : null,
    { label: "Auto-label hand", href: "/data/physical-ai/auto-label" },
    { label: "Physical AI", href: "/data/physical-ai" },
  ].filter((r): r is { label: string; href: string } => r !== null);

  return (
    <PageSection id="access" tone="closing" labelledBy="hp-access-title" padding="py-10 md:py-24">
      <Reveal variant="rise">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead id="hp-access-title" eyebrow="Licence and access" lead="Three ways in," dim="stated plainly" />
            <dl className="mt-7 md:mt-8">
              {licence.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1 py-2.5 sm:grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)]"
                  style={HAIRLINE_TOP}
                >
                  <dt className="text-[12px]" style={{ color: C.textDim }}>
                    {r.label}
                  </dt>
                  <dd className="font-mono text-[12px] leading-relaxed" style={{ color: C.value }}>
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[12px]" style={{ color: C.textDim }}>
              Indicative terms. The licence agreement governs.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ol>
              <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10 md:py-8" style={HAIRLINE_TOP}>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl md:text-2xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
                    <span className="mr-3 font-mono text-[11px]" style={{ color: C.accent }}>01</span>
                    Preview now
                  </h3>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed" style={{ color: C.textMid }}>
                    Open any sample on this page, read its lane and its numbers, download the metrics table. No form, no login.
                  </p>
                  <p className="bp-mono mt-3.5 text-[10px]" style={{ color: C.textDim }}>
                    Open to everyone
                  </p>
                </div>
                <OpenRecordLink slug={FEATURED.slug} from="access" className={PRIMARY} style={filled}>
                  Open a sample
                  <Arrow />
                </OpenRecordLink>
              </li>

              <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10 md:py-8" style={HAIRLINE_TOP}>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl md:text-2xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
                    <span className="mr-3 font-mono text-[11px]" style={{ color: C.accent }}>02</span>
                    Enter a passcode
                  </h3>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed" style={{ color: C.textMid }}>
                    If we have already spoken, your passcode opens the sample pack for samples {packSamples}: joints at {HP_FPS} fps with one state per frame.
                  </p>
                  <p className="bp-mono mt-3.5 text-[10px]" style={{ color: C.textDim }}>
                    Seven day session
                  </p>
                </div>
                <TrackedLink href="/samples/enter?redirect=%2Fsamples%2Fhand-pose" className={PRIMARY} style={ghost}>
                  Enter passcode
                  <Arrow />
                </TrackedLink>
              </li>

              <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10 md:py-8" style={HAIRLINE_TOP}>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl md:text-2xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
                    <span className="mr-3 font-mono text-[11px]" style={{ color: C.accent }}>03</span>
                    Request the full delivery
                  </h3>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed" style={{ color: C.textMid }}>
                    Tell us the samples and the intended use. We confirm the licence terms and send the full files by signed link.
                  </p>
                  <p className="bp-mono mt-3.5 text-[10px]" style={{ color: C.textDim }}>
                    By signed link, after the licence is agreed
                  </p>
                </div>
                <TrackedLink
                  href={requestUrl({ from: "hand-pose-access" })}
                  event="handpose_request_click"
                  params={{ from: "hand-pose-access" }}
                  className={PRIMARY}
                  style={filled}
                >
                  Request access
                  <Arrow />
                </TrackedLink>
              </li>
            </ol>

            <nav
              aria-label="Related"
              className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6"
              style={HAIRLINE_TOP}
            >
              <span className="bp-mono text-[10px]" style={{ color: C.textDim }}>
                Related
              </span>
              {related.map((r) => (
                <TrackedLink
                  key={r.href}
                  href={r.href}
                  className="inline-flex items-center gap-1.5 py-1 font-mono text-[11px] underline decoration-1 underline-offset-4"
                  style={{ color: C.accent }}
                >
                  {r.label}
                  <ArrowRight aria-hidden className="h-3 w-3" />
                </TrackedLink>
              ))}
            </nav>
          </div>
        </div>
      </Reveal>
    </PageSection>
  );
}
