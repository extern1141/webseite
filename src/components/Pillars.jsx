import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import TiltCard from './TiltCard.jsx';
import Icon from './Icon.jsx';
import { SectionHeader } from './Reveal.jsx';

const pillars = [
  {
    title: 'IT-Infrastruktur & Support',
    icon: 'monitor',
    image: '/img/switch.webp',
    alt: 'Netzwerk-Switch mit Patchkabeln im Serverschrank',
    text: 'Umfassender Aufbau und Betreuung für kleine und mittelständische Unternehmen. Netzwerkequipment (Switche, WLAN Access Points, Router, Firewalls), On-Premise Server oder Azure Cloud, Storage- und Backup-Lösungen sowie proaktive Wartung.',
    href: '/it-infrastruktur.html',
    link: 'Mehr zur Infrastruktur',
    accent: '#3d8bff',
  },
  {
    title: 'Webdesign & Digitalstart',
    icon: 'globe',
    image: '/img/webdesign.webp',
    alt: 'Webdesign und lokale SEO-Optimierung',
    text: 'Das Rundum-Sorglos-Paket für Neugründungen und Firmen ohne Webpräsenz. Wir übernehmen alles: Logo, Domänenkauf, E-Mail-Einrichtung, moderne DSGVO-konforme Webseite, lokales SEO, Google Maps-Eintrag, Social Media und Flyer.',
    href: '/webdesign-seo.html',
    link: 'Mehr zu den Paketen',
    accent: '#00e5ff',
  },
  {
    title: 'Reparaturen & Datenrettung',
    icon: 'wrench',
    image: '/img/repair.webp',
    alt: 'Laptop-Reparatur und Hardware-Austausch',
    text: 'Schnelle und unkomplizierte Hilfe für Privatpersonen und Home-Offices. Kleinreparaturen von Laptops, Austausch von Displays, Batterien oder SSDs, unabhängige Kaufberatung sowie professionelle Datenwiederherstellung.',
    href: '/reparaturen-datenrettung.html',
    link: 'Mehr zu den Reparaturen',
    accent: '#8b5cff',
  },
];

function PillarCard({ pillar, index, total, progress }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const still = useReducedMotion();
  const imgScale = useTransform(scrollYProgress, [0, 1], [still ? 1 : 1.35, 1]);
  // Vorherige Karten werden kleiner und dunkler, wenn die nächste darüber gleitet
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, still ? 1 : 1 - (total - index - 1) * 0.05]);
  const dim = useTransform(progress, [start, Math.min(start + 1 / total, 1)], [0, index === total - 1 || still ? 0 : 0.45]);

  return (
    <div className="service-sticky" ref={ref} style={{ top: `calc(14vh + ${index * 28}px)` }}>
      <motion.article className="service-card-wrap" style={{ scale, '--accent': pillar.accent }}>
        <TiltCard className="service-card" max={4}>
          <div className="service-text">
            <div className="service-head">
              <span className="service-index">0{index + 1}</span>
              <span className="service-icon">
                <Icon name={pillar.icon} size={26} />
              </span>
            </div>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
            <a href={pillar.href} className="pillar-link">
              <span>{pillar.link}</span>
              <Icon name="arrow" size={18} />
            </a>
          </div>
          <div className="service-image">
            <motion.img src={pillar.image} alt={pillar.alt} loading="lazy" decoding="async" width="1024" height="1024" style={{ scale: imgScale }} />
          </div>
        </TiltCard>
        <motion.div className="service-dim" style={{ opacity: dim }} aria-hidden="true" />
      </motion.article>
    </div>
  );
}

// Die drei Bereiche als gestapelte Karten, die beim Scrollen übereinander gleiten
export default function Pillars() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section id="dienste" className="services">
      <div className="container">
        <SectionHeader
          eyebrow="Unsere 3 Bereiche"
          title="Wie wir Ihnen helfen können"
          text="Einfache, transparente und professionelle Dienstleistungen für jeden Bedarf."
        />
        <div className="services-stack" ref={ref}>
          {pillars.map((p, i) => (
            <PillarCard key={p.title} pillar={p} index={i} total={pillars.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
