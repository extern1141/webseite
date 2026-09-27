// Version 4: Jede Seite ist eine eigene 3D-Welt. Die Kamera fährt beim Scrollen auf einer Bahn
// durch die Welt; jeder Inhaltsbereich der Seite entspricht einem Abschnitt dieser Bahn.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const rand = (a, b) => a + Math.random() * (b - a);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const C = { blue: 0x3d8bff, cyan: 0x00e5ff, violet: 0x8b5cff, mint: 0x00ffa3, amber: 0xffb020 };

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.65)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function points(n, fn, { size = 0.1, color = 0xaac8ff, map, opacity = 1 } = {}) {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set(fn(i), i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ size, color, map, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
}

function beam(color, height, radius = 0.25) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.8, height, 24, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  );
}

// Glühende Verbindung mit wandernden Paketen
function link(group, a, b, color, dot, lift = 1.5, packets = 3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += lift;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.035, 8, false),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 }),
    ),
  );
  const pts = points(packets, () => [0, 0, 0], { size: 0.35, color: 0xdffcff, map: dot });
  group.add(pts);
  const state = Array.from({ length: packets }, (_, i) => i / packets);
  return (dt) => {
    for (let i = 0; i < packets; i++) {
      state[i] = (state[i] + dt * 0.25) % 1;
      const v = curve.getPoint(state[i]);
      pts.geometry.attributes.position.setXYZ(i, v.x, v.y, v.z);
    }
    pts.geometry.attributes.position.needsUpdate = true;
  };
}

function windowTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 256);
  for (let y = 6; y < 256; y += 10) {
    for (let x = 6; x < 64; x += 10) {
      if (Math.random() < 0.55) {
        const r = Math.random();
        g.fillStyle = r < 0.6 ? '#3d8bff' : r < 0.85 ? '#00e5ff' : '#ffd08a';
        g.globalAlpha = rand(0.3, 1);
        g.fillRect(x, y, 5, 4);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------- Startseite: Datenstadt ----------------
function cityWorld(small, dot) {
  const g = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x070b18, metalness: 0.8, roughness: 0.35 }));
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);
  const grid = new THREE.GridHelper(400, 100, 0x1f4a9a, 0x0e1c3c);
  grid.position.y = 0.01;
  g.add(grid);
  // Gebäude
  const winTex = windowTexture();
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  const bMat = new THREE.MeshStandardMaterial({ color: 0x0c1226, metalness: 0.7, roughness: 0.4, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: 1.2 });
  const n = small ? 260 : 520;
  const bld = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bMat, n);
  const m = new THREE.Matrix4();
  let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const x = Math.round(rand(-60, 60) / 4) * 4;
    const z = Math.round(rand(-150, 20) / 4) * 4;
    if (Math.abs(x) < 5) continue; // Hauptstraße frei lassen
    const d = Math.hypot(x, z + 60);
    const h = Math.max(2, rand(3, 22) * Math.max(0.35, 1 - d / 110));
    const w = rand(2, 3.2);
    m.compose(V(x, h / 2, z), new THREE.Quaternion(), V(w, h, w));
    bld.setMatrixAt(k++, m);
  }
  bld.count = k;
  g.add(bld);
  // Wahrzeichen: drei Türme für die drei Bereiche
  const towers = [];
  [
    [C.blue, V(-9, 0, -30)],
    [C.cyan, V(9, 0, -60)],
    [C.violet, V(-9, 0, -90)],
  ].forEach(([color, p], i) => {
    const t = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(4, 26 + i * 4, 4, 3, 0.2), new THREE.MeshStandardMaterial({ color: 0x0e1633, metalness: 0.9, roughness: 0.25, emissive: color, emissiveIntensity: 0.08 }));
    body.position.y = (26 + i * 4) / 2;
    t.add(body);
    const ringGeo = new THREE.TorusGeometry(3.2, 0.06, 8, 64);
    for (let r = 0; r < 4; r++) {
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 6 + r * 6;
      t.add(ring);
    }
    const b = beam(color, 80, 0.6);
    b.position.y = 40;
    t.add(b);
    const light = new THREE.PointLight(color, 60, 40, 2);
    light.position.y = 10;
    t.add(light);
    t.position.copy(p);
    g.add(t);
    towers.push(t);
  });
  // Lichtspuren auf den Straßen
  const cars = small ? 160 : 360;
  const carState = Array.from({ length: cars }, () => ({ lane: Math.random() < 0.5 ? 'z' : 'x', off: Math.round(rand(-15, 15)) * 4 + 2, p: rand(-150, 150), s: rand(8, 20) * (Math.random() < 0.5 ? 1 : -1) }));
  const carPts = points(cars, () => [0, 0, 0], { size: 0.5, color: 0xffd9a0, map: dot });
  g.add(carPts);
  // Sterne
  g.add(points(small ? 800 : 1600, () => [rand(-200, 200), rand(40, 120), rand(-250, 50)], { size: 0.4, map: dot, color: 0x9fb8ff }));
  g.add(new THREE.AmbientLight(0x2a3a70, 0.6));
  const moon = new THREE.DirectionalLight(0x9fc2ff, 0.6);
  moon.position.set(-20, 40, 10);
  g.add(moon);
  return {
    group: g,
    fog: new THREE.FogExp2(0x050914, 0.012),
    env: 0.5,
    path: [
      [V(0, 45, 40), V(0, 0, -60)], // Hero: Blick über die Stadt
      [V(0, 18, 10), V(0, 6, -40)], // Laufband
      [V(-2, 12, -12), V(-9, 14, -30)], // Bereich 1
      [V(2, 12, -42), V(9, 16, -60)], // Bereich 2
      [V(-2, 12, -72), V(-9, 18, -90)], // Bereich 3
      [V(0, 4, -100), V(0, 3, -130)], // Warum wir: auf Straßenhöhe
      [V(8, 30, -110), V(-9, 32, -90)], // Kontakt: über den Dächern
      [V(0, 70, -60), V(0, 0, -90)], // Footer: Blick von oben
    ],
    update(dt, time) {
      for (let i = 0; i < cars; i++) {
        const c = carState[i];
        c.p += c.s * dt;
        if (c.p > 150) c.p = -150;
        if (c.p < -150) c.p = 150;
        const [x, z] = c.lane === 'z' ? [c.off, c.p - 60] : [c.p, Math.round(c.off * 2.5) - 60];
        carPts.geometry.attributes.position.setXYZ(i, x, 0.4, z);
      }
      carPts.geometry.attributes.position.needsUpdate = true;
      winTex.offset.y = Math.floor(time * 0.5) * 0.01; // Fensterlichter wechseln
      towers.forEach((t, i) => t.children.forEach((ch, j) => ch.geometry?.type === 'TorusGeometry' && (ch.position.y = 6 + (((j - 1) * 6 + time * 3 + i * 2) % 24))));
    },
  };
}

