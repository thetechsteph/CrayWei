import { Fragment } from 'react';

// Scene 02 copy and layout. Each word sits in its own mask so it can rise into place on scroll.
// `box` positions the block (landscape → portrait); `cls` picks a type size; word classes pick weight/italic.
export const MOMENTS = [
  {
    id: 'm1', n: '01', label: 'The Creature', plain: 'Small creature. Remarkable character.',
    box: 'left-[5vw] top-[20svh] w-[52vw] portrait:left-[6vw] portrait:top-[13svh] portrait:w-[88vw]',
    lines: [
      { cls: 'fs-md', words: [['Small', 'light'], ['creature.', 'light']] },
      { cls: 'fs-md', words: [['Remarkable', 'bold'], ['character.', 'ital']] },
    ],
  },
  {
    id: 'm2', n: '02', label: 'The Habitat', plain: 'A world beneath the surface.',
    box: 'right-[5vw] top-[20svh] w-[50vw] text-right portrait:right-auto portrait:left-[6vw] portrait:top-auto portrait:bottom-[9svh] portrait:w-[88vw] portrait:text-left',
    lines: [
      { cls: 'fs-md', words: [['A', 'bold'], ['world', 'bold']] },
      { cls: 'fs-xl', words: [['beneath', 'ital']] },
      { cls: 'fs-md', words: [['the', 'light'], ['surface.', 'light']] },
    ],
  },
  {
    id: 'm3', n: '03', label: 'The Connection', plain: 'And every great meal has a story.',
    box: 'left-[5vw] bottom-[10svh] w-[62vw] portrait:left-[6vw] portrait:bottom-[8svh] portrait:w-[88vw]',
    lines: [
      { cls: 'fs-md', words: [['And', 'light'], ['every', 'light'], ['great', 'light'], ['meal', 'light']] },
      { cls: 'fs-md', words: [['has', 'light'], ['a', 'light']] },
      { cls: 'fs-xl', words: [['story.', 'ital']] },
    ],
  },
];

export function Headline({ lines, dark = false }) {
  return (
    <h2 aria-hidden="true" className={`disp mt-5 ${dark ? 'disp-dark' : ''}`}>
      {lines.map((ln, i) => (
        <span key={i} className={`block ${ln.cls}`}>
          {ln.words.map(([w, c], j) => (
            <Fragment key={j}>
              <span className="wm"><span className={`w inline-block ${c}`}>{w}</span></span>{' '}
            </Fragment>
          ))}
        </span>
      ))}
    </h2>
  );
}

const Label = ({ m }) => <p className="label">{m.n} — {m.label}</p>;

/** Pinned overlays, revealed by the master timeline. Hidden until their window (see .moment in CSS). */
export function Moments() {
  return (
    <>
      {MOMENTS.map((m) => (
        <div key={m.id} className={`moment ${m.id} pointer-events-none absolute inset-0 z-30`}>
          <div className={`absolute ${m.box}`}>
            <Label m={m} />
            <Headline lines={m.lines} />
          </div>
        </div>
      ))}
      <ol aria-hidden="true" className="pips absolute right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 text-[.62rem] tracking-[.2em] text-gold md:flex">
        {MOMENTS.map((m) => <li key={m.id} className={`pip pip-${m.id}`}>{m.n}</li>)}
      </ol>
    </>
  );
}

/** Reduced-motion version: the same story as ordinary, fully visible sections in normal flow. */
export function StaticMoments() {
  return (
    <div className="water">
      {MOMENTS.map((m) => (
        <section key={m.id} aria-label={m.label} className="relative flex min-h-svh flex-col justify-center px-[6vw] py-24">
          <Label m={m} />
          <Headline lines={m.lines} />
        </section>
      ))}
    </div>
  );
}
