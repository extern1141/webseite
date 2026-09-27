import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { scrollToTarget, stopScroll } from '../lib/scroll.js';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#dienste', label: 'Dienste' },
  { href: '#ablauf', label: 'Ablauf' },
  { href: '#contact', label: 'Kontakt' },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    // kurz warten, damit das Menü schließt und Scrollen wieder erlaubt ist
    setTimeout(() => scrollToTarget(href), open ? 350 : 0);
  };

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'is-scrolled' : ''}`}
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container nav-inner">
          <a href="#home" className="nav-brand" onClick={(e) => go(e, '#home')}>
            <img src="/img/logo-light.png" alt="MDK-IT Logo" width="44" height="44" />
            <span>MDK-IT</span>
          </a>
          <ul className="nav-menu">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => go(e, l.href)} data-text={l.label}>
                  <span>{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" className="btn btn-ghost btn-small nav-cta" onClick={(e) => go(e, '#contact')}>
            Erstgespräch
          </a>
          <button
            className={`hamburger ${open ? 'active' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul>
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                >
                  <a href={l.href} onClick={(e) => go(e, l.href)}>
                    <span className="mobile-index">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="mobile-contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <a href="tel:+491776992314">+49 (0) 177 699 2314</a>
              <a href="mailto:info@mdk-it.com">info@mdk-it.com</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