// ---------------- IT-Infrastruktur: Netzwerk-Landschaft ----------------
function networkWorld(small, dot) {
  const g = new THREE.Group();
  const updaters = [];
  const metal = new THREE.MeshStandardMaterial({ color: 0x1a2238, metalness: 0.9, roughness: 0.3 });
  const plate = (p, r = 5, color = C.blue) => {
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.3, 64), new THREE.MeshStandardMaterial({ color: 0x0b1530, metalness: 0.8, roughness: 0.3 }));
    pl.position.copy(p);
    g.add(pl);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color }));
    edge.rotation.x = Math.PI / 2;
    edge.position.copy(p).add(V(0, 0.16, 0));
    g.add(edge);
  };
  const ledRow = (parent, w, y, z, count, color) => {
    for (let i = 0; i < count; i++) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), new THREE.MeshBasicMaterial({ color }));
      l.position.set(-w / 2 + 0.2 + (i * (w - 0.4)) / count, y, z);
      parent.add(l);
    }
  };
  // Stationen
  const P = { router: V(0, 0, 0), switch: V(14, 2, -18), server: V(-12, 0, -36), cloud: V(4, 10, -52), vault: V(14, 0, -70), wall: V(-10, 0, -88), monitor: V(0, 0, -108) };
  Object.entries(P).forEach(([k, p]) => k !== 'cloud' && plate(p, k === 'monitor' ? 7 : 5, k === 'wall' ? C.violet : C.blue));
  // Router mit Antennen
  const router = new THREE.Group();
  router.add(new THREE.Mesh(new RoundedBoxGeometry(4, 0.8, 2.4, 3, 0.15), metal));
  for (const x of [-1.5, 0, 1.5]) {
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2), metal);
    a.position.set(x, 1.3, -1);
    router.add(a);
  }
  ledRow(router, 4, 0.1, 1.21, 8, C.mint);
  router.position.copy(P.router).add(V(0, 0.7, 0));
  g.add(router);
  // Switch
  const sw = new THREE.Group();
  sw.add(new THREE.Mesh(new RoundedBoxGeometry(6, 0.6, 2.6, 3, 0.1), metal));
  for (let i = 0; i < 24; i++) {
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), new THREE.MeshBasicMaterial({ color: i % 5 ? C.mint : C.amber }));
    port.position.set(-2.6 + (i % 12) * 0.45, i < 12 ? 0.1 : -0.1, 1.31);
    sw.add(port);
  }
  sw.position.copy(P.switch).add(V(0, 0.6, 0));
  g.add(sw);
  // Serverrack
  const rack = new THREE.Group();
  rack.add(new THREE.Mesh(new RoundedBoxGeometry(2.4, 6, 2.4, 3, 0.1), metal));
  for (let u = 0; u < 12; u++) ledRow(rack, 2.4, -2.6 + u * 0.45, 1.21, 6, u % 3 ? C.cyan : C.blue);
  rack.position.copy(P.server).add(V(0, 3.15, 0));
  g.add(rack);
  // Cloud (Azure) als schwebende Wolke aus Kugeln
  const cloud = new THREE.Group();
  const cMat = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, metalness: 0.1, roughness: 0.2, transparent: true, opacity: 0.55, emissive: 0x1d6fff, emissiveIntensity: 0.6 });
  [[0, 0, 0, 2.2], [2.2, -0.4, 0.2, 1.6], [-2.2, -0.5, 0, 1.5], [1, 0.9, -0.4, 1.4], [-1, 0.8, 0.4, 1.3]].forEach(([x, y, z, r]) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), cMat);
    s.position.set(x, y, z);
    cloud.add(s);
  });
  cloud.position.copy(P.cloud);
  g.add(cloud);
  // Backup-Tresor
  const vault = new THREE.Group();
  vault.add(new THREE.Mesh(new RoundedBoxGeometry(4, 4, 4, 4, 0.3), metal));
  const door = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 16, 48), new THREE.MeshStandardMaterial({ color: 0xc9d4ea, metalness: 1, roughness: 0.2 }));
  door.position.z = 2.05;
  vault.add(door);
  const spokes = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.12), door.material);
    sp.rotation.z = (i * Math.PI) / 3;
    spokes.add(sp);
  }
  spokes.position.z = 2.1;
  vault.add(spokes);
  vault.position.copy(P.vault).add(V(0, 2.15, 0));
  g.add(vault);
  // Firewall: Schild aus Waben
  const wall = new THREE.Group();
  const hex = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 6);
  const hexMat = new THREE.MeshBasicMaterial({ color: C.violet, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let r = 0; r < 9; r++) {
    for (let q = 0; q < 12; q++) {
      const h = new THREE.Mesh(hex, hexMat);
      h.rotation.x = Math.PI / 2;
      h.position.set(-5 + q * 0.9 + (r % 2) * 0.45, 0.6 + r * 0.78, 0);
      wall.add(h);
    }
  }
  wall.position.copy(P.wall);
  g.add(wall);
  // Monitoring: Kreis aus Bildschirmen
  const mon = new THREE.Group();
  const screens = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), new THREE.MeshBasicMaterial({ color: i % 2 ? C.cyan : C.mint, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    s.position.set(Math.cos(a) * 5, 2.5, Math.sin(a) * 5);
    s.lookAt(0, 2.5, 0);
    mon.add(s);
    screens.push(s);
  }
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: C.cyan, wireframe: true }));
  core.position.y = 2.5;
  mon.add(core);
  mon.position.copy(P.monitor);
  g.add(mon);
  // Verbindungen
  const order = [P.router, P.switch, P.server, P.cloud, P.vault, P.wall, P.monitor];
  for (let i = 0; i < order.length - 1; i++) updaters.push(link(g, order[i].clone().add(V(0, 1, 0)), order[i + 1].clone().add(V(0, 1, 0)), i % 2 ? C.cyan : C.blue, dot, 4, 4));
  updaters.push(link(g, P.server.clone().add(V(0, 5, 0)), P.vault.clone().add(V(0, 3, 0)), C.violet, dot, 6, 3));
  g.add(points(small ? 600 : 1400, () => [rand(-80, 80), rand(-20, 60), rand(-180, 40)], { size: 0.25, map: dot, color: 0x7fa8ff, opacity: 0.8 }));
  const floor = new THREE.GridHelper(300, 120, 0x173a7a, 0x0b1733);
  floor.position.y = -3;
  g.add(floor);
  g.add(new THREE.AmbientLight(0x2a3a70, 0.8));
  const key = new THREE.PointLight(0x5fa8ff, 200, 80, 2);
  key.position.set(0, 20, -50);
  g.add(key);
  return {
    group: g,
    fog: new THREE.FogExp2(0x050914, 0.018),
    env: 0.8,
    path: [
      [V(0, 30, 30), V(0, 0, -40)], // Hero
      [V(5, 5, 9), V(0, 1, 0)], // Netzwerk & Hardware (Router/Switch)
      [V(-4, 7, -24), V(-12, 3, -36)], // Server & Cloud
      [V(8, 6, -58), V(14, 2, -70)], // Backup & Security
      [V(-2, 7, -80), V(-10, 3, -88)], // Firewall
      [V(0, 9, -96), V(0, 2, -108)], // Support & Monitoring
      [V(0, 14, -120), V(0, 3, -108)], // CTA
      [V(0, 45, -60), V(0, 0, -70)], // Kontakt/Footer: Übersicht
    ],
    update(dt, time) {
      updaters.forEach((u) => u(dt));
      cloud.position.y = P.cloud.y + Math.sin(time * 0.8) * 0.5;
      spokes.rotation.z = time * 0.4;
      core.rotation.y = time * 0.6;
      core.rotation.x = time * 0.3;
      mon.rotation.y = time * 0.08;
      screens.forEach((s, i) => (s.material.opacity = 0.25 + 0.2 * Math.sin(time * 2 + i)));
      hexMat.opacity = 0.3 + 0.1 * Math.sin(time * 1.5);
    },
  };
}

