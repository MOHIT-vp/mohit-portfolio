import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { about, principles, roles } from '../content/site';
import { RotatingWord } from '../components/RotatingWord';
import { finePointer, reducedMotion } from '../lib/env';
import { gsap } from '../lib/motion';

/**
 * About: the statement over a glowing emblem, a curve drawn out of the "I"
 * by scroll down through the list of what I work on, then three principles.
 * Hovering an area shows the real screen that backs it up; the project names
 * behind each area are always visible as text.
 */
export function About() {
  const section = useRef<HTMLElement>(null);
  const iRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState('');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState<number | null>(null);
  const span = useRef({ start: 0, end: 1 });

  // the curve's geometry follows the real positions of the I and the list
  useLayoutEffect(() => {
    const el = section.current;
    const i = iRef.current;
    const list = listRef.current;
    if (!el || !i || !list) return;
    const build = () => {
      const s = el.getBoundingClientRect();
      const a = i.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      const w = s.width;
      const sx = a.left - s.left + a.width / 2;
      const sy = a.bottom - s.top - a.height * 0.06;
      const ex = l.right - s.left + Math.min(80, w * 0.05);
      const ey = l.bottom - s.top + 40;
      const midY = (sy + ey) / 2;
      span.current = { start: sy, end: ey };
      setSize({ w, h: s.height });
      setPath(
        `M ${sx} ${sy} C ${sx} ${sy + 220}, ${w * 0.96} ${sy + 60}, ${w * 0.9} ${midY} S ${ex + 30} ${ey - 160}, ${ex} ${ey}`,
      );
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    document.fonts?.ready.then(build);
    return () => ro.disconnect();
  }, []);

  // draw the curve with the scroll: its tip tracks a line 60% down the screen,
  // so it grows from the I to the end of the list exactly as fast as you scroll
  useEffect(() => {
    const el = section.current;
    const path = el?.querySelector<SVGPathElement>('.about__curve path');
    if (!el || !path) return;
    if (reducedMotion()) { path.style.strokeDashoffset = '0'; return; }
    let raf = 0;
    const draw = () => {
      raf = 0;
      const top = el.getBoundingClientRect().top;
      const { start, end } = span.current;
      const line = window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (line - (top + start)) / Math.max(1, end - start)));
      path.style.strokeDashoffset = String(1 - p);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [path]);

  useEffect(() => {
    const el = section.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to('.about__emblem', { rotate: 40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.about__statement > span', {
        yPercent: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.about__statement', start: 'top 80%' },
      });
      gsap.from('.about__role', {
        y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07,
        scrollTrigger: { trigger: '.about__roles', start: 'top 80%' },
      });
      gsap.from('.principle', {
        y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.about__principles', start: 'top 85%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const place = (x: number, y: number) => {
    const el = preview.current;
    const s = section.current;
    if (!el || !s) return;
    const r = s.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    // float above and beside the pointer so the hovered label stays readable
    let left = x - r.left + 24;
    if (left + w > r.width - 16) left = x - r.left - w - 24;
    el.style.transform = `translate3d(${Math.max(16, left)}px, ${y - r.top - h - 28}px, 0)`;
  };

  return (
    <section id="about" className="about" ref={section} aria-labelledby="about-title">
      <div className="about__emblem" aria-hidden="true">
        <Emblem />
      </div>
      <svg className="about__curve" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden="true">
        <path d={path || 'M0 0'} pathLength={1} strokeDasharray="1" />
      </svg>

      <div className="wrap about__inner">
        <h2 id="about-title" className="about__statement">
          {about.statement.map((line) => <span key={line}>{line}</span>)}
          <span>
            <span ref={iRef} className="about__i">I</span> BUILD <RotatingWord words={about.rotating} className="about__rot" />
          </span>
        </h2>
        <p className="about__intro">{about.intro}</p>

        <ul
          className="about__roles"
          ref={listRef}
          onPointerMove={(e) => finePointer() && place(e.clientX, e.clientY)}
          onPointerLeave={() => setActive(null)}
        >
          {roles.map((r, i) => (
            <li
              key={r.label}
              className={`about__role${active === i ? ' is-active' : ''}`}
              onPointerEnter={(e) => { if (finePointer()) { place(e.clientX, e.clientY); setActive(i); } }}
            >
              <span className="about__role-label">{r.label}</span>
              <span className="about__role-proof">{r.proof}</span>
            </li>
          ))}
        </ul>

        <div className="about__principles">
          {principles.map((p) => (
            <article key={p.title} className="principle">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={`about__preview${active != null ? ' is-on' : ''}`} ref={preview} aria-hidden="true">
        {roles.map((r, i) => (
          <img key={r.shot} src={`/work/${r.shot}-800.webp`} alt="" className={i === active ? 'is-on' : ''} loading="lazy" decoding="async" />
        ))}
      </div>
    </section>
  );
}

/** A symmetric node emblem: three rings of nodes joined to their neighbours, glowing softly. */
function Emblem() {
  const rings = [
    { r: 120, n: 6, off: 0 },
    { r: 230, n: 12, off: Math.PI / 12 },
    { r: 340, n: 18, off: 0 },
  ];
  const nodes = rings.flatMap(({ r, n, off }, ri) =>
    Array.from({ length: n }, (_, k) => ({ x: 400 + r * Math.cos(off + (k * 2 * Math.PI) / n), y: 400 + r * Math.sin(off + (k * 2 * Math.PI) / n), ri })),
  );
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (j <= i) return;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 128 && Math.abs(a.ri - b.ri) <= 1) edges.push([i, j]);
  }));
  return (
    <svg viewBox="0 0 800 800">
      <defs>
        <filter id="emblem-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="emblem-core">
          <stop offset="0" stopColor="#f58a4e" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f58a4e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="400" r="380" fill="url(#emblem-core)" />
      <g filter="url(#emblem-glow)" stroke="#f3a27a" strokeOpacity="0.55" strokeWidth="1.6">
        {edges.map(([i, j]) => <line key={`${i}-${j}`} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} />)}
        {nodes.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.ri === 0 ? 7 : 5} fill="#f7c2a0" stroke="none" />)}
        <circle cx="400" cy="400" r="12" fill="#ffd9b8" stroke="none" />
      </g>
    </svg>
  );
}
