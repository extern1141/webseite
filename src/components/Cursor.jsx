import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Leuchtender Cursor-Ring, der Links und Buttons "erkennt". Nur auf Geräten mit Maus.
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!mq.matches || reduce) return;
    setEnabled(true);

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHover(!!e.target.closest('a, button, input, textarea, [data-cursor]'));
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} aria-hidden="true" />
      <motion.div
        className="cursor-ring"
        style={{ x: sx, y: sy }}
        animate={{ scale: down ? 0.8 : hover ? 1.8 : 1, opacity: hover ? 0.9 : 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-hidden="true"
      />
    </>
  );
}
