import type { CapabilityTier } from "@/lib/samples/capability";
import { C } from "./tokens";

/**
 * What we run in a category, as a matrix rather than as prose.
 *
 * It was five stacked blocks, each carrying a name, a rig line, a file list, a
 * paragraph of "when you would pick this" and a right-hand column of ramp and
 * ceiling — about eighty words per configuration, five times over, and Tam
 * looked at it and said: "em bảo Claude làm sao bố trí cho nó visual + đẹp dễ
 * nhìn, ko quá nhiều chữ."
 *
 * So it is four columns a reader can scan down: which rig, what lands on disk,
 * how soon, how much per month. Everything a reader compares is now in the same
 * column as its neighbours, which is the entire reason to use a table.
 *
 * The "when you would pick this" paragraphs are not lost, they moved. On
 * egocentric they are the `pitch` on each `ConfigFolders` card, which is where a
 * reader meets a configuration before they are comparing anything. Passing
 * `showWhen` brings them back for the categories that have no card level.
 *
 * Still no `price` column, for the reason on that field in `capability.ts`: a
 * rate on a public page anchors a brief nobody has written yet.
 */
export function CapabilityTable({
  tiers,
  showWhen = false,
}: {
  tiers: CapabilityTier[];
  /** Categories with no configuration cards above still need the guidance. */
  showWhen?: boolean;
}) {
  if (tiers.length === 0) return null;

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr>
            {["Configuration", "What ships", "Ready in", "Per month"].map((h, i) => (
              <th
                key={h}
                scope="col"
                className="bp-mono pb-2 text-[10px] font-normal"
                style={{
                  color: C.textDim,
                  borderBottom: `1px solid ${C.rule}`,
                  textAlign: i > 1 ? "right" : "left",
                  width: i === 0 ? "26%" : i === 1 ? "44%" : "15%",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tiers.map((t) => (
            <tr key={t.key} style={{ borderTop: `1px solid ${C.hairline}` }}>
              <th scope="row" className="py-4 pr-6 align-top font-normal">
                <span className="block text-[14px] font-medium" style={{ color: C.text }}>
                  {t.name}
                </span>
                {/* Rig and sensors on one dim line. They describe the same
                    object and used to be two paragraphs. */}
                <span className="mt-1 block text-[11px] leading-relaxed" style={{ color: C.textDim }}>
                  {t.rig}
                  {t.sensors ? ` · ${t.sensors}` : ""}
                </span>
                {showWhen && t.when && (
                  <span
                    className="mt-2 block text-[12px] leading-relaxed"
                    style={{ color: C.textMid }}
                  >
                    {t.when}
                  </span>
                )}
                {t.demoHref && (
                  <a
                    href={t.demoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-[11px] underline decoration-1 underline-offset-4"
                    style={{ color: C.accent }}
                  >
                    Open the live 3D demo
                  </a>
                )}
              </th>

              {/* The column a technical buyer reads first. Mono, because it is a
                  file list and they are going to write a loader for it. */}
              <td className="py-4 pr-6 align-top">
                <span className="font-mono text-[11px] leading-relaxed" style={{ color: C.value }}>
                  {t.outputs ?? "—"}
                </span>
              </td>

              <td className="py-4 pr-6 text-right align-top">
                <span className="font-mono text-[11px]" style={{ color: C.textMid }}>
                  {t.ramp}
                </span>
              </td>

              {/* Ceiling with the first month under it: quoting only the ceiling
                  to somebody scheduling a pilot overstates month one by up to
                  four times. */}
              <td className="py-4 text-right align-top">
                <span className="font-mono text-[11px]" style={{ color: C.textMid }}>
                  {t.ceiling}
                </span>
                {t.firstMonth && (
                  <span className="mt-1 block font-mono text-[10px]" style={{ color: C.textDim }}>
                    {t.firstMonth}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
