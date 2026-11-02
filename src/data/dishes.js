import egusi from '../assets/food/egusi-soup.jpeg';
import okra from '../assets/food/okra-soup.jpeg';
import afang from '../assets/food/afang-soup.jpeg';
import efo from '../assets/food/efo-riro.jpeg';
import jollof from '../assets/food/jollof-rice.jpeg';
import abacha from '../assets/food/abacha.jpeg';
import crayfish from '../assets/food/crayfish-ingredient.jpeg';

// Dish photography lives in src/assets/food. Swap a file (same name) or change an import to update it everywhere it appears.
export const DISHES = {
  egusi:  { name: 'Egusi soup',  alt: 'A pot of egusi soup',                 src: egusi },
  okra:   { name: 'Okra soup',   alt: 'A bowl of okra soup',                 src: okra },
  afang:  { name: 'Afang soup',  alt: 'A bowl of afang soup',                src: afang },
  efo:    { name: 'Efo riro',    alt: 'A bowl of efo riro',                  src: efo },
  jollof: { name: 'Jollof rice', alt: 'A bowl of Nigerian jollof rice',      src: jollof },
  abacha: { name: 'Abacha',      alt: 'Abacha served with fish',             src: abacha },
};

// The ingredient itself, for the centre of the connection moment.
export const CRAYFISH_IMAGE = { name: 'Crayfish', alt: 'Crayfish, the ingredient', src: crayfish };
