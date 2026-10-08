import { fmtCount, type HandPoseSample } from "@/lib/samples/handpose";
import { C } from "../tokens";

/** The two hands' counts in a sentence: the lane's text alternative, visible to everyone. */
export function Sentence({ hp, className = "mt-4" }: { hp: HandPoseSample; className?: string }) {
  const hand = (name: string, s: HandPoseSample["left"]) =>
    `${name} hand: ${fmtCount(s.measured)} frames measured, ${fmtCount(s.guessed)} guessed, ${fmtCount(s.bridged)} bridged, and ${fmtCount(s.none)} with no 3D pose.`;
  return (
    <p className={`${className} border-l-2 pl-2.5 text-[11px] leading-[1.55]`} style={{ borderColor: C.rule, color: C.textMid }}>
      {hand("Left", hp.left)} {hand("Right", hp.right)}
    </p>
  );
}
