import { useEffect, useRef } from 'react';
import { BRAND } from '../../data/brand';
import { PRODUCTS, TBC, formatPrice } from '../../data/products';
import { selectCount, subtotal, useCart } from '../../store/cart';

/** Slide-over cart. Functional (add, change quantity, remove, persists); checkout is intentionally NOT built yet. */
export default function CartDrawer() {
  const { open, items, setOpen, setQty, remove } = useCart();
  const count = useCart(selectCount);
  const panel = useRef(), closeBtn = useRef(), opener = useRef(null);
  const lines = PRODUCTS.filter((p) => items[p.id] > 0);
  const sub = subtotal(items);
  const orderBody = lines.map((p) => `${items[p.id]} × ${p.name} (${p.size})${p.price == null ? '' : ` — ${formatPrice(p.price * items[p.id])}`}`).join('\n') + (sub == null ? '' : `\n\nTotal: ${formatPrice(sub)}`) + '\n\nName:\nDelivery address:\n';
  const orderHref = BRAND.contact.email ? `mailto:${BRAND.contact.email}?subject=${encodeURIComponent('Cray Wei order')}&body=${encodeURIComponent(orderBody)}` : undefined;

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    closeBtn.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') return setOpen(false);
      if (e.key !== 'Tab') return;
      const f = panel.current.querySelectorAll('button:not([disabled]), a[href]');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); opener.current?.focus?.(); };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-cocoa/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        ref={panel} role="dialog" aria-modal="true" aria-label="Shopping cart" inert={!open}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-shell text-cocoa shadow-2xl transition-transform duration-500 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-cocoa/10 px-6 py-5">
          <h2 className="font-display text-2xl italic text-forest">Your cart <span className="text-base not-italic text-cocoa/60">({count})</span></h2>
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="text-[.7rem] uppercase tracking-[.22em] hover:text-crayfish">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className="mt-10 font-display text-xl italic text-cocoa/60">Nothing here yet.</p>
          ) : (
            <ul className="divide-y divide-cocoa/10">
              {lines.map((p) => (
                <li key={p.id} className="py-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-lg text-forest">{p.name}</p>
                    <p className="whitespace-nowrap text-sm text-cocoa/70">{formatPrice(p.price == null ? null : p.price * items[p.id])}</p>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[.16em] text-cocoa/50">{p.size}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-cocoa/20">
                      <button type="button" aria-label={`Decrease quantity of ${p.name}`} onClick={() => setQty(p.id, items[p.id] - 1)} className="h-9 w-9 hover:bg-cocoa/5">−</button>
                      <span className="w-9 text-center text-sm" aria-live="polite">{items[p.id]}</span>
                      <button type="button" aria-label={`Increase quantity of ${p.name}`} onClick={() => setQty(p.id, items[p.id] + 1)} className="h-9 w-9 hover:bg-cocoa/5">+</button>
                    </div>
                    <button type="button" onClick={() => remove(p.id)} className="text-xs uppercase tracking-[.16em] text-cocoa/60 underline-offset-4 hover:text-crayfish hover:underline">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-cocoa/10 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[.2em]">Subtotal</span>
            <span className="font-display text-lg">{lines.length === 0 ? '—' : sub == null ? TBC : formatPrice(sub)}</span>
          </div>
          {lines.length > 0 && orderHref ? (
            <a href={orderHref} className="btn mt-4 block w-full text-center"><span>Send order request</span></a>
          ) : (
            <button type="button" disabled className="mt-4 w-full cursor-not-allowed rounded-full bg-cocoa/15 py-3 text-xs uppercase tracking-[.22em] text-cocoa/50">Send order request</button>
          )}
          <p className="mt-3 text-xs leading-relaxed text-cocoa/55">Your order opens as an email to us. We reply to confirm delivery and payment.</p>
        </div>
      </aside>
    </div>
  );
}
