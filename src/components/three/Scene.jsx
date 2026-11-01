import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { heroState } from '../../lib/heroState';
import Crayfish from './Crayfish';
import { FOOD_ORIGIN, FoodSet, FoodSun } from './Food';
import { SHELF_X } from './Products';
import { LightShafts, Particles, Plants, Seabed, Surface } from './Underwater';

const { lerp, clamp, smoothstep: sm } = THREE.MathUtils;

/**
 * Camera poses for Scene 02, in the CRAYFISH'S local space (so they hold whatever its yaw is):
 *   f = focus point, az = orbit angle around it (0 = in front of the head, ±π/2 = beside, π = behind),
 *   el = elevation, dist = distance, ox/oy = where the animal sits in frame (landscape / portrait) so type has room.
 * p is progress through the whole journey (0–1). Scene 01's own dive is handled separately and blended in.
 */
const KEYS = [
  { p: 0.24, f: [0, 0.1, 1.4], az: -0.9, el: 0.22, dist: 5.5, ox: 0.16, oy: 0.12 },   // 01 The Creature — approach
  { p: 0.36, f: [0, 0.1, 2.2], az: -0.55, el: 0.2, dist: 3.4, ox: 0.18, oy: 0.14 },   //   head and claws
  { p: 0.44, f: [-0.5, 0.05, 2.6], az: -0.7, el: 0.15, dist: 2.4, ox: 0.18, oy: 0.14 }, //   claw detail
  { p: 0.5, f: [0, -0.45, 0.3], az: -1.57, el: 0.08, dist: 3.6, ox: -0.18, oy: -0.14 }, // 02 The Habitat — profile, legs
  { p: 0.6, f: [0, -0.2, -0.6], az: -2.4, el: 0.1, dist: 7.5, ox: -0.2, oy: -0.16 },   //   drifting wide past the plants
  { p: 0.68, f: [0, 0.2, 0], az: -2.9, el: 0.14, dist: 9, ox: -0.16, oy: -0.14 },
  { p: 0.76, f: [0, 0.1, 0.4], az: -0.5, el: 0.28, dist: 6.2, ox: 0, oy: -0.12 },       // 03 The Connection
  { p: 0.86, f: [0, 0, 0.3], az: -0.7, el: 0.45, dist: 7.5, ox: 0, oy: -0.1 },
];
const pose = { f: [0, 0, 0], az: 0, el: 0, dist: 0, ox: 0, oy: 0 };
function samplePose(p) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1], t = clamp((p - a.p) / (b.p - a.p), 0, 1), e = t * t * (3 - 2 * t);
  for (let k = 0; k < 3; k++) pose.f[k] = lerp(a.f[k], b.f[k], e);
  for (const k of ['az', 'el', 'dist', 'ox', 'oy']) pose[k] = lerp(a[k], b[k], e);
  return pose;
}

/** Scene 04 poses, relative to the table origin: glide along the row of products, then pull back to see them all. p = journey progress. */
const shelfKey = (p, x, o = {}) => ({ p, x, az: -0.3, el: 0.32, dist: 6.4, ox: 0.2, oy: -0.14, ...o });
const SHELF = [
  shelfKey(2.14, SHELF_X[0]), shelfKey(2.34, SHELF_X[0]),
  shelfKey(2.42, SHELF_X[1]), shelfKey(2.6, SHELF_X[1]),
  shelfKey(2.68, SHELF_X[2]), shelfKey(2.86, SHELF_X[2]),
  shelfKey(3.0, 0, { az: 0, el: 0.4, dist: 11.5, ox: 0.18, oy: -0.12 }),
];
const sp = { x: 0, az: 0, el: 0, dist: 0, ox: 0, oy: 0 };
function sampleShelf(p) {
  let i = 0;
  while (i < SHELF.length - 2 && p > SHELF[i + 1].p) i++;
  const a = SHELF[i], b = SHELF[i + 1], t = clamp((p - a.p) / (b.p - a.p), 0, 1), e = t * t * (3 - 2 * t);
  for (const k of ['x', 'az', 'el', 'dist', 'ox', 'oy']) sp[k] = lerp(a[k], b[k], e);
  return sp;
}

