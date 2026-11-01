import { DISHES } from '../data/dishes';
import { BRAND } from '../data/brand';
import { UNITS } from '../lib/journeyConfig';
import { jump } from '../lib/nav';
import { Headline } from './Discovery';
import { Tag, altOf, useImages } from './Ingredient';

// Scene 05 · The Invitation — copy as supplied; no claims added.
export const INVITE = {
  label: '05 / 05 — The Invitation',
  plain: 'Bring the flavour home.',
  copy: 'From the freshwater to your favourite Nigerian dishes, Cray Wei brings the ingredient closer to your kitchen.',
  primary: 'Explore Cray Wei',
  secondary: 'Our story',
  lines: [
    { cls: 'fs-sm', words: [['Bring', 'light'], ['the', 'light']] },
    { cls: 'fs-flavour', words: [['Flavour', 'flav']] },
    { cls: 'fs-md', words: [['Home.', 'soft']] },
  ],
};
const PHOTOS = ['egusi', 'jollof', 'okra', 'afang'];

function Ctas({ cls = '' }) {
  return (
    <div className={`iv-ctas ${cls}`}>
      {/* Back to Scene 04: lands on the full collection (every product, with Add to cart). Checkout does not exist yet. */}
      <a href="#products" onClick={jump(UNITS.overview)} className="btn btn-gold iv-cta"><span>{INVITE.primary} <span aria-hidden="true">→</span></span></a>
      <a href={BRAND.storyTarget} onClick={jump(0)} className="link-under iv-cta">{INVITE.secondary}</a>
    </div>
  );
}

/** Pinned overlay driven by the master timeline: four dish photographs, then the headline with FLAVOUR dominant, then the CTAs. */
export function Invitation() {
  const img = useImages();
  return (
    <div className="moment m6 pointer-events-none absolute inset-0 z-30">
      {PHOTOS.map((id, i) => {
        const d = DISHES[id], im = img[id];
        return (
          <figure key={id} className={`fr fr-iv fr-iv-${id}`}>
            <div className="fr-clip">
              <img className="fr-img" src={im.url} alt={altOf(d, im.placeholder)} loading="lazy" decoding="async" />
              {im.placeholder && <Tag d={d} />}
            </div>
            <figcaption className="fr-cap fr-cap-light"><span>0{i + 1}</span> {d.name}</figcaption>
          </figure>
        );
      })}
      <div className="iv-text">
        <p className="label">{INVITE.label}</p>
        <Headline lines={INVITE.lines} />
        <p className="iv-copy">{INVITE.copy}</p>
        <Ctas />
      </div>
    </div>
  );
}

/** Reduced-motion version: ordinary section on forest green, same content, working links. */
export function StaticInvitation() {
  const img = useImages();
  return (
    <section id="invitation" aria-label="The Invitation" className="forest-deep relative px-[6vw] py-24">
      <p className="label">{INVITE.label}</p>
      <Headline lines={INVITE.lines} />
      <p className="mt-6 max-w-[34rem] leading-relaxed text-shell/85">{INVITE.copy}</p>
      <Ctas cls="mt-8" />
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {PHOTOS.map((id) => {
          const d = DISHES[id], im = img[id];
          return (
            <figure key={id}>
              <div className="relative aspect-[4/5] overflow-hidden"><img src={im.url} alt={altOf(d, im.placeholder)} loading="lazy" className="fr-img" />{im.placeholder && <Tag d={d} />}</div>
              <figcaption className="mt-2 text-sm text-shell/80">{d.name}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
