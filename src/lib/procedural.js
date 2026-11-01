import * as THREE from 'three';

export function mulberry(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvasTex(size, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Radial gradient: `inner` held until `hold` (0–1), fading to `outer` at the edge.
export function radialTex(inner, outer, hold = 0, srgb = true) {
  return canvasTex(256, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, inner); gr.addColorStop(hold, inner); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  }, srgb);
}