// ---------------- Webdesign & SEO: Design-Studio ----------------
function studioWorld(small, dot) {
  const g = new THREE.Group();
  const grid = new THREE.GridHelper(300, 150, 0x6a3dff, 0x1a1540);
  grid.position.y = -4;
  g.add(grid);
  // schwebende Browserfenster (Wireframes)
  const wins = [];
  for (let i = 0; i < (small ? 14 : 26); i++) {
    const w = new THREE.Group();
    const W = rand(3, 6);
    const H = W * 0.62;
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W, H)), new THREE.LineBasicMaterial({ color: i % 3 ? C.blue : C.violet }));
    w.add(frame);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(W, H * 0.1), new THREE.MeshBasicMaterial({ color: 0x1b2a55 }));
    bar.position.y = H * 0.45;
    w.add(bar);
    for (let r = 0; r < 3; r++) {
      const block = new THREE.Mesh(new THREE.PlaneGeometry(W * rand(0.3, 0.8), H * 0.08), new THREE.MeshBasicMaterial({ color: r === 0 ? C.cyan : 0x2a3a6a, transparent: true, opacity: 0.7 }));
      block.position.set(-W * 0.1, H * (0.2 - r * 0.18), 0.01);
      w.add(block);
    }
    w.position.set(rand(-25, 25), rand(-2, 14), rand(-120, 10));
    w.rotation.y = rand(-0.6, 0.6);
    g.add(w);
    wins.push({ w, s: rand(0.2, 0.6), y: w.position.y });
  }
  // Identität: Logo-Skulptur
  const logo = new THREE.Mesh(new THREE.TorusKnotGeometry(3, 0.8, 200, 32), new THREE.MeshStandardMaterial({ color: 0x5a8dff, metalness: 1, roughness: 0.15 }));
  logo.position.set(-8, 4, -25);
  g.add(logo);
  // SEO: Lupe
  const lens = new THREE.Group();
  lens.add(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.35, 24, 64), new THREE.MeshStandardMaterial({ color: 0xdfe6f5, metalness: 1, roughness: 0.2 })));
  const glass = new THREE.Mesh(new THREE.CircleGeometry(2.3, 64), new THREE.MeshStandardMaterial({ color: 0x8fdcff, transparent: true, opacity: 0.25, metalness: 0.2, roughness: 0 }));
  lens.add(glass);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4), new THREE.MeshStandardMaterial({ color: 0x1a2238, metalness: 0.8, roughness: 0.3 }));
  handle.position.set(2.6, -2.6, 0);
  handle.rotation.z = Math.PI / 4;
  lens.add(handle);
  lens.position.set(9, 5, -45);
  g.add(lens);
  // Google Maps: Standort-Pin
  const pin = new THREE.Group();
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xff4d6d, metalness: 0.3, roughness: 0.3, emissive: 0x551122 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 32), pinMat);
  head.position.y = 3;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(1.35, 3, 32), pinMat);
  tip.rotation.x = Math.PI;
  tip.position.y = 1;
  pin.add(head, tip);
  const pulse = new THREE.Mesh(new THREE.RingGeometry(1, 1.2, 64), new THREE.MeshBasicMaterial({ color: 0xff4d6d, transparent: true, side: THREE.DoubleSide }));
  pulse.rotation.x = -Math.PI / 2;
  pulse.position.y = -0.4;
  pin.add(pulse);
  pin.position.set(-6, -3.5, -62);
  g.add(pin);
  // Pakete: zwei Podeste
  const pedestals = [];
  [[-5, 'Digital-Start', C.blue], [5, 'Premium', C.violet]].forEach(([x, , color], i) => {
    const ped = new THREE.Group();
    ped.add(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 2 + i, 48), new THREE.MeshStandardMaterial({ color: 0x141b33, metalness: 0.9, roughness: 0.3 })));
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.4 + i * 0.4, 0), new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.1, emissive: color, emissiveIntensity: 0.4 }));
    gem.position.y = 3 + i;
    ped.add(gem);
    const b = beam(color, 30, 0.8);
    b.position.y = 16;
    ped.add(b);
    ped.position.set(x, -3, -85);
    g.add(ped);
    pedestals.push(gem);
  });
  // FAQ: schwebende Kugeln
  const orbs = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.45, emissive: C.cyan, emissiveIntensity: 0.06 }));
    o.position.set(-4.5 + i * 3, 2, 0);
    orbs.add(o);
  }
  orbs.position.set(0, 0, -105);
  g.add(orbs);
  g.add(points(small ? 700 : 1500, () => [rand(-80, 80), rand(-4, 50), rand(-200, 40)], { size: 0.22, map: dot, color: 0xb59bff, opacity: 0.8 }));
  g.add(new THREE.AmbientLight(0x3a2a70, 0.7));
  const key = new THREE.DirectionalLight(0xd9c8ff, 1.2);
  key.position.set(10, 20, 10);
  g.add(key);
  return {
    group: g,
    fog: new THREE.FogExp2(0x0a0718, 0.016),
    env: 1,
    path: [
      [V(0, 8, 22), V(0, 4, -10)], // Hero: zwischen den Browserfenstern
      [V(-2, 5, -12), V(-8, 4, -25)], // Rundum-Sorglos: Logo
      [V(3, 6, -34), V(9, 5, -45)], // SEO-Lupe
      [V(-2, 2, -52), V(-6, -1, -62)], // Maps-Pin
      [V(0, 4, -72), V(0, 0, -85)], // Pakete
      [V(0, 4, -96), V(0, 2, -105)], // FAQ
      [V(0, 10, -112), V(0, 3, -90)], // CTA: Rückblick
      [V(0, 40, -50), V(0, 0, -70)], // Kontakt
    ],
    update(dt, time) {
      wins.forEach((o, i) => {
        o.w.position.y = o.y + Math.sin(time * o.s + i) * 0.6;
        o.w.rotation.y += dt * 0.03 * (i % 2 ? 1 : -1);
      });
      logo.rotation.y = time * 0.3;
      logo.rotation.x = time * 0.15;
      lens.rotation.y = Math.sin(time * 0.6) * 0.5;
      const pl = (time % 2) / 2;
      pulse.scale.setScalar(1 + pl * 4);
      pulse.material.opacity = 1 - pl;
      pin.position.y = -3.5 + Math.abs(Math.sin(time * 1.5)) * 0.6;
      pedestals.forEach((gem, i) => (gem.rotation.y = time * (0.6 + i * 0.3)));
      orbs.children.forEach((o, i) => (o.position.y = 2 + Math.sin(time * 1.3 + i) * 0.5));
    },
  };
}

