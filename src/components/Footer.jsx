import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FOOTER } from '../content/site.js';

export default function Footer({ text = FOOTER.text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], ['50%', '0%']);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ['0.3em', '0em']);

  return (
    <footer className="footer" ref={ref}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="nav-brand">
              <img src="/img/logo-light.png" alt="" width="40" height="40" />
              <span>MDK-IT</span>
            </a>
            <p>{text}</p>
          </div>
          {FOOTER.columns.map((col) => (
            <nav className="footer-links" key={col.title} aria-label={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MDK-IT. Alle Rechte vorbehalten.</p>
          <div className="footer-legal-links">
            <a href="/impressum.html">Impressum</a>
            <a href="/datenschutz.html">Datenschutz</a>
            <a href="#top" className="to-top">
              Nach oben ↑
            </a>
          </div>
        </div>
      </div>
      <motion.div className="footer-word" style={{ y, letterSpacing }} aria-hidden="true">
        MDK-IT
      </motion.div>
    </footer>
  );
}
