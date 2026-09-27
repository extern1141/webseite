// Version 5: fotorealistische MDK-IT-Werkstatt. Ein detaillierter Raum (Schreibtisch, Serverschrank,
// Reparatur-Werkbank, Tresor, Fenster zur Stadt). Jede Seite ist eine eigene Kamerafahrt durch den Raum.
// Realismus: physikalische Materialien, Flächenlichter, weiche Schatten, Tiefenunschärfe, leichtes Glühen.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import * as T from './officeTextures.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- Materialien ----------
function materials() {
  return {
    floor: new THREE.MeshPhysicalMaterial({ map: T.parquet(), roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.25 }),
    wall: new THREE.MeshStandardMaterial({ map: T.plaster('#c3c7cf'), roughness: 0.92 }),
    accent: new THREE.MeshStandardMaterial({ map: T.plaster('#1b2a4a'), roughness: 0.9 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xe6e8ec, roughness: 0.95 }),
    walnut: new THREE.MeshPhysicalMaterial({ map: T.walnut(), roughness: 0.38, clearcoat: 0.55, clearcoatRoughness: 0.18 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x9aa1ad, metalness: 1, roughness: 0.32 }),
    blackSteel: new THREE.MeshStandardMaterial({ color: 0x1a1d23, metalness: 0.85, roughness: 0.42 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb9bec8, metalness: 1, roughness: 0.24 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.55 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.9 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xf2f2ee, roughness: 0.18, clearcoat: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xbfd8ff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.18, clearcoat: 1 }),
    pcb: new THREE.MeshStandardMaterial({ color: 0x0d4d33, roughness: 0.55, metalness: 0.2 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x2b3140, roughness: 1 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.7, side: THREE.DoubleSide }),
    pot: new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.8 }),
    mat: new THREE.MeshStandardMaterial({ map: T.mat(), roughness: 0.85 }),
  };
}

const box = (w, h, d, m, r = 0.01) => new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), m);
const at = (mesh, x, y, z) => (mesh.position.set(x, y, z), mesh);

// ---------- Raum ----------
function room(g, M) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), M.floor);
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), M.ceiling);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 3.2;
  g.add(ceil);
  // Rückwand mit Fensteröffnung (aus vier Teilen)
  const back = new THREE.Group();
  back.add(at(new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.2), M.accent), -2.2, 1.6, -6));
  back.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), M.wall), 3.7, 1.6, -6));
  back.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.9), M.wall), 1.4, 0.45, -6));
  back.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.7), M.wall), 1.4, 2.85, -6));
  g.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.2), M.wall);
  left.rotation.y = Math.PI / 2;
  left.position.set(-5, 1.6, 0);
  g.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.2), M.wall);
  right.rotation.y = -Math.PI / 2;
  right.position.set(5, 1.6, 0);
  g.add(right);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), M.wall);
  front.rotation.y = Math.PI;
  front.position.set(0, 1.6, 6);
  g.add(front);
  // Sockelleisten
  for (const [w, x, z, ry] of [[10, 0, -5.98, 0], [12, -4.98, 0, Math.PI / 2], [12, 4.98, 0, -Math.PI / 2]]) {
    const b = box(w, 0.08, 0.015, M.ceiling, 0);
    b.position.set(x, 0.04, z);
    b.rotation.y = ry;
    g.add(b);
  }
  // Fenster: Rahmen, Sprossen, Glas, Fensterbank, Stadt dahinter
  const frameMat = M.blackSteel;
  for (const [w, h, x, y] of [[2.1, 0.06, 1.4, 0.9], [2.1, 0.06, 1.4, 2.5], [0.06, 1.66, 0.35, 1.7], [0.06, 1.66, 2.45, 1.7], [0.04, 1.6, 1.4, 1.7]]) g.add(at(box(w, h, 0.08, frameMat, 0), x, y, -6));
  g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.6), M.glass), 1.4, 1.7, -6.01));
  g.add(at(box(2.3, 0.04, 0.3, M.ceramic, 0.01), 1.4, 0.88, -5.85));
  const city = new THREE.Mesh(new THREE.PlaneGeometry(22, 11), new THREE.MeshBasicMaterial({ map: T.nightCity(), toneMapped: false, color: 0xb0b8c8 }));
  city.position.set(1.4, 2.5, -14);
  g.add(city);
  // Teppich
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), new THREE.MeshStandardMaterial({ color: 0x3a4256, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-1.6, 0.005, -3.9);
  g.add(rug);
  // Deckenpaneele (sichtbar) – das Licht kommt von Flächenlichtern
  for (const [x, z] of [[-1.6, -3.2], [2.2, -0.5], [-2.8, 1.8]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ color: 0xfff6e8, toneMapped: false }));
    p.rotation.x = Math.PI / 2;
    p.position.set(x, 3.19, z);
    g.add(p);
  }
}

