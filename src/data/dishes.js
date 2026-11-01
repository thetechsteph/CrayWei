/**
 * ⚠ TEMPORARY PLACEHOLDERS — NO REAL FOOD PHOTOGRAPHY YET.
 * Each dish below renders a generated colour/texture study with a visible "Placeholder" tag.
 * To use real, properly licensed photography: put the file in /public/food/ and set `src` (e.g. '/food/egusi-soup.jpg').
 * The tag disappears automatically once `src` is set. Frames crop with object-fit: cover, so any aspect ratio works;
 * portrait-oriented, close-up, top-down or 45° shots with warm natural light will crop best.
 */
export const DISHES = {
  egusi:  { name: 'Egusi soup',  alt: 'Egusi soup', file: '/food/egusi-soup.jpeg',  src: '/public/food/egusi-soup.jpeg'
    
   },
  okra:   { name: 'Okra soup',   alt: 'Okra soup', file: '/food/okra-soup.jpeg',   src: '/public/food/okra-soup.jpeg' },
  afang:  { name: 'Afang soup',  alt: 'Afang soup', file: '/food/afang-soup.jpeg',  src: '/public/food/afang-soup.jpeg' },
  efo:    { name: 'Efo riro',    alt: 'Efo riro', file: '/food/efo-riro.jpeg',    src: '/public/food/efo-riro.jpeg' },
  jollof: { name: 'Jollof rice', alt: 'Nigerian jollof rice', file: '/food/jollof-rice.jpeg', src: '/public/food/jollof-rice.jpeg' },
  // Optional extra visual used only in the final "connection" moment
  abacha: { name: 'Abacha',      alt: 'Abacha', file: '/food/abacha.jpeg',      src: '/public/food/abacha.jpeg' },
};

// The ingredient itself, for the final moment. Replace with a real photograph of the crayfish product/ingredient.
export const CRAYFISH_IMAGE = { name: 'Crayfish', alt: 'Crayfish, the ingredient', file: '/food/crayfish-ingredient.jpeg', src: '/public/food/crayfish-ingredient.jpeg' };
