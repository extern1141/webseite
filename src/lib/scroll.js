import Lenis from 'lenis';

let lenis = null;
const NAV_OFFSET = -90;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Element zu einem #fragment finden – ohne Fehler bei Fragmenten wie #2024 oder #!kontakt
export function findHashTarget(hash) {
  if (!hash || hash.length < 2) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

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
    else window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    return;
  }
  const el = typeof target === 'string' ? findHashTarget(target) : target;
  if (!el) return;
  // Ziel aus der aktuellen, echten Scrollposition berechnen (Lenis' interner Wert kann veraltet sein)
  const top = el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
  if (lenis) lenis.scrollTo(Math.max(0, top));
  else window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

// Tastaturfokus an das Sprungziel übergeben (wie beim normalen Browser-Sprung)
function moveFocus(el) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
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
  const el = url.hash === '#top' ? document.getElementById('top') : findHashTarget(url.hash);
  if (!el) return;
  e.preventDefault();
  scrollToTarget(url.hash === '#top' ? '#top' : el);
  moveFocus(el);
}
