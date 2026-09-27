// Erzeugt optimierte WebP-Bilder und Logo-Varianten in public/img/
// Aufruf: node scripts/optimize-images.mjs
import sharp from 'sharp';
const B = 'public/bilder/';
const jobs = [
  ['blue-cable.jpg', 'hero', 1600],
  ['px-402-6466141.jpg', 'infra', 1400],
  ['7TuVH.jpg', 'backup', 1400],
  ['ymNeZ.jpg', 'support', 1400],
];
for (const [src, name, w] of jobs) {
  await sharp(B + src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`public/img/${name}.webp`);
}
const logo = B + 'logo/Transparent Logo Mica.png';
// White variant for dark backgrounds: keep alpha, make dark strokes white, keep blue
const { data, info } = await sharp(logo).resize(256).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  if (b - r < 60) { data[i] = data[i + 1] = data[i + 2] = 255; }
  else { data[i] = 90; data[i + 1] = 160; data[i + 2] = 255; }
}
await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile('public/img/logo-light.png');
await sharp(data, { raw: info }).resize(64).png().toFile('public/favicon.png');
