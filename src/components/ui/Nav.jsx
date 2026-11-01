import { useEffect, useState } from 'react';
import { selectCount, useCart } from '../../store/cart';

const SCENES = ['The Entrance', 'The Discovery', 'The Ingredient', 'The Collection', 'The Invitation'];
const HREFS = ['#introduction', '#discovery', '#ingredient', '#products', '#invitation'];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const count = useCart(selectCount);
  const openCart = useCart((c) => c.setOpen);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10">
      <a href="#main" className="font-display text-lg italic tracking-tight text-shell" aria-label="Cray Wei, home">Cray Wei</a>
      <nav aria-label="Primary" className="flex items-center gap-6 text-[.7rem] uppercase tracking-[.22em]">
        <button type="button" onClick={() => openCart(true)} aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`} className="text-shell/80 transition-colors hover:text-gold">Cart (<span key={count} className="pop inline-block">{count}</span>)</button>
        <button type="button" aria-expanded={open} aria-controls="menu-panel" onClick={() => setOpen((o) => !o)} className="text-shell transition-colors hover:text-gold">
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>
      {open && (
        <div id="menu-panel" role="dialog" aria-label="Story scenes" className="fixed inset-0 -z-10 flex flex-col justify-center bg-forest/95 px-6 backdrop-blur-sm md:px-16">
          <ol className="font-display text-4xl leading-[1.15] md:text-6xl">
            {SCENES.map((s, i) => (
              <li key={s} className="text-gold">
                <span className="mr-4 text-sm tracking-[.2em] align-middle">0{i + 1}</span>
                <a href={HREFS[i]} onClick={() => setOpen(false)}>{s}</a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </header>
  );
}
