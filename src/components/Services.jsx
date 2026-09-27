import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TiltCard from './TiltCard.jsx';
import { SectionHeader } from './Reveal.jsx';

const services = [
  {
    title: 'IT-Infrastruktur',
    image: '/img/infra.webp',
    alt: 'Serverraum mit IT-Infrastruktur',
    text: 'Professioneller Aufbau und gezielte Weiterentwicklung Ihrer IT-Infrastruktur – individuell abgestimmt auf Ihre Anforderungen. Wir übernehmen die Migration, Implementierung und Verwaltung von Cloud-, hybriden und On-Premise-Lösungen und sorgen für maximale Skalierbarkeit, Sicherheit und Zukunftsfähigkeit.',
    tags: ['Migration', 'Implementierung', 'Cloud & Hybrid', 'Skalierbarkeit'],
    accent: '#3d8bff',
  },
  {
    title: 'Datensicherung & Recovery',
    image: '/img/backup.webp',
    alt: 'Datensicherung und Recovery',
    text: 'Ihre Daten sind das Herz Ihres Unternehmens – wir sorgen für deren Sicherheit. Durch intelligente Backup-Lösungen und klar strukturierte Recovery-Konzepte gewährleisten wir eine schnelle Wiederherstellung und minimieren Ausfallzeiten auf ein Minimum.',
    tags: ['Backup-Lösungen', 'Recovery-Konzepte', 'Schnelle Wiederherstellung'],
    accent: '#00e5ff',
  },
  {
    title: 'IT Support & Wartung',
    image: '/img/support.webp',
    alt: 'IT Support und Wartung',
    text: 'Ein zuverlässiger IT-Betrieb erfordert kontinuierliche Betreuung – genau dafür sind wir da. Mit proaktivem Monitoring, regelmäßiger Wartung und schnellen Reaktionszeiten erkennen wir Probleme frühzeitig und beheben Störungen effizient. So stellen wir sicher, dass Ihre IT jederzeit stabil, sicher und leistungsfähig bleibt – damit Sie sich auf Ihr Kerngeschäft konzentrieren können.',
    tags: ['Proaktives Monitoring', 'Regelmäßige Wartung', 'Schnelle Reaktion'],
    accent: '#8b5cff',
  },
];

function ServiceCard({ service, index, total, progress }) {
  const ref = useRef(null);
  // Bild-Parallaxe innerhalb der Karte
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  // Vorherige Karten werden kleiner und dunkler, wenn die nächste darüber gleitet
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - index - 1) * 0.05]);
  const dim = useTransform(progress, [start, Math.min(start + 1 / total, 1)], [0, index === total - 1 ? 0 : 0.45]);

  return (
    <div className="service-sticky" ref={ref} style={{ top: `calc(14vh + ${index * 28}px)` }}>
      <motion.article className="service-card-wrap" style={{ scale, '--accent': service.accent }}>
        <TiltCard className="service-card" max={4}>
          <div className="service-text">
            <span className="service-index">0{index + 1}</span>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <ul className="service-tags">
              {service.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="service-image">
            <motion.img src={service.image} alt={service.alt} loading="lazy" decoding="async" style={{ scale: imgScale }} />
          </div>
        </TiltCard>
        <motion.div className="service-dim" style={{ opacity: dim }} aria-hidden="true" />
      </motion.article>
    </div>
  );
}

export default function Services() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section id="dienste" className="services">
      <div className="container">
        <SectionHeader eyebrow="Unsere Dienste" title="Alles für Ihre IT-Infrastruktur" />
        <div className="services-stack" ref={ref}>
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} total={services.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
