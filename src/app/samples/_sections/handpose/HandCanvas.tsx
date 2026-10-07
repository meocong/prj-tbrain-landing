"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import { BONES, HAND_COUNT, HAND_FLOATS, JOINT_COUNT, poseAt, type JointTrack } from "@/lib/samples/handpose-joints";
import { useVideoClock } from "./use-video-clock";

/**
 * Both hands in 3D, drawn the way the skeleton renders draw them.
 *
 *   measured  solid bones, filled joints
 *   guessed   dashed bones, hollow joints
 *   bridged   dotted, thin bones, small rings
 *   none      nothing
 *
 * The scene is in metres in the head-rig frame (x right, y up, z forward), so
 * the numbers on the readout are the numbers in the scene. Rendering is on
 * demand: the loop runs only when the video's clock moves, the reader orbits, or
 * a preset is changing the camera, so a paused clip costs nothing and nothing
 * here animates by itself.
 *
 * Time comes from the video through `useVideoClock`, into a ref; no React state
 * is set per frame. The track is at 15 fps and the clock at 30, so between two
 * samples a hand present in both is blended (see `poseAt`).
 *
 * Dependencies are THREE objects built once and mutated in place. The fat-line
 * classes are the reason: `setPositions` allocates a new GPU buffer on every
 * call, so the bone buffers are written through their interleaved arrays.
 */

export type ViewPreset = "wearer" | "front" | "top";
export interface PresetRequest {
  name: ViewPreset;
  /** Bumped on every press, so choosing the same view again resets an orbit. */
  n: number;
}

const GROUND = "#06080E";
const TRAIL_FRAMES = 30;
const CLOCK_FPS = 30;
const TWEEN_MS = 320;

/* ── Joint markers ───────────────────────────────────────────────────────── */

