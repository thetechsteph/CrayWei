// Decides how much 3D this device gets:
//   full   – everything
//   lite   – cheaper materials, fewer particles, lower resolution
//   still  – the same 3D scene, rendered only when the scroll position changes (reduced motion, very weak GPUs)
//   static – vector poster. Only when WebGL is unavailable.
// Override for testing with ?mode=full|lite|still|static
export function detectMode() {
  const forced = new URLSearchParams(location.search).get('mode');
  if (['full', 'lite', 'still', 'static'].includes(forced)) return forced;

  let gl = false;
  try {
    const c = document.createElement('canvas');
    gl = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { gl = false; }
  if (!gl) return 'static';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'still';

  const mem = navigator.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 768;
  if (navigator.connection?.saveData || mem <= 1 || cores <= 2) return 'lite';
  return coarse || (mem <= 4 && cores <= 4) ? 'lite' : 'full';
}
