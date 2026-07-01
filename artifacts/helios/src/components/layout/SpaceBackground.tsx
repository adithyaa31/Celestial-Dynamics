import React, { useEffect, useRef } from 'react';

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Soft floating orbs for light theme
    const orbs = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.5 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: 0.06 + Math.random() * 0.14,
      fadeDir: Math.random() > 0.5 ? 1 : -1,
      hue: Math.random() > 0.6 ? 38 : 200, // amber or blue
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < 0) orb.x = width;
        if (orb.x > width) orb.x = 0;
        if (orb.y < 0) orb.y = height;
        if (orb.y > height) orb.y = 0;

        orb.alpha += 0.004 * orb.fadeDir;
        if (orb.alpha > 0.22) { orb.alpha = 0.22; orb.fadeDir = -1; }
        if (orb.alpha < 0.04) { orb.alpha = 0.04; orb.fadeDir = 1; }

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = orb.hue === 38
          ? `rgba(245,158,11,${orb.alpha})`
          : `rgba(2,132,199,${orb.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
}
