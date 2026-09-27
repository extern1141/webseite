import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import TiltCard from './TiltCard.jsx';
import Icon from './Icon.jsx';
import Magnetic from './Magnetic.jsx';
import { SectionHeader } from './Reveal.jsx';

const packages = [
  {
    name: 'Digital-Start',
    interest: 'Digital-Start (Paket)',
    text: 'Perfekt für Gründer und Dienstleister, die eine solide, schnelle und preiswerte Webpräsenz benötigen.',
    price: 1199,
    features: [
      'Domain-Kauf-Assistenz & Provider-Setup',
      'Einrichtung von 2 Firmen-E-Mails (z.B. info@firma.de)',
      'Moderne, rechtssichere One-Page Webseite',
      'Integriertes SSL-Sicherheitszertifikat',
      'Optimiert für Mobilgeräte (Responsive)',
      'Standard-Kontaktformular',
      'Erstellung Ihres Google Maps Unternehmenskontos',
      'Grundlegendes lokales SEO (Ludwigsburg/Stuttgart)',
      'Impressum & Datenschutzerklärung (DSGVO-konform)',
    ],
  },
  {
    name: 'Premium Start-Up',
    interest: 'Premium Start-Up (Paket)',
    featured: true,
    badge: 'Bestseller / Empfehlung',
    text: 'Das Rundum-Sorglos-Paket für Firmen, die von Tag 1 an professionell auftreten und aktiv Kunden anziehen wollen.',
    price: 2999,
    features: [
      <>
        Alles aus dem <strong>Digital-Start</strong> Paket
      </>,
      { extra: 'Mehrseitige Webseite (z.B. Home, Leistungen, Über uns, Kontakt)' },
      { extra: 'Individuelles Logo-Design & Corporate Identity (Farben, Schriften)' },
      { extra: 'Einrichtung von bis zu 5 E-Mails (Microsoft 365 oder Google Workspace)' },
      { extra: 'Erweiterte Keyword-Recherche & Wettbewerbsanalyse' },
      { extra: 'Professionelle Texthilfe & Inhaltsstrukturierung' },
      { extra: 'Social Media Setups (z.B. LinkedIn, Instagram, Facebook)' },
      { extra: 'Print-Design: Vorlage für Visitenkarten & Werbeflyer' },
      { extra: 'Google Ads Werbekampagnen-Setup (Erstkonfiguration)' },
    ],
  },
];

const format = (n) => Math.round(n).toLocaleString('de-DE');

// Preis zählt beim ersten Sichtbarwerden hoch. Im vorgerenderten HTML steht bereits der echte Preis.
function Price({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [shown, setShown] = useState(value);
  const [armed, setArmed] = useState(false);
  // Nur hochzählen, wenn der Preis beim Laden noch nicht zu sehen ist (kein sichtbarer Sprung)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (ref.current.getBoundingClientRect().top > window.innerHeight) {
      setShown(0);
      setArmed(true);
    }
  }, []);
  useEffect(() => {
    if (!inView || !armed) return;
    const controls = animate(0, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: setShown });
    return () => controls.stop();
  }, [inView, armed, value]);
  return (
    <span ref={ref} className="price-number">
      ab {format(shown)} €
    </span>
  );
}

function requestPackage(interest) {
  window.dispatchEvent(new CustomEvent('mdk:select-interest', { detail: interest }));
}

export default function Packages() {
  return (
    <section className="packages-section" id="packages">
      <div className="container">
        <SectionHeader
          eyebrow="Pakete"
          title="Unsere Webdesign & Marketing-Pakete"
          text="Klar strukturierte Lösungen ohne versteckte Folgekosten. Wählen Sie das passende Paket für Ihre Ziele."
        />
        <div className="packages-grid">
          {packages.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
            >
              <TiltCard className={`package-card ${p.featured ? 'featured' : ''}`} max={5}>
                {p.badge && <div className="package-badge">{p.badge}</div>}
                <div className="package-header">
                  <h3>{p.name}</h3>
                  <p>{p.text}</p>
                  <div className="package-price">
                    <Price value={p.price} /> <span>zzgl. MwSt.</span>
                  </div>
                </div>
                <ul className="package-features">
                  {p.features.map((f, j) => {
                    const extra = f && typeof f === 'object' && 'extra' in f;
                    return (
                      <li key={j} className={extra ? 'extra' : undefined}>
                        <span className="bullet-icon">
                          <Icon name={extra ? 'plus' : 'check'} size={14} />
                        </span>
                        <span>{extra ? f.extra : f}</span>
                      </li>
                    );
                  })}
                </ul>
                <Magnetic strength={0.2} className="package-cta">
                  <a href="#contact" className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'}`} onClick={() => requestPackage(p.interest)}>
                    <span>Dieses Paket anfragen</span>
                    <Icon name="arrow" size={18} className="btn-arrow" />
                  </a>
                </Magnetic>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
