import { useMemo } from 'react';
import { CRAYFISH_IMAGE, DISHES } from '../data/dishes';
import { makePlaceholder } from '../lib/placeholderFood';
import { Headline } from './Discovery';

// Scene 03 · The Ingredient — a food editorial.
export const INGREDIENT = {
  label: '03 / 05 — The Ingredient',
  plain: 'A little ingredient. A lot of flavour.',
  copy: 'From traditional soups to everyday favourites, crayfish brings depth and character to Nigerian cooking.',
  cta: 'Discover Cray Wei',
  lines: [
    { cls: 'fs-sm', words: [['A', 'light'], ['little', 'light']] },
    { cls: 'fs-ing', words: [['ingredient.', 'ital']] },
    { cls: 'fs-sm', words: [['A', 'light'], ['lot', 'light'], ['of', 'light']] },
    { cls: 'fs-ing', words: [['flavour.', 'bold']] },
  ],
};

const FRAMES = ['egusi', 'okra', 'afang', 'efo', 'jollof'];
const RING = ['egusi', 'okra', 'afang', 'efo', 'jollof', 'abacha'];

/** Real photo if `src` is set, otherwise the generated placeholder. */
export function useImages() {
  return useMemo(() => {
    const out = {};
    for (const [k, d] of Object.entries({ ...DISHES, crayfish: CRAYFISH_IMAGE })) out[k] = { url: d.src || makePlaceholder(k), placeholder: !d.src };
    return out;
  }, []);
}
export const altOf = (d) => d.alt;
export const Tag = () => null; // photo credit/labels can go here later

function Frame({ id, n, img }) {
  const d = DISHES[id], im = img[id];
  return (
    <figure className={`fr fr-${id}`}>
      <div className="fr-clip">
        <img className="fr-img" src={im.url} alt={altOf(d, im.placeholder)} loading="lazy" decoding="async" />
        {im.placeholder && <Tag d={d} />}
      </div>
      <figcaption className="fr-cap"><span>0{n}</span> {d.name}</figcaption>
    </figure>
  );
}

/** The final moment: the ingredient at the centre, the dishes around it. Dashed lines suggest connection, not a rule. */
function Connect({ img }) {
  const R = 37, pos = RING.map((_, i) => { const a = ((-90 + i * 60) * Math.PI) / 180; return [50 + R * Math.cos(a), 50 + R * Math.sin(a)]; });
  const c = img.crayfish;
  return (
    <div className="connect" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {pos.map(([x, y], i) => (
          <line key={i} className="cn-line" x1="50" y1="50" x2={x} y2={y} pathLength="1" strokeDasharray="1" strokeDashoffset="1" stroke="#174A3A" strokeWidth=".25" strokeLinecap="round" />
        ))}
      </svg>
      <div className="cn-center">
        <img src={c.url} alt="" className="fr-img" />
        {c.placeholder && <Tag d={CRAYFISH_IMAGE} />}
      </div>
      <p className="cn-name">Crayfish</p>
      {RING.map((id, i) => {
        const d = DISHES[id], im = img[id];
        return (
          <div key={id}>
            <div className="cn-node" style={{ left: `${pos[i][0]}%`, top: `${pos[i][1]}%` }}><img src={im.url} alt="" className="fr-img" /></div>
            <span className="cn-label" style={{ left: `${pos[i][0]}%`, top: `${pos[i][1]}%` }}>{d.name}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Pinned overlay, driven by the master timeline (egusi → okra + afang → efo riro + jollof → the connection). */
export function Ingredient() {
  const img = useImages();
  return (
    <div className="moment m4 pointer-events-none absolute inset-0 z-30">
      <div className="ing-text absolute left-[5vw] top-[14svh] w-[44vw] portrait:left-[6vw] portrait:top-[8svh] portrait:w-[88vw]">
        <p className="label label-dark">{INGREDIENT.label}</p>
        <Headline lines={INGREDIENT.lines} dark />
        <p className="copy mt-6 max-w-[26rem] text-[1.02rem] leading-relaxed text-cocoa/85 portrait:mt-4 portrait:text-[.95rem]">{INGREDIENT.copy}</p>
      </div>
      {FRAMES.map((id, i) => <Frame key={id} id={id} n={i + 1} img={img} />)}
      <Connect img={img} />
      {/* Scene 04 will own #products; until then this is an inert anchor. */}
      <a href="#products" className="cta pointer-events-auto absolute bottom-[6svh] left-1/2 -translate-x-1/2">{INGREDIENT.cta} <span aria-hidden="true">→</span></a>
    </div>
  );
}

/** Reduced-motion version: ordinary section, everything visible, no pinning. */
export function StaticIngredient() {
  const img = useImages();
  return (
    <section id="ingredient" aria-label="The Ingredient" className="kitchen relative px-[6vw] py-24">
      <p className="label label-dark">{INGREDIENT.label}</p>
      <Headline lines={INGREDIENT.lines} dark />
      <p className="mt-6 max-w-[30rem] leading-relaxed text-cocoa/85">{INGREDIENT.copy}</p>
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
        {FRAMES.map((id) => {
          const d = DISHES[id], im = img[id];
          return (
            <figure key={id} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden"><img src={im.url} alt={altOf(d, im.placeholder)} loading="lazy" className="fr-img" />{im.placeholder && <Tag d={d} />}</div>
              <figcaption className="mt-2 text-sm text-forest">{d.name}</figcaption>
            </figure>
          );
        })}
      </div>
      <a href="#products" className="cta mt-12">{INGREDIENT.cta} <span aria-hidden="true">→</span></a>
    </section>
  );
}
