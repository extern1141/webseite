import { motion } from 'framer-motion';
import Layout from '../components/Layout.jsx';
import PageHero from '../components/PageHero.jsx';
import DetailRow from '../components/DetailRow.jsx';
import Timeline from '../components/Timeline.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import Contact from '../components/Contact.jsx';
import Icon from '../components/Icon.jsx';
import { INTEREST } from '../content/site.js';

const rows = [
  {
    image: '/img/repair.webp',
    alt: 'Professionelle Laptop-Reparatur und Hardware-Austausch in Ludwigsburg',
    title: 'Laptop- & PC-Kleinreparaturen',
    paragraphs: [
      'Ein Defekt bedeutet nicht gleich, dass Sie ein neues Gerät kaufen müssen. In den meisten Fällen lohnt sich ein gezielter Austausch der defekten Teile. Das spart Geld und schont die Umwelt.',
    ],
    bullets: [
      { label: 'Displaytausch', text: 'Behebung von Rissen, Flackern oder Pixelfehlern' },
      { label: 'Akku-Wechsel', text: 'Austausch von müden oder aufgeblähten Laptop-Batterien' },
      { label: 'Tastaturtausch', text: 'Ersatz bei klemmenden oder defekten Tasten' },
      { label: 'Hardware-Upgrade', text: 'Einbau schnellerer SSDs und RAM-Speicher' },
      { label: 'Reinigung & Wartung', text: 'Entfernung von Staub und Erneuerung der Wärmeleitpaste gegen Überhitzung' },
    ],
  },
  {
    image: '/img/hdd.webp',
    alt: 'Sichere Datenrettung und HDD-Wiederherstellung in Ludwigsburg',
    title: 'Datenrettung & Datensicherung',
    paragraphs: [
      'Haben Sie versehentlich wichtige Dokumente gelöscht oder verweigert Ihre externe Festplatte den Dienst? Wir tun alles, um Ihre wertvollen Daten, Dokumente und Familienfotos wiederherzustellen.',
    ],
    bullets: [
      { text: 'Wiederherstellung versehentlich gelöschter Dateien und Ordner' },
      { text: 'Rettung von Daten bei beschädigten Dateisystemen (z.B. USB-Sticks)' },
      { text: 'Klonen von alten HDDs auf schnelle, moderne SSDs ohne Datenverlust' },
      { text: 'Einrichtung automatischer lokaler Sicherungen (z.B. Time Machine, Windows-Backup)' },
      { text: 'Beratung zu sicheren Cloud-Speichern für private Backups' },
    ],
  },
  {
    image: '/img/consulting.webp',
    alt: 'Unabhängige Kaufberatung für Laptops und PCs in Ludwigsburg',
    title: 'Unabhängige Kaufberatung & Ersteinrichtung',
    paragraphs: [
      'Sie suchen einen neuen PC oder Laptop, wissen aber nicht, worauf Sie achten müssen? Wir beraten Sie herstellerunabhängig. Nach dem Kauf richten wir Ihr neues Gerät komplett für Sie ein.',
    ],
    bullets: [
      { text: 'Kommissionsfreie Bedarfsanalyse und Kaufempfehlung' },
      { text: 'Einrichtung des Betriebssystems (Windows oder macOS)' },
      { text: 'Übertragung aller Daten, E-Mails und Dokumente vom Altgerät' },
      { text: 'Installation nützlicher Programme, Virenschutz und Webbrowser' },
      { text: 'Anbindung an Ihren Heimdrucker und Ihr WLAN-Netzwerk' },
    ],
  },
];

const steps = [
  { title: 'Anfrage stellen', text: 'Beschreiben Sie uns Ihr Problem über das Kontaktformular oder rufen Sie uns an.' },
  { title: 'Gerät übergeben & Diagnose', text: 'Sie bringen Ihr Gerät nach Terminvereinbarung vorbei. Wir prüfen den genauen Fehler.' },
  {
    title: 'Kostenvoranschlag & Reparatur',
    text: 'Wir nennen Ihnen den genauen Preis für Ersatzteile und Arbeitszeit. Erst nach Ihrer Freigabe reparieren wir das Gerät.',
  },
  {
    title: 'Abholung & Funktionstest',
    text: 'Sie holen Ihr repariertes Gerät ab. Gemeinsam prüfen wir vor Ort, ob alles wie gewünscht funktioniert.',
  },
];

export default function Reparaturen() {
  return (
    <Layout current="reparaturen-datenrettung">
      <PageHero
        badge="Hilfe für Privatkunden & Home-Offices"
        title="Laptop-Reparatur & Datenrettung"
        text="Ihr Laptop lädt nicht mehr, das Display ist gesprungen oder wichtige Urlaubsfotos sind verschwunden? Wir helfen Ihnen schnell, unkompliziert und zu fairen Preisen – direkt in Ludwigsburg."
      />
      <section className="detail-section">
        <div className="container">
          {rows.map((r, i) => (
            <DetailRow key={r.title} {...r} index={i} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>
      <Timeline
        eyebrow="Ablauf"
        title="So einfach läuft Ihre Reparatur ab"
        text="Bei uns gibt es keine versteckten Kosten oder böse Überraschungen."
        steps={steps}
      >
        <motion.div
          className="trust-banner"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="trust-icon">
            <Icon name="lock" size={26} />
          </span>
          <div>
            <h3>Absolut vertraulicher Umgang mit Ihren Daten</h3>
            <p>
              Ihre Privatsphäre steht an oberster Stelle. Während des gesamten Diagnose- und Reparaturprozesses bleiben Ihre privaten Daten
              (Fotos, Dokumente, Passwörter) absolut vertraulich und werden zu keinem Zeitpunkt kopiert oder an Dritte weitergegeben.
            </p>
          </div>
        </motion.div>
      </Timeline>
      <CtaBanner
        title="Haben Sie ein kaputtes Gerät oder Datenverlust?"
        text="Schreiben Sie uns eine kurze Nachricht. Wir schätzen den Schaden ein und melden uns unverbindlich bei Ihnen zurück."
        button="Reparaturanfrage senden"
      />
      <Contact
        title="Reparatur- & Datenrettungsanfrage"
        intro="Bitte beschreiben Sie Ihr Gerät (z.B. Lenovo Laptop, HP Drucker) und das Problem so genau wie möglich, damit wir Ihnen einen Vorab-Kostenvoranschlag geben können."
        subject="MDK-IT Anfrage: Reparatur & Datenrettung"
        options={[INTEREST.repair, INTEREST.it, INTEREST.web, INTEREST.other]}
        defaultInterest={INTEREST.repair.value}
        emailPlaceholder="name@beispiel.de"
        extraField={{
          id: 'device-model',
          name: 'geraetemodell',
          label: 'Geräte-Hersteller & Modell (Optional)',
          placeholder: 'z.B. Apple MacBook Air 2020, Samsung SSD 1TB',
        }}
        messageLabel="Fehlerbeschreibung *"
        messagePlaceholder="Was genau funktioniert nicht? Z.B. Laptop geht nach Einschalten sofort wieder aus..."
        submitLabel="Anfrage senden"
      />
    </Layout>
  );
}
