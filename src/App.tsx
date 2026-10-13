import { useCallback, useEffect, useState } from 'react';
import { IntroLoader } from './components/IntroLoader';
import { Nav } from './components/Nav';
import { Hero } from './sections/Hero';
import { Dive } from './sections/Dive';
import { About } from './sections/About';
import { Work } from './sections/Work';
import { Skills } from './sections/Skills';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { reducedMotion } from './lib/env';
import { pauseScroll, ScrollTrigger, startLenis } from './lib/motion';

const INTRO_KEY = 'mp-intro-seen';

/** The intro plays once per session, never with reduced motion, and never on a deep link. */
function shouldIntro() {
  if (reducedMotion() || location.hash) return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function App() {
  const [intro, setIntro] = useState(shouldIntro);

  useEffect(() => startLenis(), []);

  useEffect(() => {
    if (!intro) return;
    window.scrollTo(0, 0);
    return pauseScroll();
  }, [intro]);

  const endIntro = useCallback(() => {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* storage unavailable: the intro may replay */ }
    setIntro(false);
  }, []);

  useEffect(() => {
    // fonts and lazy images change heights; re-measure scroll triggers once they settle
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  return (
    <>
      {intro && <IntroLoader onDone={endIntro} />}
      <Nav />
      <main id="main">
        <Hero />
        <Dive />
        <About />
        <Work />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