/** One camera for the whole journey: Scene 01's slow dive → keyed close-ups → a rise toward the surface. */
function CameraRig() {
  const { camera, size, scene } = useThree();
  const cur = useRef({ x: 0, y: 0, p: 0, ox: 0, oy: 0 });
  const V = useMemo(() => ({ ka: new THREE.Vector3(), kb: new THREE.Vector3(), bp: new THREE.Vector3(), bl: new THREE.Vector3(), lf: new THREE.Vector3(), cl: new THREE.Vector3() }), []);
  const fogF = useMemo(() => new THREE.Color('#12382c'), []), fogC = useMemo(() => new THREE.Color('#efe0bd'), []), fogA = useMemo(() => new THREE.Color('#2a3a1d'), []), fogB = useMemo(() => new THREE.Color('#6b8a3e'), []);

  useFrame((state, dt) => {
    const portrait = clamp((1.2 - size.width / size.height) / 0.7, 0, 1);
    const k = heroState.still ? 1 : 1 - Math.exp(-dt * 3), c = cur.current, t = state.clock.elapsedTime;
    c.x += (heroState.px - c.x) * k; c.y += (heroState.py - c.y) * k; c.p += (heroState.progress - c.p) * k;
    const p = c.p;

    // Scene 01 pose (unchanged feel): idle drift + pointer parallax + slow push-in over the first 16% of the journey
    const hp = clamp(p / 0.16, 0, 1);
    V.bp.set(c.x * 0.9 + Math.sin(t * 0.2) * 0.25 - hp * 1.4, 2.5 - c.y * 0.35 + Math.sin(t * 0.27) * 0.12 - hp * 0.9, lerp(11.2, 16, portrait) - hp * 4.2);
    V.bl.set(0.3 + hp * 0.5, -0.2 + portrait * 0.6, 0);

    // Scene 02: blend into the keyed poses once the animal exists in the scene graph
    let oxT = 0, oyT = 0;
    const w = sm(p, 0.12, 0.24), g = heroState.cray;
    if (w > 0 && g) {
      const ps = samplePose(p), ce = Math.cos(ps.el), dm = lerp(1, 1.5, portrait);
      V.lf.set(ps.f[0], ps.f[1], ps.f[2]);
      V.cl.set(Math.sin(ps.az) * ce, Math.sin(ps.el), Math.cos(ps.az) * ce).multiplyScalar(ps.dist * dm).add(V.lf);
      g.updateWorldMatrix(true, false); g.localToWorld(V.cl); g.localToWorld(V.lf);
      V.cl.x += c.x * 0.25; V.cl.y -= c.y * 0.12;
      V.bp.lerp(V.cl, w); V.bl.lerp(V.lf, w);
      oxT = ps.ox * (1 - portrait) * w; oyT = ps.oy * portrait * w;
    }

    // Ending: a real ascent. The camera travels up the water column to just under the surface (y = 12) while tilting
    // toward the zenith; the bed and animal recede into fog, particles stream past, and the surface comes into view above.
    const r0 = clamp((p - 0.82) / 0.18, 0, 1), r = r0 * r0 * r0 * (r0 * (r0 * 6 - 15) + 10);
    heroState.surface = r;
    heroState.detail = sm(p, 0.2, 0.36) * (1 - sm(p, 0.72, 0.84));
    if (r > 0) {
      const up = Math.pow(r, 1.3);
      V.bp.y = lerp(V.bp.y, 11, r);
      V.bl.set(lerp(V.bl.x, V.bp.x, up), lerp(V.bl.y, V.bp.y + 12, up), lerp(V.bl.z, V.bp.z - 1.5, up));
    }

    // ── Scene 03 (camera): break through the surface (y = 12), swing round to look DOWN at the sunlit table, then hold a slow
    // top-down drift while the photographs take over the frame.
    heroState.food = sm(p, 1.0, 1.1);
    heroState.cream = sm(p, 0.93, 1.03);
    if (p > 1) {
      const dmF = lerp(1, 1.45, portrait), FO = FOOD_ORIGIN;
      V.bp.y += 2.2 * sm(p, 1.0, 1.06);                          // 11 → 13.2: up through the surface
      const sw = sm(p, 1.06, 1.2), pb = sm(p, 1.2, 1.5);
      if (sw > 0) {
        V.ka.set(FO.x + 0.6, FO.y + 5 * dmF, FO.z + 4 * dmF);
        V.kb.set(FO.x + Math.sin(t * 0.15) * 0.4, FO.y + 8.5 * dmF, FO.z + 3 * dmF);
        V.ka.lerp(V.kb, pb);
        V.bp.lerp(V.ka, sw);
        V.bl.lerp(V.lf.set(FO.x, FO.y, FO.z), sw);
      }
    }

    // ── Scene 04: leave the top-down view, drop to table height and glide along the products
    let ox4 = 0, oy4 = 0;
    heroState.shelf = sm(p, 2.0, 2.12);
    if (p > 2.04) {
      const ps = sampleShelf(p), w4 = sm(p, 2.06, 2.2), dm = lerp(1, 1.4, portrait), ce = Math.cos(ps.el), FO = FOOD_ORIGIN;
      V.lf.set(FO.x + ps.x, FO.y + 0.85, FO.z);
      V.cl.set(Math.sin(ps.az) * ce, Math.sin(ps.el), Math.cos(ps.az) * ce).multiplyScalar(ps.dist * dm).add(V.lf);
      V.cl.x += c.x * 0.3;
      V.bp.lerp(V.cl, w4); V.bl.lerp(V.lf, w4);
      ox4 = ps.ox * (1 - portrait) * w4; oy4 = ps.oy * portrait * w4;
    }

    // ── Scene 05: the products sink away; the camera rises to a calm, high view of the table, now deep forest green and golden-lit
    heroState.shelfOut = sm(p, 3.14, 3.26);
    heroState.invite = sm(p, 3.18, 3.4);
    const iv = sm(p, 3.14, 3.34);
    if (iv > 0) {
      const FO = FOOD_ORIGIN, dm = lerp(1, 1.3, portrait);
      V.cl.set(FO.x + Math.sin(t * 0.12) * 0.6, FO.y + 9 * dm, FO.z + 8 * dm);
      V.lf.set(FO.x, FO.y + 0.5, FO.z - 1);
      V.bp.lerp(V.cl, iv); V.bl.lerp(V.lf, iv);
      ox4 *= 1 - iv; oy4 *= 1 - iv;
    }
    camera.position.copy(V.bp); camera.lookAt(V.bl);

    // Shift the animal within the frame (without moving the camera) to leave room for the headlines
    c.ox += (oxT * (1 - r) + ox4 - c.ox) * k; c.oy += (oyT * (1 - r) + oy4 - c.oy) * k;
    if (Math.abs(c.ox) + Math.abs(c.oy) > 1e-4) camera.setViewOffset(size.width, size.height, -c.ox * size.width, -c.oy * size.height, size.width, size.height);
    else if (camera.view?.enabled) camera.clearViewOffset();

    const fc = sm(p, 1.0, 1.08), inv = heroState.invite; // water haze → bright kitchen haze → deep forest haze
    scene.fog.color.copy(fogA).lerp(fogB, r * 0.85).lerp(fogC, fc).lerp(fogF, inv);
    scene.fog.near = lerp(lerp(7, 24, fc), 10, inv); scene.fog.far = lerp(lerp(lerp(28, 42, r), 90, fc), 48, inv);
  });
  return null;
}

