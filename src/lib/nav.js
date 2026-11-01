import { heroState } from './heroState';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/**
 * onClick handler that jumps the pinned journey to a timeline unit (smooth, scrubbed). With reduced motion there is no pinned
 * journey, so the link's normal #anchor behaviour is left alone. Always give the <a> a real href as the fallback.
 */
export const jump = (unit) => (e) => {
  if (reduce || !heroState.scrollToUnit) return;
  e.preventDefault();
  heroState.scrollToUnit(unit);
};