// ---------- Schreibtisch mit Monitor, Laptop, Handy, Skizzen, Tasse, Pflanze, Stuhl ----------
function desk(g, M) {
  const d = new THREE.Group();
  d.add(at(box(1.9, 0.045, 0.85, M.walnut, 0.012), 0, 0.75, 0));
  for (const x of [-0.88, 0.88]) {
    d.add(at(box(0.05, 0.72, 0.7, M.blackSteel, 0.01), x, 0.37, 0));
  }
  d.add(at(box(1.7, 0.05, 0.03, M.blackSteel, 0), 0, 0.2, -0.3));
  // Monitor
  const mon = new THREE.Group();
  mon.add(at(box(0.98, 0.58, 0.035, M.plastic, 0.01), 0, 0, 0));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.53), new THREE.MeshBasicMaterial({ map: T.siteScreen(), toneMapped: false, color: 0xd8dde6 }));
  screen.position.z = 0.019;
  mon.add(screen);
  mon.add(at(box(0.05, 0.3, 0.05, M.alu, 0.01), 0, -0.36, -0.06));
  mon.add(at(box(0.3, 0.015, 0.22, M.alu, 0.006), 0, -0.505, -0.03));
  mon.position.set(0, 1.28, -0.22);
  d.add(mon);
  // Tastatur mit Tasten
  const kb = new THREE.Group();
  kb.add(box(0.44, 0.018, 0.14, M.alu, 0.005));
  const keys = new THREE.InstancedMesh(new RoundedBoxGeometry(0.022, 0.008, 0.022, 1, 0.003), M.plastic, 15 * 5);
  const m = new THREE.Matrix4();
  let k = 0;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) keys.setMatrixAt(k++, m.makeTranslation(-0.2 + c * 0.0285, 0.012, -0.055 + r * 0.027));
  kb.add(keys);
  kb.position.set(0, 0.782, 0.12);
  d.add(kb);
  d.add(at(box(0.06, 0.02, 0.1, M.plastic, 0.01), 0.34, 0.782, 0.14));
  // Laptop mit Monitoring-Dashboard
  const lap = new THREE.Group();
  lap.add(at(box(0.33, 0.014, 0.23, M.alu, 0.006), 0, 0, 0));
  const lid = new THREE.Group();
  lid.add(at(box(0.33, 0.21, 0.008, M.alu, 0.004), 0, 0.105, 0));
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.19), new THREE.MeshBasicMaterial({ map: T.dashboard(), toneMapped: false, color: 0xd0d6e0 }));
  dash.position.set(0, 0.105, 0.0045);
  lid.add(dash);
  lid.position.set(0, 0.007, -0.115);
  lid.rotation.x = -0.28;
  lap.add(lid);
  lap.position.set(0.78, 0.78, 0.08);
  lap.rotation.y = -0.35;
  d.add(lap);
  // Smartphone mit Maps
  const phone = new THREE.Group();
  phone.add(box(0.075, 0.008, 0.155, M.plastic, 0.006));
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.145), new THREE.MeshBasicMaterial({ map: T.mapsPhone(), toneMapped: false, color: 0xdadada }));
  ps.rotation.x = -Math.PI / 2;
  ps.position.y = 0.0045;
  phone.add(ps);
  phone.position.set(-0.5, 0.777, 0.25);
  phone.rotation.y = 0.3;
  d.add(phone);
  // Skizzenblock
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.006, 0.24), [M.ceramic, M.ceramic, new THREE.MeshStandardMaterial({ map: T.sketches(), roughness: 0.9 }), M.ceramic, M.ceramic, M.ceramic]);
  pad.position.set(-0.62, 0.776, -0.05);
  pad.rotation.y = 0.12;
  d.add(pad);
  const pen = at(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 12), M.blackSteel), -0.45, 0.782, -0.02);
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.5;
  d.add(pen);
  // Kaffeetasse (gedreht)
  const cupProfile = [V(0, 0, 0), V(0.035, 0, 0), V(0.04, 0.005, 0), V(0.042, 0.09, 0), V(0.038, 0.09, 0), V(0.036, 0.012, 0), V(0, 0.012, 0)].map((p) => new THREE.Vector2(p.x, p.y));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 48), M.ceramic);
  cup.position.set(0.5, 0.772, -0.2);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 12, 24, Math.PI), M.ceramic);
  handle.position.set(0.542, 0.817, -0.2);
  handle.rotation.z = -Math.PI / 2;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.036, 32), new THREE.MeshPhysicalMaterial({ color: 0x2a160b, roughness: 0.1, clearcoat: 1 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(0.5, 0.852, -0.2);
  d.add(cup, handle, coffee);
  // Pflanze
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.13, 32), M.pot);
  pot.position.set(-0.82, 0.84, -0.3);
  d.add(pot);
  for (let i = 0; i < 18; i++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.035, rand(0.12, 0.22)), M.leaf);
    leaf.position.set(-0.82 + rand(-0.02, 0.02), 0.96, -0.3 + rand(-0.02, 0.02));
    leaf.rotation.set(rand(-0.6, 0.6), (i / 18) * Math.PI * 2, rand(-0.5, 0.5));
    leaf.translateY(0.06);
    d.add(leaf);
  }
  d.position.set(-1.6, 0, -5.1);
  g.add(d);
  // Bürostuhl
  const chair = new THREE.Group();
  chair.add(at(box(0.5, 0.08, 0.48, M.fabric, 0.03), 0, 0.48, 0));
  const backrest = at(box(0.48, 0.6, 0.06, M.fabric, 0.03), 0, 0.85, 0.24);
  backrest.rotation.x = 0.1;
  chair.add(backrest);
  chair.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 16), M.steel), 0, 0.26, 0));
  for (let i = 0; i < 5; i++) {
    const leg = box(0.32, 0.03, 0.04, M.blackSteel, 0.01);
    leg.position.y = 0.07;
    leg.rotation.y = (i / 5) * Math.PI * 2;
    leg.translateX(0.16);
    chair.add(leg);
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), M.rubber);
    wheel.position.set(Math.cos((i / 5) * Math.PI * 2) * 0.3, 0.028, -Math.sin((i / 5) * Math.PI * 2) * 0.3);
    chair.add(wheel);
  }
  chair.position.set(-1.6, 0, -4.1);
  chair.rotation.y = 0.25;
  g.add(chair);
}

