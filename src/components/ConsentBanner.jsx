import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OPEN_EVENT, loadAnalytics, readConsent, saveConsent } from '../lib/consent.js';

// Cookie-Hinweis: Google Analytics wird nur nach ausdrücklicher Zustimmung geladen
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readConsent();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const decide = (value) => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="consent"
          role="dialog"
          aria-labelledby="consent-title"
          aria-describedby="consent-text"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="consent-title">Cookies & Statistik</h2>
          <p id="consent-text">
            Mit Ihrer Einwilligung nutzen wir Google Analytics, um Besuchsstatistiken zu erstellen. Dabei werden Cookies gesetzt
            und Daten an Google übertragen. Ohne Zustimmung funktioniert die Seite genauso. Mehr in der{' '}
            <a href="/datenschutz.html">Datenschutzerklärung</a>.
          </p>
          <div className="consent-actions">
            <button className="btn btn-ghost btn-small" onClick={() => decide('denied')}>
              Nur notwendige
            </button>
            <button className="btn btn-primary btn-small" onClick={() => decide('granted')}>
              Statistik erlauben
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
