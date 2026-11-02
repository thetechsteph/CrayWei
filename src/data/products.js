/** The Cray Wei range. Prices are in naira (₦). Edit here and the collection, the 3D packs and the cart all follow. */
export const PRODUCTS = [
  { id: 'whole-dried', n: 1, name: 'Whole dried crayfish', title: [['Whole', 'bold'], ['dried', 'bold'], ['crayfish', 'ital']],
    size: '250 g', price: 6500, imageKind: 'wholedried', unit: 224,
    description: 'Whole dried crayfish with a deep, smoky sweetness. Drop them into soups, stews and rice for instant depth.' },
  { id: 'ground', n: 2, name: 'Ground crayfish', title: [['Ground', 'bold'], ['crayfish', 'ital']],
    size: '200 g', price: 5500, imageKind: 'ground', unit: 250,
    description: 'Dried crayfish, ground fine. Stir it into egusi, okra soup and efo riro for rich, rounded flavour.' },
  { id: 'powder', n: 3, name: 'Crayfish powder', title: [['Crayfish', 'bold'], ['powder', 'ital']],
    size: '100 g', price: 3800, imageKind: 'powder', unit: 278,
    description: 'A fine, free-flowing powder for jollof, sauces and everyday seasoning. A little goes a long way.' },
];
export const TBC = 'On request';
export const formatPrice = (p) => (p == null ? TBC : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p));
export const formatSize = (s) => s ?? TBC;