// ---------- Serverschrank ----------
function rack(g, M) {
  const r = new THREE.Group();
  const W = 0.62;
  const H = 2.0;
  const D = 1.0;
  // Rahmen
  r.add(at(box(W, 0.04, D, M.blackSteel, 0), 0, H, 0));
  r.add(at(box(W, 0.06, D, M.blackSteel, 0), 0, 0.03, 0));
  r.add(at(box(0.02, H, D, M.blackSteel, 0), -W / 2, H / 2, 0));
  r.add(at(box(0.02, H, D, M.blackSteel, 0), W / 2, H / 2, 0));
  r.add(at(box(W, H, 0.02, M.blackSteel, 0), 0, H / 2, -D / 2));
  // Geöffnete Glastür
  const door = new THREE.Group();
  door.add(at(new THREE.Mesh(new THREE.PlaneGeometry(W, H - 0.1), M.glass), -W / 2, H / 2, 0));
  for (const [w, h, x, y] of [[W, 0.03, -W / 2, 0.06], [W, 0.03, -W / 2, H - 0.06], [0.03, H - 0.1, -W, H / 2]]) door.add(at(box(w, h, 0.02, M.blackSteel, 0), x, y, 0));
  door.position.set(W / 2, 0, D / 2);
  door.rotation.y = -1.9;
  r.add(door);
  const leds = [];
  const ledMats = { g: new THREE.MeshBasicMaterial({ color: 0x3dff9a, toneMapped: false }), a: new THREE.MeshBasicMaterial({ color: 0xffb020, toneMapped: false }), b: new THREE.MeshBasicMaterial({ color: 0x3d9bff, toneMapped: false }) };
  const led = (parent, x, y, z, kind = 'g') => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.002), ledMats[kind]);
    l.position.set(x, y, z);
    parent.add(l);
    leds.push(l);
  };
  const front = D / 2 - 0.04;
  // Patchpanel mit bunten Kabeln
  const patch = new THREE.Group();
  patch.add(box(0.56, 0.044, 0.04, M.blackSteel, 0));
  patch.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.012), new THREE.MeshBasicMaterial({ map: T.label('PATCH A1-A24') })), -0.16, 0.012, 0.021));
  const cableColors = [0x3d8bff, 0x3d8bff, 0xffd400, 0x3d8bff, 0xff3b3b, 0x3d8bff, 0x2ecc71, 0x3d8bff];
  for (let i = 0; i < 24; i++) {
    const x = -0.25 + i * 0.021;
    patch.add(at(box(0.013, 0.011, 0.004, M.rubber, 0), x, -0.008, 0.021));
    if (i % 3 !== 2) {
      const c = cableColors[i % cableColors.length];
      const curve = new THREE.CatmullRomCurve3([V(x, -0.008, 0.03), V(x, -0.02, 0.08), V(x * 0.6 + 0.18, -0.09, 0.1), V(0.26, -0.12, 0.05)]);
      patch.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.0028, 6), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })));
    }
  }
  patch.position.set(0, 1.8, front);
  r.add(patch);
  // Switch mit Port-LEDs
  const sw = new THREE.Group();
  sw.add(box(0.56, 0.044, 0.35, M.blackSteel, 0.004));
  sw.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.012), new THREE.MeshBasicMaterial({ map: T.label('CORE-SWITCH 48P', '#9fd4ff') })), -0.18, 0.012, 0.176));
  for (let i = 0; i < 24; i++) {
    const x = -0.12 + (i % 12) * 0.022;
    const y = i < 12 ? 0.006 : -0.01;
    sw.add(at(box(0.014, 0.011, 0.004, M.rubber, 0), x, y, 0.176));
    led(sw, x - 0.004, y + 0.008, 0.178, i % 7 ? 'g' : 'a');
  }
  sw.position.set(0, 1.72, front - 0.14);
  r.add(sw);
  // Firewall
  const fw = new THREE.Group();
  fw.add(box(0.56, 0.044, 0.3, new THREE.MeshStandardMaterial({ color: 0x7a1f2b, metalness: 0.6, roughness: 0.4 }), 0.004));
  fw.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.012), new THREE.MeshBasicMaterial({ map: T.label('FIREWALL', '#ffd0d0', '#3a0d12') })), -0.18, 0.005, 0.151));
  for (let i = 0; i < 6; i++) led(fw, 0.1 + i * 0.025, 0.005, 0.152, i < 5 ? 'g' : 'b');
  fw.position.set(0, 1.55, front - 0.12);
  r.add(fw);
  // Server (2 HE) mit Laufwerksschächten
  for (let s = 0; s < 3; s++) {
    const sv = new THREE.Group();
    sv.add(box(0.56, 0.086, 0.75, M.blackSteel, 0.004));
    const bezel = at(box(0.54, 0.08, 0.01, M.steel, 0.003), 0, 0, 0.38);
    sv.add(bezel);
    for (let b = 0; b < 8; b++) {
      sv.add(at(box(0.05, 0.03, 0.006, M.plastic, 0.002), -0.22 + b * 0.058, -0.012, 0.388));
      led(sv, -0.2 + b * 0.058, -0.012, 0.392, b % 5 ? 'g' : 'b');
    }
    sv.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.012), new THREE.MeshBasicMaterial({ map: T.label(`SRV-0${s + 1}`, '#cfe0ff') })), -0.18, 0.025, 0.386));
    sv.position.set(0, 0.95 + s * 0.1, 0.05);
    r.add(sv);
  }
  // NAS (Backup)
  const nas = new THREE.Group();
  nas.add(box(0.56, 0.13, 0.6, M.alu, 0.006));
  for (let b = 0; b < 4; b++) {
    nas.add(at(box(0.11, 0.1, 0.006, M.plastic, 0.003), -0.19 + b * 0.125, -0.005, 0.303));
    led(nas, -0.19 + b * 0.125, 0.052, 0.306, 'b');
  }
  nas.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.014), new THREE.MeshBasicMaterial({ map: T.label('NAS BACKUP', '#1a2033', '#c8cdd6') })), 0, 0.055, 0.302));
  nas.position.set(0, 0.5, 0.15);
  r.add(nas);
  // Kabelbündel nach oben
  for (let i = 0; i < 6; i++) {
    const curve = new THREE.CatmullRomCurve3([V(0.25, 1.68, 0.4), V(0.29, 1.9, 0.2 + i * 0.02), V(0.2, 2.3, -0.2), V(0.1 + i * 0.02, 3.2, -0.4)]);
    r.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.006, 6), new THREE.MeshStandardMaterial({ color: 0x2a5ad8, roughness: 0.5 })));
  }
  const glow = new THREE.PointLight(0x5aa0ff, 0.6, 2.5, 2);
  glow.position.set(0, 1.3, 0.8);
  r.add(glow);
  r.position.set(3.6, 0, -5.2);
  g.add(r);
  return leds;
}

