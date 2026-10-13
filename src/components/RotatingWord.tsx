import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { reducedMotion } from '../lib/env';

/**
 * Cycles through words in place. The words share one grid cell; the cell's
 * width eases to the current word, so the line stays centred and there is never
 * a gap after a short word. It sits on the same baseline as the text around it
 * (clipping is done with clip-path, which, unlike overflow, leaves the baseline
 * alone). Screen readers get the full list once; the animation is hidden.
 */
export function RotatingWord({ words, interval = 2200, className = '' }: { words: readonly string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
  const stack = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setI((v) => (v + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  // size the cell to the active word, and keep it right when fonts load or the viewport changes
  useLayoutEffect(() => {
    const el = stack.current;
    const word = el?.children[i] as HTMLElement | undefined;
    if (!el || !word) return;
    const fit = () => { el.style.width = `${word.offsetWidth}px`; };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(word);
    return () => ro.disconnect();
  }, [i]);

  const prev = (i - 1 + words.length) % words.length;
  return (
    <span className={`rot ${className}`}>
      <span className="sr-only">{words.join(', ')}</span>
      <span className="rot__stack" ref={stack} aria-hidden="true">
        {words.map((w, k) => (
          <span key={w} className={`rot__word${k === i ? ' is-on' : k === prev ? ' is-out' : ''}`}>
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}
