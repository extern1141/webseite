// Prozedurale Texturen für die Werkstatt (Version 5): Holz, Putz, Stadt bei Nacht, Bildschirminhalte.
import * as THREE from 'three';

const rand = (a, b) => a + Math.random() * (b - a);

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { repeat = [1, 1], srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Eichenparkett mit Maserung
export function parquet() {
  const [c, g] = canvas(1024, 1024);
  const plankW = 128;
  const plankL = 512;
  for (let x = 0; x < 1024; x += plankW) {
    for (let y = -((x / plankW) % 2) * 256; y < 1024; y += plankL) {
      const base = [rand(120, 150), rand(78, 96), rand(48, 60)];
      g.fillStyle = `rgb(${base.join(',')})`;
      g.fillRect(x, y, plankW, plankL);
      for (let i = 0; i < 70; i++) {
        const yy = y + Math.random() * plankL;
        g.strokeStyle = `rgba(${Math.random() < 0.5 ? '60,35,18' : '190,150,110'},${rand(0.05, 0.18)})`;
        g.lineWidth = rand(0.5, 2.2);
        g.beginPath();
        g.moveTo(x, yy);
        g.bezierCurveTo(x + plankW * 0.3, yy + rand(-8, 8), x + plankW * 0.7, yy + rand(-8, 8), x + plankW, yy + rand(-4, 4));
        g.stroke();
      }
      g.strokeStyle = 'rgba(25,14,6,0.8)';
      g.lineWidth = 2;
      g.strokeRect(x + 1, y + 1, plankW - 2, plankL - 2);
    }
  }
  return tex(c, { repeat: [3, 4] });
}

// Nussbaum-Tischplatte
export function walnut() {
  const [c, g] = canvas(1024, 512);
  g.fillStyle = '#4a2f1c';
  g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * 512;
    g.strokeStyle = `rgba(${Math.random() < 0.5 ? '30,16,8' : '120,80,48'},${rand(0.05, 0.22)})`;
    g.lineWidth = rand(0.6, 3);
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 128) g.lineTo(x, y + Math.sin(x / 90 + i) * rand(2, 10));
    g.stroke();
  }
  return tex(c);
}

// Leicht strukturierter Wandputz
export function plaster(color = '#c9ccd3') {
  const [c, g] = canvas(512, 512);
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  const img = g.getImageData(0, 0, 512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = rand(-10, 10);
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return tex(c, { repeat: [4, 2] });
}

// Blaue Antistatik-Matte mit Raster
export function mat() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#1f5fb0';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i <= 512; i += 32) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 512);
    g.moveTo(0, i);
    g.lineTo(512, i);
    g.stroke();
  }
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.font = 'bold 20px sans-serif';
  g.fillText('ESD SAFE', 20, 490);
  return tex(c);
}

// Stadtsilhouette bei Nacht für das Fenster
export function nightCity() {
  const [c, g] = canvas(2048, 1024);
  const sky = g.createLinearGradient(0, 0, 0, 1024);
  sky.addColorStop(0, '#040814');
  sky.addColorStop(0.6, '#0c1a3a');
  sky.addColorStop(1, '#23305a');
  g.fillStyle = sky;
  g.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 300; i++) {
    g.fillStyle = `rgba(255,255,255,${rand(0.2, 0.9)})`;
    g.fillRect(Math.random() * 2048, Math.random() * 500, 1.5, 1.5);
  }
  // Mond
  const moon = g.createRadialGradient(1650, 180, 0, 1650, 180, 90);
  moon.addColorStop(0, 'rgba(255,250,235,1)');
  moon.addColorStop(0.35, 'rgba(255,245,220,0.9)');
  moon.addColorStop(1, 'rgba(255,245,220,0)');
  g.fillStyle = moon;
  g.fillRect(1500, 30, 300, 300);
  // Schloss-Silhouette (Ludwigsburg) in der Ferne
  g.fillStyle = '#0b1328';
  g.fillRect(700, 640, 640, 120);
  g.fillRect(960, 560, 120, 90);
  g.beginPath();
  g.moveTo(940, 560);
  g.lineTo(1020, 500);
  g.lineTo(1100, 560);
  g.fill();
  for (let x = 720; x < 1320; x += 34) {
    g.fillStyle = `rgba(255,214,150,${rand(0.3, 0.8)})`;
    g.fillRect(x, 680, 10, 16);
    g.fillRect(x, 715, 10, 16);
  }
  // Gebäude im Vordergrund
  for (let x = 0; x < 2048; ) {
    const w = rand(80, 200);
    const h = rand(160, 460);
    g.fillStyle = `rgb(${rand(8, 18)},${rand(12, 24)},${rand(28, 44)})`;
    g.fillRect(x, 1024 - h, w, h);
    for (let wy = 1024 - h + 16; wy < 1004; wy += 22) {
      for (let wx = x + 10; wx < x + w - 12; wx += 18) {
        if (Math.random() < 0.45) {
          g.fillStyle = Math.random() < 0.8 ? `rgba(255,${rand(190, 230)},${rand(120, 170)},${rand(0.5, 1)})` : `rgba(120,190,255,${rand(0.5, 1)})`;
          g.fillRect(wx, wy, 9, 12);
        }
      }
    }
    x += w + rand(4, 30);
  }
  return tex(c);
}

