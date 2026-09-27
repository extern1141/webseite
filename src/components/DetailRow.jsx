import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Icon from './Icon.jsx';
import TiltCard from './TiltCard.jsx';

const ease = [0.22, 1, 0.36, 1];

// Bild + Text-Zeile der Unterseiten. Das Bild wird beim Scrollen "aufgezogen", die Punkte erscheinen nacheinander.
export default function DetailRow({ image, alt, title, paragraphs, bullets, reverse, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const still = useReducedMotion();
  const imgY = useTransform(scrollYProgress, [0, 1], still ? ['0%', '0%'] : ['-8%', '8%']);

  return (
    <div className={`detail-row ${reverse ? 'reverse' : ''}`} ref={ref}>
      {/* Auslöser liegt außen: ein komplett weggeschnittenes Element gilt für den Browser als unsichtbar */}
      <motion.div className="detail-image-wrap" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
        <motion.div
          className="detail-image-clip"
          variants={{
            hidden: { clipPath: reverse ? 'inset(0% 0% 0% 100% round 28px)' : 'inset(0% 100% 0% 0% round 28px)' },
            show: { clipPath: 'inset(0% 0% 0% 0% round 28px)' },
          }}
          transition={{ duration: 1.2, ease }}
        >
          <TiltCard className="detail-image" max={6}>
            <motion.img src={image} alt={alt} loading="lazy" decoding="async" width="1024" height="1024" style={{ y: imgY, scale: 1.18 }} />
            {index !== undefined && <span className="detail-index" aria-hidden="true">0{index + 1}</span>}
          </TiltCard>
        </motion.div>
      </motion.div>
      <div className="detail-text">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.8, ease }}>
          {title}
        </motion.h2>
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.08 }}
          >
            {p}
          </motion.p>
        ))}
        <motion.ul
          className="bullet-list"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
        >
          {bullets.map((b, i) => (
            <motion.li key={i} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} transition={{ duration: 0.6, ease }}>
              <span className="bullet-icon">
                <Icon name="check" size={14} />
              </span>
              <span>
                {b.label && <strong>{b.label}:</strong>} {b.text}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
