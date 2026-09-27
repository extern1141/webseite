import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SectionHeader } from './Reveal.jsx';

const steps = [
  {
    title: 'Kostenloses Erstgespräch',
    text: 'Wir lernen Ihr Unternehmen, Ihre Ziele und Ihre aktuelle IT-Landschaft kennen – unverbindlich.',
  },
  {
    title: 'Analyse & Konzept',
    text: 'Wir bewerten Ihre bestehende Infrastruktur und entwickeln eine passende Lösung: Cloud, On-Premise oder hybrid.',
  },
  {
    title: 'Umsetzung',
    text: 'Migration, Implementierung und Einrichtung – sauber geplant, damit Ihr Betrieb ungestört weiterläuft.',
  },
  {
    title: 'Betreuung & Wartung',
    text: 'Proaktives Monitoring, regelmäßige Wartung und schnelle Hilfe, wenn es darauf ankommt.',
  },
];

export default function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  return (
    <section id="ablauf" className="process">
      <div className="container">
        <SectionHeader
          eyebrow="So arbeiten wir"
          title="In vier Schritten zu besserer IT"
          text="Und finden Sie heraus, wie es besser, schneller und einfacher geht."
        />
        <div className="timeline" ref={ref}>
          <div className="timeline-line" aria-hidden="true">
            <motion.div className="timeline-fill" style={{ scaleY }} />
          </div>
          {steps.map((s, i) => (
            <motion.div
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
              >
                {i + 1}
              </motion.span>
              <div className="timeline-card">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
