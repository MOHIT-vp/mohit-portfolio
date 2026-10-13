import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dive } from '../content/site';
import { heroLabels } from '../content/graphs';
import { Ember } from '../field/Ember';
import { reducedMotion } from '../lib/env';
import { ScrollTrigger } from '../lib/motion';

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const MAX_ZOOM = 220;

/**
 * Where the stem of the first letter is, measured rather than guessed: draw the
 * letter in an offscreen canvas with the same font and scan a row through the
 * stem. Returns offsets from the glyph origin, per pixel of font size.
 */
function probe() {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = `900 200px "Archivo Variable", system-ui, sans-serif`;
  try { (ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = 'semi-condensed'; } catch { /* see measureStem */ }
  return ctx;
}

/** Width of the word per pixel of font size, so the cut-out always fits the screen. */
function measureWidth(word: string) {
  const ctx = probe();
  if (!ctx) return 7;
  // letter-spacing -0.02em on every glyph but the last
  return ctx.measureText(word).width / 200 - 0.02 * (word.length - 1);
}

function measureStem(letter: string) {
  const size = 200;
  const c = document.createElement('canvas');
  c.width = size * 1.5;
  c.height = size * 1.3;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = `900 ${size}px "Archivo Variable", system-ui, sans-serif`;
  try { (ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = 'semi-condensed'; } catch { /* older engines: width differs slightly, stem position barely moves */ }
  const m = ctx.measureText(letter);
  const cap = m.actualBoundingBoxAscent;
  const baseline = size * 1.1;
  ctx.fillText(letter, 0, baseline);
  const row = Math.round(baseline - cap * 0.55);
  const px = ctx.getImageData(0, row, c.width, 1).data;
  let start = -1;
  let end = -1;
  for (let x = 0; x < c.width; x++) {
    const on = px[x * 4 + 3] > 128;
    if (on && start < 0) start = x;
    if (!on && start >= 0) { end = x; break; }
  }
  if (start < 0 || end < 0) return null;
  return { start: start / size, end: end / size, cap: cap / size };
}

/**
 * A fire-red panel rises over the hero with the words cut out of it: the
 * letters are windows onto a dark scene. Scrolling zooms through the stem of
 * the first letter until the scene fills the screen, then the line lands.

 */
export function Dive() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const zoomRef = useRef<SVGGElement>(null);
  const stemRef = useRef<SVGRectElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ w: 1600, h: 900 });
  const [em, setEm] = useState(7);
  const fontSize = Math.min((box.w * 0.9) / em, box.h * 0.42);

  // size the word from its real measured width once the font is in
  useEffect(() => {
    let live = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => live && setEm(measureWidth(dive.word)));
    return () => { live = false; };
  }, []);

  // the SVG works in real pixels, so the letters can be measured and zoomed exactly
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth || 1600, h: el.clientHeight || 900 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ember = new Ember(c, { count: box.w < 700 ? 46 : 96, labels: heroLabels, color: '#f7ae3f', edge: '247,174,63', label: '#f4ead8', animate: !reducedMotion() });
    return () => ember.destroy();
  }, [box.w]);

  useEffect(() => {
    const el = section.current;
    const text = textRef.current;
    const zoom = zoomRef.current;
    if (!el || !text || !zoom || reducedMotion()) return;
    const rect = stemRef.current;
    let focal = { x: box.w / 2, y: box.h / 2 };
    let hasStem = false;
    const measure = () => {
      try {
        const e = text.getExtentOfChar(0);
        const stem = measureStem(dive.word[0]);
        const baseline = Number(text.getAttribute('y'));
        if (stem && rect) {
          const x = e.x + stem.start * fontSize;
          const w = (stem.end - stem.start) * fontSize;
          const h = stem.cap * fontSize;
          rect.setAttribute('x', String(x));
          rect.setAttribute('y', String(baseline - h));
          rect.setAttribute('width', String(w));
          rect.setAttribute('height', String(h));
          focal = { x: x + w / 2, y: baseline - h * 0.55 };
          hasStem = true;
        } else {
          focal = { x: e.x + e.width * 0.2, y: baseline - fontSize * 0.35 };
        }
      } catch { /* layout not ready */ }
    };
    measure();
    document.fonts?.ready.then(measure);

    const panel = el.querySelector<SVGElement>('.dive__panel')!;
    const words = el.querySelectorAll<HTMLElement>('.dive__line > span');
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: ({ progress: p }) => {
        const z = smoother(Math.min(1, Math.max(0, (p - 0.1) / 0.46)));
        const s = Math.exp(Math.log(MAX_ZOOM) * z);
        zoom.setAttribute('transform', `translate(${focal.x} ${focal.y}) scale(${s.toFixed(3)}) translate(${-focal.x} ${-focal.y})`);
        // browsers stop drawing glyphs at extreme sizes; past a modest zoom the stem
        // (a plain rectangle) stands in for the letter, which scales without limit
        const swap = hasStem && s > 6;
        text.style.visibility = swap ? 'hidden' : '';
        if (rect) rect.style.visibility = swap ? 'visible' : 'hidden';
        panel.style.opacity = String(1 - Math.min(1, Math.max(0, (p - 0.52) / 0.06)));
        const reveal = Math.min(1, Math.max(0, (p - 0.58) / 0.16));
        words.forEach((w, i) => {
          const local = Math.min(1, Math.max(0, reveal * 1.6 - i * 0.3));
          w.style.opacity = String(local);
          w.style.transform = `translateY(${(1 - local) * 40}%)`;
        });
      },
    });
    return () => st.kill();
  }, [box, fontSize]);

  return (
    <section id="dive" className="dive" ref={section} aria-labelledby="dive-title">
      <div className="dive__stage" ref={stage}>
        <div className="dive__scene">
          <canvas ref={canvas} className="dive__canvas" aria-hidden="true" />
          <h2 id="dive-title" className="dive__line">
            <span><em>{dive.lead}</em> {dive.line1}</span>
            <span>{dive.line2}</span>
          </h2>
        </div>
        <svg className="dive__panel" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          <defs>
            <mask id="dive-cut" maskUnits="userSpaceOnUse" x="0" y="0" width={box.w} height={box.h}>
              <rect width={box.w} height={box.h} fill="#fff" />
              <g ref={zoomRef}>
                <text ref={textRef} x={box.w / 2} y={box.h / 2 + fontSize * 0.36} textAnchor="middle" fontSize={fontSize} fill="#000">
                  {dive.word}
                </text>
                <rect ref={stemRef} fill="#000" visibility="hidden" />
              </g>
            </mask>
          </defs>
          <rect width={box.w} height={box.h} className="dive__ground" mask="url(#dive-cut)" />
        </svg>
      </div>
    </section>
  );
}
