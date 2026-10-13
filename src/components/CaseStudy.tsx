import { useEffect, useRef } from 'react';
import { labels, type Project } from '../content/site';
import { Diagram } from './Diagram';
import { Shot } from './Shot';
import { pauseScroll } from '../lib/motion';

/**
 * A project's full case study in a native modal dialog: focus moves in and is
 * contained, Escape closes it, the page behind stops scrolling, and focus
 * returns to the button that opened it (handled by the parent).
 */
export function CaseStudy({ project: p, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) {
      d.showModal();
      d.scrollTop = 0;
      return pauseScroll();
    }
    if (!p && d.open) d.close();
  }, [p]);

  return (
    <dialog
      ref={ref}
      className="study"
      aria-labelledby="study-title"
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {p && (
        <div className="study__sheet">
          <button type="button" className="study__close" onClick={onClose} autoFocus>
            Close <span aria-hidden="true">×</span>
          </button>
          <header className="study__head">
            <p className="study__kicker">{p.team ? `${p.team} · ${p.kicker}` : p.kicker}</p>
            <h2 id="study-title" className="study__title">{p.name}</h2>
            <p className="study__tagline">{p.tagline}</p>
            <p className="study__summary">{p.summary}</p>
            <p className="study__goal">{p.goal}</p>
          </header>

          {p.shots[0] && <Shot {...p.shots[0]} height={p.shots[0].h} className="study__shot" sizes="(min-width: 900px) 900px, 100vw" />}

          <div className="study__points">
            {p.points.map((pt) => (
              <div key={pt.title} className="study__point">
                <h3>{pt.title}</h3>
                <p>{pt.body}</p>
              </div>
            ))}
          </div>

          {p.diagrams && (
            <div className="study__diagrams">
              {p.diagrams.map((d) => <Diagram key={d.key} layout={d.key} caption={d.caption} />)}
            </div>
          )}

          {p.honesty && <p className="study__note">{p.honesty}</p>}

          {p.decisions && (
            <div className="study__block">
              <h3>Decisions</h3>
              <ul>{p.decisions.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          )}

          {p.shots.slice(1).map((s) => <Shot key={s.src} {...s} height={s.h} className="study__shot" sizes="(min-width: 900px) 900px, 100vw" />)}

          <div className="study__facts">
            <div>
              <h3>Stack</h3>
              <p>{p.stack.join(', ')}</p>
            </div>
            <div>
              <h3>Status</h3>
              <p>{p.status}</p>
              {p.limits && <p>{p.limits}</p>}
            </div>
          </div>

          <a className="btn btn--dark study__source" href={p.repo} target="_blank" rel="noopener noreferrer">
            {labels.source}<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </dialog>
  );
}
