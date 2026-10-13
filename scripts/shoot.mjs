#!/usr/bin/env node
/**
 * Visual verification: walk the page's scroll at even steps and screenshot each frame.
 *
 *   node scripts/shoot.mjs --url http://localhost:4173 --width 1440 --height 900 --out lab/desktop
 *   node scripts/shoot.mjs --url ... --width 375 --height 812 --out lab/mobile --mobile
 *   node scripts/shoot.mjs --url ... --reduced-motion --out lab/reduced
 *
 * Also reports: horizontal overflow, console errors, failed requests, and
 * elements that are still invisible (opacity 0) after their section was in view.
 * Uses the installed Google Chrome through playwright-core.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const has = (n) => argv.includes(n);

const url = arg('--url', 'http://localhost:4173');
const width = Number(arg('--width', 1440));
const height = Number(arg('--height', 900));
const out = path.resolve(arg('--out', 'lab/shots'));
const stepVh = Number(arg('--step', 0.85));
const settle = Number(arg('--settle', 900));
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  reducedMotion: has('--reduced-motion') ? 'reduce' : 'no-preference',
  isMobile: has('--mobile'),
  hasTouch: has('--mobile'),
});
const page = await context.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));

await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(3200);

const total = await page.evaluate(() => document.documentElement.scrollHeight);
const positions = [];
for (let y = 0; y < total - height * 0.5; y += Math.round(height * stepVh)) positions.push(y);
positions.push(total - height);

const report = { url, width, height, total, frames: [] };
let i = 0;
for (const y of positions) {
  await page.evaluate((top) => {
    if (window.__lenis) window.__lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: 'instant' });
  }, y);
  await page.waitForTimeout(settle);
  const info = await page.evaluate(() => {
    const mid = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    const section = mid?.closest('section, footer');
    return {
      scrollY: Math.round(scrollY),
      section: section?.id ?? null,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  });
  const file = path.join(out, `${String(i).padStart(2, '0')}-${info.section ?? 'none'}.png`);
  await page.screenshot({ path: file });
  report.frames.push({ ...info, file: path.basename(file) });
  i++;
}

// elements that never became visible: animated-in content stuck at opacity 0
const stuck = await page.evaluate(() =>
  Array.from(document.querySelectorAll('main *, footer *'))
    .filter((el) => {
      const cs = getComputedStyle(el);
      return cs.opacity === '0' && el.textContent?.trim() && !el.closest('[aria-hidden="true"]') && !el.closest('.helix__step:not(.is-active)');
    })
    .slice(0, 20)
    .map((el) => `${el.tagName.toLowerCase()}.${el.className}`),
);

report.errors = errors;
report.stuck = stuck;
report.maxOverflowX = Math.max(...report.frames.map((f) => f.overflowX));
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ frames: report.frames.length, total, maxOverflowX: report.maxOverflowX, errors, stuck }, null, 2));
await browser.close();
