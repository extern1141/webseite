import { useEffect, useRef, useState } from 'react';
import NetworkCanvas from './NetworkCanvas.jsx';

// Version 4: feste 3D-Welt hinter der Seite. Jeder Wegpunkt der Kamera ist an einen
// Inhaltsbereich gekoppelt – die Kamera zeigt immer das Objekt zum Text, den man gerade liest.
const ANCHORS = {
  home: ['#home', '.marquee', '.service-sticky:nth-child(1)', '.service-sticky:nth-child(2)', '.service-sticky:nth-child(3)', '.why-us', '#contact', 'footer'],
  network: ['.page-hero', '.detail-row:nth-child(1)', '.detail-row:nth-child(2)', '.detail-row:nth-child(3)', '.detail-row:nth-child(3) .bullet-list', '.detail-row:nth-child(4)', '.cta-banner', 'footer'],
  studio: ['.page-hero', '.detail-row', '.detail-row .bullet-list', '.detail-row .bullet-list li:nth-child(3)', '.packages-section', '.faq-section', '.cta-banner', '#contact'],
  laptop: ['.page-hero', '.detail-section', '.detail-row:nth-child(1) .detail-text', '.detail-row:nth-child(2)', '.detail-row:nth-child(3)', '.process', '.trust-banner', '#contact'],
  vault: ['.page-hero', '.legal-card', 'footer'],
};

export default function WorldJourney({ world }) {
  const ref = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) {
      setFallback(true);
      return undefined;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let cleanup = () => {};
    import('../lib/worlds.js').then(({ createWorld }) => {
      if (disposed) return;
      const canvas = ref.current;
      const w = createWorld(canvas, world, { small: window.innerWidth < 760 });
      const pointer = { x: 0, y: 0 };
      let anchors = [];
      // Scrollpositionen, an denen die Kamera den jeweiligen Wegpunkt erreicht
      const measure = () => {
        const vh = window.innerHeight;
        const max = document.documentElement.scrollHeight - vh;
        let prev = -1;
        anchors = ANCHORS[world].map((sel, i) => {
          const el = document.querySelector(sel);
          let a = el ? el.getBoundingClientRect().top + window.scrollY - vh * 0.35 : (max * i) / (ANCHORS[world].length - 1);
          a = Math.min(max, Math.max(0, a));
          if (i === 0) a = 0;
          if (a <= prev) a = prev + 1;
          prev = a;
          return a;
        });
        anchors[anchors.length - 1] = Math.max(anchors[anchors.length - 1], max);
      };
      const progress = () => {
        const y = window.scrollY;
        const n = anchors.length - 1;
        for (let k = 0; k < n; k++) {
          if (y < anchors[k + 1]) return (k + Math.max(0, (y - anchors[k]) / (anchors[k + 1] - anchors[k]))) / n;
        }
        return 1;
      };
      let t = progress();
      let last = performance.now();
      let raf = 0;
      let running = false;
      // Automatische Qualität: ruckelt es (Durchschnitt über 1,5 s), wird stufenweise vereinfacht.
      // Reicht auch das nicht, bleibt die Szene als Standbild stehen und wird nur beim Scrollen neu gezeichnet.
      // Gemerkte Stufe für dieses Gerät (0–3, 4 = Standbild)
      let saved = 0;
      try {
        saved = Math.min(4, Number(localStorage.getItem('mdk-3d-quality')) || 0);
      } catch {
        /* Speicher blockiert */
      }
      const remember = (v) => {
        try {
          localStorage.setItem('mdk-3d-quality', String(v));
        } catch {
          /* Speicher blockiert */
        }
      };
      let quality = Math.min(saved, 3);
      if (quality) w.setQuality(quality);
      let slowSince = 0;
      let avg = 16;
      let still = saved >= 4;
      const frame = (now) => {
        const raw = now - last;
        const dt = Math.max(0, Math.min(raw / 1000, 0.05));
        last = now;
        if (!reduce && !still && raw > 0) {
          avg = avg * 0.9 + raw * 0.1;
          if (avg > 45) {
            slowSince ||= now;
            if (now - slowSince > 1500) {
              slowSince = 0;
              avg = 16;
              if (quality < 3) {
                w.setQuality(++quality);
                remember(quality);
              } else {
                still = true;
                remember(4);
                stop();
                window.addEventListener('scroll', onScroll, { passive: true });
              }
            }
          } else slowSince = 0;
        }
        const target = progress();
        t += (target - t) * (reduce || still ? 1 : 1 - Math.pow(0.002, dt));
        w.render(t, reduce ? 0 : dt, reduce ? 0 : now / 1000, pointer);
        if (running) raf = requestAnimationFrame(frame);
      };
      const start = () => {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
      const resize = () => {
        w.resize(window.innerWidth, window.innerHeight);
        measure();
      };
      const onMove = (e) => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
      };
      const onVis = () => (document.hidden ? stop() : start());
      let pending = false;
      const onScroll = () => {
        if (!(reduce || still) || pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          frame(performance.now());
        });
      };
      resize();
      // Layout kann sich nach dem Laden noch ändern (Schriften, Bilder)
      const ro = new ResizeObserver(measure);
      ro.observe(document.body);
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('visibilitychange', onVis);
      if (reduce || still) {
        window.addEventListener('scroll', onScroll, { passive: true });
        frame(performance.now());
      } else start();
      canvas.classList.add('is-ready');
      cleanup = () => {
        stop();
        ro.disconnect();
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', onVis);
        w.dispose();
      };
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [world]);

  if (fallback) return <NetworkCanvas className="scene-3d is-ready" />;
  return (
    <>
      <canvas ref={ref} className="scene-3d world-canvas" aria-hidden="true" />
      <div className="world-shade" aria-hidden="true" />
    </>
  );
}
