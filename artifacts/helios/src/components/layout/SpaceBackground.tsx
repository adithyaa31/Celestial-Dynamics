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

    // Flowing light nodes — connected by soft lines when close
    const nodes = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.5 + Math.random() * 2.5,
      hue: Math.random() > 0.55 ? 200 : 38, // sky-blue or amber
      alpha: 0.25 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    }));

    // Radial pulse rings that emanate from center
    const pulses: { r: number; alpha: number; speed: number; color: string }[] = [];
    const spawnPulse = () => {
      pulses.push({ r: 0, alpha: 0.18, speed: 1.2 + Math.random() * 0.8, color: Math.random() > 0.5 ? 'rgba(2,132,199,' : 'rgba(245,158,11,' });
    };
    let nextPulse = 60;

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Spawn & draw pulse rings from center
      nextPulse--;
      if (nextPulse <= 0) { spawnPulse(); nextPulse = 90 + Math.floor(Math.random() * 60); }

      const cx = W / 2, cy = H / 2;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += p.speed;
        p.alpha -= 0.0012;
        if (p.alpha <= 0) { pulses.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + p.alpha + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Move & draw nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        n.phase += 0.018;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        const a = n.alpha * (0.6 + 0.4 * Math.sin(n.phase));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hue === 200 ? `rgba(2,132,199,${a})` : `rgba(245,158,11,${a})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.07;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(2,132,199,${lineAlpha})`;
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
