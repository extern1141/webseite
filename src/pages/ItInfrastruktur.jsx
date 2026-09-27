import Layout from '../components/Layout.jsx';
import PageHero from '../components/PageHero.jsx';
import DetailRow from '../components/DetailRow.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import Contact from '../components/Contact.jsx';
import { INTEREST } from '../content/site.js';

const rows = [
  {
    image: '/img/switch.webp',
    alt: 'Strukturierte Netzwerkverkabelung und Serverschrank für B2B-Kunden in Ludwigsburg',
    title: 'Netzwerktechnik & Hardware',
    paragraphs: [
      'Ein stabiles Netzwerk ist die Lebensader jedes modernen Betriebs. Wir planen und installieren Ihr Firmennetzwerk von Grund auf und sorgen dafür, dass alle Geräte schnell und störungsfrei miteinander kommunizieren.',
    ],
    bullets: [
      { text: 'Aufbau und Montage von Serverracks und Netzwerkschränken' },
      { text: 'Installation und Konfiguration professioneller Switches und Router' },
      { text: 'Einrichtung flächendeckender WLAN Access Points mit Gastnetzwerken' },
      { text: 'Absicherung durch Hardware-Firewalls der neuesten Generation' },
      { text: 'Strukturierte Netzwerkverkabelung und Fehlerdiagnose' },
    ],
  },
  {
    image: '/img/backup.webp',
    alt: 'B2B Server-Systeme und Cloud-Infrastruktur im Raum Ludwigsburg',
    title: 'Serverlösungen & Cloud-Infrastruktur',
    paragraphs: [
      'Ob klassisch im eigenen Büro (On-Premise), flexibel in der Cloud oder als effiziente Hybrid-Lösung: Wir implementieren die passende Serverlandschaft für Ihre Programme und Daten.',
    ],
    bullets: [
      { text: 'Einrichtung und Pflege von Windows- und Linux-Serversystemen' },
      { text: 'Virtualisierung bestehender Systeme für maximale Hardwareauslastung' },
      { text: 'Migration zu Microsoft Azure (Cloud-Server, Datenbanken, Active Directory)' },
      { text: 'Sichere Anbindung von Außenstellen und Home-Offices via VPN' },
      { text: 'Zentrale Benutzerverwaltung und Zugriffsrechtesteuerung' },
    ],
  },
  {
    image: '/img/hero.webp',
    alt: 'Zentrale Storage- und Backup-Infrastruktur für IT-Wartung',
    title: 'Storage, Backup & Cyber-Security',
    paragraphs: [
      'Datenverlust kann existenzbedrohend sein. Wir schützen Ihr Unternehmens-Know-how durch automatisierte Backup-Strategien und sorgen dafür, dass Sie im Ernstfall innerhalb kürzester Zeit wieder arbeitsfähig sind.',
    ],
    bullets: [
      { text: 'Zentrale Speichersysteme (NAS / SAN) für gemeinsamen Datenzugriff' },
      { text: 'Automatische, verschlüsselte Backups (lokal und in der Cloud)' },
      { text: 'Regelmäßige Backup-Wiederherstellungstests (Disaster Recovery)' },
      { text: 'Schutz vor Ransomware, Viren und unbefugten Zugriffen' },
      { text: 'DSGVO-konforme Datenspeicherung und Archivierung' },
    ],
  },
  {
    image: '/img/support.webp',
    alt: 'Professioneller IT-Support und Systemwartung für KMU in Ludwigsburg',
    title: 'Laufender Support & Proaktive Wartung',
    paragraphs: [
      'Warten Sie nicht, bis etwas ausfällt. Durch unser proaktives Monitoring erkennen wir Probleme wie drohende Festplattendefekte oder volle Speicher, bevor sie Ihren Betrieb lahmlegen.',
    ],
    bullets: [
      { text: 'Proaktive Überwachung (Monitoring) der Server- und Netzwerkgesundheit' },
      { text: 'Schneller Anwendersupport bei täglichen IT-Problemen der Mitarbeiter' },
      { text: 'Regelmäßige Updates, Sicherheits-Patches und Systemprüfungen' },
      { text: 'Hardware-Aufrüstung und Austausch veralteter Komponenten' },
      { text: 'Klare Supportvereinbarungen (SLA) ohne versteckte Kosten' },
    ],
  },
];

export default function ItInfrastruktur() {
  return (
    <Layout current="it-infrastruktur">
      <PageHero
        badge="B2B IT-Dienstleistungen"
        title="IT-Infrastruktur für kleine & mittlere Unternehmen"
        text="Wir bauen die technologische Basis für Ihren Unternehmenserfolg. Sicher, skalierbar und maßgeschneidert auf Ihre Anforderungen – lokal vor Ort in der Region Ludwigsburg & Stuttgart."
      />
      <section className="detail-section">
        <div className="container">
          {rows.map((r, i) => (
            <DetailRow key={r.title} {...r} index={i} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>
      <CtaBanner
        title="Bereit für eine stabile und sichere IT?"
        text="Vereinbaren Sie noch heute ein kostenloses Erstgespräch. Wir analysieren Ihre aktuelle IT-Infrastruktur und zeigen Ihnen konkrete Verbesserungspotenziale auf."
        button="Jetzt Erstgespräch vereinbaren"
      />
      <Contact
        title="Erstgespräch für Geschäftskunden"
        intro="Erzählen Sie uns kurz von Ihren IT-Herausforderungen. Wir melden uns umgehend bei Ihnen für eine telefonische oder persönliche Erstberatung."
        subject="MDK-IT Anfrage: IT-Infrastruktur & Support"
        options={[INTEREST.it, INTEREST.web, INTEREST.repair, INTEREST.other]}
        defaultInterest={INTEREST.it.value}
        messagePlaceholder="Welche Systeme oder Probleme betreffen Ihre Anfrage?"
      />
    </Layout>
  );
}