// Monitor: die MDK-IT-Startseite
export function siteScreen() {
  const [c, g] = canvas(1600, 900);
  const bg = g.createLinearGradient(0, 0, 1600, 900);
  bg.addColorStop(0, '#0b1a3d');
  bg.addColorStop(1, '#050914');
  g.fillStyle = bg;
  g.fillRect(0, 0, 1600, 900);
  g.fillStyle = '#eef3ff';
  g.font = 'bold 34px "Space Grotesk Variable", sans-serif';
  g.fillText('MDK-IT', 80, 80);
  g.font = '22px "Inter Variable", sans-serif';
  g.fillStyle = '#9aa8c7';
  ['Home', 'IT-Infrastruktur', 'Webdesign & SEO', 'Reparaturen'].forEach((s, i) => g.fillText(s, 760 + i * 190, 80));
  g.font = 'bold 78px "Space Grotesk Variable", sans-serif';
  g.fillStyle = '#eef3ff';
  g.fillText('Moderne IT-Systeme', 80, 300);
  const tg = g.createLinearGradient(80, 0, 900, 0);
  tg.addColorStop(0, '#3d8bff');
  tg.addColorStop(0.5, '#00e5ff');
  tg.addColorStop(1, '#8b5cff');
  g.fillStyle = tg;
  g.fillText('& starke Webauftritte', 80, 395);
  g.font = '26px "Inter Variable", sans-serif';
  g.fillStyle = '#9aa8c7';
  g.fillText('IT-Infrastruktur · Webdesign & SEO · Reparaturen & Datenrettung', 80, 470);
  g.fillStyle = tg;
  g.beginPath();
  g.roundRect(80, 530, 400, 74, 37);
  g.fill();
  g.fillStyle = '#041022';
  g.font = 'bold 26px "Space Grotesk Variable", sans-serif';
  g.fillText('Erstgespräch vereinbaren', 112, 576);
  for (let i = 0; i < 3; i++) {
    g.fillStyle = '#10204a';
    g.beginPath();
    g.roundRect(80 + i * 490, 670, 460, 180, 20);
    g.fill();
    g.fillStyle = ['#3d8bff', '#00e5ff', '#8b5cff'][i];
    g.font = 'bold 30px "Space Grotesk Variable", sans-serif';
    g.fillText(['IT-Infrastruktur', 'Webdesign & SEO', 'Reparaturen'][i], 110 + i * 490, 730);
  }
  return tex(c, { repeat: [1, 1] });
}