/** In 'still' mode nothing animates on its own: render a frame whenever the scroll position moves. */
function StillDriver({ still }) {
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    heroState.still = still; heroState.invalidate = still ? invalidate : null;
    if (!still) return;
    invalidate(); const t = setTimeout(invalidate, 600);
    return () => { clearTimeout(t); heroState.invalidate = null; heroState.still = false; };
  }, [still, invalidate]);
  return null;
}

/** Scene 05: the particles from Scene 01 return, drifting in golden light above the green table. */
function Motes({ full }) {
  const g = useRef();
  useFrame(() => { g.current.visible = heroState.invite > 0.01; });
  return (
    <group ref={g} position={[0, 12.2, -3]} visible={false}>
      <Particles count={full ? 420 : 160} fade={() => heroState.invite * 0.75} />
    </group>
  );
}

/** Everything below the water surface: switched off once the camera has come up out of the water. */
function UnderwaterWorld({ children }) {
  const g = useRef();
  useFrame(() => { g.current.visible = heroState.food < 0.5; });
  return <group ref={g}>{children}</group>;
}

/** Light is the storytelling: warm golden key from the surface, orange rim, olive fill. Focused sun while we're close; flooded as we rise. */
function Lighting({ full }) {
  const key = useRef(), amb = useRef(), spot = useRef(), rimA = useRef(), rimB = useRef();
  const warm = useMemo(() => new THREE.Color('#fff1da'), []), mint = useMemo(() => new THREE.Color('#a8d0b0'), []);
  const aim = (self) => self.lookAt(0, 0, 0);
  useFrame(({ scene }) => {
    const r = heroState.surface, d = heroState.detail, f = heroState.food, inv = heroState.invite;
    key.current.intensity = 2.8 * (1 + r * 1.1 + d * 0.25) * (1 - f);
    amb.current.intensity = lerp(0.34 * (1 + r * 0.8) * (1 - d * 0.25), 0.6, f) * (1 - 0.5 * inv);
    amb.current.color.set('#a9c27a').lerp(warm, f).lerp(mint, inv);       // olive water-light → warm daylight
    if (spot.current) spot.current.intensity = 240 * d * (1 - r) * (1 - f);
    rimA.current.intensity = 70 * (1 - f); rimB.current.intensity = 18 * (1 - f);
    scene.environmentIntensity = lerp(1, 0.75, f);
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.34} color="#a9c27a" />
      <directionalLight ref={key} position={[-4, 9, 3]} intensity={2.8} color="#ffe6ae" />
      {full && <spotLight ref={spot} position={[-2.5, 9, 3.5]} angle={0.32} penumbra={1} decay={2} intensity={0} color="#ffd98a" />}
      <pointLight ref={rimA} position={[5.5, 2.5, -4.5]} intensity={70} color="#ff7a3c" />
      <pointLight ref={rimB} position={[-5, 1, 5]} intensity={18} color="#8fc46a" />
      <Environment frames={1} resolution={256}>
        <Lightformer form="rect" intensity={2.4} color="#ffe6ae" scale={[12, 6, 1]} position={[-3, 9, 4]} onUpdate={aim} />
        <Lightformer form="rect" intensity={5} color="#ff7a3d" scale={[3, 10, 1]} position={[7, 2, -7]} onUpdate={aim} />
        <Lightformer form="rect" intensity={1.2} color="#8fc46a" scale={[4, 6, 1]} position={[-9, 1, 3]} onUpdate={aim} />
        <Lightformer form="rect" intensity={0.8} color="#b8a46a" scale={[14, 2, 1]} position={[0, -5, 3]} onUpdate={aim} />
      </Environment>
    </>
  );
}

