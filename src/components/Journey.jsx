import { useEffect, useRef, useState } from 'react';
import { scrollToTarget } from '../lib/scroll.js';

// Version 3: Scroll-Reise vom Globus durch Rechenzentrum, Mainboard und Netzwerkkabel bis zur Webseite.
// Die 3D-Welt (lib/journeyScene.js) wird erst im Browser geladen; ohne WebGL oder bei
// "Bewegung reduzieren" wird der Abschnitt ausgeblendet und die Seite startet direkt mit dem Hero.
const captions = [
  { at: 0.07, kicker: 'Scrollen Sie, um einzutauchen', title: 'Ihr Unternehmen. Vernetzt.', text: 'Von Ludwigsburg aus verbinden wir Ihre IT mit der Welt.' },
  { at: 0.29, kicker: '01 · Server & Cloud', title: 'Das Rechenzentrum', text: 'On-Premise-Server, Azure Cloud, Storage und Backups – sicher und skalierbar.' },
  { at: 0.5, kicker: '02 · Hardware', title: 'Bis ins Detail', text: 'Vom Mainboard bis zur SSD: Aufrüstung, Reparatur und Datenrettung.' },
  { at: 0.72, kicker: '03 · Netzwerk', title: 'Durch die Leitung', text: 'Switches, Firewalls, WLAN und strukturierte Verkabelung – Ihre Daten auf der Überholspur.' },
  { at: 0.93, kicker: '04 · Webdesign & SEO', title: 'Am Ziel: Ihr Auftritt', text: 'Moderne Webseite, lokales SEO und Google Maps – damit Kunden Sie finden.' },
];
const BOUNDS = [0.18, 0.4, 0.6, 0.84];

export default function Journey() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const flashRef = useRef(null);
  const capRefs = useRef([]);
  const barRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | ready | off

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const test = document.createElement('canvas');
    if (reduce || !(test.getContext('webgl2') || test.getContext('webgl'))) {
      setState('off');
      return undefined;
    }
    let disposed = false;
    let cleanup = () => {};
    import('../lib/journeyScene.js').then(({ createJourney }) => {
      if (disposed) return;
      const small = window.innerWidth < 760;
      const j = createJourney(canvasRef.current, { small });
      const pointer = { x: 0, y: 0 };
      let p = 0;
      let visible = true;
      let raf = 0;
      let last = performance.now();
      const resize = () => j.resize(window.innerWidth, window.innerHeight);
      const onMove = (e) => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
      };
      const progress = () => {
        const r = sectionRef.current.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        return Math.min(1, Math.max(0, -r.top / total));
      };
      const frame = (now) => {
        const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
        last = now;
        const target = progress();
        p += (target - p) * (1 - Math.pow(0.0005, dt)); // weich nachziehen
        if (visible) j.render(p, dt, now / 1000, pointer);
        // Lichtblitz an den Übergängen, Weißblende am Ende in die Seite
        let flash = 0;
        for (const b of BOUNDS) flash = Math.max(flash, 1 - Math.abs(p - b) / 0.022);
        flashRef.current.style.opacity = Math.max(0, flash).toFixed(3);
        sectionRef.current.style.setProperty('--fade-out', Math.max(0, (p - 0.965) / 0.035).toFixed(3));
        captions.forEach((c, i) => {
          const d = i === 0 && p < c.at ? 0 : Math.abs(p - c.at);
          const o = Math.max(0, 1 - d / 0.075);
          const el = capRefs.current[i];
          el.style.opacity = o.toFixed(3);
          el.style.transform = `translate3d(0, ${((p - c.at) * -400).toFixed(1)}px, 0)`;
        });
        barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        raf = requestAnimationFrame(frame);
      };
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(sectionRef.current);
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', onMove, { passive: true });
      raf = requestAnimationFrame(frame);
      setState('ready');
      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onMove);
        j.dispose();
      };
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <section ref={sectionRef} className={`journey is-${state}`} aria-label="Animierte Einführung">
      <div className="journey-sticky">
        <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />
        <div className="journey-vignette" aria-hidden="true" />
        <div ref={flashRef} className="journey-flash" aria-hidden="true" />
        <div className="journey-captions">
          {captions.map((c, i) => (
            <div key={c.title} ref={(el) => (capRefs.current[i] = el)} className={`journey-caption ${i === 0 ? 'first' : ''}`}>
              <span className="eyebrow">{c.kicker}</span>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
        <div className="journey-rail" aria-hidden="true">
          <span ref={barRef} />
        </div>
        <button className="journey-skip btn btn-ghost btn-small" onClick={() => scrollToTarget('#home')}>
          Intro überspringen ↓
        </button>
        <div className="journey-fadeout" aria-hidden="true" />
      </div>
    </section>
  );
}
