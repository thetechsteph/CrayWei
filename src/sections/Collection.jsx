import { useMemo } from 'react';
import AddToCart from '../components/ui/AddToCart';
import { COLLECTION_NOTE, PRODUCTS, TBC, formatPrice, formatSize } from '../data/products';
import { heroState } from '../lib/heroState';
import { makePlaceholder } from '../lib/placeholderFood';
import { useCart, selectCount } from '../store/cart';
import { Headline } from './Discovery';

// Scene 04 · The Collection. Product data is placeholder (see data/products.js). Nothing here states a price, weight or claim.
const LABEL = '04 / 05 — The Collection';
const OVERVIEW_UNIT = 305;
const go = (u) => heroState.scrollToUnit?.(u);
const titleLines = (p) => [{ cls: 'fs-pd', words: p.title }];

function Meta({ p }) {
  return (
    <dl className="pd-meta">
      <div><dt>Weight</dt><dd>{formatSize(p.size)}</dd></div>
      <div><dt>Price</dt><dd>{formatPrice(p.price)}</dd></div>
    </dl>
  );
}

/** Pinned overlay driven by the master timeline: one panel per product (the camera glides along the 3D row), then a ledger of all three. */
export function Collection({ flat }) {
  const count = useCart(selectCount);
  const setOpen = useCart((s) => s.setOpen);
  const imgs = useMemo(() => (flat ? PRODUCTS.map((p) => makePlaceholder(p.imageKind)) : []), [flat]);
  return (
    <div className="moment m5 pointer-events-none absolute inset-0 z-30">
      <div className="col-head">
        <p className="label label-dark">{LABEL}</p>
        <p className="mt-2 text-[.62rem] uppercase tracking-[.16em] text-cocoa/55">{COLLECTION_NOTE}</p>
      </div>

      <nav className="col-nav" aria-label="Products">
        {PRODUCTS.map((p) => <button key={p.id} type="button" className={`chip chip-${p.n}`} onClick={() => go(p.unit)} aria-label={`Show ${p.name}`}>0{p.n}</button>)}
        <button type="button" className="chip chip-all" onClick={() => go(OVERVIEW_UNIT)}>All</button>
      </nav>

      {PRODUCTS.map((p) => (
        <div key={p.id} className={`pd pd-${p.n}`}>
          <p className="pd-idx">0{p.n} / 03</p>
          <Headline lines={titleLines(p)} dark />
          <p className="pd-rest pd-desc">{p.description}{p.descriptionIsPlaceholder && <span className="ph-inline">Placeholder copy</span>}</p>
          <div className="pd-rest"><Meta p={p} /></div>
          <div className="pd-rest pd-act"><AddToCart id={p.id} name={p.name} /></div>
        </div>
      ))}

      {flat && PRODUCTS.map((p, i) => (
        <figure key={p.id} className={`fr fr-pd fr-pd-${p.n}`}>
          <div className="fr-clip">
            <img className="fr-img" src={imgs[i]} alt={`${p.name} (placeholder image)`} />
            <span className="ph-tag">Placeholder · product image</span>
          </div>
        </figure>
      ))}

      <div className="ledger">
        <Headline lines={[{ cls: 'fs-sm', words: [['The', 'light'], ['collection.', 'ital']] }]} dark />
        <ul className="mt-6">
          {PRODUCTS.map((p) => (
            <li key={p.id} className="lg-row">
              <span className="lg-n">0{p.n}</span>
              <span className="lg-name">{p.name}<small>{formatSize(p.size)}</small></span>
              <span className="lg-price">{p.price == null ? 'Price TBC' : formatPrice(p.price)}</span>
              <AddToCart id={p.id} name={p.name} label="Add" className="btn-sm" />
            </li>
          ))}
        </ul>
        <div className="lg-foot">
          <button type="button" className="cta pointer-events-auto" onClick={() => setOpen(true)}>View cart ({count}) <span aria-hidden="true">→</span></button>
          <p className="mt-3 text-[.62rem] uppercase tracking-[.14em] text-cocoa/55">{COLLECTION_NOTE} · {TBC} · checkout not built yet</p>
        </div>
      </div>
    </div>
  );
}

/** Reduced-motion version: ordinary section with the same content and a working cart. */
export function StaticCollection() {
  const imgs = useMemo(() => PRODUCTS.map((p) => makePlaceholder(p.imageKind)), []);
  return (
    <section id="products" aria-label="The Collection" className="kitchen relative px-[6vw] py-24">
      <p className="label label-dark">{LABEL}</p>
      <p className="mt-2 text-[.62rem] uppercase tracking-[.16em] text-cocoa/55">{COLLECTION_NOTE}</p>
      <Headline lines={[{ cls: 'fs-ing', words: [['The', 'light'], ['collection.', 'ital']] }]} dark />
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <article key={p.id}>
            <div className="relative aspect-[4/5] overflow-hidden"><img src={imgs[i]} alt={`${p.name} (placeholder image)`} loading="lazy" className="fr-img" /><span className="ph-tag">Placeholder · product image</span></div>
            <h3 className="mt-4 font-display text-2xl italic text-forest">{p.name}</h3>
            <p className="mt-1 text-sm text-cocoa/80">{p.description}</p>
            <div className="mt-4"><Meta p={p} /></div>
            <div className="mt-5"><AddToCart id={p.id} name={p.name} /></div>
          </article>
        ))}
      </div>
    </section>
  );
}
