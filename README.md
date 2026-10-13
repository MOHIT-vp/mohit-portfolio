# Mohit Patil: portfolio

A single-page portfolio in the spirit of [Dossier](https://dossier-iota-one.vercel.app/), rebuilt in original code around Mohit's own hero design and verified project work:

1. **Intro**: the MP monogram writes itself, then the curtain lifts (once per session, skippable, never with reduced motion).
2. **Hero**: the supplied design, built as independent planes (smoke, the giant word PORTFOLIO, figure, front smoke, copy). Hovering the figure (or pressing on touch) opens an organic, glowing-edged window in which the figure appears re-dressed in blue and gold.
3. **Dive**: a fire-red panel rises over the hero with LOOK CLOSER cut out of it. Scroll zooms through the stem of the L into a particle scene, where *from* HELLO, WORLD! TO PRODUCTION. lands.
4. **About**: "From data to interface, I build ___" over a glowing emblem, a curve drawn by scroll out of the I, the areas I work on (with real screenshots on hover) and three principles.
5. **Featured work**: full-width and two-up slides built from real project screens; each opens a case-study dialog.
6. **Skills**: one marquee and the tools grouped by job.
7. **Contact**: a sun rises out of the floor and fills the screen; the invitation lands on it.
8. **Footer**: MP, as wide as the screen, stretching up as the page ends.

Docs: [research and verified facts](docs/RESEARCH.md) · [design system](docs/DESIGN-SYSTEM.md) · [brief](docs/scrollcraft/builds/portfolio/BRIEF.md)

## Stack

React 19, TypeScript, Vite 8, GSAP 3 with ScrollTrigger, Lenis, self-hosted Archivo (variable width and weight) and Instrument Serif, and the vendored [liquid-glass](https://github.com/deepika-builds/liquid-glass) module (MIT) on the scrolled navigation bar. Plain CSS on design tokens; no UI or CSS framework.

No code, images, video or copy from Dossier is used: its repository has no licence. The structure and interaction ideas are reimplemented from scratch.

## Run it

Requires Node 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

## Edit content

- All copy, links and project facts: `src/content/site.ts`.
- Case-study diagrams: `src/content/graphs.ts`.
- Project screenshots: `public/work/<name>-800.webp` and `-1600.webp`.
- Hero layers: `public/hero/`. They are generated from the supplied mockup in `design/hero-mockup.webp`:

```bash
python3 scripts/hero-assets.py design/hero-mockup.webp
```

  The script cuts the figure out as a real alpha layer, derives the blue-and-gold version for the hover reveal, and generates the smoke planes. It needs Python with numpy, scipy and Pillow.

## Checks

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript, strict |
| `npm run lint` | ESLint with typescript-eslint and React hooks rules |
| `npm run build` | Production build into `dist/` |
| `npm run smoke -- --url http://localhost:4173` | 39 browser checks: structure and names, exact contact links, hero text contrast measured on the rendered smoke, the hover reveal opening and closing, keyboard and focus, the dive handing the letter over to its stem, nav landing and focus, case-study dialog focus and scroll lock, mobile menu focus trap, reduced motion, images, runtime errors |
| `node scripts/contrast.mjs` | WCAG contrast of every text colour on every flat ground |
| `npm run check:links` | HTTP status of every external link |
| `node scripts/shoot.mjs --url ... --width 390 --height 844 --mobile --out lab/mobile` | Screenshots at every scroll step plus overflow, console-error and stuck-element report; `python3 scripts/sheet.py lab/mobile` tiles them |

The browser scripts drive the installed Google Chrome through `playwright-core`; run them against `npm run preview` after a build. `@playwright/cli` is installed for interactive checks (`npx playwright-cli open http://localhost:4173`).

## Deploy (Vercel)

`vercel.json` sets the build, output directory, cache headers and basic security headers; `public/404.html` is served for unknown paths.

1. Create an empty GitHub repository (for example `MOHIT-vp/mohit-portfolio`) and push this folder to it.
2. In Vercel choose **Add New → Project**, import the repository and keep the detected settings (framework Vite, build `npm run build`, output `dist`).
3. Deploy. Vercel provides `VERCEL_PROJECT_PRODUCTION_URL` at build time; the build uses it for the canonical URL and absolute share-image tags.
4. With a custom domain, set `SITE_URL` (for example `https://yourdomain.com`) and redeploy.
5. Check the share card with LinkedIn's Post Inspector and the X card preview.

## Structure

```text
src/
  content/      site.ts (all copy and links), graphs.ts (case-study diagrams)
  sections/     Hero, Dive, About, Work, Skills, Contact, Footer
  components/   Nav, IntroLoader, HeroReveal, CaseStudy, Diagram, Shot, RotatingWord
  field/        Ember.ts (the particle scene inside the dive)
  lib/          motion (GSAP, Lenis, in-page navigation, scroll pause), glass, env
  styles/       tokens.css, base.css, sections.css
  vendor/       liquid-glass (MIT)
public/         hero layers, project screens, favicon, share card, 404, robots.txt
design/         the supplied hero mockup (source for the hero layers; not deployed)
scripts/        verification and asset tools
docs/           research, design system, brief and fingerprint registry
```

## Credits and licences

- liquid-glass by Deepika Rao, MIT (licence and source commit in `src/vendor/liquid-glass/`).
- Archivo and Instrument Serif, SIL Open Font License, via Fontsource.
- GSAP (standard no-charge licence), Lenis (MIT), React (MIT).
- Structure inspired by [Dossier](https://github.com/gargibhardwaj24/dossier) by Gargi Bhardwaj; nothing from it is copied.
- Hero figure from the hero design supplied by Mohit Patil. Project screenshots are from his own public repositories.