const VERT = /* glsl */ `
  attribute float aKind;
  attribute float aAlpha;
  uniform float uScale;
  uniform float uMin;
  varying float vKind;
  varying float vAlpha;
  void main() {
    vKind = aKind;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    if (aKind < 0.5 || mv.z > -0.02) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    // Radius in metres: filled, hollow, small ring, trail dot.
    float r = aKind < 1.5 ? 0.0066 : (aKind < 2.5 ? 0.0052 : (aKind < 3.5 ? 0.0038 : 0.0026));
    gl_PointSize = max(r * 2.0 * uScale / -mv.z, uMin);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vKind;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float disc = 1.0 - smoothstep(0.8, 1.0, d);
    float ring = (vKind > 1.5 && vKind < 3.5) ? smoothstep(0.34, 0.54, d) : 1.0;
    float a = disc * ring * vAlpha;
    if (a < 0.02) discard;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

function makePoints(count: number, color: THREE.Color) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aKind", new THREE.BufferAttribute(new Float32Array(count), 1));
  const alpha = new Float32Array(count).fill(1);
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: color },
      uScale: { value: 600 },
      uMin: { value: 7 },
    },
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return { pts, geo, mat };
}

/* ── One hand ────────────────────────────────────────────────────────────── */

type Interleaved = { data: { array: Float32Array; needsUpdate: boolean } };

function makeHand(color: THREE.Color) {
  const group = new THREE.Group();

  const geo = new LineSegmentsGeometry();
  geo.setPositions(new Float32Array(BONES.length * 6));
  const style = (o: { linewidth: number; dash?: [number, number] }) => {
    const m = new LineMaterial({
      color: color.getHex(),
      linewidth: o.linewidth,
      dashed: !!o.dash,
      dashSize: o.dash?.[0] ?? 1,
      gapSize: o.dash?.[1] ?? 1,
      worldUnits: false,
    });
    const s = new LineSegments2(geo, m);
    s.frustumCulled = false;
    s.visible = false;
    return s;
  };
  const solid = style({ linewidth: 2.6 });
  const dashed = style({ linewidth: 2, dash: [0.011, 0.008] });
  const dotted = style({ linewidth: 1.4, dash: [0.0022, 0.0075] });
  // Creates the distance attributes the dashed materials read; they are then
  // rewritten in place, never recreated.
  dashed.computeLineDistances();
  group.add(solid, dashed, dotted);

  const joints = makePoints(JOINT_COUNT, color);
  const trail = makePoints(TRAIL_FRAMES, color);
  group.add(joints.pts, trail.pts);

  const bonePos = (geo.attributes.instanceStart as unknown as Interleaved).data;
  const boneDist = (geo.attributes.instanceDistanceStart as unknown as Interleaved).data;

  const lineMats = [solid, dashed, dotted].map((s) => s.material as LineMaterial);

  return {
    group,
    solid,
    dashed,
    dotted,
    joints,
    trail,
    bonePos,
    boneDist,
    lineMats,
    dispose() {
      geo.dispose();
      lineMats.forEach((m) => m.dispose());
      joints.geo.dispose();
      joints.mat.dispose();
      trail.geo.dispose();
      trail.mat.dispose();
    },
  };
}

type Hand = ReturnType<typeof makeHand>;

const KIND_OF_STATE = [0, 1, 2, 3];

/** Write a hand's pose (63 floats at `o` in `pose`) into its joint markers and bones. */
function drawHand(h: Hand, pose: Float32Array, o: number, state: number) {
  h.solid.visible = state === 1;
  h.dashed.visible = state === 2;
  h.dotted.visible = state === 3;
  const pos = h.joints.geo.attributes.position as THREE.BufferAttribute;
  const kind = h.joints.geo.attributes.aKind as THREE.BufferAttribute;
  const k = KIND_OF_STATE[state] ?? 0;
  for (let j = 0; j < JOINT_COUNT; j++) {
    kind.array[j] = k;
    if (k) {
      pos.array[j * 3] = pose[o + j * 3];
      pos.array[j * 3 + 1] = pose[o + j * 3 + 1];
      pos.array[j * 3 + 2] = -pose[o + j * 3 + 2];
    }
  }
  pos.needsUpdate = true;
  kind.needsUpdate = true;
  if (!k) return;

  const bp = h.bonePos.array;
  const bd = h.boneDist.array;
  for (let b = 0; b < BONES.length; b++) {
    const a = o + BONES[b][0] * 3;
    const c = o + BONES[b][1] * 3;
    bp[b * 6] = pose[a];
    bp[b * 6 + 1] = pose[a + 1];
    bp[b * 6 + 2] = -pose[a + 2];
    bp[b * 6 + 3] = pose[c];
    bp[b * 6 + 4] = pose[c + 1];
    bp[b * 6 + 5] = -pose[c + 2];
    // Each bone starts its own dash pattern at its joint.
    bd[b * 2] = 0;
    bd[b * 2 + 1] = Math.hypot(pose[c] - pose[a], pose[c + 1] - pose[a + 1], pose[c + 2] - pose[a + 2]);
  }
  h.bonePos.needsUpdate = true;
  h.boneDist.needsUpdate = true;
}

/* ── The scene ───────────────────────────────────────────────────────────── */

interface CameraGoal {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

/**
 * Camera goals. The data is x right, y up, z forward: a left-handed frame, and
 * three.js is right-handed with its camera looking down -z. The scene is built
 * with z negated (see `drawHand`), so a position given here in the data's terms
 * has its z flipped on the way in, and "forward" is -z everywhere below.
 */
const at = (x: number, y: number, z: number) => new THREE.Vector3(x, y, -z);

function goalFor(name: ViewPreset, track: JointTrack): CameraGoal {
  const [cx, cy, cz] = track.centre;
  const tz = cz * 0.75;
  switch (name) {
    case "front":
      return { pos: at(cx, cy + 0.16, tz + 1.25), target: at(cx, cy, tz), fov: 42 };
    case "top":
      // A hair behind the target so the view has an "up" (forward on screen).
      return { pos: at(cx, cy + 1.2, tz - 0.03), target: at(cx, cy, tz), fov: 50 };
    default:
      // From the wearer's eyes, a little above them, looking at where the
      // hands work — not straight ahead: the hands sit 20-30 degrees below the
      // rig's forward axis, which put them under the bottom edge of the frame.
      // A fifth of the way towards the hands, so they fill the view the way
      // they fill the camera video beside it.
      return { pos: at(cx * 0.2, cy * 0.2 + 0.05, cz * 0.2), target: at(cx, cy, cz), fov: 56 };
  }
}

function Scene({
  track,
  video,
  left,
  right,
  preset,
  trail,
  reduce,
}: {
  track: JointTrack;
  video: HTMLVideoElement | null;
  left: string;
  right: string;
  preset: PresetRequest;
  trail: boolean;
  reduce: boolean;
}) {
  const { invalidate, camera, size, gl } = useThree();
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const time = useRef(0);
  const pose = useMemo(() => new Float32Array(HAND_COUNT * HAND_FLOATS), []);
  const scratch = useMemo(() => new Float32Array(HAND_COUNT * HAND_FLOATS), []);
  const states = useMemo(() => new Uint8Array(HAND_COUNT), []);
  const scratchStates = useMemo(() => new Uint8Array(HAND_COUNT), []);
  const trailRef = useRef(trail);
  const tween = useRef<{ t0: number; from: CameraGoal; to: CameraGoal } | null>(null);

  const hands = useMemo(() => [makeHand(new THREE.Color(left)), makeHand(new THREE.Color(right))], [left, right]);
  useEffect(() => () => hands.forEach((h) => h.dispose()), [hands]);

  /* Ground grid and the head-rig marker: static, built once per track. */
  const furniture = useMemo(() => {
    const g = new THREE.Group();
    const floor = track.bounds.min[1] - 0.06;
    const grid = new THREE.GridHelper(1.6, 16, 0x3b4872, 0x222a46);
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    (grid.material as THREE.LineBasicMaterial).opacity = 0.8;
    grid.position.set(track.centre[0], floor, -0.55);
    g.add(grid);

    // The rig, schematically: a box for the head unit, two lenses 9 cm apart
    // looking forward, and the three axes. Not a model of any real device.
    const rig = new THREE.Group();
    const box = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.17, 0.06, 0.05)),
      new THREE.LineBasicMaterial({ color: 0x8e9bc4 }),
    );
    box.position.set(0, 0, 0.03);
    rig.add(box);
    const lens = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(
        [-1, 1].flatMap((s) => [
          new THREE.Vector3(s * 0.045, 0, 0),
          new THREE.Vector3(s * 0.045, 0, -0.12),
          new THREE.Vector3(s * 0.045, 0, 0),
          new THREE.Vector3(s * 0.045 + s * 0.04, 0, -0.1),
        ]),
      ),
      new THREE.LineBasicMaterial({ color: 0x5a6896 }),
    );
    rig.add(lens);
    const axis = (to: [number, number, number], color: number) => {
      const l = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(...to)]),
        new THREE.LineBasicMaterial({ color }),
      );
      rig.add(l);
    };
    axis([0.14, 0, 0], 0xe8837f);
    axis([0, 0.14, 0], 0x7fd6a0);
    axis([0, 0, -0.2], 0x7fa8f0);
    g.add(rig);
    g.userData.rig = rig;
    return g;
  }, [track]);
  useEffect(
    () => () =>
      furniture.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose();
      }),
    [furniture],
  );

  const apply = () => {
    const t = time.current;
    poseAt(track, t, pose, states);
    for (let h = 0; h < HAND_COUNT; h++) {
      drawHand(hands[h], pose, h * HAND_FLOATS, states[h]);
      const tr = hands[h].trail;
      const kind = tr.geo.attributes.aKind as THREE.BufferAttribute;
      const pos = tr.geo.attributes.position as THREE.BufferAttribute;
      const alpha = tr.geo.attributes.aAlpha as THREE.BufferAttribute;
      for (let k = 0; k < TRAIL_FRAMES; k++) {
        let on = false;
        if (trailRef.current && k > 0) {
          poseAt(track, t - k / CLOCK_FPS, scratch, scratchStates);
          if (t - k / CLOCK_FPS >= 0 && scratchStates[h] > 0) {
            on = true;
            pos.array[k * 3] = scratch[h * HAND_FLOATS];
            pos.array[k * 3 + 1] = scratch[h * HAND_FLOATS + 1];
            pos.array[k * 3 + 2] = -scratch[h * HAND_FLOATS + 2];
            alpha.array[k] = 0.85 * Math.pow(1 - k / TRAIL_FRAMES, 1.4);
          }
        }
        kind.array[k] = on ? 4 : 0;
      }
      pos.needsUpdate = true;
      kind.needsUpdate = true;
      alpha.needsUpdate = true;
    }
  };

  useVideoClock(video, (t) => {
    time.current = t;
    invalidate();
  });

  useEffect(() => {
    trailRef.current = trail;
    invalidate();
  }, [trail, invalidate]);

  /* Presets. A tween unless the reader wants no motion; under reduced motion the
     camera jumps. */
  const first = useRef(true);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const to = goalFor(preset.name, track);
    const from: CameraGoal = {
      pos: cam.position.clone(),
      target: controls ? controls.target.clone() : to.target.clone(),
      fov: cam.fov,
    };
    if (reduce || first.current || !controls) {
      first.current = false;
      cam.position.copy(to.pos);
      cam.fov = to.fov;
      cam.updateProjectionMatrix();
      if (controls) {
        controls.target.copy(to.target);
        controls.update();
      } else {
        cam.lookAt(to.target);
      }
      invalidate();
      return;
    }
    tween.current = { t0: performance.now(), from, to };
    invalidate();
  }, [preset, track, camera, controls, reduce, invalidate]);

  useFrame(() => {
    const tw = tween.current;
    if (tw && controls) {
      const cam = camera as THREE.PerspectiveCamera;
      const p = Math.min(1, (performance.now() - tw.t0) / TWEEN_MS);
      const e = 1 - Math.pow(1 - p, 3);
      cam.position.lerpVectors(tw.from.pos, tw.to.pos, e);
      controls.target.lerpVectors(tw.from.target, tw.to.target, e);
      cam.fov = tw.from.fov + (tw.to.fov - tw.from.fov) * e;
      cam.updateProjectionMatrix();
      controls.update();
      if (p < 1) invalidate();
      else tween.current = null;
    }
    // From inside the rig its own marker is only edges at eye level.
    (furniture.userData.rig as THREE.Object3D).visible = camera.position.length() > 0.25;
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const dpr = gl.getPixelRatio();
    const scale = (size.height * dpr) / (2 * Math.tan((fov * Math.PI) / 360));
    for (const h of hands) {
      for (const p of [h.joints.mat, h.trail.mat]) {
        p.uniforms.uScale.value = scale;
        p.uniforms.uMin.value = 7 * dpr;
      }
      for (const m of h.lineMats) m.resolution.set(size.width, size.height);
    }
    apply();
  });

  return (
    <>
      <primitive object={furniture} />
      {hands.map((h, i) => (
        <primitive key={i} object={h.group} />
      ))}
      <OrbitControls
        makeDefault
        target={[0, 0, -0.01]}
        enableZoom={false}
        enablePan={false}
        enableDamping={false}
        minPolarAngle={0.02}
        maxPolarAngle={Math.PI - 0.02}
        rotateSpeed={0.6}
        // A finger on the canvas scrolls the page; two fingers orbit it.
        touches={{ ONE: -1 as unknown as THREE.TOUCH, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        onUpdate={(c) => {
          if (c.domElement) c.domElement.style.touchAction = "pan-y";
        }}
      />
    </>
  );
}

export default function HandCanvas(props: {
  track: JointTrack;
  video: HTMLVideoElement | null;
  left: string;
  right: string;
  preset: PresetRequest;
  trail: boolean;
  reduce: boolean;
}) {
  return (
    <Canvas
      frameloop="demand"
      flat
      dpr={[1, 2]}
      camera={{ position: [0, 0, 0], fov: 56, near: 0.01, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      style={{ background: GROUND, touchAction: "pan-y" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
