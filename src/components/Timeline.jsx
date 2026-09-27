import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SectionHeader } from './Reveal.jsx';

// Schritte, die sich beim Scrollen entlang einer leuchtenden Linie aufbauen
export default function Timeline({ id, eyebrow, title, text, steps, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  return (
    <section id={id} className="process">
      <div className="container">
        <SectionHeader eyebrow={eyebrow} title={title} text={text} />
        <div className="timeline" ref={ref}>
          <div className="timeline-line" aria-hidden="true">
            <motion.div className="timeline-fill" style={{ scaleY }} />
          </div>
          <ol className="timeline-list">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                className={`timeline-step ${i % 2 ? 'right' : 'left'}`}
                initial={{ opacity: 0, x: i % 2 ? 60 : -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="timeline-node"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.2 }}
                  aria-hidden="true"
                >
                  {i + 1}
                </motion.span>
                <div className="timeline-card">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
        {children}
      </div>
    </section>
  );
}