// ---------- Reparatur-Werkbank ----------
function bench(g, M) {
  const b = new THREE.Group();
  b.add(at(box(0.8, 0.05, 2.4, M.walnut, 0.01), 0, 0.9, 0));
  for (const [x, z] of [[-0.35, -1.1], [0.35, -1.1], [-0.35, 1.1], [0.35, 1.1]]) b.add(at(box(0.05, 0.88, 0.05, M.blackSteel, 0.005), x, 0.44, z));
  const matMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.6), M.mat);
  matMesh.rotation.x = -Math.PI / 2;
  matMesh.position.set(0, 0.926, 0.1);
  b.add(matMesh);
  // Geöffneter Laptop (Unterseite ab, Innenleben sichtbar)
  const lap = new THREE.Group();
  lap.add(at(box(0.34, 0.012, 0.24, M.alu, 0.005), 0, 0, 0));
  const board = at(box(0.2, 0.004, 0.13, M.pcb, 0), -0.04, 0.008, -0.03);
  lap.add(board);
  lap.add(at(box(0.035, 0.006, 0.035, M.alu, 0.002), -0.06, 0.012, -0.03)); // CPU
  const bat = at(box(0.3, 0.012, 0.075, new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 }), 0.004), 0, 0.012, 0.075);
  lap.add(bat);
  const batLabel = at(new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.03), new THREE.MeshBasicMaterial({ map: T.label('Li-ion 11.4V', '#dfe6f0', '#151515') })), 0.06, 0.0185, 0.075);
  batLabel.rotation.x = -Math.PI / 2;
  lap.add(batLabel);
  const fan = new THREE.Group();
  fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 32), M.plastic));
  const blades = new THREE.Group();
  for (let i = 0; i < 11; i++) {
    const bl = box(0.026, 0.002, 0.006, M.plastic, 0);
    bl.position.x = 0.013;
    const h = new THREE.Group();
    h.rotation.y = (i / 11) * Math.PI * 2;
    h.add(bl);
    blades.add(h);
  }
  blades.position.y = 0.006;
  fan.add(blades);
  fan.position.set(0.1, 0.012, -0.05);
  lap.add(fan);
  const ram = at(box(0.07, 0.004, 0.03, new THREE.MeshStandardMaterial({ color: 0x0d3d2a }), 0), 0.02, 0.012, -0.075);
  lap.add(ram);
  const bottom = at(box(0.34, 0.004, 0.24, M.alu, 0.004), 0.36, 0.002, 0.04);
  bottom.rotation.y = 0.2;
  lap.add(bottom);
  for (let i = 0; i < 6; i++) lap.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 12), M.steel), 0.28 + i * 0.012, 0.004, -0.12));
  lap.position.set(0.02, 0.935, 0.45);
  lap.rotation.y = Math.PI / 2;
  b.add(lap);
  // Ausgebaute SSD und alte Festplatte
  const ssd = new THREE.Group();
  ssd.add(box(0.08, 0.004, 0.022, M.pcb, 0));
  for (let i = 0; i < 3; i++) ssd.add(at(box(0.016, 0.002, 0.014, M.plastic, 0), -0.025 + i * 0.022, 0.003, 0));
  const ssdLabel = at(new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.012), new THREE.MeshBasicMaterial({ map: T.label('NVMe 1TB', '#111', '#e8eef7') })), 0.025, 0.0035, 0);
  ssdLabel.rotation.x = -Math.PI / 2;
  ssd.add(ssdLabel);
  ssd.position.set(0.05, 0.932, 1.2);
  b.add(ssd);
  const hdd = new THREE.Group();
  hdd.add(box(0.1, 0.018, 0.147, M.alu, 0.004));
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.002, 64), new THREE.MeshStandardMaterial({ color: 0xdfe4ee, metalness: 1, roughness: 0.05 }));
  platter.position.set(0, 0.011, -0.02);
  hdd.add(platter);
  const arm = at(box(0.006, 0.003, 0.06, M.steel, 0), 0.03, 0.014, 0.01);
  arm.rotation.y = 0.5;
  hdd.add(arm);
  hdd.position.set(-0.15, 0.937, 1.3);
  hdd.rotation.y = 0.3;
  b.add(hdd);
  // Werkzeug: Schraubendreher, Pinzette, Multimeter
  const sd = new THREE.Group();
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.09, 16), new THREE.MeshStandardMaterial({ color: 0xd12a2a, roughness: 0.4 }));
  const shaft = at(new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.07, 8), M.steel), 0, 0.08, 0);
  sd.add(grip, shaft);
  sd.rotation.z = Math.PI / 2;
  sd.position.set(0.15, 0.94, -0.05);
  sd.rotation.y = 0.4;
  b.add(sd);
  const tw = new THREE.Group();
  for (const s of [-1, 1]) {
    const leg = at(box(0.004, 0.002, 0.12, M.steel, 0), s * 0.004, 0, 0);
    leg.rotation.y = s * 0.04;
    tw.add(leg);
  }
  tw.position.set(0.2, 0.93, 0.15);
  b.add(tw);
  const mm = new THREE.Group();
  mm.add(box(0.09, 0.03, 0.17, new THREE.MeshStandardMaterial({ color: 0xf2b705, roughness: 0.5 }), 0.012));
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshBasicMaterial({ map: T.label('  12.46 V', '#0b1a0b', '#9fbf8f'), toneMapped: false }));
  disp.rotation.x = -Math.PI / 2;
  disp.position.set(0, 0.016, -0.04);
  mm.add(disp);
  mm.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 24), M.plastic), 0, 0.018, 0.03));
  mm.position.set(0.05, 0.94, -0.35);
  mm.rotation.y = -0.2;
  b.add(mm);
  // Lupenleuchte mit Ringlicht
  const lamp = new THREE.Group();
  lamp.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.03, 32), M.blackSteel), 0, 0.94, 0));
  const arm1 = at(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 12), M.steel), 0, 1.18, 0);
  arm1.rotation.z = 0.35;
  lamp.add(arm1);
  const arm2 = at(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 12), M.steel), 0.2, 1.46, 0);
  arm2.rotation.z = -1.1;
  lamp.add(arm2);
  const head = new THREE.Group();
  head.add(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.015, 16, 48), M.blackSteel));
  head.add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 12, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })));
  head.add(new THREE.Mesh(new THREE.CircleGeometry(0.055, 48), M.glass));
  head.rotation.x = -Math.PI / 2 + 0.2;
  head.position.set(0.42, 1.36, 0);
  lamp.add(head);
  const ring = new THREE.SpotLight(0xfff4e6, 6, 3, 0.7, 0.6, 2);
  ring.position.set(0.42, 1.34, 0);
  ring.target.position.set(0.02, 0.93, 0);
  ring.castShadow = true;
  ring.shadow.mapSize.set(1024, 1024);
  ring.shadow.bias = -0.0005;
  lamp.add(ring, ring.target);
  lamp.position.set(-0.25, 0, 0.45);
  b.add(lamp);
  b.position.set(-4.5, 0, 0.3);
  g.add(b);
  return { blades, ring };
}

