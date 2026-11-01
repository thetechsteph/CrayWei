// Shared, non-reactive state: GSAP/DOM writes it, the R3F render loop reads it.
// progress: 0–1 = Scenes 01–02, 1–1.5 = Scene 03. detail: close-up weight. surface: 0–1 ascent toward the surface.
// cream: the underside of the surface warming toward table colour. food: 0–1 the kitchen taking over.
// shelf: 0–1 the product row rising onto the table (Scene 04). scrollToUnit(u): jump the page to a timeline unit.
// shelfOut: products sinking away; invite: 0–1 the table turning deep forest green (Scene 05).
// cray: the live crayfish group (set by the model). still/invalidate: used by the 'still' render tier.
export const heroState = { progress: 0, px: 0, py: 0, detail: 0, surface: 0, cream: 0, food: 0, shelf: 0, shelfOut: 0, invite: 0, cray: null, still: false, invalidate: null, scrollToUnit: null };
