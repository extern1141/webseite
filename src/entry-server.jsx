import { renderToString } from 'react-dom/server';
import Home from './pages/Home.jsx';
import ItInfrastruktur from './pages/ItInfrastruktur.jsx';
import WebdesignSeo from './pages/WebdesignSeo.jsx';
import Reparaturen from './pages/Reparaturen.jsx';
import Impressum from './pages/Impressum.jsx';
import Datenschutz from './pages/Datenschutz.jsx';

const pages = {
  home: Home,
  'it-infrastruktur': ItInfrastruktur,
  'webdesign-seo': WebdesignSeo,
  'reparaturen-datenrettung': Reparaturen,
  impressum: Impressum,
  datenschutz: Datenschutz,
};

export function render(key) {
  const Page = pages[key];
  return renderToString(<Page />);
}
