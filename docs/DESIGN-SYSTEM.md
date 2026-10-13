# Design system

Source of truth: `src/styles/tokens.css`. Copy lives in `src/content/site.ts`.

## Colour

From the supplied hero (smoke reds and orange, gold headline, cream type), a dark brown ground for the long middle of the page (as in Dossier), the deep green kept from the original brief for HELIX-X, and burnt orange for the closing sun.

| Token | Hex | Used for |
| --- | --- | --- |
| `--c-cream` | `#F4EAD8` | Text on dark grounds, giant words |
| `--c-cream-soft` | `#D8C7AE` | Secondary text on brown |
| `--c-gold` | `#F7AE3F` | Rotating words and accents on dark grounds (the hero headline uses a lighter `#FFDB85` so it holds 3:1 on the bright smoke) |
| `--c-fire` | `#E8461C` | The dive panel, sun edge, footer top |
| `--c-ember` | `#E87F24` | The sun, contact ground with reduced motion |
| `--c-blood` | `#5E140C` | Footer floor |
| `--c-brown` | `#241109` | Page ground: about, work, contact before the sun |
| `--c-ink` | `#120806` | Text on light and orange grounds, dark button |
| `--c-green` | `#283F24` | HELIX-X slide |
| `--c-paper` | `#ECE4D6` | Skills, paper slides, case-study sheet |

Every text pair is checked in `scripts/contrast.mjs`; text over the hero smoke is measured on the rendered page by `scripts/smoke.mjs` (a scrim sits only behind the copy column).

## Type

- **Archivo Variable** (width 62 to 125%, weight 100 to 900): everything set in sans. Condensed heavy for the giant words (PORTFOLIO, LOOK CLOSER, MP), normal width at 620 for the hero headline, 720 to 800 for section display, 400 to 600 for body.
- **Instrument Serif** (regular and italic): the MP monogram, italic accents (*inside*, *with*, card taglines, principle titles, rotating contact words).

Fluid sizes: hero headline is bounded by both width and height so short widescreens keep the button clear of the giant word. Display words that must span the screen are SVG text with `textLength`, so they always fit exactly.

## Space and shape

- 4px-based scale `--s-1` to `--s-10`, gutter `clamp(1.25rem, 4.6vw, 4.75rem)`, content max 1520px.
- Controls are pills. Project slides 18px, media 10px, case-study sheet 22px.

## Motion

- One easing family: `expo.out` for entrances, scroll-scrubbed timelines are linear to the scroll.
- Every motion has a job: the intro introduces the mark; the hero planes move at different rates (depth); the reveal answers the pointer; the dive is a change of scene; the curve connects the statement to the areas of work; slides scale as they arrive (sequence); the sun is the ending; the footer resolves.
- Pinned scenes use CSS `position: sticky` inside a taller runway; ScrollTrigger only reads progress. Lenis smooths wheel input; keyboard and touch stay native. In-page links move focus to the destination heading.
- `prefers-reduced-motion`: no intro, no pinning (hero, dive and contact collapse to normal height), dive panel and sun removed, all text visible, marquee stopped.
- Forced colours: decorative layers are hidden and controls get real borders.

## Signature pieces

- **Hover reveal**: an SVG over the hero stage. A circle warped by animated fractal noise (`feTurbulence` + `feDisplacementMap`) masks a dark window holding the figure re-dressed in blue and gold (a colour remap of the photograph, made by `scripts/hero-assets.py`); the same warped shape, larger and blurred, makes the glowing white edge. It trails the pointer with easing, opens only over the figure, and works on touch by pressing. Reduced motion keeps the reveal but stops the wobble and the trailing.
- **Dive**: the cut-out word is masked in real pixels; the camera zooms about the measured centre of the first letter's stem. Past 6x the glyph is swapped for an identical rectangle, because browsers stop rasterising text at extreme sizes.
- **Curve**: an SVG path computed from the live positions of the "I" and the list, drawn with `pathLength=1` and a scrubbed dash offset.
