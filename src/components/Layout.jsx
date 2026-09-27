import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { initSmoothScroll, handleAnchorClick, scrollToTarget } from '../lib/scroll.js';
import Cursor from './Cursor.jsx';
import ScrollProgress from './ScrollProgress.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Grundgerüst jeder Seite: Navigation, Effekte, Footer und weiches Scrollen
export default function Layout({ current, children }) {
  useEffect(() => {
    const stop = initSmoothScroll();
    document.addEventListener('click', handleAnchorClick);
    // Beim Öffnen mit #abschnitt (z. B. /#contact von einer Unterseite) dorthin scrollen
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => scrollToTarget(el), 100);
    }
    return () => {
      stop();
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Cursor />
      <ScrollProgress />
      <Navbar current={current} />
      <main id="top">{children}</main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  );
}
