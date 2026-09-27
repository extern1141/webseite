import Layout from '../components/Layout.jsx';
import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import Pillars from '../components/Pillars.jsx';
import WhyUs from '../components/WhyUs.jsx';
import Contact from '../components/Contact.jsx';
import { INTEREST } from '../content/site.js';

export default function Home() {
  return (
    <Layout current="home">
      <Hero />
      <Marquee />
      <Pillars />
      <WhyUs />
      <Contact
        title="Schreiben Sie uns"
        intro="Nutzen Sie das Formular für ein kostenloses Erstgespräch oder eine konkrete Preisanfrage. Wir antworten in der Regel innerhalb von 24 Stunden."
        subject="Neue Kontaktanfrage über MDK-IT Homepage"
        options={[INTEREST.it, INTEREST.web, INTEREST.repair, INTEREST.other]}
      />
    </Layout>
  );
}
