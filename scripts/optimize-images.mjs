// Erzeugt optimierte WebP-Bilder und Logo-Varianten in public/img/
// Aufruf: node scripts/optimize-images.mjs
import sharp from 'sharp';

const B = 'public/bilder/';
const jobs = [
  ['blue-cable.jpg', 'hero', 1600],
  ['lrobertson-switch-3297900.jpg', 'switch', 1400],
  ['7TuVH.jpg', 'backup', 1400],
  ['ymNeZ.jpg', 'support', 1400],
  ['pexels-domaintechnik-ledl-net-2157151265-34576700.jpg', 'webdesign', 1400],
  ['pexels-bulat843-1243575272-36861987.jpg', 'repair', 1400],
  ['bluehdd.jpg', 'hdd', 1400],
  ['pexels-kampus-8815821.jpg', 'consulting', 1400],
];
for (const [src, name, w] of jobs) {
  await sharp(B + src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`public/img/${name}.webp`);
}

// Helle Logo-Variante für dunklen Hintergrund: dunkle Linien weiß, Blau bleibt Blau
const logo = B + 'logo/Transparent Logo Mica.png';
const { data, info } = await sharp(logo).resize(256).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const [r, , b] = [data[i], data[i + 1], data[i + 2]];
  if (b - r < 60) {
    data[i] = data[i + 1] = data[i + 2] = 255;
  } else {
    data[i] = 90;
    data[i + 1] = 160;
    data[i + 2] = 255;
  }
}
await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile('public/img/logo-light.png');
await sharp(data, { raw: info }).resize(64).png().toFile('public/favicon.png');
