import { motion } from 'framer-motion';
import { SplitReveal } from './Reveal.jsx';
import Magnetic from './Magnetic.jsx';
import Icon from './Icon.jsx';

// Auffälliger Aufruf zum Erstgespräch vor dem Kontaktbereich
export default function CtaBanner({ title, text, button }) {
  return (
    <section className="cta-banner">
      <div className="container">
        <motion.div
          className="cta-panel"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cta-orb cta-orb-1" aria-hidden="true" />
          <div className="cta-orb cta-orb-2" aria-hidden="true" />
          <SplitReveal as="h2" text={title} />
          <p>{text}</p>
          <Magnetic>
            <a href="#contact" className="btn btn-primary">
              <span>{button}</span>
              <Icon name="arrow" size={18} className="btn-arrow" />
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
