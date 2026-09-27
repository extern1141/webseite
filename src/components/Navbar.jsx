import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { stopScroll } from '../lib/scroll.js';
import { CONTACT, NAV } from '../content/site.js';

export default function Navbar({ current }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Auf Seiten ohne Kontaktbereich (Impressum, Datenschutz) führt der Button zur Startseite
  const ctaHref = current === 'impressum' || current === 'datenschutz' ? '/#contact' : '#contact';

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200 && !open);
    setScrolled(y > 30);
  });

  useEffect(() => {
    stopScroll(open);
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'is-scrolled' : ''}`}
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Hauptnavigation"
      >
        <div className="container nav-inner">
          <a href="/" className="nav-brand" onClick={close}>
            <img src="/img/logo-light.png" alt="MDK-IT Logo" width="44" height="44" />
            <span>MDK-IT</span>
          </a>
          <ul className="nav-menu">
            {NAV.map((l) => (
              <li key={l.key}>
                <a href={l.href} data-text={l.label} className={current === l.key ? 'active' : undefined} aria-current={current === l.key ? 'page' : undefined}>
                  <span>{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href={ctaHref} className="btn btn-ghost btn-small nav-cta">
            Erstgespräch buchen
          </a>
          <button
            className={`hamburger ${open ? 'active' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <span />
            <span />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul>
              {[...NAV, { key: 'cta', href: ctaHref, label: 'Erstgespräch buchen' }].map((l, i) => (
                <motion.li
                  key={l.key}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                >
                  <a href={l.href} onClick={close} className={current === l.key ? 'active' : undefined}>
                    <span className="mobile-index">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div className="mobile-contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}>
              <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
