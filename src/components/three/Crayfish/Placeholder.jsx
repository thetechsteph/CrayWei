import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { heroState } from '../../../lib/heroState';
import { carapaceGeo, fingerGeo, limbGeo, makeShellKit, sphereGeo } from './shell';

/**
 * Procedural placeholder crayfish. Local space: head toward +Z, tail toward -Z, +Y up,
 * feet resting at y ≈ -1. Replace with a GLB by editing ./index.jsx — nothing else depends on this file.
 */
const SIDES = [1, -1];

// One tapered segment; children attach at its far end (local +Z).
function Limb({ len, r0, r1, rot = [0, 0, 0], mat, sph, seg = 12, joint = true, children }) {
  return (
    <group rotation={rot}>
      <mesh geometry={limbGeo(len, r0, r1, seg)} material={mat} />
      {joint && <mesh geometry={sph} material={mat} scale={r0 * 1.12} />}
      <group position={[0, 0, len]}>{children}</group>
    </group>
  );
}

// Recursive chain used for antennae: each link is refd so useFrame can ripple a sway down the length.
function Chain({ i, n, len, r0, taper, bend, mat, refs }) {
  const r1 = r0 * taper;
  return (
    <group ref={(el) => { refs.current[i] = el; }} rotation={[bend, 0, 0]}>
      <mesh geometry={limbGeo(len, r0, r1, 6)} material={mat} />
      {i < n - 1 && (
        <group position={[0, 0, len]}>
          <Chain i={i + 1} n={n} len={len} r0={r1} taper={taper} bend={bend} mat={mat} refs={refs} />
        </group>
      )}
    </group>
  );
}

function Antenna({ pos, rot, n = 16, len = 0.2, r0 = 0.034, taper = 0.93, bend = 0.045, mat, speed = 1, ph = 0, animate = true }) {
  const refs = useRef([]);
  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime * speed, m = 1 + heroState.detail * 1.3;
    refs.current.forEach((el, i) => {
      if (!el) return;
      const a = Math.min(1, 0.25 + i / n);
      el.rotation.y = Math.sin(t * 0.8 + i * 0.45 + ph) * 0.07 * a * m;
      el.rotation.x = bend + Math.sin(t * 0.55 + i * 0.35 + ph * 1.7) * 0.03 * a * m;
    });
  });
  return (
    <group position={pos} rotation={rot}>
      <Chain i={0} n={n} len={len} r0={r0} taper={taper} bend={bend} mat={mat} refs={refs} />
    </group>
  );
}

function Claw({ s, shell, dark, sph, lseg, fold = 0, animate = true }) {
  const dactyl = useRef();
  useFrame(({ clock }) => {
    if (!animate) { dactyl.current.rotation.y = s * 0.05; return; }
    dactyl.current.rotation.y = s * (0.1 + 0.1 * Math.sin(clock.elapsedTime * 0.9 + (s > 0 ? 0 : 1.7)));
  });
  return (
    <group position={[s * 0.46, -0.02, 1.12]} rotation={[0.05, s * (0.6 - fold * 0.25), 0]}>
      <Limb len={0.62} r0={0.13} r1={0.115} rot={[0.1, 0, 0]} mat={shell} sph={sph} seg={lseg}>
        <Limb len={0.46} r0={0.11} r1={0.1} rot={[0, s * (-0.85 - fold * 0.75), 0]} mat={dark} sph={sph} seg={lseg}>
          <mesh geometry={sph} material={shell} scale={[0.3, 0.13, 0.5]} position={[0, 0, 0.36]} />
          <mesh geometry={fingerGeo(0.62, 0.1, 0.12, lseg)} material={shell} position={[-s * 0.1, 0, 0.72]} scale={[s, 1, 1]} />
          <group ref={dactyl} position={[s * 0.1, 0, 0.72]}>
            <mesh geometry={fingerGeo(0.6, 0.095, 0.12, lseg)} material={shell} scale={[-s, 1, 1]} />
          </group>
        </Limb>
      </Limb>
    </group>
  );
}

function Leg({ s, z, f, k, shell, dark, sph, lseg, legScale = 1, animate = true }) {
  const g = useRef();
  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime, w = heroState.detail;
    g.current.rotation.x = Math.sin(t * 1.1 + k * 1.3 + (s > 0 ? 0 : 2)) * (0.03 + 0.07 * w);
    g.current.rotation.y = Math.sin(t * 0.8 + k * 1.1 + (s > 0 ? 0 : 1.6)) * 0.06 * w; // slow, deliberate stepping
  });
  return (
    <group position={[s * 0.36, -0.3, z]} rotation={[0, s * (Math.PI / 2 - f), 0]}>
      <group ref={g} scale={legScale}>
        <Limb len={0.42} r0={0.065} r1={0.055} rot={[-0.55, 0, 0]} mat={shell} sph={sph} seg={lseg}>
          <Limb len={0.6} r0={0.055} r1={0.04} rot={[1.7, 0, 0]} mat={dark} sph={sph} seg={lseg}>
            <Limb len={0.42} r0={0.04} r1={0.014} rot={[0.5, 0, 0]} mat={dark} sph={sph} seg={lseg} joint />
          </Limb>
        </Limb>
      </group>
    </group>
  );
}

