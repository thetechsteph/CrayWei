// One place for the scroll length of the whole journey. TOTAL = timeline units; each unit is SVH_PER_UNIT viewport-heights of scroll.
export const TOTAL = 362;
export const SVH_PER_UNIT = 5.9;
export const HEIGHT_SVH = Math.round(100 + TOTAL * SVH_PER_UNIT);
export const unitTop = (u) => `${((u * SVH_PER_UNIT) / HEIGHT_SVH * 100).toFixed(2)}%`; // anchor position for a timeline unit
// Timeline landmarks (units)
export const UNITS = { discovery: 17, ingredient: 116, products: 214, overview: 305, invitation: 336 };
