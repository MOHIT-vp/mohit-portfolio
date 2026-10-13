import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { reducedMotion } from '../lib/env';

/**
 * Over the figure, an organic blob trails the pointer: a living, noise-warped
 * edge with a soft white glow, and inside it a dark window where the figure
 * appears re-dressed in blue and gold. Works with a mouse (hover) and with
 * touch (press and drag). Decorative only: the figure keeps its own alt text.
 *
 * The SVG covers the whole stage in real pixels, so the blob can cross the
 * figure's edge, and the re-dressed image is re-placed on the figure's live box
 * every frame, so it stays aligned while the hero's scroll transforms run.
 */
export function HeroReveal({ stage, figure }: { stage: RefObject<HTMLElement | null>; figure: RefObject<HTMLElement | null> }) {
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [motion] = useState(() => !reducedMotion());

  // measure through the SVG's own parent: a parent's ref is not attached yet
  // when a child's layout effect runs, the DOM parent always is
  useLayoutEffect(() => {
    const s = svg.current?.parentElement;
    if (!s) return;
    const measure = () => setSize({ w: s.clientWidth, h: s.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(s);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const s = stage.current;
    const f = figure.current;
    const el = svg.current;
    if (!s || !f || !el) return;
    const blob = el.querySelector<SVGCircleElement>('.reveal__blob')!;
    const glow = el.querySelector<SVGCircleElement>('.reveal__glow')!;
    const img = el.querySelector<SVGImageElement>('.reveal__img')!;
    const cursor = el.querySelector<SVGGElement>('.reveal__cursor')!;

    const cur = { x: 0, y: 0, r: 0 };
    const tgt = { x: 0, y: 0, r: 0 };
    let raf = 0;
    let pressed = false;
    const radius = () => Math.max(120, Math.min(190, Math.min(s.clientWidth, s.clientHeight) * 0.2));

    const frame = () => {
      raf = 0;
      const follow = motion ? 0.16 : 1;
      const grow = motion ? 0.12 : 1;
      cur.x += (tgt.x - cur.x) * follow;
      cur.y += (tgt.y - cur.y) * follow;
      cur.r += (tgt.r - cur.r) * grow;
      const sr = s.getBoundingClientRect();
      const fr = f.getBoundingClientRect();
      img.setAttribute('x', String(fr.left - sr.left));
      img.setAttribute('y', String(fr.top - sr.top));
      img.setAttribute('width', String(fr.width));
      img.setAttribute('height', String(fr.height));
      blob.setAttribute('cx', cur.x.toFixed(1));
      blob.setAttribute('cy', cur.y.toFixed(1));
      blob.setAttribute('r', Math.max(0, cur.r).toFixed(1));
      glow.setAttribute('cx', cur.x.toFixed(1));
      glow.setAttribute('cy', cur.y.toFixed(1));
      glow.setAttribute('r', Math.max(0, cur.r + 7).toFixed(1));
      cursor.setAttribute('transform', `translate(${tgt.x.toFixed(1)} ${tgt.y.toFixed(1)})`);
      const on = cur.r > 4;
      el.classList.toggle('is-on', on);
      s.classList.toggle('is-revealing', tgt.r > 0);
      const settled = Math.abs(tgt.x - cur.x) < 0.3 && Math.abs(tgt.y - cur.y) < 0.3 && Math.abs(tgt.r - cur.r) < 0.3;
      if (!settled) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const aim = (e: PointerEvent) => {
      const sr = s.getBoundingClientRect();
      const fr = f.getBoundingClientRect();
      const x = e.clientX - sr.left;
      const y = e.clientY - sr.top;
      // only over the figure itself (its box, trimmed at the empty top corners)
      const over = e.clientX > fr.left + fr.width * 0.1 && e.clientX < fr.right - fr.width * 0.06 && e.clientY > fr.top + fr.height * 0.04 && e.clientY < fr.bottom;
      const active = over && (e.pointerType === 'mouse' || pressed);
      if (active && tgt.r === 0) { cur.x = x; cur.y = y; }
      tgt.x = x;
      tgt.y = y;
      tgt.r = active ? radius() : 0;
      kick();
    };
    const down = (e: PointerEvent) => { if (e.pointerType !== 'mouse') { pressed = true; aim(e); } };
    const up = () => { pressed = false; tgt.r = 0; kick(); };
    const leave = (e: PointerEvent) => { if (e.pointerType === 'mouse') { tgt.r = 0; kick(); } };

    s.addEventListener('pointermove', aim);
    s.addEventListener('pointerdown', down);
    s.addEventListener('pointerup', up);
    s.addEventListener('pointercancel', up);
    s.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      s.removeEventListener('pointermove', aim);
      s.removeEventListener('pointerdown', down);
      s.removeEventListener('pointerup', up);
      s.removeEventListener('pointercancel', up);
      s.removeEventListener('pointerleave', leave);
      s.classList.remove('is-revealing');
    };
  }, [stage, figure, motion]);

  const { w, h } = size;
  return (
    <svg ref={svg} className="reveal" width={w} height={h} viewBox={`0 0 ${w || 1} ${h || 1}`} aria-hidden="true" focusable="false">
      <defs>
        <filter id="reveal-wobble" x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="11" result="noise">
            {motion && <animate attributeName="baseFrequency" dur="10s" values="0.009;0.015;0.011;0.009" repeatCount="indefinite" />}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="64" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="reveal-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <mask id="reveal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <g filter="url(#reveal-wobble)">
            <circle className="reveal__blob" r="0" fill="#fff" />
          </g>
        </mask>
      </defs>

      {/* the glow: the same warped shape, a little larger, blurred, behind the window */}
      <g filter="url(#reveal-soft)">
        <g filter="url(#reveal-wobble)">
          <circle className="reveal__glow" r="0" fill="#fff4e6" />
        </g>
      </g>

      <g mask="url(#reveal-mask)">
        <rect width={w} height={h} fill="#0b0604" />
        <image className="reveal__img" href="/hero/figure-alt.webp" preserveAspectRatio="xMidYMax meet" />
      </g>

      <g className="reveal__cursor">
        <circle r="7" />
        <line x1="0" y1="14" x2="0" y2="52" />
      </g>
    </svg>
  );
}
