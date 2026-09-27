// Rendert jede Seite beim Build zu fertigem HTML (schneller erster Aufbau, Google sieht alle Texte).
// React übernimmt die Seite danach im Browser ("Hydration") und startet die Animationen.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pages } from '../vite.config.js';

const { render } = await import('../dist-ssr/entry-server.js');

for (const [file, key] of Object.entries(pages)) {
  const path = `dist/${file}.html`;
  const html = readFileSync(path, 'utf8');
  if (!html.includes('<!--app-html-->')) throw new Error(`Platzhalter fehlt in ${path}`);
  writeFileSync(path, html.replace('<!--app-html-->', render(key)));
  console.log(`vorgerendert: ${path}`);
}
rmSync('dist-ssr', { recursive: true, force: true });
