import Layout from '../components/Layout.jsx';
import PageHero from '../components/PageHero.jsx';
import DetailRow from '../components/DetailRow.jsx';
import Packages from '../components/Packages.jsx';
import Faq from '../components/Faq.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import Contact from '../components/Contact.jsx';
import { INTEREST } from '../content/site.js';

const faq = [
  {
    q: 'Wie lange dauert die Fertigstellung?',
    a: 'Ein "Digital-Start" Paket wird in der Regel innerhalb von 2 bis 3 Wochen realisiert. Das "Premium Start-Up" Paket benötigt ca. 4 bis 6 Wochen, da hier zusätzlich Logo-Design, Texterstellung und Druckmedien abgestimmt werden.',
  },
  {
    q: 'Wer bezahlt die monatlichen Kosten für Hosting & E-Mails?',
    a: 'Die Verträge für Domain, Hosting und E-Mails (z.B. bei IONOS, Strato oder Microsoft) schließen wir direkt auf Ihren Namen ab. So bleiben Sie zu 100 % Eigentümer Ihrer Daten. Die monatlichen Gebühren betragen je nach Provider ca. 5 bis 15 € und werden direkt von Ihnen beglichen.',
  },
  {
    q: 'Sind die Webseiten DSGVO-konform?',
    a: 'Ja. Wir binden Cookie-Banner ein, lagern Schriftarten lokal (keine Google Fonts-Abfragen ohne Zustimmung) und binden eine personalisierte Datenschutzerklärung sowie ein Impressum ein. Das minimiert Ihr Risiko für Abmahnungen erheblich.',
  },
  {
    q: 'Kann ich Inhalte später selbst anpassen?',
    a: 'Absolut. Wir bauen unsere Webseiten so auf, dass Sie Texte, Bilder oder Blogeinträge nach einer kurzen Einweisung problemlos selbst anpassen können. Falls Sie dafür keine Zeit haben, übernehmen wir die Pflege gerne im Rahmen eines kleinen Servicevertrags.',
  },
];

export default function WebdesignSeo() {
  return (
    <Layout current="webdesign-seo">
      <PageHero
        badge="Pakete für Gründer & Unternehmen"
        title="Webdesign & Digitaler Neustart aus einer Hand"
        text="Sie möchten neu durchstarten oder Ihre veraltete Webseite erneuern? Wir bauen Ihre komplette Webpräsenz auf – von der Domain-Registrierung und E-Mail-Einrichtung über SEO bis hin zu Logo und Flyern."
      />
      <section className="detail-section detail-section-tight">
        <div className="container">
          <DetailRow
            image="/img/webdesign.webp"
            alt="Professionelles Webdesign und lokale SEO-Optimierung für Start-ups in Ludwigsburg"
            title="Das Rundum-Sorglos-Paket für Ihren Start"
            paragraphs={[
              'Für frisch gegründete Start-ups und lokale Dienstleister ist der Start oft komplex: Wo kaufe ich die Domain? Wie richte ich eine professionelle E-Mail-Adresse ein? Wer designt mein Logo? Wie werde ich bei Google gefunden?',
              'Wir nehmen Ihnen diese Hürden ab. Sie konzentrieren sich auf Ihr Geschäft, wir kümmern uns um Ihren kompletten Markenauftritt.',
            ]}
            bullets={[
              { label: 'Identität', text: 'Einzigartiges Logo-Design & passendes Farbschema' },
              { label: 'Infrastruktur', text: 'Wunschdomain-Sicherung & E-Mail-Anbindung' },
              { label: 'Sichtbarkeit', text: 'Lokale SEO-Optimierung & Google Maps Unternehmenskonto' },
              { label: 'Präsenz', text: 'Moderne, schnelle und rechtssichere Webseite (DSGVO-konform)' },
              { label: 'Print & Werbung', text: 'Visitenkarten, Flyer und Online-Marketing (Google Ads)' },
            ]}
          />
        </div>
      </section>
      <Packages />
      <Faq title="Häufig gestellte Fragen" text="Schnelle Antworten rund um die Erstellung Ihres neuen Webauftritts." items={faq} />
      <CtaBanner
        title="Lassen Sie uns Ihre Webseite aufbauen"
        text="Gemeinsam besprechen wir Ihre Wunsch-Domain, Ihr Corporate Design und Ihre Wunschfunktionen. Das Erstgespräch ist absolut kostenfrei."
        button="Erstgespräch buchen"
      />
      <Contact
        title="Paketanfrage & Beratung"
        intro="Wählen Sie Ihr Wunschpaket aus oder fragen Sie ein individuelles Konzept an. Wir freuen uns auf Ihr Projekt!"
        subject="MDK-IT Anfrage: Webdesign & SEO"
        interestLabel="Interesse an / Paket *"
        options={[
          { value: 'Digital-Start (Paket)', label: 'Digital-Start (Paket 1.199 €)' },
          { value: 'Premium Start-Up (Paket)', label: 'Premium Start-Up (Paket 2.999 €)' },
          { value: 'Nach Absprache / Kundenspezifisch', label: 'Nach Absprache / Kundenspezifisch' },
          INTEREST.it,
          INTEREST.repair,
        ]}
        extraField={{
          id: 'company',
          name: 'company',
          label: 'Unternehmen / Projekt (Optional)',
          placeholder: 'z.B. Restaurant Müller, Consulting GmbH',
        }}
        messageLabel="Welche Ideen oder Fragen haben Sie bereits? *"
        messagePlaceholder="Beschreiben Sie kurz Ihr geplantes Vorhaben..."
      />
    </Layout>
  );
}
