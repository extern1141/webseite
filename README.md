# MDK-IT Webseite

Interaktive, animierte Webseite für [mdk-it.com](https://www.mdk-it.com), gebaut mit **React**, **Vite**, **Framer Motion** und **Lenis** (Smooth Scrolling).

Sechs Seiten mit denselben Adressen wie bisher: Startseite, IT-Infrastruktur, Webdesign & SEO,
Reparaturen & Datenrettung, Impressum und Datenschutz. Beim Build wird jede Seite zu fertigem HTML
vorgerendert (schnell und für Google lesbar); React übernimmt danach im Browser die Animationen.

## Lokal starten

```bash
npm install
npm run dev       # Entwicklungsserver mit Live-Reload
npm run build     # Produktions-Build nach dist/ (inkl. Vorrendern aller Seiten)
npm run preview   # Build lokal ansehen
```

## Struktur

- `*.html` (im Hauptordner) – je Seite: Titel, Meta-Tags, Open Graph, strukturierte Daten
- `src/pages/` – Inhalt jeder Seite (Texte, Aufzählungen, FAQ, Formular-Einstellungen)
- `src/components/` – wiederverwendbare Bereiche (Hero, Karten, Pakete, Kontakt, Footer, …)
- `src/content/site.js` – gemeinsame Daten: Adresse, Telefon, Navigation, Footer, Web3Forms-Schlüssel
- `src/index.css` – Farben, Schriften und Layout (Farben oben unter `:root`)
- `public/img/` – optimierte Bilder (WebP), erzeugt mit `node scripts/optimize-images.mjs`
- `public/bilder/` – Original-Bilder (auch für die Vorschaubilder in sozialen Netzwerken)
- `public/robots.txt`, `public/sitemap.xml`, `public/CNAME`

Texte ändern: in `src/pages/` (z. B. Paketpreise in `src/components/Packages.jsx`),
Kontaktdaten in `src/content/site.js`.

## Veröffentlichung (GitHub Pages)

Bei jedem Push auf `main` baut `.github/workflows/deploy.yml` die Seite und veröffentlicht sie.
Einmalig nötig: **Settings → Pages → Build and deployment → Source: „GitHub Actions“**.