export default function CrayfishPlaceholder({ detail = 'high', cooked = false, curl = 0, fold = 0, legScale = 1, animate = true }) {
  const hi = detail === 'high';
  const seg = hi ? 48 : 26, lseg = hi ? 14 : 8;
  const { shell, dark, eye } = makeShellKit(detail, cooked ? 'cooked' : 'live');
  const sph = sphereGeo(seg);
  const car = carapaceGeo(seg);

  // Abdomen: six overlapping plates laid along a gently curling spine.
  const abd = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, -0.02, -0.5);
    const segs = [];
    for (let i = 0; i < 6; i++) {
      o.rotateX(-0.08 - curl * 0.2); o.rotateY(0.045);
      segs.push({ p: o.position.clone(), q: o.quaternion.clone(), rx: 0.5 - 0.05 * i, ry: 0.4 - 0.04 * i });
      o.translateZ(-0.36);
    }
    return { segs, tail: { p: o.position.clone(), q: o.quaternion.clone() } };
  }, [curl]);

  return (
    <group>
      {/* cephalothorax */}
      <mesh geometry={car} material={shell} position={[0, 0.05, 0.4]} />
      <mesh geometry={new THREE.TorusGeometry(0.5, 0.02, 8, 48, Math.PI)} material={dark} scale={[1.2, 0.98, 1]} position={[0, 0.05, 0.55]} />
      <mesh geometry={limbGeo(0.7, 0.15, 0.01, 10)} material={shell} scale={[1, 0.4, 1]} position={[0, 0.12, 1.25]} rotation={[-0.08, 0, 0]} />

      {/* abdomen */}
      {abd.segs.map((sg, i) => (
        <group key={i} position={sg.p} quaternion={sg.q}>
          <mesh geometry={sph} material={shell} scale={[sg.rx, sg.ry, 0.27]} />
          {SIDES.map((k) => (
            <group key={k}>
              <mesh geometry={sph} material={shell} scale={[0.24, 0.075, 0.26]} position={[k * sg.rx * 0.88, -sg.ry * 0.5, 0]} rotation={[0, 0, -k * 0.55]} />
              <mesh geometry={sph} material={dark} scale={[0.05, 0.05, 0.15]} position={[k * sg.rx * 0.4, -sg.ry * 0.95, 0.02]} />
            </group>
          ))}
        </group>
      ))}

      {/* tail fan: telson + two uropods per side */}
      <group position={abd.tail.p} quaternion={abd.tail.q}>
        <mesh geometry={sph} material={shell} scale={[0.27, 0.05, 0.44]} position={[0, -0.02, -0.2]} />
        {SIDES.map((k) => (
          <group key={k}>
            <mesh geometry={sph} material={shell} scale={[0.26, 0.045, 0.5]} position={[k * 0.3, -0.02, -0.22]} rotation={[0, -k * 0.38, 0]} />
            <mesh geometry={sph} material={dark} scale={[0.2, 0.04, 0.42]} position={[k * 0.55, -0.02, -0.18]} rotation={[0, -k * 0.8, 0]} />
          </group>
        ))}
      </group>

      {SIDES.map((k) => (
        <group key={k}>
          {/* eyes on stalks */}
          <group position={[k * 0.18, 0.22, 1.2]}>
            <Limb len={0.15} r0={0.045} r1={0.04} rot={[-0.7, k * 0.5, 0]} mat={dark} sph={sph} seg={lseg} joint={false}>
              <mesh geometry={sph} material={eye} scale={0.1} />
            </Limb>
          </group>
          {/* antennae + antennules */}
          <Antenna pos={[k * 0.13, 0.08, 1.42]} rot={[-0.3, k * 0.45, 0]} mat={dark} ph={k * 1.9} n={cooked ? 9 : 16} animate={animate} />
          <Antenna pos={[k * 0.08, 0.13, 1.45]} rot={[-0.55, k * 0.22, 0]} n={7} len={0.13} r0={0.02} bend={0.06} mat={dark} speed={1.4} ph={k * 0.8} animate={animate} />
          <Claw s={k} shell={shell} dark={dark} sph={sph} lseg={lseg} fold={fold} animate={animate} />
        </group>
      ))}

      {/* four pairs of walking legs */}
      {[0.95, 0.55, 0.15, -0.25].map((z, i) =>
        SIDES.map((k) => (
          <Leg key={`${i}${k}`} s={k} z={z} f={0.45 - i * 0.3} k={i} shell={shell} dark={dark} sph={sph} lseg={lseg} legScale={legScale} animate={animate} />
        )),
      )}
    </group>
  );
}
