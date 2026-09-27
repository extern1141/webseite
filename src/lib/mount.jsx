import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '../index.css';

// Wird eine Seite im Hintergrund vorgeladen (Speculation Rules), starten die Animationen erst,
// wenn der Besucher sie tatsächlich öffnet.
function whenActivated() {
  if (!document.prerendering) return Promise.resolve();
  return new Promise((resolve) => document.addEventListener('prerenderingchange', resolve, { once: true }));
}

export async function mount(Page) {
  await whenActivated();
  const root = document.getElementById('root');
  const app = (
    <StrictMode>
      <Page />
    </StrictMode>
  );
  // Vorgerendertes HTML übernehmen, im Entwicklungsmodus neu aufbauen
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