// ---------- Tresor & Aktenschrank, Wandlogo, Regal ----------
function extras(g, M) {
  const safe = new THREE.Group();
  safe.add(at(box(0.6, 0.7, 0.55, new THREE.MeshStandardMaterial({ color: 0x2a2f38, metalness: 0.8, roughness: 0.35 }), 0.03), 0, 0.35, 0));
  safe.add(at(box(0.5, 0.6, 0.02, new THREE.MeshStandardMaterial({ color: 0x353b46, metalness: 0.85, roughness: 0.3 }), 0.01), 0, 0.35, 0.28));
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 48), M.steel);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(-0.08, 0.42, 0.3);
  safe.add(dial);
  const handle = at(box(0.14, 0.02, 0.03, M.steel, 0.008), 0.12, 0.3, 0.305);
  safe.add(handle);
  safe.position.set(4.3, 0, 3.3);
  safe.rotation.y = -Math.PI / 2;
  g.add(safe);
  const cab = at(box(0.5, 1.1, 0.6, new THREE.MeshStandardMaterial({ color: 0x8c939e, metalness: 0.7, roughness: 0.4 }), 0.02), 4.4, 0.55, 2.2);
  g.add(cab);
  for (let i = 0; i < 3; i++) g.add(at(box(0.02, 0.02, 0.18, M.steel, 0.005), 4.14, 0.3 + i * 0.35, 2.2));
  // Regal mit Ordnern
  g.add(at(box(0.3, 0.03, 1.6, M.walnut, 0.005), 4.84, 1.9, 1.0));
  const colors = [0x1b4dff, 0x2a2f38, 0x0f8a6a, 0xd12a2a, 0x2a2f38, 0x1b4dff, 0xf2b705];
  for (let i = 0; i < 14; i++) g.add(at(box(0.26, 0.32, 0.07, new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.6 }), 0.005), 4.84, 2.08, 0.3 + i * 0.1));
  // Gerahmtes MDK-IT-Logo an der rechten Wand
  const logoTex = new THREE.TextureLoader().load('/img/logo-light.png');
  logoTex.colorSpace = THREE.SRGBColorSpace;
  const frame = at(box(0.05, 0.9, 0.9, M.blackSteel, 0.01), 4.96, 1.75, -1.4);
  g.add(frame);
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, toneMapped: false, color: 0xcfd6e2 }));
  logo.rotation.y = -Math.PI / 2;
  logo.position.set(4.93, 1.75, -1.4);
  g.add(logo);
  const logoBg = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x0a1226, roughness: 0.6 }));
  logoBg.rotation.y = -Math.PI / 2;
  logoBg.position.set(4.935, 1.75, -1.4);
  g.add(logoBg);
  // Wanduhr
  const clock = new THREE.Group();
  clock.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 48), M.ceramic));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 12, 48), M.blackSteel);
  rim.rotation.x = Math.PI / 2;
  clock.add(rim);
  const hand1 = at(box(0.006, 0.004, 0.09, M.blackSteel, 0), 0, 0.02, -0.04);
  const hand2 = at(box(0.004, 0.004, 0.13, M.blackSteel, 0), 0, 0.022, -0.06);
  const hands = new THREE.Group();
  const hh = new THREE.Group();
  hh.add(hand1);
  const mh = new THREE.Group();
  mh.add(hand2);
  hands.add(hh, mh);
  clock.add(hands);
  clock.rotation.x = Math.PI / 2;
  clock.position.set(-1.6, 2.5, -5.97);
  g.add(clock);
  return { hh, mh };
}

