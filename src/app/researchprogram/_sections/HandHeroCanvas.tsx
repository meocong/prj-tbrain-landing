"use client";

/**
 * Both hands of one recorded demonstration in 3D, from the real joint track.
 * A separate chunk (three.js), loaded only on the client by HandHero.
 *
 * Drawing follows the hand-pose library's renderer (HandCanvas on the
 * hand-pose branch), so the two read as the same instrument:
 *   measured  solid bones, filled joints
 *   guessed   dashed bones, hollow joints
 *   bridged   dotted thin bones, small rings
 *   none      nothing
 * plus a one-second wrist trail. Scene units are metres in the head-rig frame
 * (x right, y up, z forward; z is negated on the way into three.js), but no
 * number is ever printed.
 *
 * Time is not a video's clock here but `clock.current.t`, advanced by the
 * parent; the canvas renders continuously only while `active` (playing and on
 * screen) and on demand otherwise.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import { BONES, HANDS, HAND_FLOATS, JOINTS, poseAt, type JointTrack } from "@/lib/landing/research-hand";

export type ViewPreset = "orbit" | "wearer" | "top";
export interface PresetRequest {
  name: ViewPreset;
  n: number;
}

/** Scene colours, so the figure can sit on a light academic page or a dark one. */
export interface SceneTheme {
  ground: string;
  gridMajor: number;
  gridMinor: number;
  rig: number;
  rigLens: number;
  left: string;
  right: string;
  /** Draw the schematic head-rig marker at the origin. */
  showRig?: boolean;
  /** Draw the one-second wrist trail. */
  trail?: boolean;
}
const TRAIL = 15; // samples at 15 fps = one second
const TWEEN_MS = 420;

/* ── Joint markers: round points sized in metres ─────────────────────────── */

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
    float r = aKind < 1.5 ? 0.0046 : (aKind < 2.5 ? 0.0042 : (aKind < 3.5 ? 0.0032 : 0.0028));
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
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(count).fill(1), 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: color }, uScale: { value: 600 }, uMin: { value: 6 } },
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return { pts, geo, mat };
}

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
  const solid = style({ linewidth: 3.2 });
  const dashed = style({ linewidth: 2.1, dash: [0.011, 0.008] });
  const dotted = style({ linewidth: 1.4, dash: [0.0022, 0.0075] });
  dashed.computeLineDistances();
  group.add(solid, dashed, dotted);
  const joints = makePoints(JOINTS, color);
  const trail = makePoints(TRAIL, color);
  group.add(joints.pts, trail.pts);
  const bonePos = (geo.attributes.instanceStart as unknown as Interleaved).data;
  const boneDist = (geo.attributes.instanceDistanceStart as unknown as Interleaved).data;
  const lineMats = [solid, dashed, dotted].map((s) => s.material as LineMaterial);
  return {
    group, solid, dashed, dotted, joints, trail, bonePos, boneDist, lineMats,
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

function drawHand(h: Hand, pose: Float32Array, o: number, state: number) {
  h.solid.visible = state === 1;
  h.dashed.visible = state === 2;
  h.dotted.visible = state === 3;
  const pos = h.joints.geo.attributes.position as THREE.BufferAttribute;
  const kind = h.joints.geo.attributes.aKind as THREE.BufferAttribute;
  for (let j = 0; j < JOINTS; j++) {
    kind.array[j] = state;
    if (state) {
      pos.array[j * 3] = pose[o + j * 3];
      pos.array[j * 3 + 1] = pose[o + j * 3 + 1];
      pos.array[j * 3 + 2] = -pose[o + j * 3 + 2];
    }
  }
  pos.needsUpdate = true;
  kind.needsUpdate = true;
  if (!state) return;
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
    bd[b * 2] = 0;
    bd[b * 2 + 1] = Math.hypot(pose[c] - pose[a], pose[c + 1] - pose[a + 1], pose[c + 2] - pose[a + 2]);
  }
  h.bonePos.needsUpdate = true;
  h.boneDist.needsUpdate = true;
}

/* ── Camera goals (data terms; z flipped on the way in) ─────────────────── */

interface Goal { pos: THREE.Vector3; target: THREE.Vector3; fov: number }
const at = (x: number, y: number, z: number) => new THREE.Vector3(x, y, -z);

