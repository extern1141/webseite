// Gemeinsame Inhalte aller Seiten (Navigation, Kontakt, Footer)
export const CONTACT = {
  phone: '+49 (0) 177 699 2314',
  phoneHref: 'tel:+491776992314',
  email: 'info@mdk-it.com',
  street: 'Asperger Straße 30',
  city: '71634 Ludwigsburg',
  country: 'Deutschland',
  hours: 'Montag - Freitag: 08:00 - 16:00 Uhr',
  hoursNote: 'Am Wochenende geschlossen',
};

export const WEB3FORMS_KEY = '1fddb19d-e867-4893-9ecc-66d486ad50fe';

export const NAV = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'it-infrastruktur', href: '/it-infrastruktur.html', label: 'IT-Infrastruktur' },
  { key: 'webdesign-seo', href: '/webdesign-seo.html', label: 'Webdesign & SEO' },
  { key: 'reparaturen-datenrettung', href: '/reparaturen-datenrettung.html', label: 'Reparaturen' },
];

export const FOOTER = {
  text: 'Ihr zuverlässiger Partner für die komplette IT-Betreuung und digitale Präsenz von kleinen und mittelständischen Unternehmen sowie Start-ups.',
  columns: [
    {
      title: 'Dienstleistungen',
      links: [
        { href: '/it-infrastruktur.html', label: 'IT-Infrastruktur & Support' },
        { href: '/webdesign-seo.html', label: 'Webdesign & SEO Pakete' },
        { href: '/reparaturen-datenrettung.html', label: 'Reparaturen & Datenrettung' },
      ],
    },
    {
      title: 'Unternehmen',
      links: [
        { href: '/', label: 'Home' },
        { href: '/#contact', label: 'Erstgespräch buchen' },
        { href: '/#dienste', label: 'Über unsere Bereiche' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { href: '/impressum.html', label: 'Impressum' },
        { href: '/datenschutz.html', label: 'Datenschutzerklärung' },
      ],
    },
  ],
};

// Auswahl "Interesse an" im Kontaktformular
export const INTEREST = {
  it: { value: 'IT-Infrastruktur & Support', label: 'IT-Infrastruktur & Support (B2B)' },
  web: { value: 'Webdesign & Digitalstart', label: 'Webdesign & Digitalstart (B2B)' },
  repair: { value: 'Reparaturen & Datenrettung', label: 'Reparatur / Datenrettung (B2C)' },
  other: { value: 'Sonstiges', label: 'Sonstiges' },
};
