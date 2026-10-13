import { useEffect, useRef, useState } from 'react';
import { hero, labels } from '../content/site';
import { HeroReveal } from '../components/HeroReveal';
import { reducedMotion } from '../lib/env';
import { goTo, gsap } from '../lib/motion';

/**
 * The supplied hero, built as independent planes:
 *   smoke (back) · giant word · figure · front smoke · reveal · copy
 * The stage holds for one screen while the dive panel rises over it; each plane
 * moves at its own rate and the whole stage dims, so the cover reads as depth.
 */
export function Hero() {
  const runway = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [tag, setTag] = useState(hero.tags.length - 1);

  // the underline under DESIGN · CODE · IDEAS walks across the three words
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => !document.hidden && setTag((t) => (t + 1) % hero.tags.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = runway.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      // if the intro curtain is up, enter as it lifts rather than behind it
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: document.querySelector('.intro') ? 1.3 : 0.1 });
      intro
        .from('.hero__figure', { yPercent: 8, opacity: 0, duration: 1.6 })
        .from('.hero__word', { yPercent: 30, opacity: 0, duration: 1.4 }, 0.15)
        .from('.hero__copy > *', { y: 24, opacity: 0, duration: 1, stagger: 0.07 }, 0.3)
        .from('.hero__tags', { opacity: 0, duration: 1 }, 0.6);

      const st = { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true };
      gsap.to('.hero__bg', { scale: 1.08, yPercent: -4, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__word', { yPercent: -22, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__figure', { yPercent: -7, scale: 1.04, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: st });
      gsap.to('.hero__front', { yPercent: -40, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__copy, .hero__tags', { y: () => (window.innerWidth < 761 ? -24 : -80), opacity: 0, ease: 'none', scrollTrigger: { ...st, end: 'center top', invalidateOnRefresh: true } });
      gsap.to('.hero__shade', { opacity: 0.6, ease: 'none', scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="hero-runway" ref={runway}>
      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero__stage" ref={stage}>
          <picture className="hero__bg" aria-hidden="true">
            <source media="(max-aspect-ratio: 4/5)" srcSet="/hero/smoke-portrait.webp" />
            <img src="/hero/smoke.webp" alt="" fetchPriority="high" decoding="async" />
          </picture>

          <svg className="hero__word" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="hero-word-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff4e4" />
                <stop offset="0.55" stopColor="#fbd2a8" stopOpacity="0.92" />
                <stop offset="1" stopColor="#f2713a" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            <text x="6" y="186" textLength="988" lengthAdjust="spacingAndGlyphs" fill="url(#hero-word-fill)">
              {hero.backdrop}
            </text>
          </svg>

          <div className="hero__figure" ref={figure}>
            <img src="/hero/figure.webp" alt={hero.figureAlt} width={722} height={792} fetchPriority="high" decoding="async" />
          </div>

          <img className="hero__front" src="/hero/smoke-front.webp" alt="" aria-hidden="true" decoding="async" />
          <HeroReveal stage={stage} figure={figure} />
          <div className="hero__shade" aria-hidden="true" />

          <div className="hero__copy">
            <p className="hero__eyebrow">{hero.eyebrow}</p>
            <h1 id="hero-title" className="hero__title">
              {hero.title.map((line, i) => (
                <span key={line} className={`hero__line${i === 0 ? '' : ' is-gold'}`}>{line}</span>
              ))}
            </h1>
            <p className="hero__sub">{hero.sub}</p>
            <a className="btn btn--light" href="#work" onClick={(e) => { e.preventDefault(); goTo('#work'); }}>
              {labels.work} <span aria-hidden="true" className="btn__arrow">→</span>
            </a>
          </div>

          <ul className="hero__tags" aria-label="Focus">
            {hero.tags.map((t, i) => (
              <li key={t} className={i === tag ? 'is-on' : ''}>{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
