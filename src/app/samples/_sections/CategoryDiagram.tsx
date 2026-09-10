import { C } from "./tokens";

/**
 * What a category that holds no footage looks like.
 *
 * Three of the six have nothing on disk, and their cards and headers carried a
 * hatch and a number. That is honest and it is not a picture, on a page whose
 * whole complaint was that it is all type.
 *
 * A borrowed frame is out: egocentric footage on the mocap card would be a lie
 * about what we can show. But there is a third option between a lie and a
 * rectangle, which is to draw the DATA rather than the scene. Mocap's
 * deliverable IS a skeleton with per-finger pose; teleoperation's IS a joint
 * chain and three camera frames; exocentric's IS a camera placed outside the
 * body looking in. Drawing those is not a stand-in for the product, it is the
 * product, and nobody can mistake a line drawing for a photograph.
 *
 * Every figure below is the spec for that category, not decoration: 17 IMU
 * nodes because Xsens MVN HD has 17, seven joints per arm because the
 * the follower arm has seven, three cameras because the teleop set
 * ships head, left and right.
 */

const STROKE = 1.25;

export function CategoryDiagram({ slug, className }: { slug: string; className?: string }) {
  const D = DIAGRAMS[slug];
  if (!D) return null;
  return (
    <svg
      viewBox="0 0 420 200"
      className={className}
      role="img"
      aria-label={D.label}
      style={{ color: C.textDim }}
    >
      <title>{D.label}</title>
      {D.body}
    </svg>
  );
}

/** A joint marker. Filled where it carries a signal, hollow where it is linkage. */
function Node({ x, y, r = 3.2, live = false }: { x: number; y: number; r?: number; live?: boolean }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={live ? C.accent : C.base}
      stroke={live ? C.accent : "currentColor"}
      strokeWidth={STROKE}
    />
  );
}

const line = { stroke: "currentColor", strokeWidth: STROKE, fill: "none" } as const;

/**
 * Mocap: the 17-segment body Xsens MVN HD instruments, plus the hand the
 * Metagloves add. The seventeen live nodes are the seventeen IMUs.
 */
const MOCAP = (
  <g>
    {/* Body, drawn as the segment chain the suit actually measures. */}
    <g {...line}>
      <circle cx="150" cy="42" r="13" />
      <path d="M150 55 V112" />
      <path d="M119 72 H181" />
      <path d="M119 72 L104 106 L98 138" />
      <path d="M181 72 L196 106 L202 138" />
      <path d="M128 112 H172" />
      <path d="M128 112 L122 152 L119 186" />
      <path d="M172 112 L178 152 L181 186" />
      <path d="M112 190 H126" />
      <path d="M174 190 H188" />
    </g>
    {/* Seventeen IMUs: head, sternum, pelvis, two shoulders, two upper arms,
        two forearms, two hands, two upper legs, two lower legs, two feet. */}
    {[
      [150, 42], [150, 84], [150, 112],
      [119, 72], [181, 72],
      [104, 106], [196, 106],
      [98, 138], [202, 138],
      [94, 158], [206, 158],
      [128, 112], [172, 112],
      [122, 152], [178, 152],
      [119, 186], [181, 186],
    ].map(([x, y], k) => (
      <Node key={k} x={x} y={y} live />
    ))}

    {/* The hand, at the scale the gloves report: a joint per finger segment. */}
    <g transform="translate(268 46)">
      <g {...line}>
        <path d="M28 96 V64 h44 v32 z" />
        <path d="M34 64 V26" />
        <path d="M48 64 V16" />
        <path d="M62 64 V22" />
        <path d="M74 68 V34" />
        <path d="M28 78 L8 62" />
      </g>
      {[
        [34, 52], [34, 38], [34, 26],
        [48, 48], [48, 32], [48, 16],
        [62, 50], [62, 36], [62, 22],
        [74, 56], [74, 44], [74, 34],
        [20, 70], [8, 62],
      ].map(([x, y], k) => (
        <Node key={k} x={x} y={y} r={2.4} live />
      ))}
    </g>
  </g>
);

