import samples from "@/lib/samples/samples.json";
import { C } from "./tokens";

/**
 * The facet values, printed as page content rather than hidden in a control.
 *
 * `humanoidlayer.dev` prints its search facets on the home page with the values
 * showing — Modality `RGB-D / actions / language`, Robot type `humanoid /
 * bimanual / arm`, Task `tool use / grasping / household`, plus License and
 * Environment — read 2026-09-09. It doubles as a statement of coverage: you can
 * see what the catalogue is made of before you touch a filter.
 *
 * Ours were reachable only by opening the rail below, which means a reader who
 * never opens it never learns the catalogue has sixteen skill groups. R10 asks
 * for samples findable through menus; R14 for environment, difficulty and task
 * filters. This is the half of both that costs nothing to state.
 *
 * Deliberately not interactive. The rail below is the control, and two controls
 * for one thing is worse than one control and an index.
 */

type Row = {
  modality: string;
  skillGroup: string | null;
  industry: string | null;
  rig: string | null;
  environment: string | null;
};
const ALL = samples as unknown as Row[];

const AXES: { key: keyof Row; label: string }[] = [
  { key: "skillGroup", label: "Skill group" },
  { key: "industry", label: "Industry" },
  { key: "environment", label: "Workplace" },
  { key: "rig", label: "Rig" },
];

export function FacetIndex({ modality }: { modality: string }) {
  const rows = ALL.filter((r) => r.modality === modality);
  if (rows.length === 0) return null;

  const axes = AXES.map((a) => ({
    ...a,
    values: [...new Set(rows.map((r) => r[a.key]).filter(Boolean))].sort() as string[],
  })).filter((a) => a.values.length > 0);

  if (axes.length === 0) return null;

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-14 lg:px-10 xl:px-16">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
          What this category is made of
        </h2>

        <dl className="mt-6 grid gap-x-10 gap-y-7 md:grid-cols-2 xl:grid-cols-4">
          {axes.map((a) => (
            <div key={a.label} style={{ borderTop: `1px solid ${C.hairline}` }} className="pt-3">
              <dt className="flex items-baseline justify-between gap-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: C.textDim }}
                >
                  {a.label}
                </span>
                <span className="font-mono text-[11px]" style={{ color: C.accent }}>
                  {a.values.length}
                </span>
              </dt>
              <dd className="mt-2 text-[12.5px] leading-relaxed" style={{ color: C.textMid }}>
                {a.values.join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
