import {
  HAND_COLOR,
  HP_AGG,
  STATE_DEFINITION,
  STATE_DRAWING,
  STATE_LABEL,
  fmtPct,
  mmss,
  type Hand,
  type HandPoseSample,
  type StateKey,
} from "@/lib/samples/handpose";
import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { HandBadge, LaneSwatch, StateGlyph } from "./glyphs";
import { StripLane } from "./Lane";
import { DotStrip, type StripSpec } from "./DotStrip";
import { PageDisclosure } from "./PageDisclosure";
import { HAIRLINE_TOP, Lede, NEUTRAL_INK, PageSection, SectionHead } from "./page-kit";
import {
  HANDS,
  SAMPLES,
  framesLabel,
  guessedShare,
  handPoints,
  longestRun,
  median,
  noPosePct,
  NO_GROUND_TRUTH,
  pad2,
} from "./page-data";
import { OpenRecordLink } from "./page-links";

/**
 * #legend: how to read every number on the page.
 *
 * The page's argument in one sentence is "coverage is not quality", so this
 * section is built to stop a reader taking a percentage for more than it is:
 * the four states defined once, two samples set side by side where the
 * percentages differ most, the whole spread of all 32 hands, and an explicit
 * list of what the numbers are not.
 */

/** The order a reader meets the states in. `STATES` is the state-code order, which starts with "none". */
const STATE_ORDER: StateKey[] = ["measured", "guessed", "bridged", "none"];

/* ── The four states ──────────────────────────────────────────────────────── */

