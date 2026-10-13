import { useEffect, useRef } from 'react';
import { gsap } from '../lib/motion';

/**
 * The monogram writes itself, fills, and the curtain lifts onto the hero.
 * About 1.7 seconds. Any click or key skips it. The parent decides whether to
 * show it at all (not with reduced motion, not twice in one session).
 */
export function IntroLoader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const text = el.querySelector('text')!;
    const tl = gsap.timeline({ onComplete: onDone });
    tl.fromTo(text, { strokeDashoffset: 900 }, { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut' })
      .to(text, { fillOpacity: 1, duration: 0.35, ease: 'power1.out' }, 0.8)
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut' }, 1.15);
    const skip = () => tl.progress(1);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      tl.kill();
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [onDone]);

  return (
    <div className="intro" ref={root} aria-hidden="true">
      <svg viewBox="0 0 400 220" className="intro__mark">
        <text x="200" y="168" textAnchor="middle">MP</text>
      </svg>
    </div>
  );
}
