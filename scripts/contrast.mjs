#!/usr/bin/env node
/**
 * WCAG contrast for every text colour on every flat ground it is used on.
 * (Text over the hero smoke is measured on the rendered page by scripts/smoke.mjs.)
 * Body text needs 4.5:1; display type (24px+ or 19px bold) needs 3:1.
 */
const pairs = [
  // [where, text, background, minimum]
  ['brown ground: body', '#f4ead8', '#241109', 4.5],
  ['brown ground: soft body', '#d8c7ae', '#241109', 4.5],
  ['brown ground: gold display', '#f7ae3f', '#241109', 3],
  ['brown ground: role labels at 60%', '#a9a092', '#241109', 3],
  ['dive scene: cream line', '#f4ead8', '#1a0b06', 4.5],
  ['green card: body', '#f4ead8', '#283f24', 4.5],
  ['green card: gold tagline', '#f7ae3f', '#283f24', 3],
  ['paper card / skills / dialog: body', '#120806', '#ece4d6', 4.5],
  ['paper: soft body', '#5a4636', '#ece4d6', 4.5],
  ['paper: rust labels and taglines', '#9a3b10', '#ece4d6', 4.5],
  ['dialog: point text', '#4a3a2e', '#ece4d6', 4.5],
  ['cream card: body', '#120806', '#f3e1c6', 4.5],
  ['cream card: rust tagline', '#8a3a10', '#f3e1c6', 4.5],
  ['ink card: body', '#f4ead8', '#0c0806', 4.5],
  ['brown card: body', '#f4ead8', '#2c140b', 4.5],
  ['contact (sun, lightest): ink', '#120806', '#f8a24a', 4.5],
  ['contact (sun, ember): ink', '#120806', '#e87f24', 4.5],
  ['contact (sun, fire): ink', '#120806', '#e8461c', 4.5],
  ['footer top: ink', '#120806', '#e8461c', 4.5],
  ['skills: rust heading', '#a8400f', '#ece4d6', 3],
  ['light button', '#120806', '#fbf3e6', 4.5],
  ['dark button', '#f4ead8', '#120806', 4.5],
];

const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let failed = 0;
for (const [where, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${min})  ${where}`);
}
console.log(failed ? `\n${failed} pair(s) below threshold` : '\nall pairs pass');
process.exit(failed ? 1 : 0);