// ---------------- Reparaturen: im Inneren des Laptops ----------------
function laptopWorld(small, dot) {
  const g = new THREE.Group();
  const alu = new THREE.MeshStandardMaterial({ color: 0x5d6678, metalness: 0.95, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x14181f, metalness: 0.5, roughness: 0.5 });
  // Riesiger Laptop
  const lap = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(30, 1.2, 20, 4, 0.5), alu);
  lap.add(base);
  const keys = new THREE.InstancedMesh(new RoundedBoxGeometry(1.4, 0.3, 1.4, 2, 0.12), dark, 14 * 5);
  const m = new THREE.Matrix4();
  let k = 0;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) keys.setMatrixAt(k++, m.makeTranslation(-11.7 + c * 1.8, 0.7, -7 + r * 1.8));
  lap.add(keys);
  const lid = new THREE.Group();
  lid.add(new THREE.Mesh(new RoundedBoxGeometry(30, 19, 0.8, 4, 0.4), alu));
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x1b4dff });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(27, 16.5), screenMat);
  screen.position.z = 0.42;
  lid.add(screen);
  lid.position.set(0, 9.5, -10);
  lid.rotation.x = -0.25;
  lap.add(lid);
  g.add(lap);
  // Innenleben (unter dem Laptop, die Kamera taucht ein)
  const inside = new THREE.Group();
  inside.position.set(0, -30, 0);
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 120), new THREE.MeshStandardMaterial({ color: 0x0a1f3d, metalness: 0.4, roughness: 0.6 }));
  pcb.position.z = -50;
  inside.add(pcb);
  const traceMat = new THREE.LineBasicMaterial({ color: C.blue, transparent: true, opacity: 0.5 });
  for (let i = 0; i < (small ? 60 : 120); i++) {
    const x = rand(-18, 18);
    const z = rand(-105, 5);
    const pts = [V(x, 0.2, z), V(x, 0.2, z + rand(-6, 6))];
    pts.push(V(pts[1].x + rand(-6, 6), 0.2, pts[1].z));
    inside.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), traceMat));
  }
  // Akku (Zellen)
  const cellMat = new THREE.MeshStandardMaterial({ color: 0x2e7d5b, metalness: 0.6, roughness: 0.3 });
  const cells = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.9, 0.9, 6, 32), cellMat, 8);
  for (let i = 0; i < 8; i++) {
    m.makeRotationZ(Math.PI / 2);
    m.setPosition(-6 + (i % 4) * 0.1, 1.1, -12 + i * 2);
    cells.setMatrixAt(i, m);
  }
  inside.add(cells);
  const batteryGlow = new THREE.PointLight(C.mint, 30, 15, 2);
  batteryGlow.position.set(-6, 4, -5);
  inside.add(batteryGlow);
  // SSD
  const ssd = new THREE.Group();
  ssd.add(new THREE.Mesh(new RoundedBoxGeometry(8, 0.4, 2.4, 2, 0.1), new THREE.MeshStandardMaterial({ color: 0x0d0f14, metalness: 0.4, roughness: 0.4 })));
  for (let i = 0; i < 3; i++) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1.6), dark);
    chip.position.set(-2.4 + i * 2.3, 0.3, 0);
    ssd.add(chip);
  }
  const label = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), new THREE.MeshBasicMaterial({ color: C.cyan }));
  label.rotation.x = -Math.PI / 2;
  label.position.set(3, 0.45, 0);
  ssd.add(label);
  ssd.position.set(6, 0.6, -35);
  inside.add(ssd);
  // Lüfter
  const fan = new THREE.Group();
  fan.add(new THREE.Mesh(new THREE.TorusGeometry(4, 0.4, 16, 64), alu));
  const blades = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const bl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 3.4), dark);
    bl.position.z = 1.8;
    const holder = new THREE.Group();
    holder.rotation.y = (i / 9) * Math.PI * 2;
    bl.rotation.x = 0.4;
    holder.add(bl);
    blades.add(holder);
  }
  fan.add(blades);
  fan.rotation.x = Math.PI / 2;
  fan.position.set(-5, 1, -55);
  inside.add(fan);
  const fanLight = new THREE.PointLight(C.cyan, 40, 20, 2);
  fanLight.position.set(-5, 5, -55);
  inside.add(fanLight);
  // Ablauf: vier Tore
  const gates = [];
  for (let i = 0; i < 4; i++) {
    const gate = new THREE.Mesh(new THREE.TorusGeometry(4, 0.15, 12, 64), new THREE.MeshBasicMaterial({ color: [C.blue, C.cyan, C.violet, C.mint][i] }));
    gate.position.set(0, 4, -72 - i * 8);
    inside.add(gate);
    gates.push(gate);
  }
  // Vertrauen: Schild
  const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 1), new THREE.MeshBasicMaterial({ color: C.mint, wireframe: true }));
  shield.position.set(0, 5, -110);
  inside.add(shield);
  inside.add(points(small ? 300 : 700, () => [rand(-20, 20), rand(0.5, 12), rand(-115, 5)], { size: 0.2, map: dot, color: 0x9fe8ff }));
  inside.add(new THREE.AmbientLight(0x2a3a70, 0.7));
  g.add(inside);
  g.add(points(small ? 500 : 1000, () => [rand(-80, 80), rand(0, 60), rand(-80, 60)], { size: 0.3, map: dot, color: 0x9fb8ff, opacity: 0.8 }));
  g.add(new THREE.AmbientLight(0x2a3a70, 0.5));
  const key = new THREE.DirectionalLight(0xcfe0ff, 0.6);
  key.position.set(10, 30, 20);
  g.add(key);
  return {
    group: g,
    fog: new THREE.FogExp2(0x050914, 0.014),
    env: 0.45,
    path: [
      [V(0, 22, 32), V(0, 6, -6)], // Hero: vor dem Laptop
      [V(0, 6, 8), V(0, -30, -10)], // Eintauchen: Akku
      [V(-2, -25, 2), V(-6, -29, -8)], // Kleinreparaturen: Akku
      [V(8, -25, -26), V(6, -29, -35)], // Datenrettung: SSD
      [V(-3, -22, -44), V(-5, -29, -55)], // Kaufberatung: Lüfter / Gerät
      [V(0, -26, -60), V(0, -26, -100)], // Ablauf: durch die Tore
      [V(0, -24, -100), V(0, -25, -110)], // Vertrauen: Schild
      [V(0, 10, 40), V(0, 0, 0)], // Kontakt: zurück zum Laptop
    ],
    update(dt, time) {
      blades.rotation.y += dt * 8;
      gates.forEach((gt, i) => (gt.rotation.z = time * (0.4 + i * 0.1)));
      shield.rotation.y = time * 0.5;
      screenMat.color.setHSL(0.62 + Math.sin(time * 0.3) * 0.04, 0.85, 0.2);
      batteryGlow.intensity = 25 + Math.sin(time * 3) * 10;
    },
  };
}

