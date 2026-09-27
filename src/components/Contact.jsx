import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SplitReveal, FadeUp } from './Reveal.jsx';
import Magnetic from './Magnetic.jsx';
import TiltCard from './TiltCard.jsx';
import Icon from './Icon.jsx';
import { CONTACT, WEB3FORMS_KEY } from '../content/site.js';

const SUCCESS_TEXT = 'Vielen Dank! Ihre Nachricht wurde erfolgreich übermittelt. Wir melden uns in Kürze bei Ihnen.';

const info = [
  { title: 'Adresse', icon: 'pin', lines: [CONTACT.street, CONTACT.city, CONTACT.country] },
  {
    title: 'Direkter Kontakt',
    icon: 'phone',
    lines: [
      <>
        Telefon: <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
      </>,
      <>
        E-Mail: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      </>,
    ],
  },
  { title: 'Geschäftszeiten', icon: 'clock', lines: [CONTACT.hours, CONTACT.hoursNote] },
];

// Kontaktformular mit Versand über Web3Forms (wie auf der bisherigen Seite).
// Jede Seite übergibt eigene Texte, Betreffzeile und Auswahlmöglichkeiten.
export default function Contact({
  title,
  intro,
  subject,
  interestLabel = 'Interesse an *',
  options,
  defaultInterest = '',
  extraField = { id: 'company', name: 'company', label: 'Unternehmen (Optional)', placeholder: 'Name Ihrer Firma' },
  emailPlaceholder = 'name@firma.de',
  messageLabel = 'Ihre Nachricht *',
  messagePlaceholder = 'Wie können wir Ihnen helfen?',
  submitLabel = 'Nachricht senden',
}) {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [interest, setInterest] = useState(defaultInterest);

  // Buttons wie "Dieses Paket anfragen" wählen das passende Interesse vor
  useEffect(() => {
    const onSelect = (e) => setInterest(e.detail);
    window.addEventListener('mdk:select-interest', onSelect);
    return () => window.removeEventListener('mdk:select-interest', onSelect);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setStatus('sent');
        form.reset();
        setInterest(defaultInterest);
      } else {
        setStatus('error');
        setError(result.message || 'Es gab einen Fehler beim Versenden. Bitte versuchen Sie es später erneut.');
      }
    } catch {
      setStatus('error');
      setError('Es gab einen Fehler bei der Verbindung. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
    }
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
          <SplitReveal as="h2" text={title} />
          <FadeUp as="p" delay={0.2}>
            {intro}
          </FadeUp>
        </header>

        <div className="contact-wrapper">
          <FadeUp className="contact-form-wrap">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' ? (
                <motion.div
                  key="done"
                  className="form-success"
                  role="status"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg viewBox="0 0 52 52" className="check" aria-hidden="true">
                    <motion.circle cx="26" cy="26" r="24" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M15 27 l7 7 l15 -16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
                  </svg>
                  <p>{SUCCESS_TEXT}</p>
                  <button className="btn btn-ghost" onClick={() => setStatus('idle')}>
                    Neue Nachricht
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" className="contact-form" onSubmit={onSubmit} exit={{ opacity: 0, y: -20 }}>
                  <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
                  <input type="hidden" name="subject" value={subject} />
                  <input type="checkbox" name="botcheck" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div className="form-grid">
                    <Field id="name" label="Name *" required placeholder="Ihr vollständiger Name" autoComplete="name" />
                    <Field id="email" label="E-Mail *" type="email" required placeholder={emailPlaceholder} autoComplete="email" />
                    <Field id="phone" label="Telefonnummer" type="tel" placeholder="z.B. +49 177 123456" autoComplete="tel" />
                    <div className="field">
                      <label htmlFor="service-select">{interestLabel}</label>
                      <div className="select-wrap">
                        <select id="service-select" name="interessiert_an" required value={interest} onChange={(e) => setInterest(e.target.value)}>
                          {defaultInterest === '' && (
                            <option value="" disabled>
                              Bitte auswählen...
                            </option>
                          )}
                          {options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="field-line" aria-hidden="true" />
                    </div>
                    <Field id={extraField.id} name={extraField.name} label={extraField.label} placeholder={extraField.placeholder} full />
                    <Field id="message" label={messageLabel} required placeholder={messagePlaceholder} textarea />
                  </div>
                  {status === 'error' && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <Magnetic strength={0.2}>
                    <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                      <span>{status === 'sending' ? 'Wird gesendet...' : submitLabel}</span>
                      <Icon name="arrow" size={18} className="btn-arrow" />
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
                  <span className="info-icon">
                    <Icon name={b.icon} />
                  </span>
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

function Field({ id, name = id, label, type = 'text', required, placeholder, textarea, full, autoComplete }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className={`field ${textarea || full ? 'full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        name={name}
        type={textarea ? undefined : type}
        required={required}
        placeholder={placeholder}
        rows={textarea ? 5 : undefined}
        autoComplete={autoComplete}
      />
      <span className="field-line" aria-hidden="true" />
    </div>
  );
}
