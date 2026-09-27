import Layout from '../components/Layout.jsx';
import PageHero from '../components/PageHero.jsx';
import LegalCard from '../components/LegalCard.jsx';
import { CONTACT } from '../content/site.js';

export default function Datenschutz() {
  return (
    <Layout current="datenschutz">
      <PageHero compact title="Datenschutzerklärung" text="Informationen über die Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO" />
      <LegalCard>
        <h2>1. Datenschutz auf einen Blick</h2>
        <h3>Allgemeine Hinweise</h3>
        <p>
          Diese Webseite ist eine Informationsseite. Personenbezogene Daten werden nur verarbeitet, wenn Sie uns über das Kontaktformular
          schreiben oder der Nutzung von Google Analytics ausdrücklich zustimmen (siehe Abschnitt 3).
        </p>
        <h3>Automatische technische Bereitstellung (Hosting)</h3>
        <p>
          Um Ihnen diese Webseite überhaupt anzeigen zu können, wird sie auf Servern von <strong>GitHub Pages</strong> gehostet und über das
          Inhaltsnetzwerk (CDN) von <strong>Cloudflare</strong> ausgeliefert. Beim Aufruf einer Webseite übermittelt Ihr Browser automatisch
          technische Verbindungsdaten (wie Ihre IP-Adresse, Browsertyp, Betriebssystem und Uhrzeit). Diese rein technischen Protokolle
          (Server-Logfiles) werden von GitHub und Cloudflare verarbeitet, um die stabile und sichere Auslieferung der Seite zu gewährleisten.
          MDK-IT hat keinen Zugriff auf diese Server-Logfiles und wertet sie nicht aus.
        </p>
        <p>
          <strong>Freiwillige Kontaktaufnahme:</strong>
          <br />
          Die einzigen Daten, die verarbeitet werden, sind diejenigen, die Sie selbst freiwillig in ein Kontaktformular eingeben (Name,
          E-Mail-Adresse, Telefonnummer), um ein Angebot anzufordern oder eine Frage zu stellen. Diese Daten werden ausschließlich zur
          Beantwortung Ihrer konkreten Anfrage genutzt.
        </p>

        <h2>2. Allgemeine Hinweise und Pflichtinformationen</h2>
        <h3>Datenschutz</h3>
        <p>
          Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend
          den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. Die Nutzung dieser Webseite ist ohne Angabe
          personenbezogener Daten möglich.
        </p>
        <p>
          Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen
          kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
        </p>
        <h3>Hinweis zur verantwortlichen Stelle</h3>
        <p>
          Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          <br />
          <br />
          <strong>MDK-IT Einzelunternehmen</strong>
          <br />
          Inhaber: Michael Donald Kelava
          <br />
          {CONTACT.street}
          <br />
          {CONTACT.city}
          <br />
          {CONTACT.country}
          <br />
          <br />
          Telefon: <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <br />
          E-Mail: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </p>
        <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
        <p>
          Datenverarbeitungsvorgänge (wie die Bearbeitung Ihrer Anfrage) sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können
          eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtmäßigkeit
          der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
        </p>
        <h3>Recht auf Auskunft, Löschung und Berichtigung</h3>
        <p>
          Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
          personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder
          Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im
          Impressum angegebenen Adresse an uns wenden.
        </p>

        <h2>3. Datenerfassung auf dieser Website</h2>
        <h3>Kontaktformular und Web3Forms</h3>
        <p>
          Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort
          angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben
          wir nicht ohne Ihre Einwilligung weiter.
        </p>
        <p>
          Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines
          Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.
        </p>
        <p>
          Für die sichere Übermittlung und Zustellung von Anfragen über das Kontaktformular nutzen wir den externen Dienstleister{' '}
          <strong>Web3Forms</strong>. Die von Ihnen im Kontaktformular eingegebenen Daten werden verschlüsselt an Server von Web3Forms
          übertragen, um sie per E-Mail an uns zuzustellen. Web3Forms speichert die Nachrichteninhalte nicht dauerhaft, sondern fungiert
          ausschließlich als sichere Übermittlungsbrücke. Die Nutzung erfolgt auf Grundlage unseres berechtigten Interesses an einer sicheren,
          spamgeschützten und zuverlässigen Formularabwicklung (Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h3>Google Analytics (nur mit Einwilligung)</h3>
        <p>
          Sofern Sie im Cookie-Hinweis zustimmen, nutzt diese Website Google Analytics 4, einen Webanalysedienst der{' '}
          <strong>Google Ireland Limited</strong>, Gordon House, Barrow Street, Dublin 4, Irland. Google Analytics setzt Cookies und erfasst
          Informationen über die Nutzung dieser Website (z. B. aufgerufene Seiten, Verweildauer, Gerät und ungefährer Standort). Diese
          Informationen werden an Server von Google übertragen und können auch in die USA übermittelt werden; Google ist nach dem
          EU-US Data Privacy Framework zertifiziert.
        </p>
        <p>
          Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Ohne Ihre Zustimmung wird Google Analytics
          nicht geladen. Sie können Ihre Einwilligung jederzeit über den Link „Cookie-Einstellungen“ am Ende jeder Seite widerrufen. Ihre
          Auswahl wird dazu im lokalen Speicher Ihres Browsers abgelegt.
        </p>

        <h2>4. Besonderer Schutz bei Reparaturen & Datenrettung</h2>
        <p>
          Im Rahmen unserer Reparaturleistungen und Datenwiederherstellungen für Kunden (z. B. Austausch von SSDs, Datenrettung von
          Festplatten oder USB-Sticks) kommen wir unter Umständen mit Ihren privaten Trägermedien und Daten in Kontakt. MDK-IT garantiert:
        </p>
        <ul>
          <li>Ihre Daten verbleiben zu 100 % vertraulich.</li>
          <li>Es werden zu keinem Zeitpunkt unbefugte Kopien Ihrer Daten erstellt.</li>
          <li>Alle Diagnosen und Klonvorgänge finden auf lokalen, offline geschalteten Systemen ohne Internetanbindung statt.</li>
          <li>
            Nach Abschluss der Arbeiten und Aushändigung des Datenträgers werden alle temporären Arbeits-Images oder Backups auf unseren
            Systemen unwiderruflich und sicher gelöscht.
          </li>
        </ul>
      </LegalCard>
    </Layout>
  );
}
