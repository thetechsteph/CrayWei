import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { detectMode } from '../lib/device';
import { heroState } from '../lib/heroState';
import CrayfishPoster from '../components/CrayfishPoster';
import SceneBoundary from '../components/SceneBoundary';
import { HeroUI, HeroWords } from './Hero';
import { MOMENTS, Moments, StaticMoments } from './Discovery';
import { INGREDIENT, Ingredient, StaticIngredient } from './Ingredient';
import { Collection, StaticCollection } from './Collection';
import { INVITE, Invitation, StaticInvitation } from './Invitation';
import { HEIGHT_SVH, TOTAL, UNITS, unitTop } from '../lib/journeyConfig';
import { PRODUCTS } from '../data/products';

gsap.registerPlugin(ScrollTrigger);
// The whole 3D stack is a separate chunk: text and poster paint before it arrives.
const Scene = lazy(() => import('../components/three/Scene'));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scenes 01–03 share ONE pinned stage and ONE canvas. A single scrubbed GSAP timeline (0–100 = scroll progress in %)
 * drives the type; its progress is also published to the 3D camera rig via heroState.progress.
 *   0–16   Scene 01: the hero lets go (CRAY drifts up, WEI fills and drops)
 *   20–44  02 · The Creature     46–68  02 · The Habitat     70–90  02 · The Connection
 *   82–100 the ascent to the surface   100–106 break through; the glowing underside becomes a sunlit tabletop
 *   106–120 look down at the table   116–178 headline + dishes (egusi → okra + afang → efo riro + jollof)
 *   182–205 the connection: crayfish at the centre, dishes around it, CTA
 *   316–362 Scene 05: the table turns forest green, particles return, dish collage, FLAVOUR headline, CTAs
 *   206–217 the dishes fall away; placeholder products rise onto the table   214–286 one panel per product   296–315 the ledger
 */
