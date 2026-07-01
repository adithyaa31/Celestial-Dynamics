import React, { useEffect, useRef } from 'react';

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let frame = 0;

    // Floating light nodes
    const nodes = Array.from({ length: 75 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: 1.5 + Math.random() * 2.5,
      hue: Math.random() > 0.5 ? 200 : 38,
      alpha: 0.14 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
    }));

    // Expanding pulse rings from center
    const pulses: { r: number; alpha: number; speed: number; isBlue: boolean }[] = [];
    let nextPulse = 55;

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const cx = W / 2, cy = H / 2;

      // Pulse rings
      nextPulse--;
      if (nextPulse <= 0) {
        pulses.push({ r: 0, alpha: 0.14, speed: 1.3 + Math.random() * 0.8, isBlue: Math.random() > 0.4 });
        nextPulse = 70 + Math.floor(Math.random() * 55);
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += p.speed;
        p.alpha -= 0.0009;
        if (p.alpha <= 0) { pulses.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = p.isBlue ? `rgba(2,132,199,${p.alpha})` : `rgba(245,158,11,${p.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Nodes with glow
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        n.phase += 0.016;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        const a = n.alpha * (0.55 + 0.45 * Math.sin(n.phase));
        const isBlue = n.hue === 200;

        // Soft glow halo
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, isBlue ? `rgba(2,132,199,${a * 0.6})` : `rgba(245,158,11,${a * 0.6})`);
        g.addColorStop(1, isBlue ? 'rgba(2,132,199,0)' : 'rgba(245,158,11,0)');
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();

        // Core
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = isBlue ? `rgba(2,132,199,${a * 1.4})` : `rgba(245,158,11,${a * 1.4})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(2,132,199,${(1 - d / 115) * 0.07})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[-1]" />;
}
