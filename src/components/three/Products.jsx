import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { heroState } from '../../lib/heroState';
import { canvasTex, mulberry, radialTex } from '../../lib/procedural';
import { PRODUCTS } from '../../data/products';

/**
 * ⚠ PLACEHOLDER PACKS. These shapes and labels are stand-ins, NOT packaging designs: each carries a "PLACEHOLDER PACK" label.
 * Replace <Pouch/> <Jar/> <Tin/> with real pack models (or swap this whole row for photographed packs) when they exist.
 * The heaps in front of each pack are placeholder textures of the product category (whole pieces / crumb / fine powder).
 */
export const SHELF_X = [-4.4, 0, 4.4];
const TAU = Math.PI * 2, ease = (t) => t * t * (3 - 2 * t);

function labelTexture(title) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 640;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const draw = () => {
    const g = c.getContext('2d');
    g.fillStyle = '#FFF6E5'; g.fillRect(0, 0, 512, 640);
    g.fillStyle = '#174A3A'; g.fillRect(0, 0, 512, 64); g.fillStyle = '#E9A83B'; g.fillRect(0, 64, 512, 6);
    g.textAlign = 'center'; g.fillStyle = '#D95F32'; g.font = '700 30px "DM Sans", Arial, sans-serif'; g.fillText('PLACEHOLDER PACK', 256, 140);
    g.fillStyle = '#174A3A'; g.font = 'italic 700 62px Fraunces, Georgia, serif';
    const words = title.split(' '), lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [title];
    lines.forEach((l, i) => g.fillText(l, 256, 290 + i * 74));
    g.fillStyle = 'rgba(43,33,28,.65)'; g.font = '500 26px "DM Sans", Arial, sans-serif'; g.fillText('Product details to follow', 256, 560);
    tex.needsUpdate = true;
  };
  draw(); document.fonts?.ready.then(draw);
  return tex;
}

const speckle = (base, cols, n, seed) => canvasTex(256, (g, s) => {
  const r = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(r() * s, r() * s, 1 + r() * 2.5, 1 + r() * 2.5); }
});

function Pouch({ tex }) {
  return (
    <group>
      <RoundedBox args={[1, 1.7, 0.36]} radius={0.1} smoothness={4} position={[0, 0.85, 0]}><meshStandardMaterial color="#c9a878" roughness={0.85} /></RoundedBox>
      <mesh position={[0, 0.9, 0.187]}><planeGeometry args={[0.74, 0.92]} /><meshStandardMaterial map={tex} roughness={0.8} /></mesh>
      <mesh position={[0, 1.64, 0]}><boxGeometry args={[1.02, 0.07, 0.38]} /><meshStandardMaterial color="#a98a5c" roughness={0.9} /></mesh>
    </group>
  );
}
function Jar({ tex }) {
  const geo = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.48, 0], [0.54, 0.06], [0.55, 0.85], [0.5, 1.0], [0.34, 1.08], [0, 1.08]].map(([x, y]) => new THREE.Vector2(x, y)), 48), []);
  return (
    <group>
      <mesh geometry={geo}><meshStandardMaterial color="#FFF6E5" roughness={0.35} /></mesh>
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.36, 0.38, 0.24, 40]} /><meshStandardMaterial color="#174A3A" roughness={0.55} /></mesh>
      <mesh position={[0, 0.5, 0]} rotation-y={0}><cylinderGeometry args={[0.557, 0.557, 0.62, 32, 1, true, -0.5, 1.0]} /><meshStandardMaterial map={tex} roughness={0.7} /></mesh>
    </group>
  );
}
function Tin({ tex }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.5, 0.5, 1, 48]} /><meshStandardMaterial color="#174A3A" roughness={0.45} metalness={0.3} /></mesh>
      <mesh position={[0, 1.04, 0]}><cylinderGeometry args={[0.53, 0.53, 0.1, 48]} /><meshStandardMaterial color="#E9A83B" roughness={0.35} metalness={0.7} /></mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.505, 0.505, 0.62, 32, 1, true, -0.5, 1.0]} /><meshStandardMaterial map={tex} roughness={0.7} /></mesh>
    </group>
  );
}

