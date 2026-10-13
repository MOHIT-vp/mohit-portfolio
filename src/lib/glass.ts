import '../vendor/liquid-glass/liquid-glass.js';
import { reducedTransparency } from './env';

/**
 * Apply the vendored liquid-glass optics (MIT, deepika-builds/liquid-glass).
 * Real refraction in Chromium, frosted blur elsewhere, and a solid fill when
 * the visitor asks for reduced transparency (handled in CSS via .glass--solid).
 */
export function applyGlass(el: HTMLElement, opts?: Parameters<NonNullable<Window['liquidGlass']>>[1]) {
  if (reducedTransparency() || !window.liquidGlass) {
    el.classList.add('glass--solid');
    return () => el.classList.remove('glass--solid');
  }
  const handle = window.liquidGlass(el, { scale: -64, chroma: 4, blur: 6, saturate: 1.4, ...opts });
  return () => handle.destroy();
}
