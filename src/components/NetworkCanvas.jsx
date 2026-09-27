import { useEffect, useRef } from 'react';

// Interaktives Netzwerk: Knoten verbinden sich, Datenpakete wandern über die Leitungen
// und der Mauszeiger zieht Verbindungen an. Läuft nur, wenn sichtbar.
export default function NetworkCanvas({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: -9999, y: -9999, active: false };
    let w = 0;
    let h = 0;
    let nodes = [];
    let packets = [];
    let pings = [];
    let raf = 0;
    let running = false;
    const LINK = 150;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.floor((w * h) / 11000), w < 700 ? 55 : 130);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
        hub: Math.random() < 0.08,
      }));
      packets = [];
      if (reduce) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        if (!reduce) {
          // sanft vom Mauszeiger wegdrücken
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (mouse.active && d2 < 120 * 120) {
            const f = (1 - Math.sqrt(d2) / 120) * 0.6;
            n.x += (dx / (Math.sqrt(d2) + 0.01)) * f;
            n.y += (dy / (Math.sqrt(d2) + 0.01)) * f;
          }
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
        }
      }

      // Verbindungen
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.35;
            ctx.strokeStyle = `rgba(90, 160, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            if (!reduce && packets.length < 18 && Math.random() < 0.0009) {
              packets.push({ a: i, b: j, t: 0, speed: 0.008 + Math.random() * 0.012 });
            }
          }
        }
        // Verbindungen zum Mauszeiger
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 200) {
            ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - d / 200) * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Knoten
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.hub ? n.r + 1.5 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hub ? 'rgba(0, 229, 255, 0.95)' : 'rgba(170, 200, 255, 0.7)';
        ctx.fill();
        if (!reduce && n.hub && Math.random() < 0.003) pings.push({ x: n.x, y: n.y, r: 0 });
      }

      // Datenpakete
      packets = packets.filter((p) => {
        p.t += p.speed;
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b || p.t >= 1) return false;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
        g.addColorStop(0, 'rgba(0, 255, 200, 1)');
        g.addColorStop(1, 'rgba(0, 255, 200, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Pings der Hub-Knoten
      pings = pings.filter((p) => {
        p.r += 0.8;
        const alpha = 1 - p.r / 60;
        if (alpha <= 0) return false;
        if (p.r <= 0) return true;
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.y >= 0 && mouse.y <= rect.height;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y < 0 || y > rect.height) return;
      // Klick erzeugt eine Welle und einen neuen Knoten
      const x = e.clientX - rect.left;
      pings.push({ x, y, r: 0 }, { x, y, r: -15 });
      nodes.push({ x, y, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: 2, hub: true });
      if (nodes.length > 180) nodes.shift();
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    io.observe(canvas);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
