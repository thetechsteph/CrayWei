import { BRAND } from '../data/brand';
import { UNITS } from '../lib/journeyConfig';
import { jump } from '../lib/nav';

const year = new Date().getFullYear();

function Contact({ label, value, href }) {
  return (
    <li>
      <span className="foot-k">{label}</span>
      {href ? <a href={href} className="foot-link">{value}</a> : <span>{value}</span>}
    </li>
  );
}

/** Footer: normal page content after the pinned journey. Details come from data/brand.js. */
export default function Footer() {
  const { contact, social } = BRAND;
  return (
    <footer className="foot" aria-labelledby="foot-brand">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-[6vw] py-16 md:grid-cols-[1.4fr_1fr_1.2fr_1fr] md:gap-10">
        <div>
          <p id="foot-brand" className="font-display text-3xl italic text-shell">{BRAND.name}</p>
          <p className="mt-4 max-w-[18rem] leading-relaxed text-shell/80">{BRAND.description}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="foot-h">Explore</h2>
          <ul className="mt-4 space-y-3">
            <li><a href="#products" onClick={jump(UNITS.overview)} className="foot-link">Shop</a></li>
            <li><a href={BRAND.storyTarget} onClick={jump(0)} className="foot-link">Our story</a></li>
            <li><a href="#contact" className="foot-link">Contact</a></li>
          </ul>
        </nav>

        <div id="contact" className="scroll-mt-24">
          <h2 className="foot-h">Contact</h2>
          <ul className="mt-4 space-y-3">
            {contact.email && <Contact label="Email" value={contact.email} href={`mailto:${contact.email}`} />}
            {contact.phone && <Contact label="Phone" value={contact.phone} href={`tel:${contact.phone.replace(/\s/g, '')}`} />}
            {contact.location && <Contact label="Location" value={contact.location} />}
          </ul>
        </div>

        <div>
          <h2 className="foot-h">Follow</h2>
          <ul className="mt-4 space-y-3">
            {social.map((s) => (
              <li key={s.name}>
                {s.url
                  ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="foot-link">{s.name}<span className="sr-only"> (opens in a new tab)</span></a>
                  : <span className="text-shell/60">{s.name}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-shell/15">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-4 px-[6vw] py-6 text-[.7rem] uppercase tracking-[.18em] text-shell/70">
          <p>© {year} {BRAND.name}. All rights reserved.</p>
          <a href="#introduction" onClick={jump(0)} className="foot-link">Back to the start ↑</a>
        </div>
      </div>
    </footer>
  );
}
