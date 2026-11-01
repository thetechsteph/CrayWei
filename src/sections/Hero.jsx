// Scene 01 layers (presentational). Behaviour — intro, scroll, parallax — lives in Journey.jsx.
// Layer order inside the stage: CRAY (z-10) → animal (z-20) → WEI (z-30), so the claws pass between the words.

export function HeroWords() {
  return (
    <h1 className="contents">
      <span className="sr-only">Cray Wei</span>
      <span aria-hidden="true" className="hero-cray absolute left-[3vw] top-[10svh] z-10 block portrait:top-[12svh]">
        <span className="mask word word-cray">
          {'CRAY'.split('').map((c, i) => <span key={i} className="cray-letter inline-block">{c}</span>)}
        </span>
      </span>
      <span aria-hidden="true" className="hero-wei absolute right-[3vw] bottom-[8svh] z-30 block portrait:bottom-[17svh]">
        <span className="mask">
          <span className="hero-weiblock relative block">
            <span className="word word-wei block pr-[.06em]">WEI</span>
            <span className="hero-fill word word-wei word-wei-fill absolute inset-0 block pr-[.06em]">WEI</span>
          </span>
        </span>
      </span>
    </h1>
  );
}

export function HeroUI() {
  return (
    <div className="hero-ui pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-10">
      <div className="fade-in max-w-[15rem] text-shell">
        <p className="text-[.68rem] uppercase tracking-[.24em] text-gold">01 / 05 — The Entrance</p>
        {/* PLACEHOLDER COPY — to be replaced with approved brand copy */}
        <p className="mt-3 font-display text-lg italic leading-snug md:text-xl">Crayfish, from the water to the table.</p>
      </div>
      <div className="cue fade-in flex flex-col items-center gap-3 text-[.62rem] uppercase tracking-[.3em] text-shell/80">
        <span style={{ writingMode: 'vertical-rl' }}>Scroll to dive</span>
        <span className="cue-line block h-12 w-px bg-gold" />
      </div>
    </div>
  );
}