function StateCards() {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 md:gap-3.5">
      {STATE_ORDER.map((k) => (
        <li key={k} className="bp-card flex flex-col p-3.5 md:p-[18px]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px]" style={{ color: C.text }}>
              {STATE_LABEL[k]}
            </h3>
            {/* How the state is drawn on a skeleton, in each hand's hue, and how
                it is painted on a lane. Shape carries the state, so none of
                this depends on telling the two hues apart. */}
            <span className="flex items-center gap-2.5">
              <StateGlyph state={k} hand="left" width={30} />
              <StateGlyph state={k} hand="right" width={30} />
              <span aria-hidden className="h-4 w-px" style={{ background: C.hairline }} />
              <span style={{ color: NEUTRAL_INK }}>
                <LaneSwatch state={k} width={30} height={10} />
              </span>
            </span>
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed md:mt-3" style={{ color: C.textMid }}>
            {STATE_DEFINITION[k]}
          </p>
          <p className="mt-1.5 text-[11px] leading-snug md:mt-2" style={{ color: C.textDim }}>
            Drawn as: {STATE_DRAWING[k].toLowerCase()}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ── Two samples side by side ─────────────────────────────────────────────── */

function Figure({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col pt-2.5" style={HAIRLINE_TOP}>
      <dt className="bp-mono order-2 mt-1 text-[9.5px]" style={{ color: C.textDim }}>
        {label}
      </dt>
      <dd className="order-1 font-mono text-[22px] leading-none tracking-tight md:text-2xl" style={{ color: color ?? C.value }}>
        {value}
      </dd>
    </div>
  );
}

function LaneRows({ s }: { s: HandPoseSample }) {
  return (
    <>
      <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-2">
        {HANDS.map((hand) => (
          <LaneRow key={hand} hand={hand} strip={s.strip[hand]} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between pl-[28px] font-mono text-[9px]" style={{ color: C.textDim }}>
        <span>0:00</span>
        <span>{mmss(s.seconds)}</span>
      </div>
    </>
  );
}

function LaneRow({ hand, strip }: { hand: Hand; strip: string }) {
  return (
    <>
      <HandBadge hand={hand} size={18} />
      <StripLane hand={hand} strip={strip} height={14} />
    </>
  );
}

function PairCard({ n, head, note }: { n: number; head: string; note: (s: HandPoseSample) => string }) {
  const s = SAMPLES.find((x) => x.n === n);
  if (!s) return null;
  return (
    <article className="bp-card flex flex-col p-5 md:p-[22px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-base" style={{ color: C.text }}>
          #{pad2(s.n)} {s.title}
        </h3>
        <span className="bp-mono text-right text-[9.5px]" style={{ color: C.textDim }}>
          {head}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
        <Figure label="Left, 3D pose" value={fmtPct(s.left.posePct)} color={HAND_COLOR.left} />
        <Figure label="Right, 3D pose" value={fmtPct(s.right.posePct)} color={HAND_COLOR.right} />
        <Figure label="Left, no 3D pose" value={fmtPct(noPosePct(s.left, s.frames))} />
        <Figure label="Right, no 3D pose" value={fmtPct(noPosePct(s.right, s.frames))} />
      </dl>
      <LaneRows s={s} />
      <p className="mt-3.5 text-[13px] leading-relaxed" style={{ color: C.textMid }}>
        {note(s)}
      </p>
      <p className="mt-auto pt-3.5">
        <OpenRecordLink
          slug={s.slug}
          from="legend_pair"
          aria-label={`Open sample ${pad2(s.n)}, ${s.title}`}
          className="inline-block py-1 font-mono text-[11px] underline decoration-1 underline-offset-4"
          style={{ color: C.accent }}
        >
          Open sample {pad2(s.n)}
        </OpenRecordLink>
      </p>
    </article>
  );
}

/** "The longest run without one is 2 frames on the left and 7 on the right", or nothing if the file lacks the field. */
function longestRunSentence(s: HandPoseSample) {
  const l = longestRun(s.left);
  const r = longestRun(s.right);
  if (l == null || r == null) return "";
  return ` The longest run without one is ${framesLabel(l)} on the left and ${r} on the right.`;
}

function ComparePair() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-[18px]">
      <PairCard
        n={10}
        head="Fewer frames with a 3D pose"
        note={() =>
          "Most frames of this clip have no 3D pose: the hand was out of view, or was detected in 2D but not triangulated. The lane shows where."
        }
      />
      <PairCard
        n={8}
        head="Nearly all frames with a 3D pose"
        note={(s) => `Both hands carry a 3D pose on nearly every frame.${longestRunSentence(s)}`}
      />
    </div>
  );
}

/* ── The spread of all 32 hands ───────────────────────────────────────────── */

/** Sample, left, right: the table behind a strip, which is its text alternative. */
function StripTable({ caption, left, right }: { caption: string; left: (s: HandPoseSample) => string; right: (s: HandPoseSample) => string }) {
  return (
    <div>
      <table className="w-full border-collapse text-left text-[12px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {["Sample", "Left hand", "Right hand"].map((h, i) => (
              <th
                key={h}
                scope="col"
                className="bp-mono py-2 pr-3 text-[9.5px] font-normal"
                style={{ color: C.textDim, borderBottom: `1px solid ${C.rule}`, textAlign: i ? "right" : "left" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SAMPLES.map((s) => (
            <tr key={s.slug} style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
              <th scope="row" className="py-1.5 pr-3 font-normal" style={{ color: C.textMid }}>
                <span className="font-mono" style={{ color: C.textDim }}>
                  {pad2(s.n)}
                </span>{" "}
                {s.title}
              </th>
              <td className="py-1.5 pr-3 text-right font-mono" style={{ color: C.value }}>
                {left(s)}
              </td>
              <td className="py-1.5 pr-3 text-right font-mono" style={{ color: C.value }}>
                {right(s)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StripCard({
  title,
  sub,
  spec,
  points,
  table,
}: {
  title: string;
  sub: string;
  spec: StripSpec;
  points: ReturnType<typeof handPoints>;
  table: { caption: string; left: (s: HandPoseSample) => string; right: (s: HandPoseSample) => string };
}) {
  return (
    <article className="bp-card flex flex-col p-5 md:px-[22px] md:py-5">
      <h3 className="text-sm" style={{ color: C.text }}>
        {title}
      </h3>
      <p className="mt-1 text-[12px] leading-snug" style={{ color: C.textMid }}>
        {sub}
      </p>
      <DotStrip points={points} spec={spec} />
      <PageDisclosure label="Show the numbers" openLabel="Hide the numbers" className="mt-3">
        <StripTable caption={table.caption} left={table.left} right={table.right} />
      </PageDisclosure>
    </article>
  );
}

function Strips() {
  const pose = handPoints((h) => h.posePct);
  const guessed = handPoints(guessedShare);
  const p = HP_AGG.pose;

  // The one hand with the largest guessed share, named, because the figure
  // alone ("36.5%") invites the question of whose.
  const top = guessed.reduce((a, b) => (b.value > a.value ? b : a));
  const guessedMedian = median(guessed.map((g) => g.value));
  const tenPlus = guessed.filter((g) => g.value >= 10).length;

  const poseSpec: StripSpec = {
    ariaLabel: "Percentage of frames with a 3D pose, for each of 32 hands, sorted",
    lo: 0,
    hi: 100,
    ticks: [0, 25, 50, 80, 95, 100],
    guides: [50, 80, 95],
    median: p.median,
    medianLabel: `median ${p.median.toFixed(1)}`,
    notes: [
      { value: p.min, text: `min ${p.min.toFixed(1)}`, place: "above-start" },
      { value: p.max, text: `max ${p.max.toFixed(1)}`, place: "below-end" },
    ],
  };

  const guessedHi = Math.ceil((top.value + 3) / 10) * 10;
  const guessedSpec: StripSpec = {
    ariaLabel: "Guessed percentage of delivered hand-frames, for each of 32 hands, sorted",
    lo: 0,
    hi: guessedHi,
    ticks: Array.from({ length: guessedHi / 10 + 1 }, (_, i) => i * 10),
    guides: [10],
    median: guessedMedian,
    medianLabel: `median ${guessedMedian.toFixed(1)}`,
    notes: [{ value: top.value, text: `max ${top.value.toFixed(1)} (#${pad2(top.sample.n)}, ${top.hand})`, place: "above-end" }],
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-[18px]">
      <StripCard
        title="3D pose, per hand"
        sub={`All 32 hands. Circle = left, diamond = right. ${p.atLeast95} are at 95% or more, ${p.atLeast80} at 80% or more, ${p.below50} below 50%.`}
        spec={poseSpec}
        points={pose}
        table={{
          caption: "Share of frames with a 3D pose, per hand, for each sample",
          left: (s) => fmtPct(s.left.posePct),
          right: (s) => fmtPct(s.right.posePct),
        }}
      />
      <StripCard
        title="Guessed, share of delivered hand-frames, per hand"
        sub={`All 32 hands. Median ${fmtPct(guessedMedian)}, highest ${fmtPct(top.value)} (sample ${top.sample.n}, ${top.hand}). ${tenPlus} hands are at 10% or more.`}
        spec={guessedSpec}
        points={guessed}
        table={{
          caption: "Guessed share of delivered hand-frames, per hand, for each sample",
          left: (s) => fmtPct(guessedShare(s.left)),
          right: (s) => fmtPct(guessedShare(s.right)),
        }}
      />
    </div>
  );
}

/* ── What the numbers are not ─────────────────────────────────────────────── */

function NotBox() {
  const items = [
    "Not accuracy. They say how often a 3D pose was delivered for a hand, not how close each joint is to the true position.",
    "Not a confidence score. The 3D pose share counts measured plus guessed frames; bridged frames are counted separately.",
    "Not a reason. A frame with no 3D pose does not say why: the hand may have been out of view, or detected in 2D without being triangulated.",
  ];
  return (
    <div className="bp-card grid gap-4 p-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 md:px-6 md:py-5">
      <div>
        <h3 className="text-[15px]" style={{ color: C.text }}>
          What these numbers are not
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.textMid }}>
          Nothing here is re-estimated for display; gaps are drawn as gaps.
        </p>
      </div>
      <ul className="grid gap-2 text-[13px] leading-[1.55]" style={{ color: C.textMid }}>
        {items.map((t) => (
          <li key={t} className="relative pl-4">
            <span aria-hidden className="absolute left-0 top-[0.7em] h-px w-[7px]" style={{ background: C.textDim }} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReadingTheNumbers() {
  return (
    <PageSection id="legend" tone="band" labelledBy="hp-legend-title">
      <Reveal variant="rise">
        <div className="grid gap-9 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead
              id="hp-legend-title"
              eyebrow="Reading the numbers"
              lead="Coverage is not quality."
              dim="Read it with the lane."
            >
              <Lede>
                The 3D pose share says how often a pose was delivered for a hand. It does not say how close the pose is
                to the true position, and it does not say why a frame has none. The lane under each sample shows where
                the poses are.
              </Lede>
            </SectionHead>
          </div>
          <div className="lg:col-span-7">
            <StateCards />
          </div>
        </div>
      </Reveal>

      <Reveal variant="rise">
        <div className="mt-10 md:mt-12">
          <ComparePair />
        </div>
      </Reveal>

      <Reveal variant="rise">
        {/* Phone-only collapse: the two charts of all 32 hands are a full
            screen each at 390 px, and the pair above already makes the point. */}
        <PageDisclosure
          label="Show all 32 hands"
          openLabel="Hide all 32 hands"
          below="md"
          className="mt-4 md:mt-[18px]"
        >
          <Strips />
        </PageDisclosure>
      </Reveal>

      <Reveal variant="rise">
        <div className="mt-4 md:mt-[18px]">
          <NotBox />
          {/* The sentence the spec requires, set apart so it is read as a
              statement and not as one more bullet. It appears again in the FAQ. */}
          <p
            className="mt-4 border-l-2 py-0.5 pl-3.5 text-[13px] leading-relaxed"
            style={{ borderColor: C.accent, color: C.text }}
          >
            {NO_GROUND_TRUTH}
          </p>
        </div>
      </Reveal>
    </PageSection>
  );
}