/** Whole pieces: a loose pile of small curled shapes (instanced: one draw call). */
function DriedPile() {
  const im = useMemo(() => {
    const n = 80, r = mulberry(8), m = new THREE.InstancedMesh(new THREE.TorusGeometry(0.11, 0.034, 6, 12, Math.PI * 1.35), new THREE.MeshStandardMaterial({ roughness: 0.6 }), n);
    const o = new THREE.Object3D(), c = new THREE.Color(), pal = ['#b5561f', '#c9682e', '#9a4519', '#d98240'];
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, d = Math.sqrt(r()) * 0.78;
      o.position.set(Math.cos(a) * d, 0.05 + 0.15 * (1 - (d / 0.8) ** 2) + r() * 0.05, Math.sin(a) * d * 0.9);
      o.rotation.set(r() * TAU, r() * TAU, r() * TAU); o.scale.setScalar(0.8 + r() * 0.6); o.updateMatrix();
      m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.set(pal[(r() * 4) | 0]).offsetHSL(0, 0, (r() - 0.5) * 0.06));
    }
    return m;
  }, []);
  return <primitive object={im} />;
}
/** Crumb (rough) or powder (smooth, with a soft peak): a flattened dome with a speckle texture. */
function Heap({ fine }) {
  const { geo, map } = useMemo(() => {
    const g = new THREE.SphereGeometry(0.8, 44, 22, 0, TAU, 0, Math.PI / 2), p = g.attributes.position, r = mulberry(fine ? 3 : 4);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i); let y = p.getY(i) * 0.42;
      y += fine ? 0.14 * Math.exp(-(x * x + z * z) * 6) : (Math.sin(x * 14) * Math.cos(z * 12) * 0.018 + (r() - 0.5) * 0.012);
      p.setY(i, y);
    }
    g.computeVertexNormals();
    return { geo: g, map: fine ? speckle('#cf8c4c', ['rgba(255,226,180,.4)', 'rgba(110,56,20,.3)'], 5000, 6) : speckle('#8a4a20', ['#c06a2c', '#e0904a', '#6a3416', '#a8561f'], 3500, 7) };
  }, [fine]);
  return <mesh geometry={geo} scale={[1, 1, 0.9]}><meshStandardMaterial map={map} roughness={1} /></mesh>;
}

/** The row of placeholder products. Each rises onto the table in turn as the camera comes down (heroState.shelf). */
export function ProductRow({ full }) {
  const root = useRef(), items = useRef([]);
  const tex = useMemo(() => PRODUCTS.map((p) => labelTexture(p.name)), []);
  const blob = useMemo(() => radialTex('rgba(40,28,12,.5)', 'rgba(40,28,12,0)', 0.3), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime, sh = heroState.shelf;
    const out = heroState.shelfOut;
    root.current.visible = sh > 0.001 && out < 0.999;
    items.current.forEach((g, i) => {
      if (!g) return;
      const s = ease(THREE.MathUtils.clamp((sh * 1.7 - i * 0.4) / 0.6, 0, 1)) * (1 - ease(THREE.MathUtils.clamp(out * 1.5 - i * 0.15, 0, 1)));
      g.scale.setScalar(Math.max(0.001, s)); g.position.y = (1 - s) * -0.7; g.rotation.y = Math.sin(t * 0.4 + i * 1.7) * 0.12;
    });
  });
  useEffect(() => {
    if (!full) return;
    root.current.traverse((o) => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = true; o.receiveShadow = true; } });
  }, [full]);

  return (
    <group ref={root} visible={false}>
      {PRODUCTS.map((p, i) => (
        <group key={p.id} ref={(el) => { items.current[i] = el; }} position={[SHELF_X[i], 0, 0]}>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0.5]} scale={[3, 3.4, 1]} userData={{ noShadow: true }}>
            <planeGeometry /><meshBasicMaterial map={blob} transparent depthWrite={false} fog={false} />
          </mesh>
          {i === 0 && <Pouch tex={tex[0]} />}
          {i === 1 && <Jar tex={tex[1]} />}
          {i === 2 && <Tin tex={tex[2]} />}
          <group position={[0, 0, 1.15]}>{i === 0 ? <DriedPile /> : <Heap fine={i === 2} />}</group>
        </group>
      ))}
    </group>
  );
}
