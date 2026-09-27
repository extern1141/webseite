import Lenis from 'lenis';

let lenis = null;
const NAV_OFFSET = -90;

export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  let rafId;
  const raf = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
    lenis = null;
  };
}

export function stopScroll(stop) {
  if (!lenis) return;
  if (stop) lenis.stop();
  else lenis.start();
}

export function scrollToTarget(target) {
  if (target === '#home' || target === '#top' || target === 0) {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el);
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET, behavior: 'smooth' });
}

// Klicks auf Links zu Abschnitten derselben Seite (#contact, /#contact auf der Startseite) weich scrollen
export function handleAnchorClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]');
  if (!a || a.target === '_blank') return;
  const url = new URL(a.href, window.location.href);
  if (!url.hash || url.origin !== window.location.origin) return;
  const samePage = url.pathname === window.location.pathname || (url.pathname === '/' && /\/index\.html$/.test(window.location.pathname));
  if (!samePage) return;
  const el = url.hash === '#top' ? 0 : document.querySelector(url.hash);
  if (el === null) return;
  e.preventDefault();
  scrollToTarget(el === 0 ? '#top' : el);
}
