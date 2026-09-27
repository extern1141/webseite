// 3D-Reise für Version 3: Globus → Rechenzentrum → Mainboard → Netzwerkkabel → Webseite.
// Jede Station ist eine eigene Gruppe; die Kamera fährt je nach Scrollfortschritt hindurch.
// Übergänge zwischen den Stationen werden durch einen Lichtblitz (im DOM) überdeckt.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const STAGES = [0, 0.18, 0.4, 0.6, 0.84, 1];

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t) => t * t * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ---------- Station 1: Globus ----------
function buildGlobe(small, dot) {
  const group = new THREE.Group();
  const R = 3;
  const n = small ? 1600 : 3200;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const a = new THREE.Color('#3d8bff');
  const b = new THREE.Color('#00e5ff');
  const c = new THREE.Color('#8b5cff');
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    pos.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);
    const cc = a.clone().lerp(y > 0 ? b : c, Math.abs(y));
    col.set([cc.r, cc.g, cc.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const globe = new THREE.Group();
  globe.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: 0.07, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    ),
  );
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 64, 64), new THREE.MeshStandardMaterial({ color: 0x050d24, metalness: 0.6, roughness: 0.5 })));
  globe.add(
    new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R * 1.003, 4)),
      new THREE.LineBasicMaterial({ color: 0x3d8bff, transparent: true, opacity: 0.1 }),
    ),
  );
  // Knotenpunkt (zeigt zur Kamera)
  const hub = new THREE.Vector3(0, 0.35, Math.sqrt(R * R - 0.35 * 0.35)).multiplyScalar(1.01);
  const hubMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 24), new THREE.MeshBasicMaterial({ color: 0x7ffff0 }));
  hubMesh.position.copy(hub);
  globe.add(hubMesh);
  const arcs = [];
  const pmat = new THREE.PointsMaterial({ size: 0.25, map: dot, color: 0xaffcff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 26; i++) {
    const end = new THREE.Vector3().randomDirection();
    if (end.z < -0.3) end.z *= -1;
    end.multiplyScalar(R * 1.01);
    const mid = hub.clone().add(end).multiplyScalar(0.5);
    mid.setLength(R + 0.5 + hub.distanceTo(end) * 0.3);
    const curve = new THREE.QuadraticBezierCurve3(hub, mid, end);
    globe.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
        new THREE.LineBasicMaterial({ color: i % 3 ? 0x3d8bff : 0x8b5cff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }),
      ),
    );
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
    const pkt = new THREE.Points(pg, pmat);
    globe.add(pkt);
    arcs.push({ curve, pkt, t: Math.random(), s: rand(0.15, 0.35) });
  }
  group.add(globe);
  // Atmosphäre
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.15, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vN; void main(){ float i = pow(max(0.0, 0.6 - dot(vN, vec3(0.,0.,1.))), 2.4); gl_FragColor = vec4(0.1,0.55,1.0,1.0)*i*0.8; }',
    }),
  );
  group.add(atmo);
  // Sterne
  const sn = small ? 1200 : 2500;
  const sp = new Float32Array(sn * 3);
  for (let i = 0; i < sn; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(rand(25, 60));
    sp.set([v.x, v.y, v.z], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  group.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.12, map: dot, color: 0xb8ccff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));

  return {
    group,
    fog: new THREE.FogExp2(0x02040c, 0.008),
    env: 0.6,
    update(t, dt, time, cam) {
      globe.rotation.y = (1 - ease(t)) * 1.4 + Math.sin(time * 0.2) * 0.02;
      for (const a of arcs) {
        a.t = (a.t + dt * a.s) % 1;
        const v = a.curve.getPoint(a.t);
        a.pkt.geometry.attributes.position.setXYZ(0, v.x, v.y, v.z);
        a.pkt.geometry.attributes.position.needsUpdate = true;
      }
      hubMesh.scale.setScalar(1 + Math.sin(time * 5) * 0.25);
      const k = easeIn(t);
      cam.position.set(lerp(2.5, 0, ease(t)), lerp(1.5, 0.36, ease(t)), lerp(15, R + 0.15, k));
      cam.lookAt(lerp(0, hub.x, k), lerp(0, hub.y, k), lerp(0, hub.z - 1, k));
    },
  };
}

