import { useId } from "react";
import { STATE_DEFINITION, STATE_DRAWING, STATE_LABEL, type StateKey } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { HandBadge, LaneSwatch, StateGlyph } from "./glyphs";

const ORDER: StateKey[] = ["measured", "guessed", "bridged", "none"];

/**
 * "How to read the drawing": which hand is which colour, and what each of the
 * four frame states looks like on the skeleton (the bone glyph) and on the lane
 * (the swatch), with the one-sentence definition from the shared vocabulary.
 *
 * The glyphs are neutral, in the text colour: the legend explains PATTERN, and a
 * hue here would suggest the pattern belongs to one hand. The two hands get their
 * own key above them.
 *
 * `wide` lays the four states out two across, for the places the legend runs the
 * full width of the pane (a lane-only sample, where there is no video to sit
 * beside). Beside a video it is one column and needs no setting. The breakpoint
 * is a container query on the pane, not the viewport: the pane is 640px wide on a
 * laptop and 340px on a phone, and the page width says neither.
 */
export function ViewerLegend({ wide = false, className }: { wide?: boolean; className?: string }) {
  const heading = useId();
  return (
    <section aria-labelledby={heading} className={className}>
      <h3 id={heading} className="bp-mono text-[10px]" style={{ color: C.textDim }}>
        How to read the drawing
      </h3>

      <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]" style={{ color: C.textMid }}>
        <li className="inline-flex items-center gap-2">
          <HandBadge hand="left" size={20} />
          Left hand
        </li>
        <li className="inline-flex items-center gap-2">
          <HandBadge hand="right" size={20} />
          Right hand
        </li>
      </ul>

      <dl
        className={`mt-3 grid ${wide ? "@min-[34rem]:grid-cols-2 @min-[34rem]:gap-x-8" : ""}`}
        style={{ borderTop: `1px solid ${C.hairline}` }}
      >
        {ORDER.map((state) => (
          <div key={state} className="py-2" style={{ borderBottom: `1px solid ${C.hairline}` }}>
            <dt className="flex items-center gap-2.5 text-[12px] font-semibold" style={{ color: C.value }}>
              <StateGlyph state={state} width={40} />
              <LaneSwatch state={state} width={30} height={10} />
              <span>{STATE_LABEL[state]}</span>
            </dt>
            <dd className="mt-1.5 text-[11px] leading-[1.55]" style={{ color: C.textMid }}>
              {/* The drawing is the non-colour cue; this is it in words, for
                  anyone who cannot see the glyph beside the name. */}
              <span className="sr-only">Drawn as: {STATE_DRAWING[state]}. </span>
              {STATE_DEFINITION[state]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