export default function Journey() {
  const [mode, setMode] = useState(detectMode);
  const [err, setErr] = useState(null);
  const [ready, setReady] = useState(mode === 'static');
  const root = useRef(), journey = useRef(), stage = useRef();
  const [onScreen, setOnScreen] = useState(true);

  // Once the pinned stage has scrolled away (the footer is on screen), stop rendering the canvas entirely.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '120px' });
    io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  // Lets the product chips (and anything else) jump the page to a timeline unit.
  useEffect(() => {
    heroState.scrollToUnit = (u) => {
      const el = journey.current; if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY, dist = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + dist * (u / TOTAL), behavior: reduce ? 'auto' : 'smooth' });
    };
    return () => { heroState.scrollToUnit = null; };
  }, []);

  useLayoutEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.set('.cray-letter', { yPercent: 115 });
      gsap.set('.hero-weiblock', { yPercent: 115 });
      gsap.set('.fade-in', { autoAlpha: 0, y: 12 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: journey.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        onUpdate: () => { heroState.progress = tl.time() / 100; heroState.invalidate?.(); }, // progress: 0–1 = Scenes 01–02, 1–2.05 = Scene 03
      });

      // Scene 01 lets go
      tl.to('.hero-ui', { autoAlpha: 0, duration: 6 }, 0)
        .to('.hero-cray', { yPercent: -30, duration: 18 }, 0).to('.hero-cray', { autoAlpha: 0, duration: 8 }, 10)
        .to('.hero-wei', { yPercent: 20, duration: 18 }, 0).to('.hero-wei', { autoAlpha: 0, duration: 8 }, 10)
        .to('.hero-fill', { clipPath: 'inset(45% 0% 0% 0%)', duration: 14 }, 0);

      // Scene 02 moments: label slides in, words rise out of their masks, hold, then lift away
      const moment = (id, a, b) => {
        const sel = `.${id}`;
        tl.set(sel, { autoAlpha: 1 }, a)
          .fromTo(`${sel} .label`, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 3, ease: 'power2.out' }, a)
          .fromTo(`${sel} .w`, { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 5, stagger: 0.6, ease: 'power3.out' }, a + 1)
          .to(`${sel} .w`, { yPercent: -118, duration: 3, stagger: 0.2, ease: 'power2.in' }, b - 5)
          .to(`${sel} .label`, { autoAlpha: 0, duration: 2 }, b - 4)
          .set(sel, { autoAlpha: 0 }, b)
          .to(`.pip-${id}`, { opacity: 1, duration: 2 }, a)
          .to(`.pip-${id}`, { opacity: 0.3, duration: 2 }, b - 2);
      };
      tl.to('.pips', { autoAlpha: 1, duration: 3 }, 18).to('.pips', { autoAlpha: 0, duration: 3 }, 90);
      moment('m1', 20, 44); moment('m2', 46, 68); moment('m3', 70, 90);

      // Ending: the light takes over
      tl.fromTo('.sunwash', { opacity: 0 }, { opacity: 0.4, duration: 5, ease: 'power1.in' }, 95); // only the last breath of the climb; the surface itself does the work

      // Static-poster devices get a matching, simpler camera move so the story still travels
      tl.to('.poster-wrap', { scale: 1.45, yPercent: -3, duration: 24 }, 20)
        .to('.poster-wrap', { scale: 0.95, xPercent: -8, yPercent: 0, duration: 22 }, 46)
        .to('.poster-wrap', { scale: 1, xPercent: 0, duration: 16 }, 70)
        .to('.poster-wrap', { yPercent: 25, opacity: 0.4, duration: 14 }, 86);

      // ── Scene 03 · The Ingredient ───────────────────────────────────────────────
      // The kitchen colour fades in BEHIND the opaque, glowing surface (the 3D plane fills the frame), so there is no visible swap.
      tl.fromTo('.kitchen', { opacity: 0 }, { opacity: 1, duration: 4 }, 97)
        .to('.sunwash', { opacity: 0, duration: 10 }, 100)
        .to('.vignette', { opacity: 0.3, duration: 12 }, 100)
        .to('.poster-wrap', { opacity: 0, duration: 8 }, 100); // no-WebGL tier only

      // Photographs are revealed by a vertical wipe while the image inside settles from a tight crop; they leave by wiping off upward.
      const reveal = (sel, a, d = 7) => tl
        .fromTo(`${sel} .fr-clip`, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease: 'power2.inOut' }, a)
        .fromTo(`${sel} .fr-img`, { scale: 1.35 }, { scale: 1.04, duration: d + 18 }, a)
        .fromTo(`${sel} .fr-cap`, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 3, ease: 'power2.out' }, a + d - 2);
      const leave = (sel, a, d = 5) => tl
        .to(`${sel} .fr-clip`, { clipPath: 'inset(0% 0% 100% 0%)', duration: d, ease: 'power2.in' }, a)
        .to(`${sel} .fr-cap`, { autoAlpha: 0, duration: 2 }, a);

      tl.set('.m4', { autoAlpha: 1 }, 116)
        .fromTo('.m4 .label', { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 3, ease: 'power2.out' }, 116)
        .fromTo('.m4 .w', { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 5, stagger: 0.6, ease: 'power3.out' }, 117)
        .fromTo('.m4 .copy', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 5, ease: 'power2.out' }, 126);

      reveal('.fr-egusi', 120, 8);  leave('.fr-egusi', 137);            // 1 · egusi soup, close
      reveal('.fr-okra', 141);      reveal('.fr-afang', 145);           // 2 · okra + afang
      leave('.fr-okra', 157);       leave('.fr-afang', 158);
      reveal('.fr-efo', 161);       reveal('.fr-jollof', 165);          // 3 · efo riro + jollof
      leave('.fr-efo', 177);        leave('.fr-jollof', 178);

      tl.to('.ing-text', { autoAlpha: 0, y: -24, duration: 5 }, 178);

      // 4 · the connection: the ingredient at the centre, the dishes around it
      tl.fromTo('.connect', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 182)
        .fromTo('.cn-center', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 8, ease: 'power2.out' }, 182)
        .fromTo('.cn-center .fr-img', { scale: 1.3 }, { scale: 1, duration: 10 }, 182)
        .fromTo('.cn-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 8, stagger: 0.8, ease: 'power1.inOut' }, 185)
        .fromTo('.cn-node', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 5, stagger: 1.2, ease: 'back.out(1.4)' }, 188)
        .fromTo('.cn-label, .cn-name, .cn-note', { autoAlpha: 0 }, { autoAlpha: 1, duration: 3, stagger: 0.3 }, 194)
        .fromTo('.m4 .cta', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 4, ease: 'power2.out' }, 199);

      // ── Scene 04 · The Collection ───────────────────────────────────────────────
      // The dishes fall away toward the viewer and the crayfish circle shrinks off; in 3D the camera is already dropping to
      // table height and the placeholder products rise onto the same sunlit table.
      tl.to('.m4 .cta', { autoAlpha: 0, duration: 3 }, 206)
        .to('.cn-line', { strokeDashoffset: -1, duration: 6, stagger: 0.4, ease: 'power1.in' }, 206)
        .to('.cn-node', { scale: 1.25, autoAlpha: 0, duration: 8, stagger: 0.6, ease: 'power2.in' }, 206)
        .to('.cn-label, .cn-name, .cn-note', { autoAlpha: 0, duration: 3 }, 206)
        .to('.cn-center', { scale: 0.6, autoAlpha: 0, duration: 8, ease: 'power2.in' }, 208)
        .set('.m4', { autoAlpha: 0 }, 217);

      tl.set('.m5', { autoAlpha: 1 }, 208)
        .fromTo('.col-head', { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 4, ease: 'power2.out' }, 210)
        .fromTo('.col-nav', { autoAlpha: 0 }, { autoAlpha: 1, duration: 4 }, 216);

      // one panel per product: name rises word by word, then description / weight / price / add-to-cart settle in
      const product = (n, a, b) => {
        const sel = `.pd-${n}`;
        tl.set(sel, { autoAlpha: 1 }, a)
          .fromTo(`${sel} .w`, { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 5, stagger: 0.5, ease: 'power3.out' }, a)
          .fromTo(`${sel} .pd-rest`, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 5, stagger: 0.6, ease: 'power2.out' }, a + 3)
          .to(`${sel} .w`, { yPercent: -118, duration: 3, stagger: 0.2, ease: 'power2.in' }, b - 5)
          .to(`${sel} .pd-rest`, { autoAlpha: 0, duration: 3 }, b - 5)
          .set(sel, { autoAlpha: 0 }, b)
          .to(`.chip-${n}`, { opacity: 1, duration: 2 }, a).to(`.chip-${n}`, { opacity: 0.35, duration: 2 }, b - 2);
        if (root.current.querySelector(`.fr-pd-${n}`)) { reveal(`.fr-pd-${n}`, a, 7); leave(`.fr-pd-${n}`, b - 5); } // flat photo for the no-WebGL tier
      };
      product(1, 214, 234); product(2, 242, 260); product(3, 270, 286);

      // the whole collection: a ledger (not cards), every line with its own add-to-cart
      tl.set('.ledger', { autoAlpha: 1 }, 296)
        .fromTo('.ledger .w', { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 5, stagger: 0.5, ease: 'power3.out' }, 296)
        .fromTo('.ledger .lg-row', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 5, stagger: 1, ease: 'power2.out' }, 299)
        .fromTo('.ledger .lg-foot', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 4, ease: 'power2.out' }, 305)
        .to('.chip-all', { opacity: 1, duration: 2 }, 296);

      // ── Scene 05 · The Invitation ───────────────────────────────────────────────
      // The ledger lifts away and the products sink off the table (3D). The table turns deep forest green under golden dappled light,
      // the Scene 01 particles return, and the dish photographs take over the frame, then the headline and the two ways forward.
      tl.to('.ledger .w', { yPercent: -118, duration: 3, stagger: 0.2, ease: 'power2.in' }, 316)
        .to('.ledger .lg-row, .ledger .lg-foot', { autoAlpha: 0, duration: 4, stagger: 0.5 }, 316)
        .to('.col-head, .col-nav', { autoAlpha: 0, duration: 4 }, 316)
        .set('.m5', { autoAlpha: 0 }, 326);
      tl.fromTo('.invite-bg', { opacity: 0 }, { opacity: 1, duration: 20 }, 320)
        .to('.vignette', { opacity: 0.75, duration: 14 }, 326);

      tl.set('.m6', { autoAlpha: 1 }, 328);
      reveal('.fr-iv-egusi', 330, 8); reveal('.fr-iv-jollof', 334, 8); reveal('.fr-iv-okra', 338, 8); reveal('.fr-iv-afang', 342, 8);
      tl.fromTo('.m6 .label', { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 3, ease: 'power2.out' }, 336)
        .fromTo('.m6 .w', { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 5, stagger: 0.7, ease: 'power3.out' }, 337)
        .fromTo('.m6 .iv-copy', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 5, ease: 'power2.out' }, 347)
        .fromTo('.m6 .iv-cta', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 4, stagger: 0.8, ease: 'power2.out' }, 352);

      tl.set({}, {}, TOTAL);
    }, root);
    return () => ctx.revert();
  }, []);

  // Pointer parallax for the two hero words (desktop only)
  useEffect(() => {
    if (reduce || !matchMedia('(pointer: fine)').matches) return;
    const cx = gsap.quickTo('.hero-cray', 'x', { duration: 1.2, ease: 'power3' });
    const wx = gsap.quickTo('.hero-wei', 'x', { duration: 1.2, ease: 'power3' });
    const move = (e) => {
      heroState.px = (e.clientX / innerWidth) * 2 - 1;
      heroState.py = (e.clientY / innerHeight) * 2 - 1;
      cx(heroState.px * -18); wx(heroState.px * 26); heroState.invalidate?.();
    };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, []);

  // Intro plays once the 3D scene has drawn its first frame (or after a short timeout)
  useEffect(() => { const t = setTimeout(() => setReady(true), 3500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!ready || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.cray-letter', { yPercent: 0, duration: 1.4, stagger: 0.09 })
      .to('.hero-weiblock', { yPercent: 0, duration: 1.5 }, '-=1.1')
      .to('.fade-in', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, '-=0.8');
    return () => tl.kill();
  }, [ready]);

  return (
    <section ref={root} aria-label="The journey" id="introduction">
      {/* Real headings for assistive tech: the animated copy is hidden from it */}
      <div className="sr-only">
        {MOMENTS.map((m) => <h2 key={m.id}>{m.plain}</h2>)}
        <h2>{INGREDIENT.plain}</h2>
        <h2>The Collection: {PRODUCTS.map((p) => p.name).join(', ')}</h2>
        <h2>{INVITE.plain}</h2>
      </div>

      <div ref={journey} className="relative" style={reduce ? undefined : { height: `${HEIGHT_SVH}svh` }}>
        {!reduce && <span id="discovery" aria-hidden="true" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: unitTop(UNITS.discovery) }} />}
        {!reduce && <span id="ingredient" aria-hidden="true" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: unitTop(UNITS.ingredient) }} />}
        {!reduce && <span id="products" aria-hidden="true" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: unitTop(UNITS.products) }} />}
        {!reduce && <span id="invitation" aria-hidden="true" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: unitTop(UNITS.invitation) }} />}
        <div ref={stage} className={`isolate w-full overflow-hidden ${reduce ? 'relative h-svh' : 'sticky top-0 h-svh'}`}>
          <div className="water absolute inset-0" />
          <div className="kitchen absolute inset-0 opacity-0" />
          <div className="invite-bg absolute inset-0 opacity-0" />
          <HeroWords />
          {!reduce && <><Moments /><Ingredient /><Collection flat={mode === 'static'} /><Invitation /></>}

          {/* The animal: ONE canvas for the whole journey */}
          <div className="absolute inset-0 z-20">
            <div className="poster-wrap absolute inset-0">
              {mode === 'static' && (
                <CrayfishPoster className="absolute left-1/2 top-[52%] w-[min(120vw,1500px)] -translate-x-1/2 -translate-y-1/2 portrait:w-[170vw] portrait:-rotate-[62deg]" />
              )}
            </div>
            {mode !== 'static' && (
              <SceneBoundary onError={(e) => { setErr(e); setMode('static'); }}>
                <Suspense fallback={null}>
                  <Scene key={mode} mode={mode} paused={!onScreen} onReady={() => setReady(true)} onLowPerf={() => setMode((m) => (m === 'full' ? 'lite' : 'still'))} />
                </Suspense>
              </SceneBoundary>
            )}
          </div>

          <div className="sunwash pointer-events-none absolute inset-0 z-[33] opacity-0" />
          <div className="vignette pointer-events-none absolute inset-0 z-[35]" />
          <div className="grain pointer-events-none absolute inset-0 z-[36]" />
          {err && <p role="status" className="absolute left-4 top-16 z-50 max-w-[80vw] text-xs text-shell/70">3D could not start ({String(err.message || err).slice(0, 120)}) — showing the illustration instead.</p>}
          <HeroUI />
        </div>
      </div>

      {reduce && <><StaticMoments /><StaticIngredient /><StaticCollection /><StaticInvitation /></>}
    </section>
  );
}
