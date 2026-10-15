#!/usr/bin/env node
/**
 * Browser smoke test: structure, accessibility basics, keyboard, every interactive
 * piece, the scroll scenes and reduced motion.
 *   node scripts/smoke.mjs --url http://localhost:4173
 * Exits non-zero if any check fails.
 */
import { chromium } from 'playwright-core';

const argv = process.argv.slice(2);
const url = argv[argv.indexOf('--url') + 1] || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
const wait = (p, ms) => p.waitForTimeout(ms);
const jumpTo = (p, y) => p.evaluate((t) => (window.__lenis ? window.__lenis.scrollTo(t, { immediate: true, force: true }) : window.scrollTo(0, t)), y);

/** Worst-case WCAG contrast of a text colour against the real rendered pixels behind an element. */
async function contrastBehind(page, selector, textRgb) {
  const box = await page.locator(selector).first().boundingBox();
  await page.addStyleTag({ content: `${selector}, ${selector} * { color: transparent !important; text-shadow: none !important; }` });
  await wait(page, 150);
  const shot = (await page.screenshot({ clip: box })).toString('base64');
  return page.evaluate(async ({ b64, rgb }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const lt = L(...rgb);
    let worst = 99;
    for (let i = 0; i < d.length; i += 16) {
      const lb = L(d[i], d[i + 1], d[i + 2]);
      const ratio = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
      if (ratio < worst) worst = ratio;
    }
    return +worst.toFixed(2);
  }, { b64: shot, rgb: textRgb });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });

