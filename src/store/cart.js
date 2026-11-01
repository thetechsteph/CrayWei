import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PRODUCTS } from '../data/products';

// Storage can be unavailable (private mode, sandboxed frames): never let it break the cart.
const safe = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

/** items: { [productId]: quantity }. Prices live on the product, so they can be filled in later without touching saved carts. */
export const useCart = create(
  persist(
    (set) => ({
      items: {}, open: false,
      add: (id) => set((s) => ({ items: { ...s.items, [id]: (s.items[id] || 0) + 1 } })),
      setQty: (id, q) => set((s) => { const items = { ...s.items }; if (q <= 0) delete items[id]; else items[id] = Math.min(q, 99); return { items }; }),
      remove: (id) => set((s) => { const items = { ...s.items }; delete items[id]; return { items }; }),
      clear: () => set({ items: {} }),
      setOpen: (open) => set({ open }),
    }),
    { name: 'cray-wei-cart', storage: createJSONStorage(() => safe), partialize: (s) => ({ items: s.items }) },
  ),
);

export const selectCount = (s) => Object.values(s.items).reduce((a, b) => a + b, 0);
/** Subtotal only when every line has a price; otherwise null (shown as "to be confirmed"). */
export const subtotal = (items) => {
  let sum = 0;
  for (const [id, q] of Object.entries(items)) { const p = PRODUCTS.find((x) => x.id === id); if (!p || p.price == null) return null; sum += p.price * q; }
  return sum;
};
