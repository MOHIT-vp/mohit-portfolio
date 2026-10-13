import { useEffect, useRef } from 'react';
import { profile, socials } from '../content/site';
import { reducedMotion } from '../lib/env';
import { goTo, gsap } from '../lib/motion';

/** The monogram, as wide as the screen, stretching up out of the floor as the page ends. */
export function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.footer__word', { scaleY: 0.2 }, {
        scaleY: 1, ease: 'none', transformOrigin: '50% 100%',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer" ref={root}>
      <div className="wrap footer__bar">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <ul className="footer__links">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <a href="#top" onClick={(e) => { e.preventDefault(); goTo('#top'); }}>
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
      <svg className="footer__word" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="footer-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff4e4" />
            <stop offset="1" stopColor="#f4d2ac" />
          </linearGradient>
        </defs>
        <text x="4" y="396" textLength="992" lengthAdjust="spacingAndGlyphs" fill="url(#footer-fill)">
          {profile.monogram}
        </text>
      </svg>
    </footer>
  );
}