export default function Scene({ mode = 'full', paused = false, onReady, onLowPerf }) {
  const full = mode === 'full';
  const [dpr, setDpr] = useState(full ? [1, 2] : mode === 'still' ? 1 : [1, 1.5]);
  const declines = useRef(0);

  return (
    <Canvas
      style={{ pointerEvents: 'none' }}
      frameloop={paused ? 'never' : mode === 'still' ? 'demand' : 'always'}
      shadows={full ? 'soft' : false}
      dpr={dpr}
      camera={{ fov: 32, near: 0.1, far: 70, position: [0, 2.5, 11] }}
      gl={{ antialias: full, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); requestAnimationFrame(() => onReady?.()); }}
    >
      {/* Step resolution down first; if the device still struggles, hand over to the static poster. */}
      {mode !== 'still' && (
        <PerformanceMonitor bounds={() => [20, 60]} onDecline={() => { if (++declines.current > 2) onLowPerf?.(); else setDpr(1); }} />
      )}
      <StillDriver still={mode === 'still'} />
      <fog attach="fog" args={['#2a3a1d', 7, 28]} />
      <Lighting full={full} />
      <CameraRig />
      <UnderwaterWorld>
        <LightShafts count={full ? 7 : 4} />
        <Seabed detail={full ? 1 : 0.6} />
        <Plants count={full ? 40 : 18} />
        <Particles count={full ? 900 : 320} />
        <Crayfish detail={full ? 'high' : 'low'} />
      </UnderwaterWorld>
      <Surface />
      <FoodSun full={full} />
      <FoodSet full={full} />
      <Motes full={full} />
    </Canvas>
  );
}