// ---------- Kamerafahrten je Seite: [Kameraposition, Blickziel] ----------
const PATHS = {
  home: [
    [V(0, 1.7, 5.4), V(-0.2, 1.2, -3)],
    [V(1.4, 1.6, 1.6), V(3.3, 1.2, -5)],
    [V(3.25, 1.35, -3.3), V(3.6, 1.25, -4.75)],
    [V(-1.45, 1.22, -3.65), V(-1.6, 1.1, -5.3)],
    [V(-3.15, 1.4, 0.75), V(-4.48, 0.95, 0.75)],
    [V(0.8, 1.55, -3.4), V(1.4, 1.7, -8)],
    [V(2.6, 1.65, -0.6), V(4.95, 1.75, -1.4)],
    [V(0, 2.7, 5.5), V(0, 0.8, -2)],
  ],
  network: [
    [V(1.1, 1.65, 1.2), V(3.5, 1.2, -4.8)],
    [V(3.45, 1.85, -4.05), V(3.6, 1.78, -4.72)],
    [V(3.3, 1.12, -3.85), V(3.6, 1.05, -4.7)],
    [V(3.75, 0.72, -3.95), V(3.6, 0.52, -4.7)],
    [V(3.32, 1.6, -4.1), V(3.6, 1.55, -4.72)],
    [V(-0.5, 1.08, -4.35), V(-0.82, 0.92, -5.05)],
    [V(1.2, 1.6, -1.2), V(1.8, 1.4, -6.5)],
    [V(0, 2.5, 4.2), V(1.2, 1, -4)],
  ],
  studio: [
    [V(-1.3, 1.55, -2.3), V(-1.6, 1.0, -5.2)],
    [V(-1.6, 1.3, -4.25), V(-1.6, 1.28, -5.32)],
    [V(-2.1, 1.12, -4.55), V(-2.22, 0.77, -5.15)],
    [V(-1.95, 0.98, -4.45), V(-2.1, 0.78, -4.85)],
    [V(-0.8, 1.35, -3.5), V(-1.6, 1.15, -5.3)],
    [V(-0.9, 0.98, -4.7), V(-1.1, 0.83, -5.3)],
    [V(-1.6, 1.6, -2.8), V(-1.6, 1.4, -6)],
    [V(0, 2.3, 3.8), V(-1.5, 1, -4)],
  ],
  laptop: [
    [V(-2.6, 1.6, 0.8), V(-4.45, 0.95, 0.75)],
    [V(-3.55, 1.38, 0.75), V(-4.47, 0.94, 0.75)],
    [V(-4.1, 1.12, 0.62), V(-4.48, 0.94, 0.75)],
    [V(-4.1, 1.08, 1.55), V(-4.5, 0.93, 1.5)],
    [V(-0.5, 1.12, -4.35), V(-0.82, 0.93, -5.05)],
    [V(-3.85, 1.2, 0.0), V(-4.5, 0.95, -0.05)],
    [V(3.3, 1.15, 2.9), V(4.3, 0.5, 3.3)],
    [V(0, 2.3, 4.6), V(-3, 1, 0)],
  ],
  vault: [
    [V(2.1, 1.55, 4.6), V(4.3, 0.6, 3.3)],
    [V(3.45, 1.0, 3.05), V(4.3, 0.45, 3.3)],
    [V(0, 2.5, 5.5), V(0, 1, -3)],
  ],
};

