import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import NetworkCanvas from './NetworkCanvas.jsx';
import Magnetic from './Magnetic.jsx';
import Icon from './Icon.jsx';
import { SplitReveal } from './Reveal.jsx';

const ease = [0.22, 1, 0.36, 1];
const chips = [
  { label: 'IT-Infrastruktur', icon: 'monitor', href: '/it-infrastruktur.html', className: 'chip-a' },
  { label: 'Webdesign & SEO', icon: 'globe', href: '/webdesign-seo.html', className: 'chip-b' },
  { label: 'Reparaturen', icon: 'wrench', href: '/reparaturen-datenrettung.html', className: 'chip-c' },
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const visualY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  // 3D-Neigung des Bildes abhängig von der Mausposition
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 });
  const layerX = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 18 });
  const layerY = useSpring(useTransform(my, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 18 });

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section id="home" className="hero" ref={ref} onPointerMove={onMove}>
      <NetworkCanvas className="hero-canvas" />
      <div className="hero-glow hero-glow-1" aria-hidden="true" />
      <div className="hero-glow hero-glow-2" aria-hidden="true" />

      <div className="container hero-container">
        <motion.div className="hero-content" style={{ y: contentY, opacity: contentOpacity }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
            <span className="pulse-dot" /> IT-Services aus Ludwigsburg
          </motion.span>

          <h1 aria-label="Moderne IT-Systeme & starke Webauftritte">
            <SplitReveal text="Moderne IT-Systeme" animate delay={0.1} />
            <br />
            <SplitReveal text="& starke Webauftritte" className="gradient-text" animate delay={0.3} />
          </h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.6 }}>
            Wir machen Ihre IT zukunftssicher, bauen Ihre digitale Präsenz von Grund auf auf und retten Ihre Daten. Professionelle Lösungen
            für Unternehmen, Gründer und Privatkunden.
          </motion.p>

          <motion.div className="hero-actions" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.8 }}>
            <Magnetic>
              <a href="#contact" className="btn btn-primary">
                <span>Jetzt Erstgespräch vereinbaren</span>
                <Icon name="arrow" size={18} className="btn-arrow" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#dienste" className="btn btn-ghost">
                Unsere 3 Bereiche
              </a>
            </Magnetic>
          </motion.div>
          <motion.p className="hero-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
            Tipp: Bewegen Sie die Maus oder klicken Sie ins Netzwerk.
          </motion.p>
        </motion.div>

        <motion.div
          className="hero-visual"
          style={{ y: visualY, scale: visualScale }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.3 }}
        >
          <motion.div className="hero-card" style={{ rotateX, rotateY }}>
            <img
              src="/img/hero.webp"
              alt="MDK-IT B2B Netzwerkverkabelung und IT-Systeme in Ludwigsburg"
              width="1024"
              height="1024"
              fetchPriority="high"
            />
            <div className="hero-card-shine" />
            <div className="hero-card-scan" />
          </motion.div>
          <motion.div className="hero-chips" style={{ x: layerX, y: layerY }}>
            {chips.map((c, i) => (
              <motion.a
                key={c.label}
                href={c.href}
                className={`chip ${c.className}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.15, type: 'spring', stiffness: 200, damping: 14 }}
              >
                <span className="chip-icon">
                  <Icon name={c.icon} size={16} />
                </span>
                {c.label}
              </motion.a>
            ))}
          </motion.div>
          <div className="orbit orbit-1" aria-hidden="true" />
          <div className="orbit orbit-2" aria-hidden="true" />
        </motion.div>
      </div>

      <a href="#dienste" className="scroll-indicator" aria-label="Nach unten scrollen">
        <span className="scroll-mouse">
          <span />
        </span>
        Scrollen
      </a>
    </section>
  );
}
