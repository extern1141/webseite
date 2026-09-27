# MDK-IT Webseite

Interaktive, animierte Webseite für [mdk-it.com](https://www.mdk-it.com), gebaut mit **React**, **Vite**, **Framer Motion** und **Lenis** (Smooth Scrolling).

## Lokal starten

```bash
npm install
npm run dev       # Entwicklungsserver mit Live-Reload
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```

## Struktur

- `src/components/` – alle Bereiche der Seite (Hero, Dienste, Ablauf, Kontakt, …)
- `src/index.css` – Farben, Schriften und Layout (Farben oben unter `:root`)
- `public/img/` – optimierte Bilder (WebP), erzeugt mit `node scripts/optimize-images.mjs`
- `public/bilder/` – Original-Bilder

Texte ändern: direkt in den Komponenten, z. B. die Dienste in `src/components/Services.jsx`.

## Veröffentlichung (GitHub Pages)

Bei jedem Push auf `main` baut `.github/workflows/deploy.yml` die Seite und veröffentlicht sie.
Einmalig nötig: **Settings → Pages → Build and deployment → Source: „GitHub Actions“**.
