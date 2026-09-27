import { useEffect, useRef, useState } from 'react';
import NetworkCanvas from './NetworkCanvas.jsx';

// Hintergrund-Szene der Version 2: ein leuchtender Netzwerk-Globus (Ludwigsburg als Knotenpunkt),
// Datenverbindungen mit wandernden Paketen und ein Sternenfeld. Liegt fest hinter der ganzen Seite,
// reagiert auf Maus, Ziehen und Scrollen. three.js wird erst im Browser nachgeladen.
const HUB = { lat: 48.8973, lon: 9.1857 }; // Ludwigsburg
const TARGETS = [
  [52.52, 13.4], [48.14, 11.58], [50.11, 8.68], [53.55, 9.99], [47.37, 8.54], [48.21, 16.37],
  [51.51, -0.13], [48.86, 2.35], [40.42, -3.7], [41.9, 12.5], [59.33, 18.07], [52.37, 4.9],
  [40.71, -74.0], [37.77, -122.42], [35.68, 139.69], [1.35, 103.82], [-33.87, 151.21], [25.2, 55.27],
];

function toVec(THREE, lat, lon, r) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

export default function Scene3D({ variant = 'home' }) {
  const ref = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const canvas = ref.current;
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) {
      setFallback(true);
      return undefined;
    }

    import('three').then((THREE) => {
      if (disposed) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const small = window.innerWidth < 760;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050914, 0.045);
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 9);

      const R = 2.2;
      const globe = new THREE.Group();
      scene.add(globe);

      // Punkte auf der Kugel (Fibonacci-Verteilung)
      const count = small ? 1400 : 2600;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const c1 = new THREE.Color('#3d8bff');
      const c2 = new THREE.Color('#00e5ff');
      const c3 = new THREE.Color('#8b5cff');
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const rr = Math.sqrt(1 - y * y);
        const t = i * Math.PI * (3 - Math.sqrt(5));
        pos.set([Math.cos(t) * rr * R, y * R, Math.sin(t) * rr * R], i * 3);
        const c = c1.clone().lerp(y > 0 ? c2 : c3, Math.abs(y));
        col.set([c.r, c.g, c.b], i * 3);
      }
      const dotsGeo = new THREE.BufferGeometry();
      dotsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      dotsGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const dotTex = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.3, 'rgba(255,255,255,0.8)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      })();
      const dotsMat = new THREE.PointsMaterial({
        size: 0.055,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      globe.add(new THREE.Points(dotsGeo, dotsMat));

      // Innere Kugel als dunkler Kern + feines Drahtgitter
      globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48), new THREE.MeshBasicMaterial({ color: 0x06102a, transparent: true, opacity: 0.85 })));
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R * 1.002, 3)),
        new THREE.LineBasicMaterial({ color: 0x3d8bff, transparent: true, opacity: 0.08 }),
      );
      globe.add(wire);

      // Atmosphäre (leuchtender Rand)
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.12, 48, 48),
        new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader:
            'varying vec3 vN; void main(){ float i = pow(max(0.0, 0.62 - dot(vN, vec3(0.0,0.0,1.0))), 2.5); gl_FragColor = vec4(0.1, 0.55, 1.0, 1.0) * i * 0.7; }',
        }),
      );
      scene.add(atmo);

      // Knotenpunkt Ludwigsburg mit pulsierendem Ring
      const hub = toVec(THREE, HUB.lat, HUB.lon, R * 1.01);
      const hubMark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00ffd5 }));
      hubMark.position.copy(hub);
      globe.add(hubMark);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, side: THREE.DoubleSide, depthWrite: false });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.08, 40), ringMat);
      ring.position.copy(hub);
      ring.lookAt(hub.clone().multiplyScalar(2));
      globe.add(ring);

      // Verbindungen von Ludwigsburg in die Welt, mit wandernden Datenpaketen
      const arcs = [];
      const packetMat = new THREE.PointsMaterial({ size: 0.16, map: dotTex, color: 0x9ffcff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      for (const [lat, lon] of TARGETS) {
        const end = toVec(THREE, lat, lon, R * 1.01);
        const mid = hub.clone().add(end).multiplyScalar(0.5);
        mid.setLength(R + 0.35 + hub.distanceTo(end) * 0.35);
        const curve = new THREE.QuadraticBezierCurve3(hub, mid, end);
        const pts = curve.getPoints(64);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x3d8bff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
        globe.add(line);
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
        const packet = new THREE.Points(pGeo, packetMat);
        globe.add(packet);
        const endDot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0x8b5cff }));
        endDot.position.copy(end);
        globe.add(endDot);
        arcs.push({ curve, packet, t: Math.random(), speed: 0.12 + Math.random() * 0.18 });
      }

      // Umlaufender Partikelring
      const orbitCount = small ? 300 : 600;
      const orbitPos = new Float32Array(orbitCount * 3);
      for (let i = 0; i < orbitCount; i++) {
        const a = (i / orbitCount) * Math.PI * 2;
        const rr = R * 1.55 + (Math.random() - 0.5) * 0.25;
        orbitPos.set([Math.cos(a) * rr, (Math.random() - 0.5) * 0.08, Math.sin(a) * rr], i * 3);
      }
      const orbitGeo = new THREE.BufferGeometry();
      orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
      const orbit = new THREE.Points(
        orbitGeo,
        new THREE.PointsMaterial({ size: 0.035, map: dotTex, color: 0x00e5ff, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      orbit.rotation.x = 1.2;
      orbit.rotation.z = 0.3;
      globe.add(orbit);

      // Sternenfeld über die ganze Seite (Tiefe beim Scrollen)
      const starCount = small ? 900 : 1800;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) starPos.set([(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60, -Math.random() * 30 - 2], i * 3);
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ size: 0.06, map: dotTex, color: 0xaac8ff, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      scene.add(stars);

      globe.rotation.y = -Math.PI / 2 - (HUB.lon * Math.PI) / 180 + 0.6;
      globe.rotation.x = 0.35;

      // Interaktion: Maus neigt, Ziehen dreht, Scrollen bewegt die Kamera
      const pointer = { x: 0, y: 0 };
      let drag = null;
      let spin = 0;
      const onMove = (e) => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
        if (drag) {
          spin += (e.clientX - drag) * 0.005;
          drag = e.clientX;
        }
      };
      const onDown = (e) => {
        if (e.target.closest('a, button, input, textarea, select, label, .consent')) return;
        if (window.scrollY < window.innerHeight * 0.8) drag = e.clientX;
      };
      const onUp = () => {
        drag = null;
      };

      let w = 0;
      let h = 0;
      const resize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      // Globus-Position je nach Bildschirm und Seite
      const layout = () => {
        const narrow = w < 960;
        if (variant === 'home') return narrow ? { x: 0, y: -2.6, s: 0.72 } : { x: 2.35, y: 0, s: 1 };
        return narrow ? { x: 1.2, y: 1.2, s: 0.55 } : { x: 3, y: 0.3, s: 0.75 };
      };

      let raf = 0;
      let last = performance.now();
      let running = false;
      const current = { x: 0, y: 0, s: 1, rx: 0.35 };
      const frame = (now) => {
        // Zeitschritt begrenzen (der erste Frame kann einen negativen Wert liefern)
        const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
        last = now;
        const vh = h || 1;
        const p = Math.min(window.scrollY / vh, 3); // 0 = oben, 1 = eine Bildschirmhöhe gescrollt
        const L = layout();
        // Beim Scrollen wandert der Globus nach hinten und wird zur ruhigen Kulisse
        const target = {
          x: L.x * Math.max(0, 1 - p * 0.9),
          y: L.y - Math.min(p, 1) * 0.4,
          s: L.s * (1 - Math.min(p, 1.5) * 0.25),
        };
        const k = 1 - Math.pow(0.001, dt);
        current.x += (target.x - current.x) * k;
        current.y += (target.y - current.y) * k;
        current.s += (target.s - current.s) * k;
        globe.position.set(current.x, current.y, -Math.min(p, 1.5) * 2.5);
        globe.scale.setScalar(current.s);
        atmo.position.copy(globe.position);
        atmo.scale.setScalar(current.s);

        if (!reduce) {
          spin *= 0.95;
          globe.rotation.y += dt * 0.08 + spin * dt * 8;
          current.rx += (0.35 + pointer.y * 0.35 - current.rx) * k;
          globe.rotation.x = current.rx;
          globe.rotation.z = pointer.x * -0.15;
          orbit.rotation.y += dt * 0.15;
          const pulse = (now / 1000) % 1.6;
          ring.scale.setScalar(1 + pulse * 3);
          ringMat.opacity = Math.max(0, 1 - pulse / 1.6);
          for (const a of arcs) {
            a.t = (a.t + dt * a.speed) % 1;
            const v = a.curve.getPoint(a.t);
            const attr = a.packet.geometry.attributes.position;
            attr.setXYZ(0, v.x, v.y, v.z);
            attr.needsUpdate = true;
          }
        }
        stars.position.y = window.scrollY * 0.0025;
        stars.rotation.z = pointer.x * 0.05;
        camera.position.x = pointer.x * 0.4;
        camera.position.y = -pointer.y * 0.3;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        if (running) raf = requestAnimationFrame(frame);
      };
      const start = () => {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
      const onVis = () => (document.hidden ? stop() : start());
      const onScroll = () => reduce && frame(performance.now());

      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      document.addEventListener('visibilitychange', onVis);
      if (reduce) {
        window.addEventListener('scroll', onScroll, { passive: true });
        frame(performance.now());
      } else start();
      canvas.classList.add('is-ready');

      cleanup = () => {
        stop();
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', onVis);
        scene.traverse((o) => {
          o.geometry?.dispose();
          o.material?.dispose();
        });
        dotTex.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [variant]);

  if (fallback) return <NetworkCanvas className="scene-3d is-ready" />;
  return <canvas ref={ref} className="scene-3d" aria-hidden="true" />;
}