// ---------------- Impressum & Datenschutz: Datentresor ----------------
function vaultWorld(small, dot) {
  const g = new THREE.Group();
  const panes = [];
  for (let i = 0; i < 24; i++) {
    const side = i % 2 ? 1 : -1;
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 9),
      new THREE.MeshStandardMaterial({ color: 0x8fb8ff, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.12, side: THREE.DoubleSide }),
    );
    p.position.set(side * 7, 3, -i * 6);
    p.rotation.y = side * -0.35;
    g.add(p);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(6, 9)), new THREE.LineBasicMaterial({ color: C.blue, transparent: true, opacity: 0.6 }));
    edge.position.copy(p.position);
    edge.rotation.copy(p.rotation);
    g.add(edge);
    panes.push(p);
  }
  const lock = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcfd8ea, metalness: 1, roughness: 0.2 });
  lock.add(new THREE.Mesh(new RoundedBoxGeometry(4, 3.4, 1.4, 4, 0.3), bodyMat));
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.3, 16, 48, Math.PI), bodyMat);
  shackle.position.y = 1.7;
  lock.add(shackle);
  lock.position.set(0, 3, -150);
  g.add(lock);
  const b = beam(C.cyan, 60, 1.5);
  b.position.set(0, 30, -150);
  g.add(b);
  const floor = new THREE.GridHelper(200, 80, 0x1f4a9a, 0x0b1733);
  floor.position.y = -2;
  g.add(floor);
  g.add(points(small ? 500 : 1000, () => [rand(-30, 30), rand(-2, 20), rand(-160, 10)], { size: 0.18, map: dot, color: 0x9fd4ff, opacity: 0.8 }));
  g.add(new THREE.AmbientLight(0x2a3a70, 0.8));
  const key = new THREE.PointLight(0x7fc0ff, 150, 60, 2);
  key.position.set(0, 10, -150);
  g.add(key);
  return {
    group: g,
    fog: new THREE.FogExp2(0x050914, 0.02),
    env: 0.9,
    path: [
      [V(0, 4, 12), V(0, 3, -20)],
      [V(0, 3.5, -60), V(0, 3, -100)],
      [V(0, 4, -135), V(0, 3, -150)],
    ],
    update(dt, time) {
      lock.rotation.y = Math.sin(time * 0.5) * 0.4;
      panes.forEach((p, i) => (p.material.opacity = 0.1 + 0.05 * Math.sin(time + i)));
    },
  };
}

