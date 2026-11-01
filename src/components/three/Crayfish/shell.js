import * as THREE from 'three';
import { canvasTex, mulberry } from '../../../lib/procedural';

const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

export const sphereGeo = (seg) => memo(`s${seg}`, () => new THREE.SphereGeometry(1, seg, Math.round(seg * 0.66)));

// Tapered limb along +Z, base at the origin.
export const limbGeo = (len, r0, r1, seg = 12) =>
  memo(`l${len}|${r0}|${r1}|${seg}`, () => {
    const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
    g.rotateX(Math.PI / 2); g.translate(0, 0, len / 2);
    return g;
  });

// Claw finger: tapered, flattened vertically, curving toward +X. Along +Z.
export const fingerGeo = (len, r, curve, seg = 12) =>
  memo(`f${len}|${r}|${curve}|${seg}`, () => {
    const g = new THREE.CylinderGeometry(r * 0.07, r, len, seg, 10);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i) + len / 2) / len;
      p.setX(i, p.getX(i) + curve * t * t);
      p.setZ(i, p.getZ(i) * 0.7);
    }
    g.rotateX(Math.PI / 2); g.translate(0, 0, len / 2);
    return g;
  });

// Cephalothorax: a sphere pulled into a tapered, domed carapace with a dorsal ridge.
export const carapaceGeo = (seg) =>
  memo(`c${seg}`, () => {
    const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
    const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = 1 - 0.5 * THREE.MathUtils.smoothstep(z, -0.1, 1);
      const sx = 0.62 * k, sy = 0.5 * k * (y < 0 ? 0.72 : 1), sz = 1.05;
      // normals follow the ellipsoid (inverse scale) so shading stays smooth, with no UV seam
      const nv = new THREE.Vector3(n.getX(i) / sx, n.getY(i) / sy, n.getZ(i) / sz).normalize();
      n.setXYZ(i, nv.x, nv.y, nv.z);
      x *= sx; y *= sy; z *= sz;
      if (y > 0) y += 0.05 * Math.exp(-(x * x) / 0.02) * (1 - 0.5 * (z / sz));
      p.setXYZ(i, x, y, z);
    }
    return g;
  });

// Shell materials. 'high' gets clearcoat + sheen; 'low' is a cheaper standard material.
export const makeShellKit = (detail, variant = 'live') =>
  memo(`kit${detail}${variant}`, () => {
    const cooked = variant === 'cooked';
    const rnd = mulberry(11);
    const map = canvasTex(512, (g, s) => {
      g.fillStyle = cooked ? '#d9532a' : '#c24a22'; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 700; i++) {
        const x = rnd() * s, y = rnd() * s, r = 8 + rnd() * 46, light = rnd() > 0.55;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, light ? (cooked ? 'rgba(255,160,100,.32)' : 'rgba(240,130,70,.30)') : 'rgba(70,16,8,.30)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    });
    const bump = canvasTex(256, (g, s) => {
      g.fillStyle = '#808080'; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 2600; i++) {
        const v = 90 + rnd() * 90 | 0;
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.beginPath(); g.arc(rnd() * s, rnd() * s, 1 + rnd() * 3, 0, 6.3); g.fill();
      }
    }, false);
    [map, bump].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; });
    map.repeat.set(2, 1.5); bump.repeat.set(2, 1.5);

    const high = detail === 'high';
    const base = { map, bumpMap: bump, bumpScale: 2, roughness: cooked ? 0.34 : 0.42 };
    const shell = high
      ? new THREE.MeshPhysicalMaterial({ ...base, clearcoat: cooked ? 0.85 : 0.5, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: new THREE.Color('#ff9558'), sheenRoughness: 0.6 })
      : new THREE.MeshStandardMaterial(base);
    const dark = shell.clone(); dark.color.set('#a8705e');
    const eye = high
      ? new THREE.MeshPhysicalMaterial({ color: '#0a0605', roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 })
      : new THREE.MeshStandardMaterial({ color: '#0a0605', roughness: 0.15 });
    return { shell, dark, eye };
  });
