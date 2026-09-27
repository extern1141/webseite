import { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon.jsx';
import { SectionHeader } from './Reveal.jsx';

// Aufklappbare Fragen. Die Antworten bleiben im HTML (gut für Google), sind aber eingeklappt.
export default function Faq({ title, text, items }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq-section">
      <div className="container">
        <SectionHeader eyebrow="FAQ" title={title} text={text} />
        <div className="faq-list">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                className={`faq-item ${isOpen ? 'open' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
              >
                <h3>
                  <button
                    className="faq-question"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-toggle">
                      <Icon name="plus" size={20} />
                    </span>
                  </button>
                </h3>
                <div className="faq-answer" id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
