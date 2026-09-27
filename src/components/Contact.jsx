import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SplitReveal, FadeUp } from './Reveal.jsx';
import Magnetic from './Magnetic.jsx';
import TiltCard from './TiltCard.jsx';

const EMAIL = 'info@mdk-it.com';

const info = [
  { title: 'Adresse', lines: ['Asperger Straße 30', '71634 Ludwigsburg', 'Deutschland'], icon: '⌖' },
  {
    title: 'Kontakt',
    lines: [
      <a key="tel" href="tel:+491776992314">+49 (0) 177 699 2314</a>,
      <a key="mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>,
    ],
    icon: '✆',
  },
  { title: 'Verfügbarkeit', lines: ['Montag – Freitag', '08:00 – 16:00 Uhr'], icon: '◷' },
];

function Field({ id, label, type = 'text', required, textarea }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className={`field ${textarea ? 'full' : ''}`}>
      <Tag id={id} name={id} type={textarea ? undefined : type} required={required} placeholder=" " rows={textarea ? 5 : undefined} />
      <label htmlFor={id}>
        {label}
        {required && ' *'}
      </label>
      <span className="field-line" aria-hidden="true" />
    </div>
  );
}

export default function Contact() {
  const [sent, setSent] = useState(false);

  // Öffnet das E-Mail-Programm mit vorausgefüllter Nachricht an info@mdk-it.com
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const subject = `Anfrage Erstgespräch – ${data.name}${data.company ? ` (${data.company})` : ''}`;
    const body = [
      data.message,
      '',
      '---',
      `Name: ${data.name}`,
      `E-Mail: ${data.email}`,
      data.company && `Unternehmen: ${data.company}`,
      data.phone && `Telefon: ${data.phone}`,
    ]
      .filter((l) => l !== undefined && l !== '')
      .join('\n');
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    form.reset();
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-blob blob-1" aria-hidden="true" />
      <div className="contact-blob blob-2" aria-hidden="true" />
      <div className="container">
        <header className="section-header">
          <FadeUp as="span" className="eyebrow">
            Kontakt
          </FadeUp>
          <SplitReveal as="h2" text="Buchen Sie Ihr kostenloses Erstgespräch" />
          <FadeUp as="p" delay={0.2}>
            Und finden Sie heraus, wie es besser, schneller und einfacher geht.
          </FadeUp>
        </header>

        <div className="contact-wrapper">
          <FadeUp className="contact-form-wrap">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="done"
                  className="form-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg viewBox="0 0 52 52" className="check">
                    <motion.circle cx="26" cy="26" r="24" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M15 27 l7 7 l15 -16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
                  </svg>
                  <h3>Vielen Dank!</h3>
                  <p>Ihr E-Mail-Programm wurde mit Ihrer Nachricht geöffnet. Bitte senden Sie die E-Mail dort ab – wir melden uns schnellstmöglich.</p>
                  <button className="btn btn-ghost" onClick={() => setSent(false)}>
                    Neue Nachricht
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" className="contact-form" onSubmit={onSubmit} exit={{ opacity: 0, y: -20 }}>
                  <div className="form-grid">
                    <Field id="name" label="Name" required />
                    <Field id="email" label="E-Mail" type="email" required />
                    <Field id="company" label="Unternehmen" />
                    <Field id="phone" label="Telefon" type="tel" />
                    <Field id="message" label="Nachricht" required textarea />
                  </div>
                  <Magnetic strength={0.2}>
                    <button type="submit" className="btn btn-primary">
                      <span>Nachricht senden</span>
                      <span className="btn-arrow">→</span>
                    </button>
                  </Magnetic>
                </motion.form>
              )}
            </AnimatePresence>
          </FadeUp>

          <div className="contact-info">
            {info.map((b, i) => (
              <FadeUp key={b.title} delay={0.1 * i}>
                <TiltCard className="info-card" max={10}>
                  <span className="info-icon">{b.icon}</span>
                  <div>
                    <h3>{b.title}</h3>
                    {b.lines.map((l, j) => (
                      <p key={j}>{l}</p>
                    ))}
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
