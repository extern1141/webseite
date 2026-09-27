import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';

const words = ['Netzwerke', 'Server', 'Azure Cloud', 'Firewalls', 'WLAN', 'Backup', 'Webdesign', 'Lokales SEO', 'Logo-Design', 'Google Maps', 'Laptop-Reparatur', 'Datenrettung'];

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Laufband, dessen Tempo und Richtung auf die Scrollgeschwindigkeit reagiert
function Row({ baseVelocity, outline }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const skew = useTransform(velocity, [-2000, 0, 2000], [8, 0, -8]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const items = [...words, ...words];
  return (
    <div className="marquee-row">
      <motion.div className={`marquee-track ${outline ? 'outline' : ''}`} style={{ x, skewX: skew }}>
        {items.map((w, i) => (
          <span key={i}>
            {w}
            <i>✦</i>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="marquee" aria-hidden="true">
      <Row baseVelocity={-2} />
      <Row baseVelocity={2} outline />
    </section>
  );
}
