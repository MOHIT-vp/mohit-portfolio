import { useEffect, useRef, useState } from 'react';
import { labels, projects, type Project } from '../content/site';
import { CaseStudy } from '../components/CaseStudy';
import { Shot } from '../components/Shot';
import { reducedMotion } from '../lib/env';
import { gsap } from '../lib/motion';

/**
 * Featured work as slides: full-width and two-up, each on its own ground,
 * each built from the project's real screens. A slide opens its case study.
 */
export function Work() {
  const section = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.work__title', { xPercent: 6 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.card').forEach((card) => {
        gsap.fromTo(card, { scale: 0.92, opacity: 0.4 }, {
          scale: 1, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top 98%', end: 'top 55%', scrub: true },
        });
        const media = card.querySelector('.card__media-inner');
        if (media) gsap.fromTo(media, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const show = (p: Project, e: React.MouseEvent<HTMLElement>) => {
    opener.current = e.currentTarget;
    setOpen(p);
  };

  return (
    <section id="work" className="work" ref={section} aria-labelledby="work-title">
      <h2 id="work-title" className="work__title" aria-label="Featured work">
        <span aria-hidden="true">FEATURED WORK</span>
      </h2>
      <div className="wrap work__grid">
        {projects.map((p) => (
          <article key={p.id} className={`card card--${p.card.size} card--${p.card.tone}`} aria-labelledby={`card-${p.id}`}>
            <div className="card__media">
              <div className="card__media-inner">
                <CardVisual project={p} />
              </div>
            </div>
            <div className="card__meta">
              <div className="card__titles">
                <h3 id={`card-${p.id}`} className="card__name">{p.name}</h3>
                <p className="card__tagline">{p.tagline}</p>
              </div>
              <p className="card__summary">{p.summary}</p>
              <div className="card__actions">
                <button type="button" className="btn btn--card" onClick={(e) => show(p, e)} aria-haspopup="dialog">
                  {labels.caseStudy}<span className="sr-only">: {p.name}</span>
                </button>
                <a className="card__source" href={p.repo} target="_blank" rel="noopener noreferrer">
                  {labels.source}<span className="sr-only">: {p.name} (opens in a new tab)</span> <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <span className="card__kicker">{p.team ?? p.kicker}</span>
          </article>
        ))}
      </div>
      <CaseStudy project={open} onClose={() => { setOpen(null); opener.current?.focus(); }} />
    </section>
  );
}

function CardVisual({ project: p }: { project: Project }) {
  const [first, second] = p.shots;
  return (
    <div className={`card__shots${second && p.card.size === 'big' ? ' has-pair' : ''}`}>
      <Shot {...first} height={first.h} className="card__shot card__shot--main" sizes={p.card.size === 'big' ? '(min-width: 900px) 70vw, 100vw' : '(min-width: 900px) 45vw, 100vw'} />
      {second && p.card.size === 'big' && (
        <Shot {...second} height={second.h} className="card__shot card__shot--second" sizes="(min-width: 900px) 34vw, 60vw" />
      )}
    </div>
  );
}
