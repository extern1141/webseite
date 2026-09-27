import { Fragment } from 'react';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

// Text Wort für Wort aus einer Maske nach oben einblenden
export function SplitReveal({ text, as: Tag = 'span', className, delay = 0, animate }) {
  const words = text.split(' ');
  const trigger = animate === undefined ? { whileInView: 'show', viewport: { once: true, amount: 0.6 } } : { animate: animate ? 'show' : 'hidden' };
  return (
    <Tag className={className} aria-label={Tag === 'span' ? undefined : text}>
      <motion.span
        initial="hidden"
        {...trigger}
        transition={{ staggerChildren: 0.07, delayChildren: delay }}
        style={{ display: 'inline' }}
        aria-hidden="true"
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="word-mask">
              <motion.span
                className="word"
                variants={{ hidden: { y: '110%', rotate: 4 }, show: { y: '0%', rotate: 0 } }}
                transition={{ duration: 0.9, ease }}
              >
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}

export function FadeUp({ children, delay = 0, className, as = 'div', y = 40, amount = 0.3 }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, rotateX: 14, transformPerspective: 900 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, transformPerspective: 900 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </Comp>
  );
}

export function SectionHeader({ eyebrow, title, text }) {
  return (
    <header className="section-header">
      <FadeUp as="span" className="eyebrow">
        {eyebrow}
      </FadeUp>
      <SplitReveal as="h2" text={title} />
      {text && (
        <FadeUp as="p" delay={0.2}>
          {text}
        </FadeUp>
      )}
    </header>
  );
}