const WORLDS = { home: cityWorld, network: networkWorld, studio: studioWorld, laptop: laptopWorld, vault: vaultWorld };

export function createWorld(canvas, name, { small }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  const dot = glowTexture();
  const world = (WORLDS[name] || cityWorld)(small, dot);
  scene.add(world.group);
  scene.fog = world.fog;
  scene.background = world.fog.color;
  scene.environmentIntensity = world.env;
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  const posCurve = new THREE.CatmullRomCurve3(world.path.map((p) => p[0]), false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(world.path.map((p) => p[1]), false, 'centripetal');
  const look = new THREE.Vector3();

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.75, 0.5, 0.5);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let useBloom = !small;
  const basePR = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
  let size = [1, 1];
  return {
    // Qualitätsstufe: 0 = voll, 1 = geringere Auflösung, 2 = ohne Glow, 3 = sehr niedrige Auflösung
    setQuality(level) {
      useBloom = !small && level < 2;
      renderer.setPixelRatio(basePR * [1, 0.75, 0.75, 0.5][level]);
      this.resize(...size);
    },
    resize(w, h) {
      size = [w, h];
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      camera.fov = w < h ? 72 : 55;
      camera.updateProjectionMatrix();
    },
    // t: 0 = Seitenanfang, 1 = Seitenende
    render(t, dt, time, pointer) {
      world.update(dt, time);
      camera.position.copy(posCurve.getPoint(t));
      look.copy(lookCurve.getPoint(t));
      camera.position.x += pointer.x * 1.2;
      camera.position.y -= pointer.y * 0.8;
      camera.lookAt(look);
      if (useBloom) composer.render();
      else renderer.render(scene, camera);
    },
    dispose() {
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => (mm.map?.dispose(), mm.emissiveMap?.dispose(), mm.dispose()));
      });
      dot.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
