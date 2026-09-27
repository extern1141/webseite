import { motion } from 'framer-motion';

// Rahmen für Impressum und Datenschutzerklärung
export default function LegalCard({ children }) {
  return (
    <section className="legal-section">
      <div className="container">
        <motion.div
          className="legal-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