// ── desktop ──
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await wait(page, 2600); // the intro plays on a first visit

  const s = await page.evaluate(() => {
    const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]));
    let skip = null;
    for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skip = `h${hs[i - 1]} -> h${hs[i]}`;
    const links = [...document.querySelectorAll('a')];
    const hashes = links.map((a) => a.getAttribute('href')).filter((h) => h?.startsWith('#'));
    return {
      title: document.title,
      h1: document.querySelectorAll('h1').length,
      skip,
      noAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      unnamed: links.filter((a) => !(a.getAttribute('aria-label') || a.textContent.trim())).length,
      unnamedButtons: [...document.querySelectorAll('button')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
      blank: links.filter((a) => a.target === '_blank' && !/noopener/.test(a.rel)).length,
      missing: hashes.filter((h) => !document.querySelector(h)),
      lang: document.documentElement.lang,
      mail: document.querySelector('.contact__mail')?.getAttribute('href'),
      socials: [...document.querySelectorAll('.contact__links a')].map((a) => a.href),
      emDash: /[—–]/.test(document.body.innerText),
      introGone: !document.querySelector('.intro'),
    };
  });
  check('intro finishes and removes itself', s.introGone);
  check('title set', s.title.includes('Mohit Patil'), s.title);
  check('one h1', s.h1 === 1, `h1 count ${s.h1}`);
  check('no skipped heading levels', !s.skip, s.skip ?? '');
  check('every img has alt', s.noAlt === 0, `${s.noAlt} missing`);
  check('every link has a name', s.unnamed === 0);
  check('every button has a name', s.unnamedButtons === 0);
  check('new-tab links use noopener', s.blank === 0);
  check('in-page anchors resolve', s.missing.length === 0, s.missing.join(', '));
  check('html lang', s.lang === 'en');
  check('email link', s.mail === 'mailto:mohitpatil04046@gmail.com', s.mail);
  check(
    'social links exact',
    JSON.stringify(s.socials) === JSON.stringify(['https://github.com/MOHIT-vp', 'https://www.linkedin.com/in/mohit-v-patil-a43b2a324', 'https://x.com/MohitPatil758']),
    s.socials.join(' '),
  );
  check('no em or en dashes in visible text', !s.emDash);

  // hero text contrast measured on the rendered smoke
  // the sub-line is set at 24px or more, so the large-text bar (3:1) applies; checked, not assumed
  // the hero's only text is the name in the corner: small, so it must clear AA (4.5:1) on the smoke
  const name = await contrastBehind(page, '.hero__name', [244, 234, 216]);
  check('hero name contrast on smoke (AA, 4.5:1)', name >= 4.5, `worst ${name}:1`);
  check('the h1 is the name', await page.evaluate(() => document.querySelector('h1')?.textContent === 'Mohit Patil'));
  await page.reload({ waitUntil: 'networkidle' });
  await wait(page, 1500);

  // reveal: hovering the figure opens the blob onto the re-dressed figure
  const fig = await page.locator('.hero__figure').boundingBox();
  await page.mouse.move(fig.x + fig.width * 0.5, fig.y + fig.height * 0.5, { steps: 8 });
  await wait(page, 900);
  const rv = await page.evaluate(() => ({
    on: document.querySelector('.reveal').classList.contains('is-on'),
    r: Number(document.querySelector('.reveal__blob').getAttribute('r')),
    w: Number(document.querySelector('.reveal').getAttribute('width')),
  }));
  check('hero reveal opens over the figure', rv.on && rv.r > 100 && rv.w > 0, JSON.stringify(rv));
  await page.mouse.move(5, 300, { steps: 6 });
  await wait(page, 900);
  check('hero reveal closes when the pointer leaves the figure', await page.evaluate(() => !document.querySelector('.reveal').classList.contains('is-on')));

  // keyboard
  await page.keyboard.press('Tab');
  const skipLink = await page.evaluate(() => { const el = document.activeElement; const r = el.getBoundingClientRect(); return { t: el.textContent.trim(), v: r.top >= 0 && r.bottom <= innerHeight }; });
  check('first Tab is a visible skip link', skipLink.t === 'Skip to the work' && skipLink.v, JSON.stringify(skipLink));
  const ring = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    ring.push(await page.evaluate(() => ({ t: (document.activeElement.textContent || '').trim().slice(0, 18), o: getComputedStyle(document.activeElement).outlineStyle })));
  }
  check('focus ring visible while tabbing', ring.every((r) => r.o !== 'none'), ring.map((r) => `${r.t}[${r.o}]`).join(' | '));

  // dive: past the zoom the camera is inside the letter, not on the panel
  const dive = await page.evaluate(() => { const d = document.getElementById('dive'); const r = d.getBoundingClientRect(); return { top: r.top + scrollY, run: d.offsetHeight - innerHeight }; });
  await jumpTo(page, dive.top + dive.run * 0.48);
  await wait(page, 500);
  const inside = await page.evaluate(() => ({
    rect: document.querySelector('.dive__panel rect[fill="#000"]')?.style.visibility,
    text: document.querySelector('.dive__panel text').style.visibility,
  }));
  check('dive: zoom hands the letter over to its stem', inside.rect === 'visible' && inside.text === 'hidden', JSON.stringify(inside));
  await jumpTo(page, dive.top + dive.run * 0.85);
  await wait(page, 500);
  const line = await page.evaluate(() => [...document.querySelectorAll('.dive__line > span')].map((x) => Number(getComputedStyle(x).opacity)));
  check('dive: the line is fully visible after the zoom', line.every((o) => o > 0.95), line.join(','));

  // nav jumps
  await jumpTo(page, 0);
  await wait(page, 300);
  await page.click('.nav__links a[href="#work"]');
  await wait(page, 2600);
  const work = await page.evaluate(() => ({ top: Math.round(document.getElementById('work').getBoundingClientRect().top), focus: document.activeElement?.id }));
  check('nav: Work lands on the section', Math.abs(work.top) < 4, JSON.stringify(work));
  check('nav: Work moves focus to its heading', work.focus === 'work-title', work.focus);
  check('nav: current section is marked', await page.evaluate(() => document.querySelector('.nav__links a[aria-current]')?.getAttribute('href') === '#work'));
  await page.click('.nav__cta');
  await wait(page, 3000);
  const contactEnd = await page.evaluate(() => {
    const c = document.getElementById('contact');
    const end = c.getBoundingClientRect().bottom + scrollY - innerHeight;
    return { off: Math.round(scrollY - end), opacity: [...document.querySelectorAll('.contact__content > *')].map((x) => Number(getComputedStyle(x).opacity)) };
  });
  check("nav: Let's connect lands where contact is fully shown", Math.abs(contactEnd.off) < 4 && contactEnd.opacity.every((o) => o > 0.95), JSON.stringify(contactEnd));

  // case study dialog
  await page.evaluate(() => document.getElementById('work').scrollIntoView());
  await wait(page, 600);
  await page.click('.card >> nth=1 >> button');
  await wait(page, 700);
  const open = await page.evaluate(() => ({ open: document.querySelector('dialog.study').open, focus: document.activeElement?.className, title: document.getElementById('study-title')?.textContent, paused: document.documentElement.classList.contains('scroll-paused') }));
  check('case study opens with focus on Close and the page paused', open.open && open.focus === 'study__close' && open.paused, JSON.stringify(open));
  check('case study shows the right project', open.title === 'Agentic Refund Orchestrator', open.title);
  await page.keyboard.press('Escape');
  await wait(page, 400);
  const closed = await page.evaluate(() => ({ open: document.querySelector('dialog.study').open, focus: document.activeElement?.textContent?.trim().slice(0, 40), paused: document.documentElement.classList.contains('scroll-paused') }));
  check('case study: Escape closes, returns focus, resumes scrolling', !closed.open && closed.focus.startsWith('Read the case study') && !closed.paused, JSON.stringify(closed));
  await page.click('.card >> nth=0 >> button');
  await wait(page, 600);
  await page.click('.study__close');
  await wait(page, 400);
  check('case study: Close button closes', await page.evaluate(() => !document.querySelector('dialog.study').open));

  const broken = await page.evaluate(async () => {
    const all = [...document.querySelectorAll('img')];
    all.forEach((i) => (i.loading = 'eager'));
    await Promise.all(all.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    return all.filter((i) => !i.naturalWidth).map((i) => i.src);
  });
  check('all images load', broken.length === 0, broken.join(', '));
  check('no runtime errors (desktop)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ── mobile menu ──
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${url}/#top`, { waitUntil: 'networkidle' });
  await wait(page, 900);
  check('mobile: menu button visible', await page.isVisible('.nav__toggle'));
  await page.click('.nav__toggle');
  const open = await page.evaluate(() => ({ hidden: document.getElementById('menu').hidden, expanded: document.querySelector('.nav__toggle').getAttribute('aria-expanded'), inside: document.getElementById('menu').contains(document.activeElement) }));
  check('mobile: menu opens with focus inside', !open.hidden && open.expanded === 'true' && open.inside, JSON.stringify(open));
  const seen = new Set();
  let escaped = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => (document.activeElement?.classList.contains('nav__toggle') ? 'close' : document.getElementById('menu').contains(document.activeElement) ? 'menu' : 'outside'));
    seen.add(where);
    if (where === 'outside') escaped = true;
  }
  check('mobile: Tab cycles menu and Close, never escapes', !escaped && seen.has('close') && seen.has('menu'), [...seen].join(','));
  await page.keyboard.press('Escape');
  const esc = await page.evaluate(() => ({ hidden: document.getElementById('menu').hidden, back: document.activeElement?.classList.contains('nav__toggle') }));
  check('mobile: Escape closes and returns focus', esc.hidden && esc.back, JSON.stringify(esc));
  await page.click('.nav__toggle');
  await page.setViewportSize({ width: 1024, height: 768 });
  await wait(page, 400);
  const widened = await page.evaluate(() => ({ hidden: document.getElementById('menu').hidden, locked: document.documentElement.classList.contains('menu-open') }));
  check('mobile: widening past the breakpoint closes the menu', widened.hidden && !widened.locked, JSON.stringify(widened));
  await page.setViewportSize({ width: 375, height: 812 });
  await wait(page, 400);
  await page.click('.nav__toggle');
  await page.click('#menu a[href="#about"]');
  await wait(page, 2200);
  const landed = await page.evaluate(() => ({ hidden: document.getElementById('menu').hidden, top: Math.round(document.getElementById('about').getBoundingClientRect().top) }));
  check('mobile: menu link navigates and closes', landed.hidden && Math.abs(landed.top) < 4, JSON.stringify(landed));
  await ctx.close();
}

// ── reduced motion ──
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await wait(page, 600);
  const rm = await page.evaluate(() => ({
    intro: !!document.querySelector('.intro'),
    heroPinned: document.querySelector('.hero-runway').offsetHeight > innerHeight * 1.05,
    panel: getComputedStyle(document.querySelector('.dive__panel')).display,
    line: [...document.querySelectorAll('.dive__line > span')].every((x) => getComputedStyle(x).opacity === '1'),
    sun: getComputedStyle(document.querySelector('.contact__sun')).display,
    contactTall: document.getElementById('contact').offsetHeight > innerHeight * 1.5,
  }));
  check('reduced motion: no intro, no pinning, panel and sun off, all text shown', !rm.intro && !rm.heroPinned && rm.panel === 'none' && rm.line && rm.sun === 'none' && !rm.contactTall, JSON.stringify(rm));
  await ctx.close();
}

await browser.close();
let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.ok ? `  (${r.detail})` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
