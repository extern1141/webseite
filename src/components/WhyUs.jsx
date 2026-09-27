import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TiltCard from './TiltCard.jsx';
import Icon from './Icon.jsx';
import { SplitReveal, FadeUp } from './Reveal.jsx';

const features = [
  {
    icon: 'pin',
    title: 'Persönlich & Regional vor Ort',
    text: 'Wir betreuen Kunden in Ludwigsburg, Stuttgart und Umgebung persönlich. Sie haben stets einen festen, kompetenten Ansprechpartner.',
  },
  {
    icon: 'layers',
    title: 'Alles aus einer Hand',
    text: 'Von der Netzwerkdose im Büro über die eigene Firmen-E-Mail bis hin zur fertigen Webseite und Flyern – wir decken Ihren gesamten digitalen Bedarf ab.',
  },
  {
    icon: 'lock',
    title: 'Höchste Datensicherheit & Zuverlässigkeit',
    text: 'Egal ob sensible Firmendaten auf dem Server oder private Hochzeitsfotos auf einer kaputten Festplatte – wir gehen mit Ihren Daten maximal sorgsam und professionell um.',
  },
];

export default function WhyUs() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const frameRotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  return (
    <section className="why-us" ref={ref}>
      <div className="container why-grid">
        <div className="why-visual">
          <motion.div className="why-frame" style={{ rotate: frameRotate }} aria-hidden="true" />
          <TiltCard className="why-image" max={8}>
            <motion.img
              src="/img/support.webp"
              alt="Persönliche B2B IT-Beratung und Support für KMU im Raum Ludwigsburg"
              loading="lazy"
              decoding="async"
              width="1360"
              height="752"
              style={{ y: imgY, scale: 1.2 }}
            />
          </TiltCard>
        </div>
        <div className="why-features">
          <FadeUp as="span" className="eyebrow">
            Warum wir
          </FadeUp>
          <SplitReveal as="h2" text="Warum MDK-IT der richtige Partner für Sie ist" />
          <FadeUp as="p" className="why-lead" delay={0.15}>
            Bei uns stehen Sie als Kunde im Mittelpunkt. Wir verzichten auf Fachchinesisch und bieten echten, verlässlichen Service vor Ort.
          </FadeUp>
          <div className="why-list">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={0.1 * i} y={30}>
                <div className="why-feature">
                  <span className="why-feature-icon">
                    <Icon name={f.icon} />
                  </span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
