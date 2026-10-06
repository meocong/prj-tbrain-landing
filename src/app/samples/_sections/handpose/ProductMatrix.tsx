import Link from "next/link";
import { categoryBySlug } from "@/lib/samples/categories";
import { HANDPOSE_PATH } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { HAIRLINE_TOP, PageSection, SectionHead, TH_CLASS } from "./page-kit";

/**
 * #products: three ways to get hands, and which one is for what.
 *
 * A buyer who searches "hand pose" meets three things on this site that all
 * claim it — this vision-based set, the auto-label stage that runs on footage
 * they already have, and the studio mocap — and they differ in the one thing
 * that matters, how the hand was obtained. A ruled table, because that is a
 * comparison down a column, with a marker on the row they are standing on.
 *
 * The mocap row is shown only where the category exists on this build.
 */

interface Product {
  name: string;
  href: string;
  how: string;
  use: string;
  here?: boolean;
}

function products(): Product[] {
  const rows: Product[] = [
    {
      name: "Hand pose",
      href: HANDPOSE_PATH,
      here: true,
      how: "Vision-based, stereo triangulation, captured by a head-worn rig. A measured, guessed, bridged or no-3D-pose label on every frame.",
      use: "Evaluating hand tracking and manipulation work on real tasks, with a label on every frame saying how the pose was obtained.",
    },
    {
      name: "Auto-label hand",
      href: "/data/physical-ai/auto-label",
      how: "A 21-keypoint hand stage run on RGB video you already have. One camera, a model estimate.",
      use: "Adding hand labels to existing footage.",
    },
  ];
  if (categoryBySlug("mocap")) {
    rows.push({
      name: "Mocap",
      href: "/samples/mocap",
      how: "Studio capture with Xsens gloves and a body suit. Instrumented, controlled setting.",
      use: "Retargeting to a humanoid, and dexterous work where the finger matters.",
    });
  }
  return rows;
}

function Name({ p }: { p: Product }) {
  return (
    <>
      {p.here && (
        <span className="bp-mono mb-1 flex items-center gap-1.5 text-[9px]" style={{ color: C.accent }}>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: C.accent }} />
          You are here
        </span>
      )}
      <span className="block text-[15px] font-semibold" style={{ color: C.text }}>
        {p.name}
      </span>
      <Link
        href={p.href}
        aria-current={p.here ? "page" : undefined}
        className="mt-1 inline-flex py-1 font-mono text-[11px] underline decoration-1 underline-offset-4"
        style={{ color: C.accent }}
      >
        {p.href}
      </Link>
    </>
  );
}

export function ProductMatrix() {
  const all = products();
  // The row you are on is lit from the left, so the eye finds it before it reads it.
  const lit = { background: `linear-gradient(90deg, ${C.accentSoft}, transparent 70%)` };

  return (
    <PageSection id="products" tone="band" labelledBy="hp-products-title">
      <Reveal variant="rise">
        <SectionHead
          id="hp-products-title"
          eyebrow="Which hand-pose product?"
          lead="Three ways to get hands,"
          dim="and what each is for"
        />

        <div className="mt-8 hidden md:block">
          <table className="w-full border-collapse text-left text-[13px]">
            <caption className="sr-only">
              Three hand-pose products: how the hands are obtained and what each is used for.
            </caption>
            <thead>
              <tr>
                {["Product", "How the hands are obtained", "Use it for"].map((h) => (
                  <th key={h} scope="col" className={`${TH_CLASS} pb-3 pr-4`} style={{ color: C.textDim, borderBottom: `1px solid ${C.rule}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map((p) => (
                <tr key={p.name} className="align-top" style={{ borderBottom: `1px solid ${C.hairline}`, ...(p.here ? lit : null) }}>
                  <th scope="row" className="w-[22%] py-[18px] pl-0 pr-4 text-left font-normal">
                    <Name p={p} />
                  </th>
                  <td className="py-[18px] pr-4 leading-[1.55]" style={{ color: C.textMid }}>
                    {p.how}
                  </td>
                  <td className="py-[18px] pr-4 leading-[1.55]" style={{ color: C.textMid }}>
                    {p.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 md:hidden">
          {all.map((p) => (
            <li key={p.name} className="py-4" style={{ ...HAIRLINE_TOP, ...(p.here ? lit : null) }}>
              <Name p={p} />
              <p className="mt-2.5 text-[13px] leading-[1.55]" style={{ color: C.textMid }}>
                {p.how}
              </p>
              <p className="mt-2 text-[13px] leading-[1.55]" style={{ color: C.textMid }}>
                <span className="bp-mono mr-1.5 text-[9px]" style={{ color: C.textDim }}>
                  Use it for
                </span>
                {p.use}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </PageSection>
  );
}
