import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'wouter';
import { useGetSolarSummary, useGetLatestSolar } from '@workspace/api-client-react';

function AnimatedSunCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let frame = 0;
    let raf: number;
    const W = canvas.width = 600;
    const H = canvas.height = 600;
    const cx = W / 2, cy = H / 2;

    // Particles
    const particles: { x: number; y: number; angle: number; speed: number; r: number; alpha: number; life: number; maxLife: number }[] = [];
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 120 + Math.random() * 160;
      particles.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, angle, speed: 0.002 + Math.random() * 0.006, r, alpha: Math.random(), life: Math.random() * 120, maxLife: 80 + Math.random() * 120 });
    }

    // Coronal loops
    const loops: { startAngle: number; spread: number; height: number; phase: number; speed: number; color: string }[] = [];
    for (let i = 0; i < 8; i++) {
      loops.push({
        startAngle: (Math.PI * 2 / 8) * i,
        spread: 0.4 + Math.random() * 0.5,
        height: 40 + Math.random() * 60,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.01,
        color: i % 2 === 0 ? '#FF6D00' : '#FF8C00',
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Outer glow halos
      for (let i = 4; i >= 1; i--) {
        const grd = ctx.createRadialGradient(cx, cy, 90, cx, cy, 90 + i * 55);
        grd.addColorStop(0, `rgba(255,109,0,${0.04 * i})`);
        grd.addColorStop(1, 'rgba(255,109,0,0)');
        ctx.beginPath(); ctx.arc(cx, cy, 90 + i * 55, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      }

      // Coronal loops
      loops.forEach((loop) => {
        const pulse = Math.sin(frame * loop.speed + loop.phase);
        const sa = loop.startAngle + frame * 0.003;
        const ea = sa + loop.spread;
        const h = loop.height * (0.7 + 0.3 * Math.abs(pulse));
        const midA = (sa + ea) / 2;
        const r = 100;
        const x1 = cx + Math.cos(sa) * r, y1 = cy + Math.sin(sa) * r;
        const x2 = cx + Math.cos(ea) * r, y2 = cy + Math.sin(ea) * r;
        const hx = cx + Math.cos(midA) * (r + h), hy = cy + Math.sin(midA) * (r + h);
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.quadraticCurveTo(hx, hy, x2, y2);
        ctx.strokeStyle = loop.color + '88';
        ctx.lineWidth = 2 + Math.abs(pulse) * 2;
        ctx.stroke();
      });

      // Sun plasma surface
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frame * 0.003);
      const sunGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
      sunGrd.addColorStop(0, '#FFFFFF');
      sunGrd.addColorStop(0.15, '#FFF176');
      sunGrd.addColorStop(0.4, '#FFD54F');
      sunGrd.addColorStop(0.65, '#FF8F00');
      sunGrd.addColorStop(0.85, '#E65100');
      sunGrd.addColorStop(1, '#BF360C');
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.05) {
        const dist = 100 + Math.sin(a * 7 + frame * 0.04) * 4 + Math.sin(a * 13 + frame * 0.03) * 3;
        const x = Math.cos(a) * dist, y = Math.sin(a) * dist;
        a < 0.05 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fillStyle = sunGrd; ctx.fill();
      ctx.restore();

      // Orbiting AI rings
      [
        { r: 145, speed: 0.008, color: '#00E5FF', opacity: 0.6, dash: [8, 4], width: 1.5 },
        { r: 175, speed: -0.005, color: '#009DFF', opacity: 0.4, dash: [4, 8], width: 1 },
        { r: 210, speed: 0.003, color: '#6D28D9', opacity: 0.35, dash: [12, 6], width: 1 },
      ].forEach((ring) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frame * ring.speed);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = ring.opacity;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dash);
        ctx.stroke();
        // Dot on ring
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(ring.r, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = ring.color;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      // Solar wind particles
      particles.forEach((p) => {
        p.life++;
        p.angle += p.speed;
        p.r += 0.15;
        p.alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.8;
        p.x = cx + Math.cos(p.angle) * p.r;
        p.y = cy + Math.sin(p.angle) * p.r;
        if (p.life >= p.maxLife || p.r > 310) {
          p.r = 105 + Math.random() * 10;
          p.angle = Math.random() * Math.PI * 2;
          p.x = cx + Math.cos(p.angle) * p.r;
          p.y = cy + Math.sin(p.angle) * p.r;
          p.life = 0;
          p.maxLife = 80 + Math.random() * 120;
          p.speed = 0.002 + Math.random() * 0.006;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,160,60,${p.alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full opacity-90" style={{ maxWidth: 600, maxHeight: 600 }} />;
}

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Star = { x: number; y: number; r: number; alpha: number; twinkleSpeed: number; phase: number };
    const stars: Star[] = Array.from({ length: 300 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 2,
      alpha: 0.08 + Math.random() * 0.18,
      twinkleSpeed: 0.004 + Math.random() * 0.015,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach((s) => {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(frame * s.twinkleSpeed + s.phase));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(2,132,199,${a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

function MeteorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Meteor = { x: number; y: number; len: number; speed: number; alpha: number; active: boolean };
    const meteors: Meteor[] = [];
    let nextMeteor = 0;

    const spawnMeteor = () => {
      meteors.push({ x: Math.random() * canvas.width, y: -20, len: 120 + Math.random() * 80, speed: 8 + Math.random() * 6, alpha: 1, active: true });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nextMeteor--;
      if (nextMeteor <= 0) { spawnMeteor(); nextMeteor = 1500 + Math.random() * 900; }
      meteors.forEach((m, i) => {
        if (!m.active) return;
        m.x += m.speed * 0.7; m.y += m.speed;
        m.alpha -= 0.012;
        if (m.alpha <= 0 || m.y > canvas.height) { m.active = false; return; }
        const grd = ctx.createLinearGradient(m.x, m.y, m.x - m.len * 0.5, m.y - m.len);
        grd.addColorStop(0, `rgba(2,132,199,${m.alpha * 0.5})`);
        grd.addColorStop(1, 'rgba(2,132,199,0)');
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.len * 0.5, m.y - m.len);
        ctx.strokeStyle = grd; ctx.lineWidth = 1.5; ctx.stroke();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

function AnimatedCounter({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}</>;
}

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { setDone(true); clearInterval(timer); }
      }, 35);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(t1);
  }, [text, delay]);
  return <>{displayed}{!done && <span className="animate-pulse">|</span>}</>;
}

export default function Home() {
  const cursorX = useMotionValue(-400);
  const cursorY = useMotionValue(-400);
  const springX = useSpring(cursorX, { stiffness: 250, damping: 30 });
  const springY = useSpring(cursorY, { stiffness: 250, damping: 30 });
  const { data: summary } = useGetSolarSummary({ query: { refetchInterval: 60000 } });
  const { data: latest } = useGetLatestSolar({ query: { refetchInterval: 30000 } });

  useEffect(() => {
    const h = (e: MouseEvent) => { cursorX.set(e.clientX - 200); cursorY.set(e.clientY - 200); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
      {/* Full-screen space background */}
      <StarField />
      <MeteorCanvas />

      {/* Nebula blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute w-[600px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #6D28D9, transparent)', top: '10%', left: '60%' }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="absolute w-[500px] h-[500px] rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #00E5FF, transparent)', top: '50%', left: '-10%' }}
          animate={{ x: [0, 20, 0], y: [0, 30, 0] }} transition={{ duration: 25, repeat: Infinity }} />
        <motion.div className="absolute w-[800px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #FF4500, transparent)', top: '20%', left: '20%' }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity }} />
      </div>

      {/* Mouse glow */}
      <motion.div className="fixed pointer-events-none z-50 w-[400px] h-[400px] rounded-full"
        style={{ x: springX, y: springY, background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)' }} />

      {/* Digital grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Animated Sun */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] pointer-events-none" style={{ width: 520, height: 520 }}>
        <AnimatedSunCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center" style={{ marginTop: '14rem' }}>
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
          <p className="font-data text-xs tracking-[0.5em] text-primary/70 mb-3 uppercase">ISRO Aditya-L1 Mission Intelligence</p>
          <h1 className="text-7xl md:text-9xl font-heading text-primary neon-text-cyan tracking-widest leading-none drop-shadow-[0_0_40px_rgba(0,229,255,0.5)]">
            HELIOS
          </h1>
          <h2 className="text-xl md:text-2xl font-heading text-slate-500 tracking-[0.3em] mt-2">PROJECT</h2>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="font-data text-slate-500 tracking-wider mt-5 max-w-xl text-sm leading-relaxed px-4">
          <TypingText text="Combining Soft X-Ray and Hard X-Ray Intelligence to Predict Solar Storms Before They Happen." delay={1200} />
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}
          className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,229,255,0.5)' }} whileTap={{ scale: 0.97 }}
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-primary cursor-pointer border border-primary/50 transition-all select-none">
              LAUNCH MISSION CONTROL
            </motion.div>
          </Link>
          <Link href="/forecasting">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-slate-600 cursor-pointer border border-slate-300/60 select-none">
              EXPLORE AI FORECAST
            </motion.div>
          </Link>
          <Link href="/mission">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-slate-400 cursor-pointer border border-slate-700/40 select-none">
              ABOUT ADITYA-L1
            </motion.div>
          </Link>
        </motion.div>

        {/* Animated stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 px-4">
          {[
            { label: 'PREDICTION ACCURACY', value: summary?.predictionAccuracy ?? 87.4, suffix: '%', decimals: 1 },
            { label: 'DETECTED EVENTS', value: summary?.totalEventsDetected ?? 15, suffix: '', decimals: 0 },
            { label: 'AVG LEAD TIME', value: summary?.averageLeadTime ?? 18.5, suffix: 'min', decimals: 1 },
            { label: 'ACTIVE ALERTS', value: summary?.activeAlerts ?? 2, suffix: '', decimals: 0 },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -4, boxShadow: '0 0 30px rgba(0,229,255,0.2)' }}
              className="glass-panel px-5 py-4 rounded-xl text-center border border-primary/20 transition-all duration-500 cursor-default">
              <div className="text-2xl font-heading text-primary neon-text-cyan">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              <div className="text-xs font-data text-slate-500 tracking-widest mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 font-data text-xs text-slate-400">
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />ADITYA-L1 UPLINK ACTIVE</span>
        <span>|</span><span>SoLEXS + HEL1OS ONLINE</span>
        <span>|</span><span>MODEL v2.4.1</span>
      </motion.div>
    </div>
  );
}
