import { useEffect, useRef } from 'react';
import { contact, profile, socials } from '../content/site';
import { RotatingWord } from '../components/RotatingWord';
import { finePointer, reducedMotion } from '../lib/env';
import { gsap } from '../lib/motion';

/**
 * A sun rises out of the bottom edge and grows until it is the whole screen,
 * then the invitation lands on it. The address leans toward the pointer.
 */
export function Contact() {
  const section = useRef<HTMLElement>(null);
  const mail = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true } });
      tl.fromTo('.contact__sun', { scale: 0.7, yPercent: 12 }, { scale: 1, yPercent: 0, ease: 'power1.out', duration: 0.2 })
        .to('.contact__sun', { scale: 7, ease: 'power2.in', duration: 0.45 })
        .fromTo('.contact__content > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.2, ease: 'power2.out' }, 0.52);
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = mail.current;
    if (!el || reducedMotion() || !finePointer()) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'expo.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'expo.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.1);
      y((e.clientY - (r.top + r.height / 2)) * 0.25);
    };
    const reset = () => { x(0); y(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); };
  }, []);

  const [user, domain] = profile.email.split('@');

  return (
    <section id="contact" className="contact" ref={section} data-land="end" aria-labelledby="contact-title">
      <div className="contact__stage">
        <div className="contact__sun" aria-hidden="true" />
        <div className="wrap contact__content">
          <h2 id="contact-title" className="contact__title">
            {contact.lead}
            <br />
            <RotatingWord words={contact.rotating} className="contact__rot" interval={2600} />
          </h2>
          <p className="contact__note">{contact.note}</p>
          <a className="contact__mail" href={`mailto:${profile.email}`} ref={mail}>
            <span>{user}</span><span className="contact__at">@{domain}</span>
          </a>
          <ul className="contact__links">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
