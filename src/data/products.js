/**
 * ⚠ PLACEHOLDER PRODUCTS — categories are PROPOSED, not confirmed inventory.
 * Nothing below is real product data: no prices, weights, specifications, sourcing or certifications have been provided.
 * To go live, fill in `size` (e.g. '500 g') and `price` (a number, in naira) for each product and replace the description.
 * Empty `size` / `price` render as "To be confirmed"; the cart handles both cases.
 */
export const PRODUCTS = [
  { id: 'whole-dried', n: 1, name: 'Whole dried crayfish', title: [['Whole', 'bold'], ['dried', 'bold'], ['crayfish', 'ital']],
    size: null, price: null, description: 'Crayfish, dried and kept whole.', descriptionIsPlaceholder: true, imageKind: 'wholedried', unit: 224 },
  { id: 'ground', n: 2, name: 'Ground crayfish', title: [['Ground', 'bold'], ['crayfish', 'ital']],
    size: null, price: null, description: 'Crayfish, ground.', descriptionIsPlaceholder: true, imageKind: 'ground', unit: 250 },
  { id: 'powder', n: 3, name: 'Crayfish powder', title: [['Crayfish', 'bold'], ['powder', 'ital']],
    size: null, price: null, description: 'Crayfish, as a fine powder.', descriptionIsPlaceholder: true, imageKind: 'powder', unit: 278 },
];
export const COLLECTION_NOTE = 'Proposed categories · placeholder products';
export const TBC = 'To be confirmed';
export const formatPrice = (p) => (p == null ? TBC : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p));
export const formatSize = (s) => s ?? TBC;