function goalFor(name: ViewPreset, track: JointTrack): Goal {
  const [cx, cy, cz] = track.centre;
  switch (name) {
    case "wearer":
      return { pos: at(cx * 0.2, cy * 0.2 + 0.05, cz * 0.2), target: at(cx, cy, cz), fov: 56 };
    case "top":
      return { pos: at(cx, cy + 0.72, cz - 0.02), target: at(cx, cy, cz), fov: 46 };
    default:
      // Three-quarter, from in front of the wearer and to the side, a little
      // above the hands, close enough that they fill the panel; the head rig
      // at the origin sits behind them, so the egocentric viewpoint reads.
      return { pos: at(cx + 0.2, cy + 0.19, cz + 0.3), target: at(cx, cy + 0.01, cz), fov: 44 };
  }
}

function Scene({
  track, clock, active, preset, autoRotate, reduce, seek, theme,
}: {
  theme: SceneTheme;
  seek: number;
  track: JointTrack;
  clock: React.RefObject<{ t: number; v: number }>;
  active: boolean;
  preset: PresetRequest;
  autoRotate: boolean;
  reduce: boolean;
}) {
  const { invalidate, camera, size, gl } = useThree();
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const pose = useMemo(() => new Float32Array(HANDS * HAND_FLOATS), []);
  const scratch = useMemo(() => new Float32Array(HANDS * HAND_FLOATS), []);
  const states = useMemo(() => new Uint8Array(HANDS), []);
  const scratchStates = useMemo(() => new Uint8Array(HANDS), []);
  const tween = useRef<{ t0: number; from: Goal; to: Goal } | null>(null);
  const follow = useMemo(() => ({ goal: new THREE.Vector3(), delta: new THREE.Vector3() }), []);

  const hands = useMemo(() => [makeHand(new THREE.Color(theme.left)), makeHand(new THREE.Color(theme.right))], [theme.left, theme.right]);
  useEffect(() => () => hands.forEach((h) => h.dispose()), [hands]);

  const furniture = useMemo(() => {
    const g = new THREE.Group();
    const grid = new THREE.GridHelper(1.8, 18, theme.gridMajor, theme.gridMinor);
    const gm = grid.material as THREE.LineBasicMaterial;
    gm.transparent = true;
    gm.opacity = 0.85;
    grid.position.set(track.centre[0], track.floor - 0.05, -0.5);
    g.add(grid);
    // Schematic head rig at the origin: a box, two forward lenses, three axes.
    // Not a model of any real device.
    const rig = new THREE.Group();
    const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.17, 0.06, 0.05)), new THREE.LineBasicMaterial({ color: theme.rig }));
    box.position.set(0, 0, 0.03);
    rig.add(box);
    rig.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(
          [-1, 1].flatMap((s) => [
            new THREE.Vector3(s * 0.045, 0, 0), new THREE.Vector3(s * 0.045, 0, -0.12),
            new THREE.Vector3(s * 0.045, 0, 0), new THREE.Vector3(s * 0.045 + s * 0.04, 0, -0.1),
          ]),
        ),
        new THREE.LineBasicMaterial({ color: theme.rigLens }),
      ),
    );
    const axis = (to: [number, number, number], color: number) =>
      rig.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(...to)]), new THREE.LineBasicMaterial({ color })));
    axis([0.12, 0, 0], 0xe8837f);
    axis([0, 0.12, 0], 0x7fd6a0);
    axis([0, 0, -0.18], 0x7fa8f0);
    rig.visible = theme.showRig !== false;
    g.add(rig);
    return g;
  }, [track, theme.gridMajor, theme.gridMinor, theme.rig, theme.rigLens, theme.showRig]);
  useEffect(
    () => () =>
      furniture.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose();
      }),
    [furniture],
  );

  const first = useRef(true);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const to = goalFor(preset.name, track);
    // Centre the view on the palms at the current moment (the follow-cam
    // only keeps them there once frames are running).
    if (preset.name !== "wearer" && clock.current) {
      poseAt(track, clock.current.t, pose, states);
      let n = 0;
      const f = new THREE.Vector3();
      for (let h = 0; h < HANDS; h++) {
        if (!states[h]) continue;
        const o = h * HAND_FLOATS + 9 * 3;
        f.x += pose[o];
        f.y += pose[o + 1];
        f.z += -pose[o + 2];
        n++;
      }
      if (n) {
        f.multiplyScalar(1 / n);
        const offset = to.pos.clone().sub(to.target);
        to.target.copy(f);
        to.pos.copy(f).add(offset);
      }
    }
    if (reduce || first.current || !controls) {
      first.current = false;
      cam.position.copy(to.pos);
      cam.fov = to.fov;
      cam.updateProjectionMatrix();
      if (controls) {
        controls.target.copy(to.target);
        controls.update();
      } else cam.lookAt(to.target);
      invalidate();
      return;
    }
    tween.current = { t0: performance.now(), from: { pos: cam.position.clone(), target: controls.target.clone(), fov: cam.fov }, to };
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pose/states are scratch buffers, clock a ref
  }, [preset, track, camera, controls, reduce, invalidate]);

  useEffect(() => {
    invalidate();
  }, [active, autoRotate, seek, invalidate]);

  useFrame((_, delta) => {
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
    } else if (controls && autoRotate && active) {
      controls.update();
    }
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const dpr = gl.getPixelRatio();
    const scale = (size.height * dpr) / (2 * Math.tan((fov * Math.PI) / 360));
    for (const h of hands) {
      for (const m of [h.joints.mat, h.trail.mat]) {
        m.uniforms.uScale.value = scale;
        m.uniforms.uMin.value = 5 * dpr;
      }
      for (const m of h.lineMats) m.resolution.set(size.width, size.height);
    }

    const c = clock.current;
    if (!c) return;
    const t = c.t;
    poseAt(track, t, pose, states);
    // Follow-cam: outside the wearer's own view, ease the orbit target (and
    // the camera with it) towards the palms that have a pose, so hands that
    // travel half a metre across the bench stay in frame. Snaps when paused.
    if (controls && !tween.current && preset.name !== "wearer") {
      let n = 0;
      follow.goal.set(0, 0, 0);
      for (let h = 0; h < HANDS; h++) {
        if (!states[h]) continue;
        const o = h * HAND_FLOATS + 9 * 3;
        follow.goal.x += pose[o];
        follow.goal.y += pose[o + 1];
        follow.goal.z += -pose[o + 2];
        n++;
      }
      if (n) {
        follow.goal.multiplyScalar(1 / n);
        // Time-based easing (~1 s to settle) so slow devices frame the same as fast ones.
        follow.delta.copy(follow.goal).sub(controls.target).multiplyScalar(active ? 1 - Math.exp(-Math.min(delta, 0.25) * 3) : 1);
        controls.target.add(follow.delta);
        camera.position.add(follow.delta);
        controls.update();
      }
    }
    for (let h = 0; h < HANDS; h++) {
      drawHand(hands[h], pose, h * HAND_FLOATS, states[h]);
      const tr = hands[h].trail;
      const kind = tr.geo.attributes.aKind as THREE.BufferAttribute;
      const pos = tr.geo.attributes.position as THREE.BufferAttribute;
      const alpha = tr.geo.attributes.aAlpha as THREE.BufferAttribute;
      for (let k = 0; k < TRAIL; k++) {
        const tk = t - (k + 1) / track.fps;
        let on = false;
        if (tk >= 0 && theme.trail !== false) {
          poseAt(track, tk, scratch, scratchStates);
          if (scratchStates[h] === 1) {
            on = true;
            pos.array[k * 3] = scratch[h * HAND_FLOATS];
            pos.array[k * 3 + 1] = scratch[h * HAND_FLOATS + 1];
            pos.array[k * 3 + 2] = -scratch[h * HAND_FLOATS + 2];
            alpha.array[k] = 0.8 * Math.pow(1 - k / TRAIL, 1.5);
          }
        }
        kind.array[k] = on ? 4 : 0;
      }
      pos.needsUpdate = true;
      kind.needsUpdate = true;
      alpha.needsUpdate = true;
    }
  });

  return (
    <>
      <primitive object={furniture} />
      {hands.map((h, i) => (
        <primitive key={i} object={h.group} />
      ))}
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping={false}
        autoRotate={autoRotate && active && !reduce}
        autoRotateSpeed={0.9}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
        rotateSpeed={0.6}
        touches={{ ONE: -1 as unknown as THREE.TOUCH, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        onStart={() => window.dispatchEvent(new CustomEvent("rs-hand-orbit"))}
        onUpdate={(c) => {
          if (c.domElement) c.domElement.style.touchAction = "pan-y";
        }}
      />
    </>
  );
}

export default function HandHeroCanvas(props: {
  theme: SceneTheme;
  /** Bumped by the parent on a seek, so a paused (on-demand) canvas redraws. */
  seek: number;
  track: JointTrack;
  clock: React.RefObject<{ t: number; v: number }>;
  active: boolean;
  preset: PresetRequest;
  autoRotate: boolean;
  reduce: boolean;
}) {
  return (
    <Canvas
      frameloop={props.active ? "always" : "demand"}
      flat
      dpr={[1, 2]}
      camera={{ position: [0.6, 0.4, 0.6], fov: 40, near: 0.01, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      style={{ background: props.theme.ground, touchAction: "pan-y" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
