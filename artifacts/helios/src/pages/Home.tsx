import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'wouter';
import { useGetSolarSummary } from '@workspace/api-client-react';

/* ── Animated Sun ───────────────────────────────────────────────── */
function AnimatedSun() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const S = 600; cv.width = cv.height = S;
    const C = S / 2;
    let frame = 0, raf: number;

    // Solar-wind particles
    const pts = Array.from({ length: 220 }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = 108 + Math.random() * 10;
      return { angle: a, r, speed: 0.003 + Math.random() * 0.007, alpha: 0, life: Math.random() * 140, max: 90 + Math.random() * 110 };
    });

    // Coronal loops
    const loops = Array.from({ length: 10 }, (_, i) => ({
      sa: (Math.PI * 2 / 10) * i,
      spread: 0.35 + Math.random() * 0.55,
      height: 35 + Math.random() * 65,
      phase: Math.random() * Math.PI * 2,
      speed: 0.007 + Math.random() * 0.009,
      color: i % 3 === 0 ? '#FF6D00' : i % 3 === 1 ? '#FF8C00' : '#FFA040',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, S, S);
      frame++;

      // Outer halo rings — layered
      [
        { r: 280, alpha: 0.03, blur: 40 },
        { r: 230, alpha: 0.05, blur: 30 },
        { r: 185, alpha: 0.08, blur: 20 },
        { r: 150, alpha: 0.12, blur: 10 },
      ].forEach(({ r, alpha }) => {
        const g = ctx.createRadialGradient(C, C, r * 0.3, C, C, r);
        g.addColorStop(0, `rgba(255,120,0,${alpha})`);
        g.addColorStop(1, 'rgba(255,80,0,0)');
        ctx.beginPath(); ctx.arc(C, C, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });

      // AI orbit rings
      [
        { r: 148, speed: 0.009, color: '#0284C7', dash: [10, 5], w: 1.5, dotR: 3.5 },
        { r: 178, speed: -0.006, color: '#F59E0B', dash: [5, 10], w: 1, dotR: 2.5 },
        { r: 215, speed: 0.004, color: '#6D28D9', dash: [14, 7], w: 1, dotR: 2 },
      ].forEach(({ r, speed, color, dash, w, dotR }) => {
        ctx.save(); ctx.translate(C, C); ctx.rotate(frame * speed);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = color + '70'; ctx.lineWidth = w;
        ctx.setLineDash(dash); ctx.stroke();
        // Glowing dot
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(r, 0, dotR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      });

      // Coronal loops
      loops.forEach(l => {
        const pulse = Math.sin(frame * l.speed + l.phase);
        const sa = l.sa + frame * 0.004;
        const ea = sa + l.spread;
        const mid = (sa + ea) / 2;
        const h = l.height * (0.65 + 0.35 * Math.abs(pulse));
        const rBase = 104;
        const x1 = C + Math.cos(sa) * rBase, y1 = C + Math.sin(sa) * rBase;
        const x2 = C + Math.cos(ea) * rBase, y2 = C + Math.sin(ea) * rBase;
        const hx = C + Math.cos(mid) * (rBase + h), hy = C + Math.sin(mid) * (rBase + h);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(hx, hy, x2, y2);
        ctx.strokeStyle = l.color + 'AA';
        ctx.lineWidth = 1.5 + Math.abs(pulse) * 2.5;
        ctx.stroke();
      });

      // Sun body (plasma surface)
      ctx.save(); ctx.translate(C, C); ctx.rotate(frame * 0.004);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, 104);
      sg.addColorStop(0, '#FFFFFF');
      sg.addColorStop(0.12, '#FFF9C4');
      sg.addColorStop(0.35, '#FFD54F');
      sg.addColorStop(0.6, '#FF8F00');
      sg.addColorStop(0.82, '#E65100');
      sg.addColorStop(1, '#BF360C');
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.04) {
        const d = 104 + Math.sin(a * 8 + frame * 0.05) * 5 + Math.sin(a * 15 + frame * 0.03) * 3;
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fillStyle = sg;
      ctx.shadowColor = '#FF8F00'; ctx.shadowBlur = 30;
      ctx.fill(); ctx.restore();

      // Solar wind particles
      pts.forEach(p => {
        p.life++;
        p.angle += p.speed;
        p.r += 0.18;
        p.alpha = Math.sin((p.life / p.max) * Math.PI) * 0.9;
        const x = C + Math.cos(p.angle) * p.r;
        const y = C + Math.sin(p.angle) * p.r;
        if (p.life >= p.max || p.r > 295) {
          p.r = 108 + Math.random() * 8;
          p.angle = Math.random() * Math.PI * 2;
          p.life = 0;
          p.max = 90 + Math.random() * 110;
          p.speed = 0.003 + Math.random() * 0.007;
        }
        ctx.beginPath(); ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,140,40,${p.alpha})`; ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: 600, height: 600 }} className="opacity-95" />;
}

/* ── Floating particle network (hero bg) ─────────────────────────── */
function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    let W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
    let raf: number;
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: 1.5 + Math.random() * 2,
      hue: Math.random() > 0.55 ? 200 : 38,
      alpha: 0.15 + Math.random() * 0.25, phase: Math.random() * Math.PI * 2,
    }));
    let f = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H); f++;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += 0.015;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const a = p.alpha * (0.55 + 0.45 * Math.sin(p.phase));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 200 ? `rgba(2,132,199,${a})` : `rgba(245,158,11,${a})`;
        ctx.fill();
      });
      // Connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(2,132,199,${(1 - d / 100) * 0.06})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

/* ── Animated meteor streaks ─────────────────────────────────────── */
function Meteors() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    let W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
    let raf: number;
    type M = { x: number; y: number; len: number; speed: number; alpha: number; active: boolean; hue: number };
    const meteors: M[] = [];
    let nextM = 80;
    const spawn = () => meteors.push({
      x: Math.random() * W * 0.8, y: -20,
      len: 100 + Math.random() * 100, speed: 7 + Math.random() * 7,
      alpha: 0.8, active: true, hue: Math.random() > 0.4 ? 200 : 38,
    });
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      nextM--; if (nextM <= 0) { spawn(); nextM = 120 + Math.floor(Math.random() * 200); }
      meteors.forEach(m => {
        if (!m.active) return;
        m.x += m.speed * 0.6; m.y += m.speed;
        m.alpha -= 0.014;
        if (m.alpha <= 0 || m.y > H) { m.active = false; return; }
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.len * 0.5, m.y - m.len);
        const c = m.hue === 200 ? `rgba(2,132,199,` : `rgba(245,158,11,`;
        g.addColorStop(0, c + (m.alpha * 0.7) + ')');
        g.addColorStop(0.4, c + (m.alpha * 0.3) + ')');
        g.addColorStop(1, c + '0)');
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.len * 0.5, m.y - m.len);
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
        // Head glow
        ctx.beginPath(); ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = m.hue === 200 ? 'rgba(2,132,199,0.9)' : 'rgba(245,158,11,0.9)';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const r = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    window.addEventListener('resize', r);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', r); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

/* ── Animated counter ─────────────────────────────────────────────── */
function Counter({ to, suffix = '', dec = 0 }: { to: number; suffix?: string; dec?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!to) return;
    const dur = 2200, step = to / (dur / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= to) { setV(to); clearInterval(t); } else setV(cur);
    }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <>{dec ? v.toFixed(dec) : Math.floor(v)}{suffix}</>;
}

/* ── Typing text ──────────────────────────────────────────────────── */
function Typing({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t0 = setTimeout(() => {
      let i = 0;
      const t = setInterval(() => {
        i++; setShown(text.slice(0, i));
        if (i >= text.length) { setDone(true); clearInterval(t); }
      }, 32);
      return () => clearInterval(t);
    }, delay);
    return () => clearTimeout(t0);
  }, [text, delay]);
  return <>{shown}{!done && <span className="animate-pulse text-primary">|</span>}</>;
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function Home() {
  const mx = useMotionValue(-400), my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 220, damping: 28 });
  const sy = useSpring(my, { stiffness: 220, damping: 28 });

  const { data: summary } = useGetSolarSummary({ query: { refetchInterval: 60000 } });

  useEffect(() => {
    const h = (e: MouseEvent) => { mx.set(e.clientX - 200); my.set(e.clientY - 200); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const stats = [
    { label: 'PREDICTION ACCURACY', val: summary?.predictionAccuracy ?? 87.4, suf: '%', dec: 1 },
    { label: 'EVENTS DETECTED', val: summary?.totalEventsDetected ?? 15, suf: '', dec: 0 },
    { label: 'AVG LEAD TIME', val: summary?.averageLeadTime ?? 18.5, suf: 'min', dec: 1 },
    { label: 'ACTIVE ALERTS', val: summary?.activeAlerts ?? 2, suf: '', dec: 0 },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">

      {/* Particle network fills the full viewport */}
      <ParticleField />
      <Meteors />

      {/* Soft pastel blob gradients — white-theme nebula */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute w-[700px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(ellipse, #BFDBFE, transparent)', top: '5%', left: '55%' }}
          animate={{ x: [0, 40, 0], y: [0, -25, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(ellipse, #FDE68A, transparent)', top: '45%', left: '-8%' }}
          animate={{ x: [0, 25, 0], y: [0, 35, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[900px] h-[700px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(ellipse, #E0E7FF, transparent)', top: '15%', left: '15%' }}
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 18, repeat: Infinity }} />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full blur-2xl opacity-12"
          style={{ background: 'radial-gradient(ellipse, #FED7AA, transparent)', bottom: '10%', right: '10%' }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 20, 0] }} transition={{ duration: 14, repeat: Infinity }} />
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(2,132,199,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(2,132,199,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Mouse glow */}
      <motion.div className="fixed pointer-events-none z-50 w-[400px] h-[400px] rounded-full"
        style={{
          x: sx, y: sy,
          background: 'radial-gradient(circle, rgba(2,132,199,0.10) 0%, rgba(245,158,11,0.04) 50%, transparent 70%)',
        }} />

      {/* Sun — centred above content */}
      <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -62%)', width: 600, height: 600 }}>
        {/* Extra pulsing halo rings behind the sun */}
        {[1, 2, 3].map(i => (
          <motion.div key={i} className="absolute inset-0 rounded-full border border-sky-300/20"
            animate={{ scale: [1, 1 + i * 0.18], opacity: [0.4, 0] }}
            transition={{ duration: 3 + i * 0.8, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
            style={{ margin: `${-i * 20}px` }} />
        ))}
        <AnimatedSun />
      </div>

      {/* Hero copy */}
      <div className="relative z-10 flex flex-col items-center text-center" style={{ marginTop: '15rem' }}>
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <p className="font-data text-xs tracking-[0.55em] text-primary/60 mb-3 uppercase">ISRO Aditya-L1 Mission Intelligence</p>
          <h1 className="text-8xl md:text-[9rem] font-heading text-primary tracking-widest leading-none"
            style={{ textShadow: '0 0 40px rgba(2,132,199,0.25), 0 0 80px rgba(2,132,199,0.10)' }}>
            HELIOS
          </h1>
          <h2 className="text-xl md:text-2xl font-heading text-slate-400 tracking-[0.35em] mt-2">PROJECT</h2>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="font-data text-slate-500 tracking-wide mt-5 max-w-xl text-sm leading-relaxed px-6">
          <Typing text="Combining Soft X-Ray and Hard X-Ray Intelligence to Predict Solar Storms Before They Happen." delay={1100} />
        </motion.p>

        {/* CTA buttons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
          className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 0 36px rgba(2,132,199,0.30)' }} whileTap={{ scale: 0.97 }}
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-primary cursor-pointer border border-primary/40 select-none transition-all duration-300">
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
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-amber-600 cursor-pointer border border-amber-400/40 select-none">
              ABOUT ADITYA-L1
            </motion.div>
          </Link>
        </motion.div>

        {/* Animated stat counters */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 px-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(2,132,199,0.18)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 + i * 0.1 }}
              className="glass-panel px-5 py-4 rounded-xl text-center border border-primary/20 cursor-default">
              <div className="text-2xl font-heading text-primary"
                style={{ textShadow: '0 0 16px rgba(2,132,199,0.3)' }}>
                <Counter to={s.val} suffix={s.suf} dec={s.dec} />
              </div>
              <div className="text-xs font-data text-slate-400 tracking-widest mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-5 font-data text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          ADITYA-L1 UPLINK ACTIVE
        </span>
        <span className="text-slate-300">·</span>
        <span>SoLEXS + HEL1OS ONLINE</span>
        <span className="text-slate-300">·</span>
        <span>MODEL v2.4.1</span>
      </motion.div>
    </div>
  );
}