// ---------- Station 2: Rechenzentrum ----------
const OFF = new THREE.Color(0x05080f);
function buildDatacenter(small) {
  const group = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 80),
    new THREE.MeshStandardMaterial({ color: 0x0b1120, metalness: 0.85, roughness: 0.28 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -20;
  group.add(floor);
  // Bodenraster
  const grid = new THREE.GridHelper(80, 80, 0x1c3d7a, 0x0f1d3a);
  grid.position.set(0, 0.002, -20);
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  group.add(grid);

  const perRow = small ? 10 : 14;
  const rackGeo = new RoundedBoxGeometry(1, 2.4, 1.3, 2, 0.04);
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x1a2133, metalness: 0.9, roughness: 0.35 });
  const racks = new THREE.InstancedMesh(rackGeo, rackMat, perRow * 2);
  const ledsPerRack = small ? 18 : 30;
  const ledGeo = new THREE.BoxGeometry(0.02, 0.03, 0.08);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const leds = new THREE.InstancedMesh(ledGeo, ledMat, perRow * 2 * ledsPerRack);
  const m = new THREE.Matrix4();
  const palette = [new THREE.Color('#00ffa3'), new THREE.Color('#00e5ff'), new THREE.Color('#3d8bff'), new THREE.Color('#ffb020')];
  let li = 0;
  const ledState = [];
  for (let side = -1, r = 0; side <= 1; side += 2) {
    for (let i = 0; i < perRow; i++, r++) {
      const x = side * 2;
      const z = 4 - i * 1.45;
      m.makeTranslation(x, 1.2, z);
      racks.setMatrixAt(r, m);
      for (let k = 0; k < ledsPerRack; k++) {
        m.makeTranslation(x - side * 0.51, rand(0.25, 2.25), z + rand(-0.5, 0.5));
        leds.setMatrixAt(li, m);
        const c = palette[Math.floor(Math.random() * (Math.random() < 0.9 ? 3 : 4))];
        leds.setColorAt(li, c);
        ledState.push({ c, on: true });
        li++;
      }
    }
  }
  group.add(racks, leds);
  // Deckenlicht-Streifen
  const stripMat = new THREE.MeshBasicMaterial({ color: 0xbfe6ff });
  for (const x of [-2, 0, 2]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(x === 0 ? 0.12 : 0.06, 0.02, 30), stripMat);
    strip.position.set(x, 3.3, -8);
    group.add(strip);
  }
  // Kabeltrassen über den Racks
  const trayMat = new THREE.MeshStandardMaterial({ color: 0x2a3550, metalness: 0.8, roughness: 0.4 });
  for (const x of [-2, 2]) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 30), trayMat);
    tray.position.set(x, 2.75, -8);
    group.add(tray);
  }
  // Ziel-Rack am Ende des Gangs, leuchtet
  const target = new THREE.Group();
  const tBody = new THREE.Mesh(new RoundedBoxGeometry(1.4, 2.6, 1.4, 2, 0.05), rackMat);
  tBody.position.y = 1.3;
  target.add(tBody);
  const tFace = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), new THREE.MeshBasicMaterial({ color: 0x0a2a55 }));
  tFace.position.set(0, 1.3, 0.71);
  target.add(tFace);
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const slots = [];
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.035), slotMat.clone());
    s.material.transparent = true;
    s.position.set(0, 0.4 + i * 0.16, 0.72);
    target.add(s);
    slots.push(s);
  }
  target.position.set(0, 0, 4 - perRow * 1.45 - 1.5);
  group.add(target);
  const glow = new THREE.PointLight(0x00c8ff, 30, 12, 2);
  glow.position.set(0, 1.4, target.position.z + 2);
  group.add(glow);
  group.add(new THREE.AmbientLight(0x223355, 0.6));
  const end = target.position.z + 0.95;

  return {
    group,
    fog: new THREE.FogExp2(0x040816, 0.07),
    env: 1,
    update(t, dt, time, cam) {
      // LEDs flackern
      for (let i = 0; i < 40; i++) {
        const j = Math.floor(Math.random() * ledState.length);
        const s = ledState[j];
        s.on = !s.on;
        leds.setColorAt(j, s.on ? s.c : OFF);
      }
      leds.instanceColor.needsUpdate = true;
      slots.forEach((s, i) => (s.material.opacity = 0.5 + 0.5 * Math.sin(time * 6 + i)));
      const e = ease(t);
      const z = lerp(8, end, e);
      const sway = Math.sin(t * Math.PI) * 0.35;
      cam.position.set(sway, lerp(1.6, 1.3, e), z);
      cam.lookAt(0, 1.3, z - 4);
    },
  };
}

