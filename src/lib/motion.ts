import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reducedMotion } from './env';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

let lenis: Lenis | null = null;

/** Smooth scrolling for wheel input only; touch and keyboard stay native. Skipped with reduced motion. */
export function startLenis() {
  if (reducedMotion() || lenis) return () => {};
  lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  // exposed for the verification harness (scripts/shoot.mjs) so it can jump without fighting the smoothing
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

/** Pause smooth scrolling (for the intro and the case-study dialog). Returns a resume function. */
export function pauseScroll() {
  lenis?.stop();
  document.documentElement.classList.add('scroll-paused');
  return () => {
    lenis?.start();
    document.documentElement.classList.remove('scroll-paused');
  };
}

/**
 * Scroll to an in-page target, then move keyboard focus to its heading so screen
 * readers and Tab follow. Scroll-driven sections can set data-land="end" to land
 * where their content is fully revealed rather than at their first frame.
 */
export function goTo(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  const focusTarget = target.querySelector<HTMLElement>('h1, h2') ?? target;
  const done = () => {
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: true });
    history.replaceState(null, '', hash === '#top' ? location.pathname : hash);
  };
  const dest = () => {
    const r = target.getBoundingClientRect();
    const y = target.dataset.land === 'end' ? r.bottom + window.scrollY - window.innerHeight : r.top + window.scrollY;
    return Math.max(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight));
  };
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(dest(), {
      onComplete: () => {
        // lazy media can shift layout mid-flight; settle exactly on the target
        if (Math.abs(window.scrollY - dest()) > 2) lenis?.scrollTo(dest(), { immediate: true, force: true });
        done();
      },
    });
  } else {
    window.scrollTo({ top: dest(), behavior: reducedMotion() ? 'auto' : 'smooth' });
    done();
  }
}
