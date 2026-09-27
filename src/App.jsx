import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { initSmoothScroll, stopScroll } from './lib/scroll.js';
import Preloader from './components/Preloader.jsx';
import Cursor from './components/Cursor.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Services from './components/Services.jsx';
import Process from './components/Process.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

// Der Preloader wird nur beim ersten Besuch pro Sitzung gezeigt
function shouldShowPreloader() {
  try {
    if (sessionStorage.getItem('mdk-intro')) return false;
    sessionStorage.setItem('mdk-intro', '1');
  } catch {
    /* Speicher blockiert – Intro trotzdem zeigen */
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const [loading, setLoading] = useState(shouldShowPreloader);

  useEffect(() => initSmoothScroll(), []);

  useEffect(() => {
    stopScroll(loading);
    document.documentElement.classList.toggle('is-loading', loading);
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader onDone={() => setLoading(false)} />}</AnimatePresence>
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero ready={!loading} />
        <Marquee />
        <Services />
        <Process />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  );
}