// ---------- Station 3: Mainboard ----------
function buildBoard(small, dot) {
  const group = new THREE.Group();
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.12, 20),
    new THREE.MeshStandardMaterial({ color: 0x0a1a3a, metalness: 0.4, roughness: 0.55 }),
  );
  board.position.set(0, -0.06, -4);
  group.add(board);
  // Leiterbahnen (rechtwinklige Pfade)
  const traces = [];
  const traceMat = new THREE.LineBasicMaterial({ color: 0x2d7bff, transparent: true, opacity: 0.55 });
  const count = small ? 70 : 140;
  for (let i = 0; i < count; i++) {
    const pts = [];
    let x = rand(-6.5, 6.5);
    let z = rand(-13.5, 5.5);
    pts.push(new THREE.Vector3(x, 0.005, z));
    for (let s = 0; s < 4; s++) {
      if (s % 2) x = Math.max(-6.8, Math.min(6.8, x + rand(-3, 3)));
      else z = Math.max(-13.8, Math.min(5.8, z + rand(-3, 3)));
      pts.push(new THREE.Vector3(x, 0.005, z));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), traceMat));
    traces.push(new THREE.CurvePath());
    for (let k = 0; k < pts.length - 1; k++) traces[traces.length - 1].add(new THREE.LineCurve3(pts[k], pts[k + 1]));
  }
  // Datenpakete auf den Leiterbahnen
  const pn = small ? 60 : 140;
  const pp = new Float32Array(pn * 3);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  group.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.22, map: dot, color: 0x7ff6ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const pulses = Array.from({ length: pn }, () => ({ tr: traces[Math.floor(Math.random() * traces.length)], t: Math.random(), s: rand(0.1, 0.35) }));

  const chipMat = new THREE.MeshStandardMaterial({ color: 0x111418, metalness: 0.3, roughness: 0.6 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x8c96ab, metalness: 0.9, roughness: 0.45 });
  // CPU mit Kühlkörper
  const cpu = new THREE.Mesh(new RoundedBoxGeometry(2.4, 0.25, 2.4, 2, 0.05), chipMat);
  cpu.position.set(-1.5, 0.12, -2);
  group.add(cpu);
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.9, 0.05), metal, 18);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 18; i++) {
    m.makeTranslation(-1.5, 0.75, -2 - 1.05 + i * 0.123);
    fins.setMatrixAt(i, m);
  }
  group.add(fins);
  // RAM-Riegel
  for (let i = 0; i < 4; i++) {
    const ram = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 4.2), new THREE.MeshStandardMaterial({ color: 0x0f2a1f, metalness: 0.5, roughness: 0.5 }));
    ram.position.set(1.4 + i * 0.35, 0.45, -2.2);
    group.add(ram);
    const chips = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 3.6), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.4, roughness: 0.4 }));
    chips.position.set(1.47 + i * 0.35, 0.5, -2.2);
    group.add(chips);
  }
  // Kondensatoren und kleine Chips
  const caps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16), metal, small ? 30 : 60);
  for (let i = 0; i < caps.count; i++) {
    m.makeTranslation(rand(-6, 6), 0.18, rand(-12, 4));
    caps.setMatrixAt(i, m);
  }
  group.add(caps);
  const ics = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), chipMat, small ? 30 : 60);
  for (let i = 0; i < ics.count; i++) {
    m.makeTranslation(rand(-6, 6), 0.04, rand(-12, 4));
    ics.setMatrixAt(i, m);
  }
  group.add(ics);
  // Netzwerkbuchse am Ende (RJ45), leuchtet
  const port = new THREE.Group();
  const housing = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1, 1.2, 2, 0.05), metal);
  port.add(housing);
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.55), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
  hole.position.z = 0.61;
  port.add(hole);
  const ledA = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
  ledA.position.set(-0.45, 0.38, 0.61);
  const ledB = ledA.clone();
  ledB.material = new THREE.MeshBasicMaterial({ color: 0xffb020 });
  ledB.position.x = 0.45;
  port.add(ledA, ledB);
  port.position.set(0, 0.5, -12.5);
  group.add(port);
  const pl = new THREE.PointLight(0x00c8ff, 6, 8, 2);
  pl.position.set(0, 1, -11);
  group.add(pl);
  group.add(new THREE.AmbientLight(0x3355aa, 0.5));
  const key = new THREE.DirectionalLight(0xbfd8ff, 0.5);
  key.position.set(5, 8, 5);
  group.add(key);

  return {
    group,
    fog: new THREE.FogExp2(0x040a1a, 0.06),
    env: 0.25,
    update(t, dt, time, cam) {
      pulses.forEach((p, i) => {
        p.t = (p.t + dt * p.s) % 1;
        const v = p.tr.getPoint(p.t);
        pg.attributes.position.setXYZ(i, v.x, 0.05, v.z);
      });
      pg.attributes.position.needsUpdate = true;
      ledA.visible = Math.sin(time * 9) > -0.2;
      ledB.visible = Math.sin(time * 5.3) > 0;
      const e = ease(t);
      // Kamera: von oben über das Board, dann tief zur Buchse
      const x = lerp(3, 0, e) + Math.sin(t * Math.PI) * -1.2;
      const y = t < 0.5 ? lerp(6, 1.2, ease(t * 2)) : lerp(1.2, 0.5, ease((t - 0.5) * 2));
      const z = lerp(7, -11.35, e);
      cam.position.set(x, y, z);
      cam.lookAt(lerp(-1, 0, e), lerp(0, 0.5, e), z - 5);
    },
  };
}

