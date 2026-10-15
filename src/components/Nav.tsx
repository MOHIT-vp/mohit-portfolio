import { useEffect, useRef, useState } from 'react';
import { labels, navLinks, profile } from '../content/site';
import { applyGlass } from '../lib/glass';
import { goTo } from '../lib/motion';

const SECTIONS = navLinks.map((l) => l.href.slice(1));

/**
 * Transparent over the hero, as in the supplied design. Once the hero has
 * scrolled away the bar gains a liquid-glass backing so it stays legible on
 * every ground. The current section is marked with aria-current.
 */
export function Nav() {
  const glass = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [solid, setSolid] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => (glass.current ? applyGlass(glass.current, { scale: -54, chroma: 3 }) : undefined), []);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setSolid(window.scrollY > window.innerHeight * 0.9);
      const line = window.innerHeight * 0.35;
      const hit = SECTIONS.find((id) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        return r && r.top <= line && r.bottom > line;
      });
      setCurrent(hit ?? null);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // The menu only exists below the desktop breakpoint: if the window grows past it, close it.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
    const onChange = () => { if (wide.matches) setOpen(false); };
    wide.addEventListener('change', onChange);
    return () => wide.removeEventListener('change', onChange);
  }, []);

  // Menu: Escape closes and returns focus; Tab cycles through the menu and its Close button.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const focusables = () => [...Array.from(menu?.querySelectorAll<HTMLElement>('a, button') ?? []), toggleRef.current!].filter(Boolean);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
      if (e.key === 'Tab') {
        // the Close button sits before the menu in the DOM, so step through the cycle explicitly
        e.preventDefault();
        const f = focusables();
        const i = f.indexOf(document.activeElement as HTMLElement);
        f[i === -1 ? 0 : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('menu-open');
    return () => { document.removeEventListener('keydown', onKey); document.documentElement.classList.remove('menu-open'); };
  }, [open]);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (!open) return goTo(href);
    // let the menu close (and release the scroll lock) before travelling
    setOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => goTo(href)));
  };

  return (
    <header className={`nav${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <a className="skip" href="#work" onClick={(e) => jump(e, '#work')}>Skip to the work</a>
      <div className="nav__bar">
        <span className="nav__glass" ref={glass} aria-hidden="true" />
        <a className="nav__mono" href="#top" onClick={(e) => jump(e, '#top')} aria-label={`${profile.name}, back to top`}>
          {/* a ligature: the P grows out of the M's last stem */}
          <span aria-hidden="true" className="mono">M<span className="mono__p">P</span></span>
        </a>
        <nav className="nav__links" aria-label="Sections">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => jump(e, l.href)} aria-current={current === l.href.slice(1) ? 'location' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="nav__cta" href="#contact" onClick={(e) => jump(e, '#contact')}>
          {labels.connect} <span aria-hidden="true">↗</span>
        </a>
        <button ref={toggleRef} className="nav__toggle" type="button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <div id="menu" className="menu" ref={menuRef} hidden={!open}>
        <nav aria-label="Menu">
          <ul className="menu__list">
            {[{ href: '#top', label: 'Home' }, ...navLinks].map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => jump(e, l.href)}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="menu__mail" href={`mailto:${profile.email}`}>{profile.email}</a>
      </div>
    </header>
  );
}
