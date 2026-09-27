import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import NetworkCanvas from './NetworkCanvas.jsx';
import Magnetic from './Magnetic.jsx';
import { SplitReveal } from './Reveal.jsx';
import { scrollToTarget } from '../lib/scroll.js';

const ease = [0.22, 1, 0.36, 1];
const chips = [
  { label: 'Cloud', icon: '☁', className: 'chip-a' },
  { label: 'On-Premise', icon: '▤', className: 'chip-b' },
  { label: 'Hybrid', icon: '⇄', className: 'chip-c' },
];

export default function Hero({ ready }) {
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
  const layerX = useSpring(useTransform(mx, [-0.5, 0.5], [-30, 30]), { stiffness: 120, damping: 18 });
  const layerY = useSpring(useTransform(my, [-0.5, 0.5], [-30, 30]), { stiffness: 120, damping: 18 });

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const go = (e, href) => {
    e.preventDefault();
    scrollToTarget(href);
  };

  return (
    <section id="home" className="hero" ref={ref} onPointerMove={onMove}>
      <NetworkCanvas className="hero-canvas" />
      <div className="hero-glow hero-glow-1" aria-hidden="true" />
      <div className="hero-glow hero-glow-2" aria-hidden="true" />

      <div className="container hero-container">
        <motion.div className="hero-content" style={{ y: contentY, opacity: contentOpacity }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease }}
          >
            <span className="pulse-dot" /> IT-Services aus Ludwigsburg
          </motion.span>

          <h1>
            <SplitReveal text="IT-Infrastruktur" animate={ready} delay={0.1} />
            <br />
            <SplitReveal text="für morgen" className="gradient-text" animate={ready} delay={0.3} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease, delay: 0.6 }}
          >
            Modernisieren Sie Ihre IT-Infrastruktur mit unserer umfassenden Expertise in Cloud, On-Premise und
            hybriden Umgebungen.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease, delay: 0.8 }}
          >
            <Magnetic>
              <a href="#contact" className="btn btn-primary" onClick={(e) => go(e, '#contact')}>
                <span>Jetzt Beratung buchen</span>
                <span className="btn-arrow">→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#dienste" className="btn btn-ghost" onClick={(e) => go(e, '#dienste')}>
                Dienste entdecken
              </a>
            </Magnetic>
          </motion.div>
          <motion.p
            className="hero-hint"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ delay: 1.6 }}
          >
            Tipp: Bewegen Sie die Maus oder klicken Sie ins Netzwerk.
          </motion.p>
        </motion.div>

        <motion.div
          className="hero-visual"
          style={{ y: visualY, scale: visualScale }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={ready ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, ease, delay: 0.3 }}
        >
          <motion.div className="hero-card" style={{ rotateX, rotateY }}>
            <img src="/img/hero.webp" alt="Netzwerk-Switch mit blauen Kabeln" width="1248" height="832" fetchPriority="high" />
            <div className="hero-card-shine" />
            <div className="hero-card-scan" />
          </motion.div>
          <motion.div className="hero-chips" style={{ x: layerX, y: layerY }}>
            {chips.map((c, i) => (
              <motion.div
                key={c.label}
                className={`chip ${c.className}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={ready ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1 + i * 0.15, type: 'spring', stiffness: 200, damping: 14 }}
              >
                <span className="chip-icon">{c.icon}</span>
                {c.label}
              </motion.div>
            ))}
          </motion.div>
          <div className="orbit orbit-1" aria-hidden="true" />
          <div className="orbit orbit-2" aria-hidden="true" />
        </motion.div>
      </div>

      <a href="#dienste" className="scroll-indicator" onClick={(e) => go(e, '#dienste')} aria-label="Nach unten scrollen">
        <span className="scroll-mouse">
          <span />
        </span>
        Scrollen
      </a>
    </section>
  );
}
