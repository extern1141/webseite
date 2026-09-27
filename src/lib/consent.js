// Einwilligung für Google Analytics (DSGVO / TDDDG): Analytics lädt erst nach Zustimmung.
const KEY = 'mdk-consent';
const GA_ID = 'G-6F3JCEJMM9';
export const OPEN_EVENT = 'mdk:open-consent';

export function readConsent() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveConsent(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* Speicher blockiert – Auswahl gilt nur für diesen Besuch */
  }
  if (value === 'granted') loadAnalytics();
  else disableAnalytics();
}

let loaded = false;
export function loadAnalytics() {
  window[`ga-disable-${GA_ID}`] = false;
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

// Widerruf: weitere Messungen stoppen und GA-Cookies dieser Domain löschen
function disableAnalytics() {
  window[`ga-disable-${GA_ID}`] = true;
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    const host = window.location.hostname;
    for (const domain of ['', host, `.${host.replace(/^www\./, '')}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
