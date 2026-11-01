import { mulberry } from './procedural';

// Generates an abstract, top-down colour/texture study per dish. These are deliberately NOT meant to pass as photographs:
// they hold the layout, colour and cropping while real photography is sourced.
const W = 480, H = 600, TAU = Math.PI * 2;
const cache = new Map();

const blob = (g, x, y, r, c) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
const ell = (g, x, y, rx, ry, rot, fill, stroke) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fillStyle = fill; g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.4; g.stroke(); } g.restore();
};
const strand = (g, r, x, y, len, rot, col, w) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-len / 2, 0); g.quadraticCurveTo(0, (r() - 0.5) * len * 0.6, len / 2, 0); g.stroke(); g.restore();
};
const pick = (r, a) => a[(r() * a.length) | 0];
const each = (n, f) => { for (let i = 0; i < n; i++) f(i); };
const rim = (g, col) => {
  g.lineCap = 'butt'; g.strokeStyle = col; g.lineWidth = 120; g.beginPath(); g.arc(W / 2, H / 2, 380, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(40,20,5,.35)'; g.lineWidth = 26; g.beginPath(); g.arc(W / 2, H / 2, 318, 0, TAU); g.stroke();
};

const RECIPES = {
  egusi(g, r) { // golden, oily, with pale ground-melon curds and green leaf
    g.fillStyle = '#d8a13c'; g.fillRect(0, 0, W, H);
    each(40, () => blob(g, r() * W, r() * H, 40 + r() * 70, pick(r, ['rgba(233,185,85,.35)', 'rgba(185,112,31,.3)'])));
    each(70, () => ell(g, r() * W, r() * H, 10 + r() * 22, 6 + r() * 14, r() * TAU, 'rgba(196,86,26,.45)'));
    each(260, () => ell(g, r() * W, r() * H, 8 + r() * 14, 6 + r() * 10, r() * TAU, pick(r, ['#f3e3a8', '#ecd58f', '#f7ecc4']), 'rgba(120,70,10,.3)'));
    each(110, () => strand(g, r, r() * W, r() * H, 18 + r() * 34, r() * TAU, pick(r, ['#44702a', '#2f5a22', '#5b8a34']), 3 + r() * 3));
    rim(g, '#f4e9d2');
  },
  okra(g, r) { // bright green and glossy, with sliced okra and a streak of palm oil
    g.fillStyle = '#6c9a2a'; g.fillRect(0, 0, W, H);
    each(40, () => blob(g, r() * W, r() * H, 40 + r() * 70, pick(r, ['rgba(134,181,58,.4)', 'rgba(74,122,30,.4)', 'rgba(217,112,31,.25)'])));
    each(90, () => { const x = r() * W, y = r() * H, rr = 12 + r() * 10; ell(g, x, y, rr, rr, 0, '#a8cf5a', '#3f6e1c'); each(5, (i) => ell(g, x + Math.cos(i * 1.26) * rr * 0.45, y + Math.sin(i * 1.26) * rr * 0.45, 2.2, 2.2, 0, '#e6f0a8')); });
    each(120, () => strand(g, r, r() * W, r() * H, 20 + r() * 40, r() * TAU, 'rgba(255,255,220,.3)', 1.6));
    rim(g, '#f4e9d2');
  },
  afang(g, r) { // deep, dark green; fine shredded leaf, flecks of red oil, dark chunks
    g.fillStyle = '#1d3a17'; g.fillRect(0, 0, W, H);
    each(40, () => blob(g, r() * W, r() * H, 40 + r() * 70, pick(r, ['rgba(47,90,34,.5)', 'rgba(15,36,16,.5)'])));
    each(420, () => strand(g, r, r() * W, r() * H, 20 + r() * 40, r() * TAU, pick(r, ['rgba(63,122,44,.75)', 'rgba(90,150,60,.55)', 'rgba(20,50,18,.8)']), 1.6 + r() * 1.6));
    each(80, () => ell(g, r() * W, r() * H, 2 + r() * 5, 2 + r() * 4, 0, 'rgba(217,89,31,.85)'));
    each(12, () => ell(g, r() * W, r() * H, 14 + r() * 12, 10 + r() * 8, r() * TAU, '#5a3a1e', 'rgba(20,10,4,.6)'));
    rim(g, '#e9dec4');
  },
  efo(g, r) { // red pepper-and-palm-oil base, plenty of leafy green, dark onion/protein pieces
    g.fillStyle = '#a92f16'; g.fillRect(0, 0, W, H);
    each(40, () => blob(g, r() * W, r() * H, 40 + r() * 70, pick(r, ['rgba(194,74,28,.45)', 'rgba(122,28,14,.45)', 'rgba(233,160,47,.22)'])));
    each(170, () => { const x = r() * W, y = r() * H, a = r() * TAU, s = 10 + r() * 20; ell(g, x, y, s, s * 0.55, a, pick(r, ['#3d6b20', '#4e8228', '#2f5818']), 'rgba(20,40,10,.5)'); strand(g, r, x, y, s * 1.6, a, 'rgba(20,45,10,.55)', 1.2); });
    each(100, () => ell(g, r() * W, r() * H, 2 + r() * 6, 2 + r() * 5, 0, 'rgba(228,87,31,.9)'));
    each(40, () => ell(g, r() * W, r() * H, 6 + r() * 12, 5 + r() * 9, r() * TAU, '#4a2312'));
    rim(g, '#f4e9d2');
  },
  jollof(g, r) { // orange-red rice: many small grains, deeper red where it's caught
    g.fillStyle = '#c8401a'; g.fillRect(0, 0, W, H);
    each(30, () => blob(g, r() * W, r() * H, 50 + r() * 70, pick(r, ['rgba(120,28,10,.35)', 'rgba(240,154,85,.3)'])));
    each(2600, () => ell(g, r() * W, r() * H, 5 + r() * 3, 1.8 + r() * 1.4, r() * TAU, pick(r, ['#e9703a', '#d9531f', '#f09a55', '#b83a14', '#e45f2a'])));
    each(50, () => ell(g, r() * W, r() * H, 2 + r() * 4, 2 + r() * 3, 0, 'rgba(70,20,8,.8)'));
    rim(g, '#f4e9d2');
  },
  abacha(g, r) { // pale shredded cassava with red palm-oil sauce and a little green
    g.fillStyle = '#efdba6'; g.fillRect(0, 0, W, H);
    each(30, () => blob(g, r() * W, r() * H, 50 + r() * 60, pick(r, ['rgba(255,242,200,.5)', 'rgba(226,194,122,.4)'])));
    each(1000, () => strand(g, r, r() * W, r() * H, 22 + r() * 40, r() * TAU, pick(r, ['rgba(255,242,200,.8)', 'rgba(226,194,122,.7)']), 1.4 + r() * 1.4));
    each(70, () => blob(g, r() * W, r() * H, 10 + r() * 24, 'rgba(200,68,26,.55)'));
    each(40, () => ell(g, r() * W, r() * H, 3 + r() * 6, 2 + r() * 4, r() * TAU, '#5a8a2f'));
    rim(g, '#f4e9d2');
  },
  wholedried(g, r) { // larger curled pieces, russet and orange, on a pale linen ground
    g.fillStyle = '#d9c6a0'; g.fillRect(0, 0, W, H);
    each(30, () => blob(g, r() * W, r() * H, 50 + r() * 60, 'rgba(120,90,50,.18)'));
    each(150, () => { const x = r() * W, y = r() * H, a = r() * TAU, s = 16 + r() * 16; g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = pick(r, ['#b5561f', '#c9682e', '#9a4519', '#d98240']); g.lineWidth = 7 + r() * 5; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, s, 0.2, 4.6 + r()); g.stroke(); g.restore(); });
  },
  ground(g, r) { // fine russet crumb
    g.fillStyle = '#8a4a20'; g.fillRect(0, 0, W, H);
    each(30, () => blob(g, r() * W, r() * H, 50 + r() * 70, pick(r, ['rgba(20,8,2,.35)', 'rgba(192,106,44,.3)'])));
    each(4200, () => ell(g, r() * W, r() * H, 1.5 + r() * 3.5, 1.2 + r() * 2.5, r() * TAU, pick(r, ['#c06a2c', '#e0904a', '#6a3416', '#f0b26a', '#a8561f'])));
  },
  powder(g, r) { // very fine, lighter, soft
    g.fillStyle = '#c98446'; g.fillRect(0, 0, W, H);
    each(40, () => blob(g, r() * W, r() * H, 50 + r() * 80, pick(r, ['rgba(255,214,160,.35)', 'rgba(120,64,24,.25)'])));
    each(6000, () => { g.fillStyle = pick(r, ['rgba(255,226,180,.35)', 'rgba(110,56,20,.3)']); g.fillRect(r() * W, r() * H, 1.4, 1.4); });
  },
  crayfish(g, r) { // the ingredient: warm, russet, finely textured
    g.fillStyle = '#6a3b1c'; g.fillRect(0, 0, W, H);
    each(40, () => blob(g, r() * W, r() * H, 40 + r() * 70, pick(r, ['rgba(20,8,2,.4)', 'rgba(192,106,44,.3)'])));
    each(1100, () => ell(g, r() * W, r() * H, 3 + r() * 8, 2 + r() * 4, r() * TAU, pick(r, ['#c06a2c', '#e0904a', '#8a4a20', '#f0b26a', '#a8561f'])));
  },
};

export function makePlaceholder(kind) {
  if (cache.has(kind)) return cache.get(kind);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), r = mulberry([...kind].reduce((a, ch) => a + ch.charCodeAt(0), 7));
  (RECIPES[kind] || RECIPES.egusi)(g, r);
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); // vignette + a warm cast
  v.addColorStop(0, 'rgba(255,200,120,.05)'); v.addColorStop(1, 'rgba(30,18,6,.38)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  each(2500, () => { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(r() * W, r() * H, 1.5, 1.5); });
  const url = c.toDataURL('image/jpeg', 0.82);
  cache.set(kind, url);
  return url;
}