/**
 * Teleoperation: the bimanual chain, seven joints an arm plus a gripper, and
 * the three synchronised cameras the set ships.
 */
const TELEOP = (
  <g>
    <g {...line}>
      {/* Torso and shoulders. */}
      <path d="M210 40 V78" />
      <path d="M168 78 H252" />
      <path d="M198 40 h24" />
      {/* Left arm: seven links down to a gripper. */}
      <path d="M168 78 L136 96 L112 122 L96 152" />
      <path d="M96 152 l-11 12 M96 152 l11 12" />
      {/* Right arm, mirrored. */}
      <path d="M252 78 L284 96 L308 122 L324 152" />
      <path d="M324 152 l-11 12 M324 152 l11 12" />
    </g>

    {[
      [168, 78], [152, 87], [136, 96], [124, 109], [112, 122], [104, 137], [96, 152],
      [252, 78], [268, 87], [284, 96], [296, 109], [308, 122], [316, 137], [324, 152],
    ].map(([x, y], k) => (
      <Node key={k} x={x} y={y} r={2.8} live />
    ))}

    {/* Three cameras: head, left, right. Boxes with a lens, so they read as
        hardware rather than as more joints. */}
    {[
      [210, 22, "head"],
      [78, 46, "left"],
      [342, 46, "right"],
    ].map(([x, y], k) => (
      <g key={k} transform={`translate(${Number(x) - 15} ${Number(y) - 10})`}>
        <rect x="0" y="0" width="30" height="20" rx="2" {...line} />
        <circle cx="15" cy="10" r="4.5" {...line} />
      </g>
    ))}
  </g>
);

/**
 * Exocentric: the camera outside the body, which is the entire definition. A
 * plan view says it in one drawing where a sentence needs a clause about what
 * it is NOT.
 */
const EXO = (
  <g>
    {/* The room. */}
    <rect x="46" y="30" width="328" height="142" rx="2" {...line} strokeDasharray="4 5" />

    {/* The subject, whole body in frame — the thing that distinguishes this
        from a head-mounted rig, which sees hands and nothing else. */}
    <g {...line} transform="translate(226 66)">
      <circle cx="0" cy="0" r="9" />
      <path d="M0 9 V44" />
      <path d="M-16 20 H16" />
      <path d="M0 44 L-13 76 M0 44 L13 76" />
    </g>

    {/* Fixed camera on a stand, with its field of view reaching past the
        subject on both sides. */}
    <path d="M92 96 L206 44 L206 148 Z" fill={C.accent} opacity="0.10" />
    <path d="M92 96 L206 44 M92 96 L206 148" stroke={C.accent} strokeWidth={STROKE} fill="none" opacity="0.55" />
    <g transform="translate(62 84)">
      <rect x="0" y="0" width="30" height="22" rx="2" {...line} />
      <circle cx="15" cy="11" r="5" {...line} />
      <path d="M15 22 V150" {...line} strokeDasharray="3 4" />
      <path d="M4 150 H26" {...line} />
    </g>

    {/* And the handheld position, because the collection is both. */}
    <g transform="translate(318 118)">
      <rect x="0" y="0" width="24" height="17" rx="2" {...line} />
      <circle cx="12" cy="8.5" r="3.8" {...line} />
      <path d="M-6 24 l14 -6" {...line} />
    </g>
  </g>
);

const DIAGRAMS: Record<string, { label: string; body: React.ReactNode }> = {
  mocap: { label: "Full-body skeleton with 17 IMU nodes and per-finger hand pose", body: MOCAP },
  teleoperation: {
    label: "Bimanual arm chain, seven joints per arm plus a gripper, with three synchronised cameras",
    body: TELEOP,
  },
  exocentric: { label: "Plan view: a fixed camera and a handheld camera outside the subject", body: EXO },
};
