import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { SplitReveal } from './Reveal.jsx';

const ease = [0.22, 1, 0.36, 1];

// Kopfbereich der Unterseiten mit interaktivem Netzwerk im Hintergrund
export default function PageHero({ badge, title, text, compact }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const still = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', still ? '0%' : '35%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, still ? 1 : 0]);

  return (
    <section className={`page-hero ${compact ? 'compact' : ''}`} ref={ref}>
      <div className="hero-glow hero-glow-1" aria-hidden="true" />
      <div className="hero-glow hero-glow-2" aria-hidden="true" />
      <motion.div className="container page-hero-inner" style={{ y, opacity }}>
        {badge && (
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
            <span className="pulse-dot" /> {badge}
          </motion.span>
        )}
        <SplitReveal as="h1" text={title} animate delay={0.1} />
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.45 }}>
          {text}
        </motion.p>
      </motion.div>
    </section>
  );
}
