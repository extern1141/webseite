import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Jede Seite ist eine eigene HTML-Datei (gleiche URLs wie bisher, gut für SEO)
export const pages = {
  index: 'home',
  'it-infrastruktur': 'it-infrastruktur',
  'webdesign-seo': 'webdesign-seo',
  'reparaturen-datenrettung': 'reparaturen-datenrettung',
  impressum: 'impressum',
  datenschutz: 'datenschutz',
};

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: Object.fromEntries(Object.keys(pages).map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
      output: {
        // React und Animations-Bibliotheken in eigene, lange cachebare Dateien legen
        manualChunks: (id) => {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (/node_modules\/(framer-motion|motion-dom|motion-utils|lenis)\//.test(id)) return 'motion';
        },
      },
    },
  },
});