// Laptop auf dem Schreibtisch: Monitoring-Dashboard
export function dashboard() {
  const [c, g] = canvas(1280, 800);
  g.fillStyle = '#0a0f1e';
  g.fillRect(0, 0, 1280, 800);
  g.fillStyle = '#eef3ff';
  g.font = 'bold 30px sans-serif';
  g.fillText('Monitoring · alle Systeme', 40, 60);
  const names = ['Server-01', 'Server-02', 'NAS-Backup', 'Firewall', 'Switch-Core', 'WLAN-AP'];
  names.forEach((n, i) => {
    const x = 40 + (i % 3) * 405;
    const y = 100 + Math.floor(i / 3) * 330;
    g.fillStyle = '#111a33';
    g.beginPath();
    g.roundRect(x, y, 380, 300, 16);
    g.fill();
    g.fillStyle = '#9aa8c7';
    g.font = '22px sans-serif';
    g.fillText(n, x + 20, y + 40);
    g.fillStyle = '#00ffa3';
    g.beginPath();
    g.arc(x + 350, y + 32, 9, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ['#3d8bff', '#00e5ff', '#8b5cff'][i % 3];
    g.lineWidth = 3;
    g.beginPath();
    for (let k = 0; k <= 20; k++) g.lineTo(x + 20 + k * 17, y + 220 - Math.abs(Math.sin(k * 0.7 + i)) * 110 - Math.random() * 30);
    g.stroke();
  });
  return tex(c);
}

// Smartphone: Google-Maps-Eintrag
export function mapsPhone() {
  const [c, g] = canvas(512, 1024);
  g.fillStyle = '#e8ecef';
  g.fillRect(0, 0, 512, 1024);
  g.strokeStyle = '#ffffff';
  g.lineWidth = 18;
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.moveTo(rand(-100, 600), -20);
    g.lineTo(rand(-100, 600), 1044);
    g.stroke();
  }
  g.fillStyle = '#b7e1c1';
  g.fillRect(40, 520, 160, 120);
  g.fillStyle = '#a7c8f0';
  g.fillRect(300, 80, 190, 140);
  g.fillStyle = '#ea4335';
  g.beginPath();
  g.arc(256, 430, 42, Math.PI, 0);
  g.lineTo(256, 520);
  g.closePath();
  g.fill();
  g.fillStyle = '#7a1b12';
  g.beginPath();
  g.arc(256, 430, 15, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.roundRect(24, 760, 464, 220, 24);
  g.fill();
  g.fillStyle = '#202124';
  g.font = 'bold 38px sans-serif';
  g.fillText('MDK-IT', 50, 820);
  g.font = '26px sans-serif';
  g.fillStyle = '#5f6368';
  g.fillText('IT-Service · Ludwigsburg', 50, 865);
  g.fillText('Asperger Straße 30', 50, 905);
  g.fillStyle = '#1a73e8';
  g.fillText('Route  ·  Anrufen  ·  Website', 50, 950);
  return tex(c);
}

// Skizzenblock mit Logo-Entwürfen und Wireframe
export function sketches() {
  const [c, g] = canvas(1024, 720);
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, 1024, 720);
  g.strokeStyle = 'rgba(80,120,200,0.25)';
  for (let y = 40; y < 720; y += 32) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
  g.strokeStyle = '#2b2f3a';
  g.lineWidth = 3;
  g.strokeRect(520, 60, 440, 300);
  g.strokeRect(540, 90, 400, 40);
  g.strokeRect(540, 150, 180, 120);
  g.strokeRect(740, 150, 200, 20);
  g.strokeRect(740, 190, 160, 20);
  for (let i = 0; i < 3; i++) g.strokeRect(540 + i * 135, 290, 120, 50);
  g.beginPath();
  g.arc(200, 190, 110, 0, Math.PI * 2);
  g.stroke();
  g.font = 'bold 60px serif';
  g.fillStyle = '#2b2f3a';
  g.fillText('MDK', 120, 212);
  g.font = 'italic 34px serif';
  g.fillText('Logo v3 ✓', 110, 360);
  g.fillText('SEO: Ludwigsburg, IT-Service', 80, 470);
  g.fillText('→ Google Maps Eintrag', 80, 530);
  g.strokeStyle = '#1a73e8';
  g.beginPath();
  g.arc(740, 520, 70, 0, Math.PI * 2);
  g.moveTo(790, 570);
  g.lineTo(860, 640);
  g.stroke();
  return tex(c);
}

// Beschriftung für Geräte (z. B. Server-Frontblenden)
export function label(text, color = '#9aa8c7', bg = '#10151f') {
  const [c, g] = canvas(512, 64);
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 64);
  g.fillStyle = color;
  g.font = 'bold 30px sans-serif';
  g.fillText(text, 16, 42);
  return tex(c);
}