// ---------- Station 4: im Netzwerkkabel ----------
function buildCable(small, dot) {
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(3, 1.5, -25),
    new THREE.Vector3(-3, -2, -50),
    new THREE.Vector3(2.5, 2.5, -75),
    new THREE.Vector3(-1.5, 0, -100),
    new THREE.Vector3(0, 0, -120),
  ]);
  // Ringe, die an der Kamera vorbeiziehen (Streifen-Textur)
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 8, 256);
  g.fillStyle = '#00d0ff';
  g.fillRect(0, 0, 8, 6);
  g.fillStyle = '#3d4dff';
  g.fillRect(0, 128, 8, 3);
  const ringTex = new THREE.CanvasTexture(c);
  ringTex.wrapS = ringTex.wrapT = THREE.RepeatWrapping;
  ringTex.repeat.set(1, 60);
  ringTex.rotation = Math.PI / 2;
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 600, 1.6, 32, false),
    new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.BackSide, transparent: true, opacity: 0.9 }),
  );
  group.add(tube);
  // äußere Hülle als feines Gitter
  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 300, 1.62, 16, false),
      new THREE.MeshBasicMaterial({ color: 0x1b3a80, wireframe: true, transparent: true, opacity: 0.25 }),
    ),
  );
  // Glasfaser-Adern
  const colors = [0x00e5ff, 0x3d8bff, 0x8b5cff, 0x00ffa3];
  const frames = curve.computeFrenetFrames(400, false);
  const strands = small ? 16 : 32;
  for (let s = 0; s < strands; s++) {
    const ang = (s / strands) * Math.PI * 2;
    const rad = rand(0.6, 1.3);
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const p = curve.getPointAt(i / 400);
      const twist = ang + i * 0.02;
      p.addScaledVector(frames.normals[i], Math.cos(twist) * rad).addScaledVector(frames.binormals[i], Math.sin(twist) * rad);
      pts.push(p);
    }
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: colors[s % colors.length], transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }),
      ),
    );
  }
  // Datenpakete, die durch das Kabel schießen
  const pn = small ? 250 : 600;
  const pp = new Float32Array(pn * 3);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  group.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.28, map: dot, color: 0xbff8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const pulses = Array.from({ length: pn }, () => ({ t: Math.random(), s: rand(0.04, 0.12), a: rand(0, Math.PI * 2), r: rand(0.2, 1.4) }));
  // Licht am Ende des Kabels
  const endLight = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  endLight.position.copy(curve.getPointAt(1));
  group.add(endLight);

  return {
    group,
    fog: new THREE.FogExp2(0x020512, 0.035),
    env: 1,
    update(t, dt, time, cam) {
      ringTex.offset.y -= dt * 0.6;
      for (let i = 0; i < pn; i++) {
        const p = pulses[i];
        p.t = (p.t + dt * p.s) % 1;
        const v = curve.getPointAt(p.t);
        const idx = Math.min(399, Math.floor(p.t * 400));
        v.addScaledVector(frames.normals[idx], Math.cos(p.a) * p.r).addScaledVector(frames.binormals[idx], Math.sin(p.a) * p.r);
        pg.attributes.position.setXYZ(i, v.x, v.y, v.z);
      }
      pg.attributes.position.needsUpdate = true;
      const u = Math.min(0.97, ease(t) * 0.97);
      cam.position.copy(curve.getPointAt(u));
      cam.lookAt(curve.getPointAt(Math.min(1, u + 0.03)));
      cam.rotation.z += Math.sin(time * 0.5) * 0.02 + t * 0.6;
    },
  };
}

