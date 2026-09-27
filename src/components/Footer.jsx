import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { scrollToTarget } from '../lib/scroll.js';

export default function Footer() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], ['60%', '0%']);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ['0.3em', '0em']);

  return (
    <footer className="footer" ref={ref}>
      <div className="container footer-top">
        <p>&copy; {new Date().getFullYear()} MDK-IT. Alle Rechte vorbehalten.</p>
        <button className="to-top" onClick={() => scrollToTarget('#home')}>
          Nach oben ↑
        </button>
      </div>
      <motion.div className="footer-word" style={{ y, letterSpacing }} aria-hidden="true">
        MDK-IT
      </motion.div>
    </footer>
  );
}