export function createWorld(canvas, name, { small }) {
  RectAreaLightUniformsLib.init();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const basePR = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
  renderer.setPixelRatio(basePR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070d);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.28;

  const M = materials();
  const g = new THREE.Group();
  room(g, M);
  desk(g, M);
  const leds = rack(g, M);
  const { blades } = bench(g, M);
  const { hh, mh } = extras(g, M);
  scene.add(g);
  g.traverse((o) => {
    if (o.isMesh && !(o.material?.isMeshBasicMaterial) && !o.material?.transparent) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  // Licht: Flächenleuchten an der Decke, Mondlicht durchs Fenster, Monitorschein
  for (const [x, z, i] of [[-1.6, -3.2, 7], [2.2, -0.5, 6], [-2.8, 1.8, 5]]) {
    const l = new THREE.RectAreaLight(0xfff1dd, i, 1.2, 1.2);
    l.position.set(x, 3.18, z);
    l.lookAt(x, 0, z);
    scene.add(l);
  }
  const moon = new THREE.DirectionalLight(0x9ab8ff, 0.9);
  moon.position.set(2.5, 5, -12);
  moon.target.position.set(0, 0, -2);
  moon.castShadow = true;
  moon.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(moon.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  moon.shadow.bias = -0.0004;
  scene.add(moon, moon.target);
  const screenGlow = new THREE.PointLight(0x7fa8ff, 0.8, 2.2, 2);
  screenGlow.position.set(-1.6, 1.25, -4.9);
  scene.add(screenGlow);
  scene.add(new THREE.HemisphereLight(0xb8c6e8, 0x2a1c10, 0.45));

  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 60);
  const path = PATHS[name] || PATHS.home;
  const posCurve = new THREE.CatmullRomCurve3(path.map((p) => p[0]), false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(path.map((p) => p[1]), false, 'centripetal');
  const look = new THREE.Vector3();

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = new BokehPass(scene, camera, { focus: 2, aperture: 0.012, maxblur: 0.006 });
  composer.addPass(bokeh);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.35, 0.4, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let useComposer = !small;
  let size = [1, 1];
  const ledState = leds.map(() => true);
  return {
    // 0 = voll, 1 = ohne Tiefenunschärfe, 2 = ohne Nachbearbeitung + Schatten, 3 = halbe Auflösung
    setQuality(level) {
      bokeh.enabled = level < 1;
      useComposer = !small && level < 2;
      renderer.shadowMap.enabled = level < 2;
      scene.traverse((o) => o.material && (o.material.needsUpdate = true));
      renderer.setPixelRatio(basePR * [1, 1, 0.75, 0.5][level]);
      this.resize(...size);
    },
    resize(w, h) {
      size = [w, h];
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      camera.fov = w < h ? 60 : 42;
      camera.updateProjectionMatrix();
    },
    render(t, dt, time, pointer) {
      // Blinkende Status-LEDs, Lüfter, Uhr
      for (let i = 0; i < 6; i++) {
        const j = Math.floor(Math.random() * leds.length);
        ledState[j] = !ledState[j];
        leds[j].visible = ledState[j] || Math.random() < 0.3;
      }
      blades.rotation.y += dt * 25;
      const d = new Date();
      mh.rotation.y = -(d.getMinutes() / 60) * Math.PI * 2;
      hh.rotation.y = -(((d.getHours() % 12) + d.getMinutes() / 60) / 12) * Math.PI * 2;

      camera.position.copy(posCurve.getPoint(t));
      look.copy(lookCurve.getPoint(t));
      // leichte "Handkamera" und Mausparallaxe
      camera.position.x += Math.sin(time * 0.7) * 0.004 + pointer.x * 0.05;
      camera.position.y += Math.sin(time * 0.9 + 1) * 0.003 - pointer.y * 0.03;
      camera.lookAt(look);
      bokeh.uniforms.focus.value = camera.position.distanceTo(look);
      if (useComposer) composer.render();
      else renderer.render(scene, camera);
    },
    dispose() {
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => (mm.map?.dispose(), mm.dispose()));
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