// ---------- Station 5: die Webseite ----------
function buildWebsite(small, dot) {
  const group = new THREE.Group();
  // Browserfenster mit gezeichneter Seite
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 1000;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 1600, 1000);
  grd.addColorStop(0, '#0b1a3d');
  grd.addColorStop(1, '#050914');
  g.fillStyle = grd;
  g.fillRect(0, 0, 1600, 1000);
  g.fillStyle = '#111b33';
  g.fillRect(0, 0, 1600, 70);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(40 + i * 34, 35, 11, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = '#1b2748';
  g.fillRect(420, 18, 760, 34);
  g.fillStyle = '#9aa8c7';
  g.font = '22px "Inter Variable", sans-serif';
  g.fillText('https://www.mdk-it.com', 660, 43);
  g.fillStyle = '#eef3ff';
  g.font = 'bold 34px "Space Grotesk Variable", sans-serif';
  g.fillText('MDK-IT', 90, 150);
  g.font = '22px "Inter Variable", sans-serif';
  g.fillStyle = '#9aa8c7';
  ['Home', 'IT-Infrastruktur', 'Webdesign & SEO', 'Reparaturen'].forEach((s, i) => g.fillText(s, 760 + i * 190, 150));
  g.font = 'bold 84px "Space Grotesk Variable", sans-serif';
  g.fillStyle = '#eef3ff';
  g.fillText('Moderne IT-Systeme', 90, 380);
  const tg = g.createLinearGradient(90, 0, 900, 0);
  tg.addColorStop(0, '#3d8bff');
  tg.addColorStop(0.5, '#00e5ff');
  tg.addColorStop(1, '#8b5cff');
  g.fillStyle = tg;
  g.fillText('& starke Webauftritte', 90, 480);
  g.font = '28px "Inter Variable", sans-serif';
  g.fillStyle = '#9aa8c7';
  g.fillText('IT-Infrastruktur · Webdesign & SEO · Reparaturen & Datenrettung', 90, 570);
  g.fillStyle = tg;
  g.beginPath();
  g.roundRect(90, 640, 420, 80, 40);
  g.fill();
  g.fillStyle = '#041022';
  g.font = 'bold 28px "Space Grotesk Variable", sans-serif';
  g.fillText('Erstgespräch vereinbaren', 125, 690);
  // angedeuteter Globus
  const cg = g.createRadialGradient(1220, 560, 20, 1220, 560, 260);
  cg.addColorStop(0, 'rgba(0,229,255,0.35)');
  cg.addColorStop(0.7, 'rgba(61,139,255,0.15)');
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = cg;
  g.beginPath();
  g.arc(1220, 560, 260, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#7fd8ff';
  for (let i = 0; i < 500; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 220;
    g.fillRect(1220 + Math.cos(a) * r, 560 + Math.sin(a) * r, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const frame = new THREE.Mesh(new RoundedBoxGeometry(8.3, 5.3, 0.15, 4, 0.12), new THREE.MeshStandardMaterial({ color: 0x1a2440, metalness: 0.9, roughness: 0.3 }));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  screen.position.z = 0.08;
  const win = new THREE.Group();
  win.add(frame, screen);
  group.add(win);
  const back = new THREE.PointLight(0x3d8bff, 40, 20, 2);
  back.position.set(0, 0, -3);
  group.add(back);
  group.add(new THREE.AmbientLight(0x334477, 0.8));
  // schwebende Kacheln der drei Bereiche
  const tiles = [];
  const tileMat = new THREE.MeshStandardMaterial({ color: 0x10204a, metalness: 0.7, roughness: 0.3, emissive: 0x0a2a66, emissiveIntensity: 0.6 });
  for (let i = 0; i < 3; i++) {
    const tile = new THREE.Mesh(new RoundedBoxGeometry(2.2, 1.3, 0.1, 3, 0.08), tileMat);
    tile.position.set(-4.5 + i * 4.5, -4, -2.5);
    group.add(tile);
    tiles.push(tile);
  }
  // Partikel
  const pn = small ? 300 : 700;
  const pp = new Float32Array(pn * 3);
  for (let i = 0; i < pn; i++) pp.set([rand(-15, 15), rand(-9, 9), rand(-12, 4)], i * 3);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const parts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.08, map: dot, color: 0x7fb8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  group.add(parts);
  const grid = new THREE.GridHelper(60, 60, 0x1c3d7a, 0x0f1d3a);
  grid.position.y = -5;
  group.add(grid);

  return {
    group,
    fog: new THREE.FogExp2(0x050914, 0.04),
    env: 0.7,
    update(t, dt, time, cam, pointer) {
      const e = ease(t);
      win.rotation.y = lerp(-0.5, 0, e) + pointer.x * 0.1;
      win.rotation.x = lerp(0.25, 0, e) - pointer.y * 0.08;
      win.position.y = Math.sin(time) * 0.08;
      tiles.forEach((tile, i) => {
        tile.position.y = -4 + Math.sin(time * 1.2 + i) * 0.15 + e * 1.2;
        tile.rotation.y = Math.sin(time * 0.6 + i) * 0.2;
      });
      parts.rotation.y += dt * 0.02;
      cam.position.set(lerp(-4, 0, e), lerp(2, 0, e), lerp(18, 3.4, easeIn(t)));
      cam.lookAt(0, 0, 0);
    },
  };
}

export function createJourney(canvas, { small }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
  // Auf Handys: geringere Auflösung und kein Glow-Effekt (spart viel Grafikleistung)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02040c);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 200);

  const dot = glowTexture();
  const stages = [buildGlobe(small, dot), buildDatacenter(small), buildBoard(small, dot), buildCable(small, dot), buildWebsite(small, dot)];
  stages.forEach((s) => {
    s.group.visible = false;
    scene.add(s.group);
  });

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.65 : 0.85, 0.5, 0.3);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let active = -1;
  return {
    resize(w, h) {
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      camera.fov = w < h ? 70 : 55;
      camera.updateProjectionMatrix();
    },
    render(p, dt, time, pointer) {
      let i = STAGES.findIndex((b, k) => p >= b && p < STAGES[k + 1]);
      if (i < 0) i = stages.length - 1;
      if (i !== active) {
        stages.forEach((s, k) => (s.group.visible = k === i));
        scene.fog = stages[i].fog;
        scene.environmentIntensity = stages[i].env;
        active = i;
      }
      const t = clamp01((p - STAGES[i]) / (STAGES[i + 1] - STAGES[i]));
      stages[i].update(t, dt, time, camera, pointer);
      // leichte Mausparallaxe
      camera.rotation.y -= pointer.x * 0.05;
      camera.rotation.x -= pointer.y * 0.04;
      if (small) renderer.render(scene, camera);
      else composer.render();
      return i;
    },
    dispose() {
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => (m.map?.dispose(), m.dispose()));
      });
      envTex.dispose();
      pmrem.dispose();
      composer.dispose?.();
      renderer.dispose();
    },
  };
}
